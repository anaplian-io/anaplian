import { Action } from '../actions';
import { Validator } from './validator';

const nameRegex = /^(\w+)$/;

export class ActionValidator implements Validator<Action> {
  public readonly validate = async (
    action: Action,
  ): Promise<{ valid: true } | { valid: false; reason: string }> => {
    if (!action.name.match(nameRegex)) {
      return {
        valid: false,
        reason: `${action.name}: Action name "${action.name}" does not match regex ${nameRegex}`,
      };
    }
    const invalidExamples = this.getInvalidExamples(action);
    if (invalidExamples.length > 0) {
      return {
        valid: false,
        reason: `${action.name}: Found an example with ${invalidExamples[0]?.arguments?.length} argument(s) but ${action.arguments?.length || 0} expected.`,
      };
    }
    const invalidArguments = this.getInvalidArguments(action);
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

  private readonly getInvalidExamples = (action: Action) =>
    action.examples?.filter(
      (example) => example.arguments?.length !== action.arguments?.length,
    ) || [];

  private readonly getInvalidArguments = (action: Action) =>
    action.arguments?.filter((argument) => !argument.name.match(nameRegex)) ||
    [];
}
