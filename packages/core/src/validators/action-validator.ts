import { Action } from '../actions';
import { Validator } from './validator';

export class ActionValidator implements Validator<Action> {
  public readonly validate = async (
    action: Action,
  ): Promise<{ valid: true } | { valid: false; reason: string }> => {
    const invalidExamples =
      action.examples?.filter(
        (example) => example.arguments?.length !== action.arguments?.length,
      ) || [];
    if (invalidExamples.length > 0) {
      return {
        valid: false,
        reason: `Found an example with ${invalidExamples[0]?.arguments?.length} argument(s) but ${action.arguments?.length || 0} expected.`,
      };
    }
    return {
      valid: true,
    };
  };
}
