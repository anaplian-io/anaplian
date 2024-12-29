import { AgentError } from '../errors';

/**
 * Defines a single argument that will be passed by the agent.
 */
export interface ActionArgument {
  /**
   * The name of the argument. This will be available to the agent in documentation.
   */
  readonly name: string;
  /**
   * A description of the argument. This will help instruct the agent in how this argument should be used.
   */
  readonly description: string;
  /**
   * Optional example valid values that will be provided to the agent.
   */
  readonly exampleValidValues?: string[];
  /**
   * Optional example invalid values that will be provided to the agent.
   */
  readonly exampleInvalidValues?: string[];
}

/**
 * Defines an action that can be taken by the agent.
 */
export interface Action {
  /**
   * The name of the action. This is the literal string that will be invoked by the agent.
   */
  readonly name: string;
  /**
   * The set of arguments required to execute this action.
   */
  readonly arguments?: ActionArgument[];

  /**
   * A description of this Action that will be provided to the agent.
   */
  readonly description: string;

  /**
   * Full examples of inputs and outputs of this action.
   */
  readonly examples?: {
    readonly arguments?: string[];
    readonly result: string;
  }[];

  /**
   * Function that will be applied on action invocation. If the agent has provided an invalid value,
   * the implementer should throw {@link InvalidArgumentError}.
   *
   * @param {Record<string, string>} args - An object mapping argument names to the values provided by the agent.
   * This field is validated to ensure all arguments have been provided.
   * @returns {Promise<string>} - The result of the action.
   */
  readonly apply: (args: Record<string, string>) => Promise<string>;
}

/**
 * Error used by Actions to signal that the agent passed an invalid argument.
 */
export class InvalidArgumentError extends AgentError {
  public readonly invalidArgument: ActionArgument;

  /**
   *
   * @param {ActionArgument} invalidArgument - The argument passed that was invalid.
   */
  constructor(invalidArgument: ActionArgument) {
    super(`Argument ${invalidArgument.name} has an invalid value`);
    this.invalidArgument = invalidArgument;
  }
}
