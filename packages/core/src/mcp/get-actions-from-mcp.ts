import { Action } from '../actions';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InvalidSyntaxError } from '../errors/agent-error';

export const getActionsFromMcp = async (
  mcpClient: Client,
): Promise<Action<'jsonInput'>[]> => {
  const mcpTools = await mcpClient
    .listTools()
    .then((response) => response.tools);
  return mcpTools.map((tool) => ({
    name: tool.name,
    description: (
      `${tool.description ?? ''}\n` +
      `${tool.annotations?.readOnlyHint ? 'This action does not modify anything.' : ''} ` +
      `${tool.annotations?.destructiveHint ? 'This action makes destructive changes.' : ''} ` +
      `${tool.annotations?.idempotentHint ? 'This action is idempotent.' : ''} ` +
      `${tool.annotations?.openWorldHint ? 'This tool interacts with external systems or an open environment.' : ''}`
    ).trim(),
    arguments: {
      jsonInput: {
        description: `Accepts structured input with the following JSON schema: ${JSON.stringify(tool.inputSchema)}`,
      },
    },
    apply: async (args) => {
      let parsedArguments: Record<string, unknown>;
      try {
        parsedArguments = JSON.parse(args.jsonInput);
      } catch (e) {
        throw new InvalidSyntaxError(`${e}`);
      }
      return mcpClient
        .callTool({
          name: tool.name,
          arguments: parsedArguments,
        })
        .then((result) => JSON.stringify(result));
    },
  }));
};
