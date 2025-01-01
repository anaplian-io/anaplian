import { AnaplianAgent, AnaplianModel, Context } from '../common/types';
import { ContextCreator } from './context-creator';
import { ActionExecutor } from './action-executor';
import { ModelOutputParser } from '../parsers/model-output-parser';
import { AgentError } from '../errors/agent-error';

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
    readonly onFatalError: (error: unknown) => Promise<void>;
  };
}

export class AgentOrchestrator {
  private shuttingDown: boolean = false;
  private currentContext: Context = {};
  constructor(private readonly props: AgentOrchestratorProps) {}

  public readonly run: AnaplianAgent['run'] = async () => {
    if (this.props.initialContext) {
      this.currentContext = Object.freeze(this.props.initialContext);
    } else {
      this.currentContext = Object.freeze(
        await this.props.contextCreator.createInitialContext(),
      );
    }
    this.props.events.afterInitialize(this.currentContext).catch(() => {});
    while (!this.shuttingDown) {
      try {
        this.props.events
          .beforeIterationStart(this.currentContext)
          .catch(() => {});
        const rawModelOutput = await this.props.model.invoke(
          this.currentContext,
        );
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
        this.props.events
          .afterIterationEnd(this.currentContext)
          .catch(() => {});
        await this.yieldToEventLoop();
      } catch (error) {
        this.props.events.onFatalError(error).catch(() => {});
        await this.shutdown();
      }
    }
  };

  public readonly shutdown: AnaplianAgent['shutdown'] = async () => {
    if (!this.shuttingDown) {
      this.shuttingDown = true;
      await this.props.events
        .beforeShutdown(this.currentContext)
        .catch(() => {});
    }
  };

  private readonly yieldToEventLoop = async () => {
    await new Promise((accept) => setImmediate(accept));
  };
}
