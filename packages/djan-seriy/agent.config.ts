import { AgentConfig } from './src/agent-config';
import { ChatOpenAI } from '@langchain/openai';

export default {
  name: 'a-cool-mcp-agent',
  description: 'An AI agent invocable through model context protocol.',
  guidance:
    'You are a helpful agent that uses your available actions to answer user queries.',
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
  contextWindowSize: 100_000,
  mcpServers: {},
} satisfies AgentConfig;
