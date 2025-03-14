import { AgentValidator } from '../agent-validator';
import { AnaplianAgent } from '../../agents';
import { Validator } from '../validator';
import { ContextProvider } from '../../contexts';
import { Action } from '../../actions';

describe(AgentValidator, () => {
  const validator: Validator<AnaplianAgent> = new AgentValidator();
  it.each<AnaplianAgent>([
    {
      run: jest.fn(),
      shutdown: jest.fn(),
      initialize: jest.fn(),
      next: jest.fn(),
      metadata: {
        modelContextWindowSize: 4,
        modelName: '',
        availableActions: [{} as unknown as Action],
        instructionsTokens: 1,
        paddingTokens: 1,
        contextProviders: [
          {
            maximumAllowedTokens: 1,
            provider: { key: 'foo' } as unknown as ContextProvider<
              never,
              never
            >,
          },
          {
            maximumAllowedTokens: 1,
            provider: { key: 'bar' } as unknown as ContextProvider<
              never,
              never
            >,
          },
        ],
      },
    },
    {
      run: jest.fn(),
      shutdown: jest.fn(),
      initialize: jest.fn(),
      next: jest.fn(),
      metadata: {
        modelContextWindowSize: 10,
        modelName: '',
        availableActions: [{} as unknown as Action],
        instructionsTokens: 1,
        paddingTokens: 1,
        initialContext: {
          foo: {},
          bar: {},
        },
        contextProviders: [
          {
            maximumAllowedTokens: 1,
            provider: { key: 'foo' } as unknown as ContextProvider<
              never,
              never
            >,
          },
          {
            maximumAllowedTokens: 1,
            provider: { key: 'bar' } as unknown as ContextProvider<
              never,
              never
            >,
          },
        ],
      },
    },
  ])('is valid', async (agent) => {
    expect.assertions(5);
    expect(agent.run).not.toHaveBeenCalled();
    expect(agent.shutdown).not.toHaveBeenCalled();
    expect(agent.next).not.toHaveBeenCalled();
    expect(agent.initialize).not.toHaveBeenCalled();
    await expect(validator.validate(agent)).resolves.toStrictEqual({
      valid: true,
    });
  });

  it.each<AnaplianAgent>([
    {
      run: jest.fn(),
      shutdown: jest.fn(),
      initialize: jest.fn(),
      next: jest.fn(),
      metadata: {
        modelContextWindowSize: 3,
        modelName: '',
        availableActions: [{} as unknown as Action],
        instructionsTokens: 1,
        paddingTokens: 1,
        initialContext: {
          foo: {},
          bar: {},
        },
        contextProviders: [
          {
            maximumAllowedTokens: 1,
            provider: { key: 'foo' } as unknown as ContextProvider<
              never,
              never
            >,
          },
          {
            maximumAllowedTokens: 1,
            provider: { key: 'bar' } as unknown as ContextProvider<
              never,
              never
            >,
          },
        ],
      },
    },
    {
      run: jest.fn(),
      shutdown: jest.fn(),
      initialize: jest.fn(),
      next: jest.fn(),
      metadata: {
        modelContextWindowSize: 4,
        modelName: '',
        availableActions: [],
        instructionsTokens: 1,
        paddingTokens: 1,
        initialContext: {
          foo: {},
          bar: {},
        },
        contextProviders: [
          {
            maximumAllowedTokens: 1,
            provider: { key: 'foo' } as unknown as ContextProvider<
              never,
              never
            >,
          },
          {
            maximumAllowedTokens: 1,
            provider: { key: 'bar' } as unknown as ContextProvider<
              never,
              never
            >,
          },
        ],
      },
    },
    {
      run: jest.fn(),
      shutdown: jest.fn(),
      initialize: jest.fn(),
      next: jest.fn(),
      metadata: {
        modelContextWindowSize: 4,
        modelName: '',
        availableActions: [{} as unknown as Action],
        instructionsTokens: 1,
        paddingTokens: 1,
        initialContext: {
          foo: {},
          baz: {},
        },
        contextProviders: [
          {
            maximumAllowedTokens: 1,
            provider: { key: 'foo' } as unknown as ContextProvider<
              never,
              never
            >,
          },
          {
            maximumAllowedTokens: 1,
            provider: { key: 'bar' } as unknown as ContextProvider<
              never,
              never
            >,
          },
        ],
      },
    },
    {
      run: jest.fn(),
      shutdown: jest.fn(),
      initialize: jest.fn(),
      next: jest.fn(),
      metadata: {
        modelContextWindowSize: 4,
        modelName: '',
        availableActions: [{} as unknown as Action],
        instructionsTokens: 1,
        paddingTokens: 1,
        initialContext: {
          foo: {},
        },
        contextProviders: [
          {
            maximumAllowedTokens: 1,
            provider: { key: 'foo' } as unknown as ContextProvider<
              never,
              never
            >,
          },
          {
            maximumAllowedTokens: 1,
            provider: { key: 'bar' } as unknown as ContextProvider<
              never,
              never
            >,
          },
        ],
      },
    },
    {
      run: jest.fn(),
      shutdown: jest.fn(),
      initialize: jest.fn(),
      next: jest.fn(),
      metadata: {
        modelContextWindowSize: 4,
        modelName: '',
        availableActions: [{} as unknown as Action],
        instructionsTokens: 1,
        paddingTokens: 1,
        initialContext: {
          foo: {},
          bar: {},
        },
        contextProviders: [
          {
            maximumAllowedTokens: 1,
            provider: { key: 'foo' } as unknown as ContextProvider<
              never,
              never
            >,
          },
          {
            maximumAllowedTokens: 1,
            provider: { key: 'baz' } as unknown as ContextProvider<
              never,
              never
            >,
          },
        ],
      },
    },
    {
      run: jest.fn(),
      shutdown: jest.fn(),
      initialize: jest.fn(),
      next: jest.fn(),
      metadata: {
        modelContextWindowSize: 4,
        modelName: '',
        availableActions: [{} as unknown as Action],
        instructionsTokens: 1,
        paddingTokens: 1,
        initialContext: {
          foo: {},
          bar: {},
        },
        contextProviders: [
          {
            maximumAllowedTokens: 1,
            provider: { key: 'foo' } as unknown as ContextProvider<
              never,
              never
            >,
          },
        ],
      },
    },
    {
      run: jest.fn(),
      shutdown: jest.fn(),
      initialize: jest.fn(),
      next: jest.fn(),
      metadata: {
        modelContextWindowSize: 4,
        modelName: '',
        availableActions: [{} as unknown as Action],
        instructionsTokens: 1,
        paddingTokens: 1,
        initialContext: {
          foo: {},
          bar: {},
        },
        contextProviders: [
          {
            maximumAllowedTokens: 1,
            provider: { key: 'foo' } as unknown as ContextProvider<
              never,
              never
            >,
          },
          {
            maximumAllowedTokens: -1,
            provider: { key: 'bar' } as unknown as ContextProvider<
              never,
              never
            >,
          },
        ],
      },
    },
    {
      run: jest.fn(),
      shutdown: jest.fn(),
      initialize: jest.fn(),
      next: jest.fn(),
      metadata: {
        modelContextWindowSize: 4,
        modelName: '',
        availableActions: [{} as unknown as Action],
        instructionsTokens: 1,
        paddingTokens: 1,
        initialContext: {},
        contextProviders: [],
      },
    },
    {
      run: jest.fn(),
      shutdown: jest.fn(),
      initialize: jest.fn(),
      next: jest.fn(),
      metadata: {
        modelContextWindowSize: 10,
        modelName: '',
        availableActions: [{} as unknown as Action],
        instructionsTokens: 1,
        paddingTokens: -1,
        initialContext: {
          foo: {},
          bar: {},
        },
        contextProviders: [
          {
            maximumAllowedTokens: 1,
            provider: { key: 'foo' } as unknown as ContextProvider<
              never,
              never
            >,
          },
          {
            maximumAllowedTokens: 1,
            provider: { key: 'bar' } as unknown as ContextProvider<
              never,
              never
            >,
          },
        ],
      },
    },
    {
      run: jest.fn(),
      shutdown: jest.fn(),
      initialize: jest.fn(),
      next: jest.fn(),
      metadata: {
        modelContextWindowSize: -1,
        modelName: '',
        availableActions: [{} as unknown as Action],
        instructionsTokens: 1,
        paddingTokens: 1,
        initialContext: {
          foo: {},
          bar: {},
        },
        contextProviders: [
          {
            maximumAllowedTokens: 1,
            provider: { key: 'foo' } as unknown as ContextProvider<
              never,
              never
            >,
          },
          {
            maximumAllowedTokens: 1,
            provider: { key: 'bar' } as unknown as ContextProvider<
              never,
              never
            >,
          },
        ],
      },
    },
    {
      run: jest.fn(),
      shutdown: jest.fn(),
      initialize: jest.fn(),
      next: jest.fn(),
      metadata: {
        modelContextWindowSize: 10,
        modelName: '',
        availableActions: [{} as unknown as Action],
        instructionsTokens: 1,
        paddingTokens: 1,
        initialContext: {
          foo: {},
          bar: {},
        },
        contextProviders: [
          {
            maximumAllowedTokens: 1,
            provider: { key: 'foo' } as unknown as ContextProvider<
              never,
              never
            >,
          },
          {
            maximumAllowedTokens: 1,
            provider: { key: 'foo' } as unknown as ContextProvider<
              never,
              never
            >,
          },
        ],
      },
    },
    {
      run: jest.fn(),
      shutdown: jest.fn(),
      initialize: jest.fn(),
      next: jest.fn(),
      metadata: {
        modelContextWindowSize: 10,
        modelName: '',
        availableActions: [{} as unknown as Action],
        instructionsTokens: -1,
        paddingTokens: 1,
        initialContext: {
          foo: {},
          bar: {},
        },
        contextProviders: [
          {
            maximumAllowedTokens: 1,
            provider: { key: 'foo' } as unknown as ContextProvider<
              never,
              never
            >,
          },
          {
            maximumAllowedTokens: 1,
            provider: { key: 'bar' } as unknown as ContextProvider<
              never,
              never
            >,
          },
        ],
      },
    },
  ])('is invalid', async (agent) => {
    expect.assertions(5);
    expect(agent.run).not.toHaveBeenCalled();
    expect(agent.shutdown).not.toHaveBeenCalled();
    expect(agent.initialize).not.toHaveBeenCalled();
    expect(agent.next).not.toHaveBeenCalled();
    await expect(validator.validate(agent)).resolves.toStrictEqual(
      expect.objectContaining({
        valid: false,
      }),
    );
  });
});
