import { AgentConfig } from './agent-config.js';
import {
  AgentBuilder,
  AnaplianAgent,
  DateContextProvider,
  HistoryContextProvider,
  isHistoryContext,
} from '@anaplian/core';
import { ReturnAction } from './return-action.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client';

export const packageAgent = async (
  config: AgentConfig & { readonly query: string },
) => {
  let agent: AnaplianAgent | undefined = undefined;
  let returnedResult: string = '<AGENT RETURNED NO VALUE>';
  const agentBuilder = new AgentBuilder({
    model: config.model,
    roleAssignmentDirective: `User query: \n\n> ${config.query}\n\nUse the "return" action to return your response to the user.\n${config.guidance}`,
  })
    .setContextWindowSize(config.contextWindowSize)
    .addAction(new ReturnAction())
    .addContextProvider(new HistoryContextProvider({}), 99)
    .addContextProvider(new DateContextProvider(), 1)
    .setOn('afterIterationEnd', async (context) => {
      const history = context.history;
      if (isHistoryContext(history)) {
        const lastItem = history.records[history.records.length - 1];
        if (lastItem) {
          console.info(`AGENT: ${lastItem.actionTaken}`);
          console.info(`RESULT: ${lastItem.result}`);
          if (lastItem.actionTaken.startsWith('return(')) {
            const extractedResult = lastItem.actionTaken.match(
              /"([^"\\]*(?:\\.[^"\\]*)*)"/,
            )?.[1];
            returnedResult = extractedResult ?? returnedResult;
            agent?.shutdown();
          }
        }
      }
    });
  await Promise.all(
    Object.entries(config.mcpServers).map(async ([name, definition]) => {
      const mcpClient = new Client({
        name,
        version: '0.1.0',
      });
      await mcpClient.connect(
        new StdioClientTransport({
          command: definition.command,
          env: definition.env,
          cwd: definition.cwd,
          args: definition.args,
        }),
      );
      agentBuilder.addMcpClient(mcpClient);
    }),
  );
  agent = await agentBuilder.build();
  return {
    run: () =>
      agent?.run().then(() => returnedResult) ??
      Promise.resolve(returnedResult),
  };
};
