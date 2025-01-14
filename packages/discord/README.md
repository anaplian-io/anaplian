# **@anaplian/discord**

This package provides actions for Anaplian agents for interacting with Discord.

---

## **Installation**

```bash
npm install --save @anaplian/discord
```

## **API Reference**

### **Actions**

#### `ListChannelsAction`

**Description**
Lists all text channels in a guild. This action invokes an API call.

**Parameters**

- `discordClient` - A [discord.js](https://discord.js.org) client. The client is assumed to be logged in and ready.

#### `MessageChannelAction`

**Description**
Sends a message to a channel. The channel is assumed to be cached.

**Parameters**

- `discordClient` - A [discord.js](https://discord.js.org) client. The client is assumed to be logged in and ready.

### **Context Providers**

#### `GuildContextProvider`

**Description**
Provides all guilds and their corresponding snowflakes to the agent. This context provider reads from the cache.

**Parameters**

- `discordClient` - A [discord.js](https://discord.js.org) client. The client is assumed to be logged in and ready.
