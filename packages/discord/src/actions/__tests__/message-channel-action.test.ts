import { Client } from 'discord.js';
import { MessageChannelAction } from '../message-channel-action';

describe('MessageChannelAction', () => {
  it('sends a message to a text channel', async () => {
    const mockChannel = {
      isTextBased: jest.fn().mockReturnValue(true),
      send: jest.fn().mockResolvedValue(true),
    };
    const mockClient = {
      channels: {
        cache: {
          get: jest.fn().mockReturnValue(mockChannel),
        },
      },
    } as unknown as Client;
    const messageChannelAction = new MessageChannelAction({
      discordClient: mockClient,
    });
    await expect(
      messageChannelAction.apply({
        channelSnowflake: '3885535482831922002',
        message: 'This is a message.',
      }),
    ).resolves.toBe('Successfully sent to 3885535482831922002.');
    expect(mockChannel.isTextBased).toHaveBeenCalledTimes(1);
    expect(mockClient.channels.cache.get).toHaveBeenCalledTimes(1);
    expect(mockChannel.send).toHaveBeenCalledWith('This is a message.');
  });

  it('throws an error during message send', async () => {
    const mockChannel = {
      isTextBased: jest.fn().mockReturnValue(true),
      send: jest.fn().mockRejectedValue(new Error('An error happened.')),
    };
    const mockClient = {
      channels: {
        cache: {
          get: jest.fn().mockReturnValue(mockChannel),
        },
      },
    } as unknown as Client;
    const messageChannelAction = new MessageChannelAction({
      discordClient: mockClient,
    });
    await expect(
      messageChannelAction.apply({
        channelSnowflake: '3885535482831922002',
        message: 'This is a message.',
      }),
    ).resolves.toBe('Error: An error happened.');
    expect(mockChannel.isTextBased).toHaveBeenCalledTimes(1);
    expect(mockClient.channels.cache.get).toHaveBeenCalledTimes(1);
    expect(mockChannel.send).toHaveBeenCalledWith('This is a message.');
  });

  it('returns an error when not a text-based channel', async () => {
    const mockChannel = {
      isTextBased: jest.fn().mockReturnValue(false),
      send: jest.fn(),
    };
    const mockClient = {
      channels: {
        cache: {
          get: jest.fn().mockReturnValue(mockChannel),
        },
      },
    } as unknown as Client;
    const messageChannelAction = new MessageChannelAction({
      discordClient: mockClient,
    });
    await expect(
      messageChannelAction.apply({
        channelSnowflake: '3885535482831922002',
        message: 'This is a message.',
      }),
    ).resolves.toBe('Error: this channel is not text-based.');
    expect(mockChannel.isTextBased).toHaveBeenCalledTimes(1);
    expect(mockClient.channels.cache.get).toHaveBeenCalledTimes(1);
    expect(mockChannel.send).not.toHaveBeenCalled();
  });

  it('returns an error when channel not found', async () => {
    const mockClient = {
      channels: {
        cache: {
          get: jest.fn().mockReturnValue(undefined),
        },
      },
    } as unknown as Client;
    const messageChannelAction = new MessageChannelAction({
      discordClient: mockClient,
    });
    await expect(
      messageChannelAction.apply({
        channelSnowflake: '3885535482831922002',
        message: 'This is a message.',
      }),
    ).resolves.toBe(
      'Error: channel was not found. Try listing channels for this guild to refresh the cache.',
    );
    expect(mockClient.channels.cache.get).toHaveBeenCalledTimes(1);
  });
});
