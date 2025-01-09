import { Action } from './action';

/**
 * This action echoes the input to the output. This is meant for the agent to consider
 * its actions before taking them and introspect about results.
 */
export class ThinkAction implements Action<'thought'> {
  public readonly name: string = 'think';
  public readonly arguments: Action<'thought'>['arguments'] = [
    {
      name: 'thought',
      description: 'The thought that will be saved to history.',
    },
  ];
  public readonly description: string =
    'This action echoes its input to the output. This will be retained in history, ' +
    'but it will not be published externally. This is useful for considering and reasoning prior to taking other actions ' +
    'or introspecting on results after taking another action.';
  public readonly examples: Action<'thought'>['examples'] = [
    {
      arguments: ['I should plan my next few actions before taking them.'],
      result: 'I should plan my next few actions before taking them.',
    },
    {
      arguments: [
        'That did not turn out how I expected. I will change strategies when I try again.',
      ],
      result:
        'That did not turn out how I expected. I will change strategies when I try again.',
    },
  ];
  public readonly apply = async (
    args: Record<'thought', string>,
  ): Promise<string> => {
    return args.thought;
  };
}
