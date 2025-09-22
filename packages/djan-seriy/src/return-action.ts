import { Action } from '@anaplian/core';

export class ReturnAction implements Action<'value'> {
  public readonly name: string = 'return';
  public readonly description: string =
    'Returns a value back to the caller. Use this action when you have completed your task.';
  public readonly arguments: Action<'value'>['arguments'] = {
    value: {
      description: 'The value that will be returned back to your caller.',
    },
  };
  public readonly examples: Action<'value'>['examples'] = [
    {
      arguments: ['I have finished my task.'],
      result: 'I have finished my task.',
    },
  ];
  public readonly apply = async (
    args: Record<'value', string>,
  ): Promise<string> => args.value;
}
