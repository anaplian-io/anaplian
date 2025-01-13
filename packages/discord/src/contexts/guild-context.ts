import { Client } from 'discord.js';
import { ContextProvider } from '@anaplian/core';

/**
 * Properties for building a GuildContextProvider.
 */
export interface GuildContextProviderProps {
  /**
   * Discord.js client. This is assumed to logged in and ready.
   */
  readonly discordClient: Client;
}

/** @see {isGuildContext} ts-auto-guard:type-guard */
export type GuildContext = {
  readonly guilds: {
    readonly name: string;
    readonly snowflake: string;
  }[];
};

/**
 * Provides all guilds and their corresponding snowflakes to the agent.
 * This context provider reads from the cache.
 */
export class GuildContextProvider
  implements ContextProvider<'discordGuilds', GuildContext>
{
  constructor(private readonly props: GuildContextProviderProps) {}
  public readonly getNextContext: ContextProvider<
    'discordGuilds',
    GuildContext
  >['getNextContext'] = async (props) => props.priorContext.discordGuilds;
  public readonly getInitialContext: ContextProvider<
    'guilds',
    GuildContext
  >['getInitialContext'] = async () => ({
    guilds: this.props.discordClient.guilds.cache.map((guild, snowflake) => ({
      name: guild.name,
      snowflake,
    })),
  });
  public readonly refresh: ContextProvider<'discordGuilds', GuildContext>['refresh'] =
    (props) => this.getInitialContext(props);
  public readonly key = 'discordGuilds';
  public readonly description =
    'Provides a list of Discords servers (known as "guilds" in the Discord API) that ' +
    'you can access along with their snowflakes, which are globally unique identifiers.';
  public readonly fieldDescriptions: Record<keyof GuildContext, string> = {
    guilds: 'An array of guilds. Contains the guild name and its snowflake.',
  };
  public readonly examples: ContextProvider<
    'guilds',
    GuildContext
  >['examples'] = [
    {
      example: {
        guilds: [
          {
            name: 'A Gaming Server',
            snowflake: '123456789012345678',
          },
          {
            name: 'A D&D Server',
            snowflake: '1328110446854686116',
          },
        ],
      },
      description:
        'There are two accessible guides: "A Gaming Server" and "A D&D Server". Their snowflakes are provided ' +
        'so that they can be referenced in actions you take.',
    },
  ];
}
