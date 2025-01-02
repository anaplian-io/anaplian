import { Action } from '../actions';
import { ContextProvider } from '../contexts';
import { Context } from '../common';

/**
 * An autonomous AI agent.
 */
export interface AnaplianAgent {
  /**
   * Begins the agent's main event loop. Be careful about awaiting this promise
   * as it will block execution until the agent shuts down.
   */
  readonly run: () => Promise<void>;
  /**
   * Begins the agent shutdown process.
   */
  readonly shutdown: () => Promise<void>;
  /**
   * Information returned to the builder caller for debugging and record keeping.
   */
  readonly metadata: {
    /**
     * The context window size of the model in tokens.
     */
    readonly modelContextWindowSize: number;
    /**
     * The name of the model (e.g. 'gpt-4o-mini').
     */
    readonly modelName: string;
    /**
     * An array of actions available to this agent.
     */
    readonly availableActions: Action[];
    /**
     * The number of tokens allocated to generating instructions.
     */
    readonly instructionsTokens: number;
    /**
     * The number of tokens not allocated to generating context or instructions.
     */
    readonly paddingTokens: number;
    /**
     * The initial context supplied to this agent if applicable.
     */
    readonly initialContext?: Context;
    /**
     * The context providers used to build each iteration of the context.
     */
    readonly contextProviders: {
      /**
       * The context provider.
       */
      readonly provider: ContextProvider<string, Record<string, unknown>>;
      /**
       * The maximum number of tokens allocated to this context provider.
       */
      readonly maximumAllowedTokens: number;
    }[];
  };
}
