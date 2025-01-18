import {
  AgentBuilder,
  AnaplianAgent,
  DateContextProvider,
  HistoryContextProvider,
  isHistoryContext,
  NopAction,
  ThinkAction,
} from '@anaplian/core';
import { ChatOpenAI } from '@langchain/openai';
import { getEnvironmentVariable } from './environment';
import { HttpGetMarkdownAction, TavilySearchAction } from '@anaplian/web';
import { tavily } from '@tavily/core';
import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import {
  GuildContextProvider,
  ListChannelsAction,
  MessageChannelAction,
} from '@anaplian/discord';

const openAiApiKey = getEnvironmentVariable('OPEN_AI_API_KEY');
const directive = getEnvironmentVariable('DIRECTIVE');
const tavilyApiKey = getEnvironmentVariable('TAVILY_API_KEY');
const discordToken = getEnvironmentVariable('DISCORD_BOT_TOKEN');
let djanSeriy: AnaplianAgent | undefined;
const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
discordClient
  .login(discordToken)
  .then(() => {
    console.info('CONNECTED TO DISCORD');
    const modelName = 'gpt-4o-mini';
    return new AgentBuilder({
      modelName,
      roleAssignmentDirective: directive,
      model: new ChatOpenAI({
        apiKey: openAiApiKey,
        model: modelName,
        streaming: false,
        temperature: 0,
      }),
    })
      .addAction(new NopAction())
      .addAction(new ThinkAction())
      .addAction(
        new TavilySearchAction({
          tavilyClient: tavily({ apiKey: tavilyApiKey }),
          maxResults: 5,
        }),
      )
      .addAction(
        new ListChannelsAction({
          discordClient,
        }),
      )
      .addAction(
        new MessageChannelAction({
          discordClient,
        }),
      )
      .addAction(new HttpGetMarkdownAction({}))
      .addContextProvider(new HistoryContextProvider({}), 97.5)
      .addContextProvider(new DateContextProvider(), 0.5)
      .addContextProvider(
        new GuildContextProvider({
          discordClient,
        }),
        2,
      )
      .setOn('beforeShutdown', async (context) => {
        console.info('SHUTTING DOWN...');
        console.info(JSON.stringify(context));
      })
      .setOn('afterIterationEnd', async (context) => {
        const history = context.history;
        if (isHistoryContext(history)) {
          const lastItem = history.records[history.records.length - 1];
          if (lastItem) {
            console.info(`AGENT: ${lastItem.actionTaken}`);
            console.info(`RESULT: ${lastItem.result}`);
            if (lastItem.actionTaken === 'nop()') {
              await djanSeriy?.shutdown().then(() => process.exit(0));
            }
          }
        }
      })
      .setOn('fatalError', async (error) => {
        console.error(error);
      })
      .build();
  })
  .then((agent) => {
    djanSeriy = agent;
    console.info('SETTING SHUTDOWN HOOK');
    process.on('SIGINT', agent.shutdown);
    console.info('RUNNING AGENT');
    return agent.run();
  });
