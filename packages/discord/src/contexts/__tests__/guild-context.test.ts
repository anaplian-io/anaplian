import { Client } from 'discord.js';
import { GuildContextProvider } from '../guild-context';

describe('GuildContextProvider', () => {
  const mockDiscordClient = {
    guilds: {
      cache: {
        map: jest
          .fn()
          .mockImplementation((fn) => [
            fn({ name: 'a-mock-guild' }, 'a-mock-guild-snowflake'),
          ]),
      },
    },
  } as unknown as Client;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets the next context', async () => {
    const provider = new GuildContextProvider({
      discordClient: mockDiscordClient,
    });
    await expect(
      provider.getNextContext({
        actionResult: 'N/A',
        actionTaken: 'N/A',
        getTokenCount: jest.fn(),
        maximumAllowedTokens: 0,
        priorContext: {
          discordGuilds: {
            guilds: [
              {
                name: 'prior guild name',
                snowflake: 'prior guild snowflake',
              },
            ],
          },
        },
      }),
    ).resolves.toStrictEqual({
      guilds: [
        {
          name: 'prior guild name',
          snowflake: 'prior guild snowflake',
        },
      ],
    });
    expect(mockDiscordClient.guilds.cache.map).toHaveBeenCalledTimes(0);
  });

  it('gets the initial context', async () => {
    const provider = new GuildContextProvider({
      discordClient: mockDiscordClient,
    });
    await expect(
      provider.getInitialContext({
        getTokenCount: jest.fn(),
        maximumAllowedTokens: 0,
      }),
    ).resolves.toStrictEqual({
      guilds: [
        {
          name: 'a-mock-guild',
          snowflake: 'a-mock-guild-snowflake',
        },
      ],
    });
    expect(mockDiscordClient.guilds.cache.map).toHaveBeenCalledTimes(1);
  });

  it('refreshes the context provider', async () => {
    const provider = new GuildContextProvider({
      discordClient: mockDiscordClient,
    });
    await expect(
      provider.refresh?.({
        getTokenCount: jest.fn(),
        maximumAllowedTokens: 0,
        priorContext: {
          discordGuilds: {
            guilds: [
              {
                name: 'prior guild name',
                snowflake: 'prior guild snowflake',
              },
            ],
          },
        },
      }),
    ).resolves.toStrictEqual({
      guilds: [
        {
          name: 'a-mock-guild',
          snowflake: 'a-mock-guild-snowflake',
        },
      ],
    });
    expect(mockDiscordClient.guilds.cache.map).toHaveBeenCalledTimes(1);
  });
});
