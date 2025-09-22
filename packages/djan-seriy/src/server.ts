import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { packageAgent } from './package-agent';
import c from '../agent.config';
import { AgentConfig } from './agent-config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const agentConfig = c as AgentConfig;

const server = new McpServer({
  name: agentConfig.name,
  version: agentConfig.version,
});

server.registerTool(
  `${agentConfig.name}_invoke`,
  {
    description: agentConfig.description,
    annotations: agentConfig.annotations,
    title: agentConfig.title,
    inputSchema: {
      query: z.string({
        description: 'Natural language query that will be sent to the agent.',
      }),
    },
  },
  async ({ query }) =>
    packageAgent({
      ...agentConfig,
      query,
    })
      .then((agent) => agent.run())
      .then((result) => ({
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      })),
);

const transport = new StdioServerTransport();

(async () => {
  await server.connect(transport);
})();
