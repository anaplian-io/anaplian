import { Client, TextChannel } from 'discord.js';
import { Action } from '@anaplian/core';

/**
 * Properties for building a MessageChannelsAction.
 */
export interface MessageChannelActionProps {
  /**
   * Discord.js client. This is assumed to logged in and ready.
   */
  readonly discordClient: Client;
}

/**
 * Sends a message to a channel. The channel is assumed to be cached.
 */
export class MessageChannelAction
  implements Action<'message' | 'channelSnowflake'>
{
  constructor(private readonly props: MessageChannelActionProps) {}
  public readonly name = 'messageChannel';
  public readonly arguments: Action<
    'message' | 'channelSnowflake'
  >['arguments'] = [
    {
      name: 'message',
      description:
        'The text of the message that will be sent. Double quotes and newlines should be escaped.',
    },
    {
      name: 'channelSnowflake',
      description:
        'The snowflake (globally unique identifier) of the channel to message. ' +
        'This channel must be text-based, and you must have access.',
      exampleValidValues: ['3885535482831922002'],
      exampleInvalidValues: ['#general', 'general'],
    },
  ];
  public readonly description =
    'Sends a message to a discord channel. ' +
    'The channel should be a text-only channel that you have access to.';
  public readonly examples: Action<'message' | 'channelSnowflake'>['examples'] =
    [
      {
        arguments: ['3885535482831922002', 'How is everyone doing today?'],
        result: 'Successfully sent to 3885535482831922002.',
      },
      {
        arguments: ['3885535482831922002', 'How is everyone doing today?'],
        result: 'Error: this channel is not text-based.',
      },
      {
        arguments: ['3885535482831922002', 'How is everyone doing today?'],
        result:
          'Error: channel was not found. Try listing channels for this guild to refresh the cache..',
      },
    ];
  public readonly apply = async (
    args: Record<'message' | 'channelSnowflake', string>,
  ): Promise<string> => {
    const channel = this.props.discordClient.channels.cache.get(
      args.channelSnowflake,
    );
    if (channel) {
      if (channel.isTextBased()) {
        return (channel as TextChannel)
          .send(args.message)
          .then(() => `Successfully sent to ${args.channelSnowflake}.`)
          .catch((error) => `${error}`);
      }
      return 'Error: this channel is not text-based.';
    } else {
      return 'Error: channel was not found. Try listing channels for this guild to refresh the cache.';
    }
  };
}
