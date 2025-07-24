import { BaseLLM } from '@langchain/core/language_models/llms';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { Action } from '../actions';
import { ContextProvider } from '../contexts';
import { Context } from '../common';
import {
  AgentOrchestrator,
  AgentOrchestratorProps,
} from '../orchestrators/agent-orchestrator';
import { AnaplianAgent } from './anaplian-agent';
import { wrapModel } from '../common/model-wrappers';
import { RootFormatter } from '../formatters/root-formatter';
import { ModelOutputParser } from '../parsers/model-output-parser';
import { xmlModelOutputParser } from '../parsers/xml-model-output-parser';
import { ActionDocumentationFormatter } from '../formatters/action-documentation-formatter';
import { ContextProviderDocumentationFormatter } from '../formatters/context-provider-documentation-formatter';
import { ActionExecutor } from '../orchestrators/action-executor';
import { ContextCreator } from '../orchestrators/context-creator';
import {
  getModelContextSize,
  isModelSupported,
} from '@anaplian/model-context-size';
import { Validator } from '../validators/validator';
import { ActionValidator } from '../validators/action-validator';
import { AgentValidator } from '../validators/agent-validator';
import {
  InvalidActionError,
  InvalidAgentParametersError,
} from '../errors/agent-validation-error';
import { serializeWithoutImages } from '../common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { getActionsFromMcp } from '../mcp/get-actions-from-mcp';

/**
 * Defines the required properties for {@link AgentBuilder}.
 */
export interface AgentBuilderProps {
  /**
   * A LangChain-compatible model.
   *
   * @see {BaseLLM}
   * @see {BaseChatModel}
   */
  readonly model: BaseLLM | BaseChatModel;
  /**
   * The canonical name of the model (e.g. 'gpt-4o-mini'). If this model is recognized by @anaplian/model-context-size,
   * the context window size will be set automatically.
   */
  readonly modelName?: string;
  /**
   * Tells the model who it is, how it should act, and what task it should accomplish.
   */
  readonly roleAssignmentDirective: string;
}

/**
 * Builds an {@link AnaplianAgent}.
 */
export class AgentBuilder {
  private readonly actions: Action[] = [];
  private readonly mcpClients: Client[] = [];
  private readonly contextProviders: {
    readonly provider: ContextProvider<never, never>;
    readonly weight: number;
  }[] = [];
  private contextWindowSize?: number;
  private paddingTokens?: number;
  private initialContext?: Context;
  private events: AgentOrchestratorProps['events'] = {
    afterInitialize: () => Promise.resolve(),
    afterIterationEnd: () => Promise.resolve(),
    beforeIterationStart: () => Promise.resolve(),
    beforeShutdown: () => Promise.resolve(),
    fatalError: () => Promise.resolve(),
  };

  constructor(private readonly props: AgentBuilderProps) {}

  /**
   * Adds a new available action to this agent.
   *
   * @param action {Action} - The Action to add.
   */
  public readonly addAction = <T extends string = never | string>(
    action: Action<T>,
  ): this => {
    this.actions.push(action as Action);
    return this;
  };

  /**
   * Adds actions from tools available in a model context protocol client.
   *
   * @param mcpClient {Client} - A connected MCP client.
   */
  public readonly addMcpClient = (mcpClient: Client): this => {
    this.mcpClients.push(mcpClient);
    return this;
  };

  /**
   * Adds a new context provider to the agent.
   *
   * @param {ContextProvider} contextProvider - The context provider.
   * @param {number} weight - The relative number of tokens from the context window that will
   * be allocated to this provider. This number will be normalized.
   */
  public readonly addContextProvider = <
    T extends string,
    U extends Record<string, unknown>,
  >(
    contextProvider: ContextProvider<T, U>,
    weight: number,
  ): this => {
    this.contextProviders.push({
      weight,
      provider: <ContextProvider<never, never>>contextProvider,
    });
    return this;
  };

  /**
   * Sets the context window size. If not explicitly set, the builder will infer the size based on the model name.
   * If the size is neither set nor can be inferred, it is defaulted to 4096 tokens.
   *
   * @param {number} contextWindowSize - The total context window size in tokens.
   */
  public readonly setContextWindowSize = (contextWindowSize: number): this => {
    this.contextWindowSize = contextWindowSize;
    return this;
  };

  /**
   * Sets the number of padding tokens. Padding tokens is the number of tokens not included in the instructions or context.
   * This defaults to 5% of the total context window size.
   *
   * @param {number} paddingTokens - The number of padding tokens.
   */
  public readonly setPaddingTokens = (paddingTokens: number): this => {
    this.paddingTokens = paddingTokens;
    return this;
  };

