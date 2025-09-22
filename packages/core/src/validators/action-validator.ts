import { Action, ActionArgument } from '../actions';
import { Validator } from './validator';
import { extractArguments } from '../common/extract-arguments';

const nameRegex = /^[A-Za-z0-9]+(?:[_-][A-Za-z0-9]+)*$/;

export class ActionValidator implements Validator<Action> {
  public readonly validate = async <T extends string>(
    action: Action<T>,
  ): Promise<{ valid: true } | { valid: false; reason: string }> => {
    const extractedArguments = extractArguments(
      action.arguments as Action['arguments'],
    );
    if (!action.name.match(nameRegex)) {
      return {
        valid: false,
        reason: `${action.name}: Action name "${action.name}" does not match regex ${nameRegex}`,
      };
    }
    const invalidExamples = this.getInvalidExamples(
      action as Action,
      extractedArguments,
    );
    if (invalidExamples.length > 0) {
      return {
        valid: false,
        reason: `${action.name}: Found an example with ${invalidExamples[0]?.arguments?.length} argument(s) but ${extractedArguments.length} expected.`,
      };
    }
    const invalidArguments = this.getInvalidArguments(action as Action);
    if (invalidArguments.length > 0) {
      return {
        valid: false,
        reason: `${action.name}: Argument "${invalidArguments[0]?.name}" does not match regex ${nameRegex}`,
      };
    }
    return {
      valid: true,
    };
  };

  private readonly getInvalidExamples = (
    action: Action,
    extractedArguments: ActionArgument<string>[],
  ) =>
    action.examples?.filter(
      (example) =>
        (example.arguments?.length || 0) !== extractedArguments.length,
    ) || [];

  private readonly getInvalidArguments = (action: Action) =>
    extractArguments(action.arguments).filter(
      (argument) => !argument.name.match(nameRegex),
    );
}
