import { AnaplianModel } from '../../common/types';
import { ContextCreator } from '../context-creator';
import { ActionExecutor } from '../action-executor';
import { ModelOutputParser } from '../../parsers/model-output-parser';
import {
  AgentOrchestrator,
  AgentOrchestratorProps,
} from '../agent-orchestrator';
import { AgentError } from '../../errors/agent-error';

describe('AgentOrchestrator', () => {
  let mockModel: jest.Mocked<AnaplianModel>;
  let mockContextCreator: jest.Mocked<ContextCreator>;
  let mockActionExecutor: jest.Mocked<ActionExecutor>;
  let mockOutputParser: jest.Mocked<ModelOutputParser>;
  let mockEvents: AgentOrchestratorProps['events'];

  let orchestrator: AgentOrchestrator;

  const yieldToEventLoop = async () => {
    await new Promise((accept) => setImmediate(accept));
  };

  beforeEach(() => {
    mockModel = {
      invoke: jest.fn().mockResolvedValue('mocked model output'),
      getTokenCount: jest.fn().mockResolvedValue(10),
    };

    mockContextCreator = {
      createInitialContext: jest.fn().mockResolvedValue({ initial: 'context' }),
      createNextContext: jest.fn().mockResolvedValue({ next: 'context' }),
    } as unknown as jest.Mocked<ContextCreator>;

    mockActionExecutor = {
      execute: jest.fn().mockResolvedValue('mocked action result'),
    } as unknown as jest.Mocked<ActionExecutor>;

    mockOutputParser = {
      parse: jest.fn().mockResolvedValue('parsed action'),
    } as unknown as jest.Mocked<ModelOutputParser>;

    mockEvents = {
      beforeIterationStart: jest
        .fn()
        .mockImplementation(() => Promise.reject()),
      afterIterationEnd: jest.fn().mockImplementation(() => Promise.reject()),
      beforeShutdown: jest.fn().mockImplementation(() => Promise.reject()),
      afterInitialize: jest.fn().mockImplementation(() => Promise.reject()),
      fatalError: jest.fn().mockImplementation(() => Promise.reject()),
    };

    const props: AgentOrchestratorProps = {
      contextCreator: mockContextCreator,
      actionExecutor: mockActionExecutor,
      modelOutputParser: mockOutputParser,
      model: mockModel,
      events: mockEvents,
    };

    orchestrator = new AgentOrchestrator(props);
  });

  describe('run', () => {
    it('should initialize the context and complete one iteration successfully', async () => {
      const runPromise = orchestrator.run();
      await yieldToEventLoop();

      expect(mockContextCreator.createInitialContext).toHaveBeenCalled();
      expect(mockEvents.afterInitialize).toHaveBeenCalledWith({
        initial: 'context',
      });

      expect(mockEvents.beforeIterationStart).toHaveBeenCalledWith({
        initial: 'context',
      });
      expect(mockModel.invoke).toHaveBeenCalledWith({ initial: 'context' });
      expect(mockOutputParser.parse).toHaveBeenCalledWith(
        'mocked model output',
      );
      expect(mockActionExecutor.execute).toHaveBeenCalledWith('parsed action');
      expect(mockContextCreator.createNextContext).toHaveBeenCalledWith({
        actionResult: 'mocked action result',
        actionTaken: 'parsed action',
        priorContext: { initial: 'context' },
      });

      expect(mockEvents.afterIterationEnd).toHaveBeenCalledWith({
        next: 'context',
      });

      await orchestrator.shutdown();
      await runPromise;
    });

    it('should not initialize the context and complete one iteration successfully', async () => {
      orchestrator = new AgentOrchestrator({
        contextCreator: mockContextCreator,
        actionExecutor: mockActionExecutor,
        modelOutputParser: mockOutputParser,
        model: mockModel,
        events: mockEvents,
        initialContext: {
          someCoolContext: {
            value: 'initial value',
          },
        },
      });
      const runPromise = orchestrator.run();
      await yieldToEventLoop();

      expect(mockContextCreator.createInitialContext).not.toHaveBeenCalled();
      expect(mockEvents.afterInitialize).toHaveBeenCalledWith({
        someCoolContext: {
          value: 'initial value',
        },
      });

      expect(mockEvents.beforeIterationStart).toHaveBeenCalledWith({
        someCoolContext: {
          value: 'initial value',
        },
      });
      expect(mockModel.invoke).toHaveBeenCalledWith({
        someCoolContext: {
          value: 'initial value',
        },
      });
      expect(mockOutputParser.parse).toHaveBeenCalledWith(
        'mocked model output',
      );
      expect(mockActionExecutor.execute).toHaveBeenCalledWith('parsed action');
      expect(mockContextCreator.createNextContext).toHaveBeenCalledWith({
        actionResult: 'mocked action result',
        actionTaken: 'parsed action',
        priorContext: {
          someCoolContext: {
            value: 'initial value',
          },
        },
      });

      expect(mockEvents.afterIterationEnd).toHaveBeenCalledWith({
        next: 'context',
      });

      await orchestrator.shutdown();
      await runPromise;
    });

    it('should handle errors gracefully and shut down', async () => {
      mockOutputParser.parse.mockRejectedValue(new Error('Parsing error'));

      await orchestrator.run();

      expect(mockEvents.fatalError).toHaveBeenCalledWith(expect.any(Error));
      expect(mockEvents.beforeShutdown).toHaveBeenCalledWith({
        initial: 'context',
      });
    });

    it('should handle AgentError and continue processing', async () => {
      mockOutputParser.parse.mockRejectedValue(
        new AgentError('Mock Agent Error'),
      );

      const runPromise = orchestrator.run();
      await yieldToEventLoop();

      expect(mockContextCreator.createNextContext).toHaveBeenCalledWith({
        actionResult: 'ERROR: Mock Agent Error',
        actionTaken: 'mocked model output',
        priorContext: { initial: 'context' },
      });

      await orchestrator.shutdown();
      await runPromise;
    });
  });

  describe('shutdown', () => {
    it('should set shuttingDown to true and trigger the shutdown event', async () => {
      await orchestrator.shutdown();

      expect(mockEvents.beforeShutdown).toHaveBeenCalledWith({});
    });

    it('should not trigger shutdown event multiple times', async () => {
      await orchestrator.shutdown();
      await orchestrator.shutdown();

      expect(mockEvents.beforeShutdown).toHaveBeenCalledTimes(1);
    });
  });
});
