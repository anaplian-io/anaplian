import { Action } from '../actions';
import {
  IncorrectActionUsageError,
  InvalidSyntaxError,
  NoSuchActionError,
} from '../errors/agent-error';
import { extractArguments } from '../common/extract-arguments';

export interface ActionExecutorProps {
  readonly availableActions: Action<never | string>[];
}

const commandRegex = /^(\w+)\((.*)\)$/;
const argumentRegex = /"(?:\\.|[^"\\])*"/g;

export class ActionExecutor {
  constructor(private readonly props: ActionExecutorProps) {}

  public readonly execute = async (agentInput: string): Promise<string> => {
    const { availableActions } = this.props;
    const commandParseMatch = agentInput.match(commandRegex);
    if (!commandParseMatch) {
      throw new InvalidSyntaxError(
        `Invalid syntax for command "${agentInput}"; must match regex ${commandRegex}`,
      );
    }
    const command = commandParseMatch[1]!;
    const selectedAction = availableActions.filter(
      (action) => action.name === command,
    )[0];
    if (!selectedAction) {
      throw new NoSuchActionError(
        `"${command}" is not a recognized action. Available actions: ${availableActions.map((availableAction) => availableAction.name).join(', ')}`,
      );
    }
    const unsplitArguments = commandParseMatch[2];
    const parsedArguments = (unsplitArguments?.match(argumentRegex) || []).map(
      (argument) =>
        argument.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n'),
    );
    const extractedArguments = extractArguments(
      selectedAction.arguments as Action['arguments'],
    );
    if (parsedArguments.length !== (extractedArguments.length || 0)) {
      throw new IncorrectActionUsageError(
        `Action "${selectedAction.name}" requires ${extractedArguments.length || 0} argument(s) but found ${parsedArguments.length} instead`,
      );
    }
    return await selectedAction.apply(
      Object.fromEntries(
        extractedArguments.map((argument, index) => [
          argument.name,
          parsedArguments[index]!,
        ]),
      ),
    );
  };
}
