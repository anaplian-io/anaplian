import { AgentBuilder } from '../agent-builder';
import { FakeChatModel, FakeLLM } from '@langchain/core/utils/testing';
import {
  InvalidActionError,
  InvalidAgentParametersError,
} from '../../errors/agent-validation-error';
import { ChatOpenAI } from '@langchain/openai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

describe('AgentBuilder', () => {
  it('throws an InvalidAgentParametersError', async () => {
    const builder = new AgentBuilder({
      model: new FakeChatModel({}),
      roleAssignmentDirective: 'You are an agent. You do agent things.',
      modelName: 'a-fake-model',
    });
    await expect(builder.build()).rejects.toThrow(InvalidAgentParametersError);
  });

  it('throws an InvalidActionError', async () => {
    const builder = new AgentBuilder({
      model: new FakeChatModel({}),
      roleAssignmentDirective: 'You are an agent. You do agent things.',
      modelName: 'a-fake-model',
    }).addAction({
      apply: jest.fn(),
      description: '',
      name: 'an invalid action name',
    });
    await expect(builder.build()).rejects.toThrow(InvalidActionError);
  });

  it('successfully builds an agent with a fresh context', async () => {
    const builder = new AgentBuilder({
      roleAssignmentDirective: '',
      model: new ChatOpenAI({
        model: 'gpt-4o-mini',
        apiKey: 'fake-api-key',
      }),
      modelName: 'gpt-4o-mini',
    })
      .addAction({
        apply: jest.fn(),
        description: 'mock action',
        name: 'nop',
      })
      .addMcpClient({
        listTools: jest.fn().mockResolvedValue({
          tools: [
            {
              name: 'mockMcpTool',
              description: 'does not very much',
              inputSchema: {},
            },
          ],
        }),
      } as unknown as Client)
      .setOn('fatalError', jest.fn().mockRejectedValue(new Error()))
      .addContextProvider(
        {
          key: 'foo',
          description: '',
          examples: [],
          fieldDescriptions: {},
          getInitialContext: jest.fn(),
          getNextContext: jest.fn(),
        },
        1,
      )
      .addContextProvider(
        {
          key: 'bar',
          description: '',
          examples: [],
          fieldDescriptions: {},
          getInitialContext: jest.fn(),
          getNextContext: jest.fn(),
        },
        2,
      );
    const agent = await builder.build();
    expect(agent.metadata.modelName).toBe('gpt-4o-mini');
    expect(agent.metadata.modelContextWindowSize).toBe(128000);
    expect(agent.metadata.instructionsTokens).toBeGreaterThan(200);
    expect(agent.metadata.instructionsTokens).toBeLessThan(300);
    expect(agent.metadata.paddingTokens).toBe(6400);
    expect(agent.metadata.availableActions.length).toBe(2);
  });

  it('successfully builds an agent with an existing context', async () => {
    const builder = new AgentBuilder({
      roleAssignmentDirective: '',
      model: new FakeChatModel({}),
    })
      .addAction({
        apply: jest.fn(),
        description: 'mock action',
        name: 'nop',
      })
      .setOn('fatalError', jest.fn().mockRejectedValue(new Error()))
      .addContextProvider(
        {
          key: 'foo',
          description: '',
          examples: [],
          fieldDescriptions: {},
          getInitialContext: jest.fn(),
          getNextContext: jest.fn(),
        },
        1,
      )
      .addContextProvider(
        {
          key: 'bar',
          description: '',
          examples: [],
          fieldDescriptions: {},
          getInitialContext: jest.fn(),
          getNextContext: jest.fn(),
        },
        2,
      )
      .setContextWindowSize(1000)
      .setPaddingTokens(100)
      .setInitialContext({ foo: {}, bar: {} });
    const agent = await builder.build();
    expect(agent.metadata.modelContextWindowSize).toBe(1000);
    expect(agent.metadata.paddingTokens).toBe(100);
    expect(agent.metadata.instructionsTokens).toBe(264);
    expect(agent.metadata.modelName).toBe('unspecified');
  });

  it('tests the event handlers', async () => {
    const builder = new AgentBuilder({
      model: new FakeLLM({}),
      modelName: 'a-fake-model',
      roleAssignmentDirective: 'You are an agent. You do agent things.',
    });
    const mockFunction = jest.fn();
    await Promise.all(
      Object.values(builder['events']).map(async (event) => await event({})),
    );
    expect(mockFunction).not.toHaveBeenCalled();
    builder
      .setOn('fatalError', mockFunction)
      .setOn('afterInitialize', mockFunction)
      .setOn('afterIterationEnd', mockFunction)
      .setOn('beforeIterationStart', mockFunction)
      .setOn('beforeShutdown', mockFunction);
    expect(mockFunction).not.toHaveBeenCalled();
    await Promise.all(
      Object.values(builder['events']).map(async (event) => await event({})),
    );
    expect(mockFunction).toHaveBeenCalledTimes(5);
  });
});
