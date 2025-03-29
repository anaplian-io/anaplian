import {
  AgentBuilder,
  AnaplianAgent,
  DateContextProvider,
  HistoryContextProvider,
  isHistoryContext,
  NopAction,
  serializeWithoutImages,
  StaticImageContextProvider,
  ThinkAction,
} from '@anaplian/core';
import { getEnvironmentVariable } from './environment';
import { HttpGetMarkdownAction, TavilySearchAction } from '@anaplian/web';
import { tavily } from '@tavily/core';
import 'dotenv/config';
import { Ollama } from '@langchain/ollama';

const directive = getEnvironmentVariable('DIRECTIVE');
const tavilyApiKey = getEnvironmentVariable('TAVILY_API_KEY');
const imageUrl = getEnvironmentVariable('IMAGE_URL');
let djanSeriy: AnaplianAgent | undefined;
(async () => {
  const agent = await new AgentBuilder({
    roleAssignmentDirective: directive,
    model: new Ollama({
      model: 'gemma3:27b',
    }),
  })
    .setContextWindowSize(128_000)
    .addAction(new NopAction())
    .addAction(new ThinkAction())
    .addAction(
      new TavilySearchAction({
        tavilyClient: tavily({ apiKey: tavilyApiKey }),
        maxResults: 5,
      }),
    )
    .addAction(new HttpGetMarkdownAction({}))
    .addContextProvider(new HistoryContextProvider({}), 97)
    .addContextProvider(new DateContextProvider(), 0.5)
    .addContextProvider(
      new StaticImageContextProvider({
        images: [
          {
            annotation: 'Input image',
            imageType: 'jpeg',
            imageContent: await fetch(imageUrl).then(async (response) =>
              Buffer.from(await response.arrayBuffer()),
            ),
          },
        ],
      }),
      0.5,
    )
    .setOn('beforeShutdown', async (context) => {
      console.info('SHUTTING DOWN...');
      console.info(serializeWithoutImages(context));
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
  process.on('SIGINT', agent.shutdown);
  await agent.run();
})();
