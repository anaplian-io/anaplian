import { AgentBuilder } from '../agents';
import { FakeListChatModel, FakeLLM } from '@langchain/core/utils/testing';
import { NopAction, ThinkAction } from '../actions';
import { DateContextProvider, HistoryContextProvider } from '../contexts';

describe('@anaplian/core', () => {
  const yieldToEventLoop = async () => {
    await new Promise((accept) => setImmediate(accept));
  };

  it.each([
    new FakeLLM({
      response:
        '<output>think("This is a thing that I have thought about")</output>',
    }),
    new FakeListChatModel({
      responses: [
        '<output>think("This is a thing that I have thought about")</output>',
      ],
    }),
  ])('builds, runs, and shuts down an agent', async (model) => {
    expect.assertions(10);
    const onFatal = jest.fn().mockReturnValue(Promise.resolve());
    const onStartIteration = jest.fn().mockReturnValue(Promise.resolve());
    const onEndIteration = jest.fn().mockReturnValue(Promise.resolve());
    const onShutdown = jest.fn().mockReturnValue(Promise.resolve());
    const onInitialize = jest.fn().mockReturnValue(Promise.resolve());
    const invokeSpy = jest.spyOn(model, 'invoke');
    const agent = await new AgentBuilder({
      modelName: 'gpt-4o-mini',
      model: model,
      roleAssignmentDirective: 'You are an agent. You do agent things.',
    })
      .addAction(new NopAction())
      .addAction(new ThinkAction())
      .addContextProvider(new DateContextProvider(), 0.5)
      .addContextProvider(new HistoryContextProvider({}), 99.5)
      .setOn('afterInitialize', onInitialize)
      .setOn('beforeIterationStart', onStartIteration)
      .setOn('afterIterationEnd', onEndIteration)
      .setOn('beforeShutdown', onShutdown)
      .setOn('fatalError', onFatal)
      .build();
    const runPromise = agent.run();
    await yieldToEventLoop();
    await agent.shutdown();
    await runPromise;
    expect(onFatal).not.toHaveBeenCalled();
    expect(onStartIteration).toHaveBeenCalledTimes(1);
    expect(onStartIteration).toHaveBeenCalledWith(
      expect.objectContaining({
        history: {
          records: [],
        },
      }),
    );
    expect(onEndIteration).toHaveBeenCalledTimes(1);
    expect(onEndIteration).toHaveBeenCalledWith(
      expect.objectContaining({
        history: {
          records: [
            expect.objectContaining({
              actionTaken: 'think("This is a thing that I have thought about")',
              result: 'This is a thing that I have thought about',
            }),
          ],
        },
      }),
    );
    expect(onShutdown).toHaveBeenCalledTimes(1);
    expect(onShutdown).toHaveBeenCalledWith(
      expect.objectContaining({
        history: {
          records: [
            expect.objectContaining({
              actionTaken: 'think("This is a thing that I have thought about")',
              result: 'This is a thing that I have thought about',
            }),
          ],
        },
      }),
    );
    expect(onInitialize).toHaveBeenCalledTimes(1);
    expect(onInitialize).toHaveBeenCalledWith(
      expect.objectContaining({
        history: {
          records: [],
        },
      }),
    );
    expect(invokeSpy).toHaveBeenCalledTimes(1);
  });

  it('throws a fatal error', async () => {
    const model = new FakeLLM({});
    const onFatal = jest.fn().mockReturnValue(Promise.resolve());
    const onStartIteration = jest.fn().mockReturnValue(Promise.resolve());
    const onEndIteration = jest.fn().mockReturnValue(Promise.resolve());
    const onShutdown = jest.fn().mockReturnValue(Promise.resolve());
    const onInitialize = jest.fn().mockReturnValue(Promise.resolve());
    const invokeSpy = jest
      .spyOn(model, 'invoke')
      .mockRejectedValue(new Error());
    const agent = await new AgentBuilder({
      modelName: 'gpt-4o-mini',
      model: model,
      roleAssignmentDirective: 'You are an agent. You do agent things.',
    })
      .addAction(new NopAction())
      .addAction(new ThinkAction())
      .addContextProvider(new DateContextProvider(), 0.5)
      .addContextProvider(new HistoryContextProvider({}), 99.5)
      .setOn('afterInitialize', onInitialize)
      .setOn('beforeIterationStart', onStartIteration)
      .setOn('afterIterationEnd', onEndIteration)
      .setOn('beforeShutdown', onShutdown)
      .setOn('fatalError', onFatal)
      .build();
    const runPromise = agent.run();
    await yieldToEventLoop();
    await runPromise;
    expect(onFatal).toHaveBeenCalledTimes(1);
    expect(onStartIteration).toHaveBeenCalledTimes(1);
    expect(onStartIteration).toHaveBeenCalledWith(
      expect.objectContaining({
        history: {
          records: [],
        },
      }),
    );
    expect(onEndIteration).toHaveBeenCalledTimes(0);
    expect(onShutdown).toHaveBeenCalledTimes(1);
    expect(onShutdown).toHaveBeenCalledWith(
      expect.objectContaining({
        history: {
          records: [],
        },
      }),
    );
    expect(onInitialize).toHaveBeenCalledTimes(1);
    expect(onInitialize).toHaveBeenCalledWith(
      expect.objectContaining({
        history: {
          records: [],
        },
      }),
    );
    expect(invokeSpy).toHaveBeenCalledTimes(1);
  });
});
