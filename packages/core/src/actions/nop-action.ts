import { Action } from './action';

/**
 * This is the no-operation action. Nothing will be done.
 */
export class NopAction implements Action {
  public readonly apply = () => Promise.resolve('No action was taken.');
  public readonly description =
    'This is the no-operation action. Nothing will be done. ' +
    'Use this to wait a turn if there is nothing to do right now.';
  public readonly examples = [
    {
      result: 'No action was taken.',
    },
  ];
  public readonly name = 'nop';
}
