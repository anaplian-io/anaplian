import { AgentConfig } from './src/agent-config';
import { ChatOpenAI } from '@langchain/openai';

export default {
  name: 'a-cool-mcp-agent',
  description: 'An AI agent invocable through model context protocol.',
  version: '0.1.0',
  model: new ChatOpenAI({
    apiKey: 'NA',
    configuration: {
      baseURL: 'http://127.0.0.1:1234/v1',
    },
    model: 'gpt-oss-120b',
  }),
  annotations: {
    idempotentHint: true,
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: false,
  },
  contextWindowSize: 60_000,
  mcpServers: {},
} satisfies AgentConfig;
