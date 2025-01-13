import { Client, Collection } from 'discord.js';
import { ListChannelsAction } from '../list-channels-action';
import { isListChannelsResult } from '../list-channels-action.guard';

describe('ListChannelsAction', () => {
  it('fetches a list of channels', async () => {
    const dummyChannels = [
      { id: '123456789012345678', name: 'general', isTextBased: () => true },
      {
        id: '987654321098765432',
        name: 'bot-commands',
        isTextBased: () => true,
      },
      {
        id: '112233445566778899',
        name: 'voice-channel',
        isTextBased: () => false,
      },
      {
        id: 'fake',
      },
    ];
    const dummyChannelCollection = new Collection<string, unknown>(
      dummyChannels.map((channel) => [
        channel.id,
        channel.id === 'fake' ? null : channel,
      ]),
    );
    const mockDiscordClient = {
      guilds: {
        fetch: jest.fn().mockResolvedValue({
          channels: {
            fetch: jest.fn().mockResolvedValue(dummyChannelCollection),
          },
        }),
      },
    } as unknown as Client;
    const listChannelsAction = new ListChannelsAction({
      discordClient: mockDiscordClient,
    });
    const listChannelsResult = JSON.parse(
      await listChannelsAction.apply({
        guildSnowflake: '123456789012345678',
      }),
    );
    expect(isListChannelsResult(listChannelsResult)).toBeTruthy();
    expect(listChannelsResult).toStrictEqual({
      channels: [
        {
          name: 'general',
          snowflake: '123456789012345678',
        },
        {
          name: 'bot-commands',
          snowflake: '987654321098765432',
        },
      ],
    });
  });

  it('raises an error', async () => {
    const mockDiscordClient = {
      guilds: {
        fetch: jest
          .fn()
          .mockRejectedValue(new Error('Failed to fetch guilds.')),
      },
    } as unknown as Client;
    const listChannelsAction = new ListChannelsAction({
      discordClient: mockDiscordClient,
    });
    const listChannelsResult = JSON.parse(
      await listChannelsAction.apply({
        guildSnowflake: '123456789012345678',
      }),
    );
    expect(isListChannelsResult(listChannelsResult)).toBeTruthy();
    expect(listChannelsResult).toStrictEqual({
      error: 'Error: Failed to fetch guilds.',
      channels: [],
    });
  });
});
