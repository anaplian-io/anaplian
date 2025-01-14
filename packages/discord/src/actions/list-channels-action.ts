import { ChannelType, Client } from 'discord.js';
import { Action, ActionArgument } from '@anaplian/core';

/**
 * Properties for building a ListChannelsAction.
 */
export interface ListChannelsActionProps {
  /**
   * Discord.js client. This is assumed to logged in and ready.
   */
  readonly discordClient: Client;
}

/** @see {isListChannelsResult} ts-auto-guard:type-guard */
export type ListChannelsResult = {
  readonly error?: string;
  readonly channels: {
    readonly name: string;
    readonly snowflake: string;
  }[];
};

/**
 * Lists all text channels in a guild.
 * This action invokes an API call.
 */
export class ListChannelsAction implements Action<'guildSnowflake'> {
  constructor(private readonly props: ListChannelsActionProps) {}
  public readonly name = 'listChannels';
  public readonly arguments: [ActionArgument<'guildSnowflake'>] = [
    {
      name: 'guildSnowflake',
      description:
        'The snowflake of the guild whose channels should be listed.',
      exampleValidValues: ['123456789012345678'],
      exampleInvalidValues: ['A D&D Server'],
    },
  ];
  public readonly description =
    'Lists all channels of the guild whose snowflake was provided. ' +
    'The name of the channel as well as the channel snowflake are provided. Note that channels are sometimes ' +
    'referred to use the "#" symbol (e.g. "#general"), but they will be referred to here without the "#" ' +
    '(e.g. "general"). These two forms are equivalent when referred to by users. Only text-based channels ' +
    'will be returned.';
  public readonly examples: Action<'guildSnowflake'>['examples'] = [
    {
      arguments: ['123456789012345678'],
      result: JSON.stringify(<ListChannelsResult>{
        channels: [
          {
            name: 'general',
            snowflake: '3885535482831922002',
          },
          {
            name: 'bot-posts',
            snowflake: '1025252554979491473',
          },
        ],
      }),
    },
    {
      arguments: ['123456789012345678'],
      result: JSON.stringify(<ListChannelsResult>{
        error: 'Error: Channel does not exist or you do not have access to it.',
        channels: [],
      }),
    },
  ];
  public readonly apply = async (
    args: Record<'guildSnowflake', string>,
  ): Promise<string> =>
    this.props.discordClient.guilds
      .fetch(args.guildSnowflake)
      .then((guild) => guild.channels.fetch())
      .then((channelsCollection) =>
        JSON.stringify({
          channels: channelsCollection
            .filter(
              (channel) => !!channel && channel.type === ChannelType.GuildText,
            )
            .map((channel) => ({
              name: channel?.name,
              snowflake: channel?.id,
            })),
        }),
      )
      .catch((error) =>
        JSON.stringify({
          error: `${error}`,
          channels: [],
        }),
      );
}
