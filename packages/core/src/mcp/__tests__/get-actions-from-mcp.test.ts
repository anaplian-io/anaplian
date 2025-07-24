import { getActionsFromMcp } from '../get-actions-from-mcp';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InvalidSyntaxError } from '../../errors/agent-error';
import Mock = jest.Mock;

describe('getActionsFromMcp', () => {
  let mcpClientMock: Client;

  beforeEach(() => {
    mcpClientMock = {
      listTools: jest.fn(),
      callTool: jest.fn(),
    } as unknown as Client;
  });

  it('should process valid input correctly', async () => {
    const mockTools = [
      {
        name: 'testTool',
        description: 'Test tool description',
        inputSchema: {
          type: 'object',
          properties: { testParam: { type: 'string' } },
          required: ['testParam'],
        },
        annotations: {
          readOnlyHint: true,
          destructiveHint: true,
          idempotentHint: true,
          openWorldHint: true,
        },
      },
    ];

    (<Mock>mcpClientMock.listTools).mockResolvedValue({ tools: mockTools });
    (<Mock>mcpClientMock.callTool).mockResolvedValue({
      result: 'test response',
    });

    const result = await getActionsFromMcp(mcpClientMock);

    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('testTool');
    expect(result[0]!.description).toContain('Test tool description');
    expect(result[0]!.description).toContain(
      'This action does not modify anything.',
    );
    expect(result[0]!.description).toContain(
      'This action makes destructive changes.',
    );
    expect(result[0]!.description).toContain('This action is idempotent.');
    expect(result[0]!.description).toContain(
      'This tool interacts with external systems or an open environment.',
    );
    expect(result[0]!.arguments).toStrictEqual({
      jsonInput: {
        description:
          'Accepts structured input with the following JSON schema: ' +
          JSON.stringify(mockTools[0]!.inputSchema),
      },
    });

    const applyResult = await result[0]!.apply({
      jsonInput: JSON.stringify({ testParam: 'testValue' }),
    });
    expect(applyResult).toBe('{\"result\":\"test response\"}');
  });

  it('should handle invalid input correctly', async () => {
    const mockTools = [
      {
        name: 'testTool',
        description: 'Test tool description',
        inputSchema: {
          type: 'object',
          properties: { testParam: { type: 'string' } },
          required: ['testParam'],
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
        },
      },
    ];

    (<Mock>mcpClientMock.listTools).mockResolvedValue({ tools: mockTools });
    (<Mock>mcpClientMock.callTool).mockResolvedValue({
      result: 'test response',
    });

    const result = await getActionsFromMcp(mcpClientMock);

    await expect(
      result[0]!.apply({ jsonInput: 'invalid JSON' }),
    ).rejects.toThrow(InvalidSyntaxError);
  });

  it('should handle edge cases', async () => {
    const mockTools = [
      {
        name: 'emptyTool',
        inputSchema: {},
        annotations: {},
      },
    ];

    (<Mock>mcpClientMock.listTools).mockResolvedValue({ tools: mockTools });
    (<Mock>mcpClientMock.callTool).mockResolvedValue({
      result: 'test response',
    });

    const result = await getActionsFromMcp(mcpClientMock);

    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('emptyTool');
    expect(result[0]!.description).toBe('');

    const applyResult = await result[0]!.apply({
      jsonInput: JSON.stringify({}),
    });
    expect(applyResult).toBe('{\"result\":\"test response\"}');
  });
});
