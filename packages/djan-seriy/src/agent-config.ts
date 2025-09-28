import { BaseLLM } from '@langchain/core/language_models/llms';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export type AgentConfig = {
  readonly name: string;
  readonly title?: string;
  readonly version: string;
  readonly description?: string;
  readonly guidance?: string;
  readonly model: BaseLLM | BaseChatModel;
  readonly contextWindowSize: number;
  readonly annotations?: {
    readonly destructiveHint?: boolean;
    readonly idempotentHint?: boolean;
    readonly readOnlyHint?: boolean;
    readonly openWorldHint?: boolean;
  };
  readonly mcpServers: Record<
    string,
    {
      readonly command: string;
      readonly args?: string[];
      readonly env?: Record<string, string>;
      readonly cwd?: string;
    }
  >;
};