  /**
   * Sets the initial context that will be provided to the agent. This is generally used when resuming a previously
   * saved session.
   *
   * @param {Context} initialContext - The initial context to use when running the agent.
   */
  public readonly setInitialContext = (initialContext: Context): this => {
    this.initialContext = initialContext;
    return this;
  };

  /**
   * Adds an event handler to the specified agent event. Promise rejections are ignored by the agent.
   *
   * @param {AgentOrchestratorProps['events']} event - The event to handle.
   * @param fn - The event handler.
   */
  public readonly setOn = <T extends keyof AgentOrchestratorProps['events']>(
    event: T,
    fn: AgentOrchestratorProps['events'][T],
  ): this => {
    this.events = {
      ...this.events,
      [event]: fn,
    };
    return this;
  };

  /**
   * Constructs the agent and validates. Validation errors will throw {@link AgentValidationError}.
   */
  public readonly build = async (): Promise<AnaplianAgent> => {
    const serializer = serializeWithoutImages;
    const leftPadding = '\t';
    const modelOutputParser: ModelOutputParser = xmlModelOutputParser;
    this.actions.push(
      ...(
        await Promise.all(
          this.mcpClients.map((client) => getActionsFromMcp(client)),
        )
      )
        .flat()
        .map((action) => action as Action),
    );
    const rootFormatter = new RootFormatter({
      serializer,
      actionDocumentationFormatter: new ActionDocumentationFormatter({
        leftPadding,
      }),
      availableActions: this.actions,
      contextProviderDocumentationFormatter:
        new ContextProviderDocumentationFormatter({
          leftPadding,
          objectSerializer: serializer,
        }),
      contextProviderDocumentations: this.contextProviders.map(
        (contextProvider) => contextProvider.provider,
      ),
      functionalInstructions: modelOutputParser.modelInstructions,
      roleAssignmentDirective: this.props.roleAssignmentDirective,
    });
    const model = wrapModel(this.props.model, rootFormatter);
    const modelContextWindowSize =
      this.contextWindowSize ??
      (this.props.modelName && isModelSupported(this.props.modelName)
        ? getModelContextSize(this.props.modelName)
        : 4096);
    const paddingTokens =
      this.paddingTokens ?? Math.trunc(0.05 * modelContextWindowSize);
    const instructionsTokens = await model.getTokenCount(
      await rootFormatter.formatPartial(),
    );
    const totalContextProviderWeight = this.contextProviders
      .map((contextProvider) => contextProvider.weight)
      .reduce((total, current) => total + current, 0);
    const contextProviders = this.contextProviders.map((contextProvider) => ({
      provider: contextProvider.provider,
      maximumAllowedTokens: Math.trunc(
        (contextProvider.weight / totalContextProviderWeight) *
          (modelContextWindowSize - instructionsTokens - paddingTokens),
      ),
    }));
    const agentOrchestrator = new AgentOrchestrator({
      model,
      modelOutputParser,
      actionExecutor: new ActionExecutor({
        availableActions: this.actions,
      }),
      contextCreator: new ContextCreator({
        contextProviders,
        model,
        serializer,
      }),
      events: this.events,
      initialContext: this.initialContext,
    });
    const actionValidator: Validator<Action> = new ActionValidator();
    const actionInvalidReasons = await Promise.all(
      this.actions.map((action) => actionValidator.validate(action)),
    ).then((validations) =>
      validations
        .filter(
          (validation): validation is { valid: false; reason: string } =>
            !validation.valid,
        )
        .map((actionInvalid) => actionInvalid.reason),
    );
    if (actionInvalidReasons.length > 0) {
      throw new InvalidActionError(actionInvalidReasons.join('\n'));
    }
    const agent: AnaplianAgent = {
      metadata: {
        availableActions: this.actions,
        modelName: this.props.modelName ?? 'unspecified',
        initialContext: this.initialContext,
        contextProviders,
        instructionsTokens,
        modelContextWindowSize,
        paddingTokens,
      },
      run: agentOrchestrator.run,
      shutdown: agentOrchestrator.shutdown,
      next: agentOrchestrator.next,
      initialize: agentOrchestrator.initialize,
    };
    const agentValidator: Validator<AnaplianAgent> = new AgentValidator();
    const agentValidity = await agentValidator.validate(agent);
    if (!agentValidity.valid) {
      throw new InvalidAgentParametersError(agentValidity.reason);
    }
    return agent;
  };
}
