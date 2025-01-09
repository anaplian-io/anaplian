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
import { TavilySearchAction, HttpGetAction } from '@anaplian/web';
import { tavily } from '@tavily/core';

const openAiApiKey = getEnvironmentVariable('OPEN_AI_API_KEY');
const directive = getEnvironmentVariable('DIRECTIVE');
const tavilyApiKey = getEnvironmentVariable('TAVILY_API_KEY');
const modelName = 'gpt-4o-mini';
let djanSeriy: AnaplianAgent | undefined;
new AgentBuilder({
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
  .addAction(new HttpGetAction())
  .addContextProvider(new HistoryContextProvider({}), 99.5)
  .addContextProvider(new DateContextProvider(), 0.5)
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
          await djanSeriy?.shutdown();
        }
      }
    }
  })
  .setOn('fatalError', async (error) => {
    console.error(error);
  })
  .build()
  .then((agent) => {
    djanSeriy = agent;
    console.info('SETTING SHUTDOWN HOOK');
    process.on('SIGINT', agent.shutdown);
    return agent;
  })
  .then((agent) => {
    console.info('RUNNING AGENT');
    return agent.run();
  });
