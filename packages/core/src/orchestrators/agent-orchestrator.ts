import { AnaplianModel, Context } from '../common/types';
import { ContextCreator } from './context-creator';
import { ActionExecutor } from './action-executor';
import { ModelOutputParser } from '../parsers/model-output-parser';
import { AgentError } from '../errors/agent-error';
import { AnaplianAgent } from '../agents';

export interface AgentOrchestratorProps {
  readonly contextCreator: ContextCreator;
  readonly actionExecutor: ActionExecutor;
  readonly modelOutputParser: ModelOutputParser;
  readonly model: AnaplianModel;
  readonly initialContext?: Context;
  readonly events: {
    readonly beforeIterationStart: (context: Context) => Promise<void>;
    readonly afterIterationEnd: (context: Context) => Promise<void>;
    readonly beforeShutdown: (context: Context) => Promise<void>;
    readonly afterInitialize: (context: Context) => Promise<void>;
    readonly fatalError: (error: unknown) => Promise<void>;
  };
}

export class AgentOrchestrator {
  private shuttingDown: boolean = false;
  private initialized: boolean = false;
  private currentContext: Context = {};
  private eventLoopImmediate: ReturnType<typeof setImmediate> | undefined;
  constructor(private readonly props: AgentOrchestratorProps) {}

  public readonly run: AnaplianAgent['run'] = async () => {
    if (!this.initialized) {
      await this.initialize();
    }
    while (!this.shuttingDown) {
      try {
        await this.next().then(() => this.yieldToEventLoop());
      } catch (error) {
        await this.props.events
          .fatalError(error)
          .catch(() => {})
          .then(() => this.shutdown());
      }
    }
  };

  public readonly initialize: AnaplianAgent['initialize'] = async () => {
    if (this.props.initialContext) {
      this.currentContext = Object.freeze(this.props.initialContext);
    } else {
      this.currentContext = Object.freeze(
        await this.props.contextCreator.createInitialContext(),
      );
    }
    await this.props.events
      .afterInitialize(this.currentContext)
      .catch(() => {});
    this.initialized = true;
  };

  public readonly next: AnaplianAgent['next'] = async () => {
    if (!this.initialized) {
      await this.initialize();
    }
    await this.props.events
      .beforeIterationStart(this.currentContext)
      .catch(() => {});
    this.currentContext = await this.props.contextCreator.refreshContext(
      this.currentContext,
    );
    const rawModelOutput = await this.props.model.invoke(this.currentContext);
    this.currentContext = await this.props.modelOutputParser
      .parse(rawModelOutput)
      .then((parsedAction) =>
        this.props.actionExecutor
          .execute(parsedAction)
          .then((result) => ({ parsedAction, result })),
      )
      .catch((error) => {
        if (error instanceof AgentError) {
          return {
            parsedAction: rawModelOutput,
            result: `ERROR: ${error.message}`,
          };
        }
        throw error;
      })
      .then((actionResult) =>
        this.props.contextCreator.createNextContext({
          actionResult: actionResult.result,
          actionTaken: actionResult.parsedAction,
          priorContext: this.currentContext,
        }),
      )
      .then((newContext) => Object.freeze(newContext));
    await this.props.events
      .afterIterationEnd(this.currentContext)
      .catch(() => {});
  };

  public readonly shutdown: AnaplianAgent['shutdown'] = async () => {
    if (!this.shuttingDown) {
      this.shuttingDown = true;
      await this.props.events
        .beforeShutdown(this.currentContext)
        .catch(() => {});
    }
  };

  private readonly yieldToEventLoop = () => {
    clearImmediate(this.eventLoopImmediate);
    return new Promise((accept) => {
      this.eventLoopImmediate = setImmediate(accept);
    });
  };
}
