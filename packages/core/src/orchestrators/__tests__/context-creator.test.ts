import { ContextProvider } from '../../contexts';
import { ContextCreator } from '../context-creator';
import { ContextConstructionError } from '../../errors/context-construction-error';
import { AnaplianModel } from '../../common/types';

describe('ContextCreator', () => {
  const getContextMockFunction = (returnObject: object) =>
    jest.fn().mockImplementation(async ({ getTokenCount }) => {
      const tokens: number = await getTokenCount();
      expect(tokens).toBe(6992);
      return Promise.resolve(returnObject);
    });
  const firstMockContextProvider: ContextProvider<
    'foo',
    {
      readonly firstField: string;
      readonly secondField: number;
    }
  > = {
    description: '',
    fieldDescriptions: {
      firstField: '',
      secondField: '',
    },
    getInitialContext: getContextMockFunction({
      firstField: '0',
      secondField: 1,
    }),
    getNextContext: getContextMockFunction({
      firstField: '2',
      secondField: 3,
    }),
    refresh: getContextMockFunction({
      firstField: '5',
      secondField: 6,
    }),
    key: 'foo',
  };

  const secondMockContextProvider: ContextProvider<
    'bar',
    {
      readonly firstField: string[];
    }
  > = {
    description: '',
    fieldDescriptions: {
      firstField: '',
    },
    getInitialContext: getContextMockFunction({
      firstField: ['0', '1'],
    }),
    getNextContext: getContextMockFunction({
      firstField: ['2,', '3'],
    }),
    refresh: getContextMockFunction({
      firstField: ['5', '6'],
    }),
    key: 'bar',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an initial context from two providers', async () => {
    expect.assertions(9);
    const mockModel = {
      getTokenCount: jest.fn().mockResolvedValue(6992),
    } as unknown as AnaplianModel;
    const contextProviders = [
      {
        provider: <ContextProvider<never, never>>firstMockContextProvider,
        maximumAllowedTokens: 7000,
      },
      {
        provider: <ContextProvider<never, never>>secondMockContextProvider,
        maximumAllowedTokens: 7000,
      },
    ];
    const mockSerializer = jest
      .fn()
      .mockImplementation((input) => JSON.stringify(input));
    const contextCreator = new ContextCreator({
      model: mockModel,
      contextProviders: contextProviders,
      serializer: mockSerializer,
    });
    const initialContext = await contextCreator.createInitialContext();
    expect(mockSerializer).toHaveBeenCalledTimes(4);
    expect(mockModel.getTokenCount).toHaveBeenCalledTimes(4);
    expect(firstMockContextProvider.getInitialContext).toHaveBeenCalledTimes(1);
    expect(secondMockContextProvider.getInitialContext).toHaveBeenCalledTimes(
      1,
    );
    expect(firstMockContextProvider.getNextContext).not.toHaveBeenCalled();
    expect(secondMockContextProvider.getNextContext).not.toHaveBeenCalled();
    expect(initialContext).toStrictEqual({
      foo: {
        firstField: '0',
        secondField: 1,
      },
      bar: {
        firstField: ['0', '1'],
      },
    });
  });

  it('fails to create an initial context from two providers because of an exceeded token limit', async () => {
    expect.assertions(9);
    const mockModel = {
      getTokenCount: jest.fn().mockResolvedValue(6992),
    } as unknown as AnaplianModel;
    const contextProviders = [
      {
        provider: <ContextProvider<never, never>>firstMockContextProvider,
        maximumAllowedTokens: 7000,
      },
      {
        provider: <ContextProvider<never, never>>secondMockContextProvider,
        maximumAllowedTokens: 6000,
      },
    ];
    const mockSerializer = jest
      .fn()
      .mockImplementation((input) => JSON.stringify(input));
    const contextCreator = new ContextCreator({
      model: mockModel,
      contextProviders: contextProviders,
      serializer: mockSerializer,
    });
    await expect(contextCreator.createInitialContext()).rejects.toThrow(
      ContextConstructionError,
    );
    expect(mockSerializer).toHaveBeenCalledTimes(4);
    expect(mockModel.getTokenCount).toHaveBeenCalledTimes(4);
    expect(firstMockContextProvider.getInitialContext).toHaveBeenCalledTimes(1);
    expect(secondMockContextProvider.getInitialContext).toHaveBeenCalledTimes(
      1,
    );
    expect(firstMockContextProvider.getNextContext).not.toHaveBeenCalled();
    expect(secondMockContextProvider.getNextContext).not.toHaveBeenCalled();
  });

  it('creates next from two providers', async () => {
    expect.assertions(9);
    const mockModel = {
      getTokenCount: jest.fn().mockResolvedValue(6992),
    } as unknown as AnaplianModel;
    const contextProviders = [
      {
        provider: <ContextProvider<never, never>>firstMockContextProvider,
        maximumAllowedTokens: 7000,
      },
      {
        provider: <ContextProvider<never, never>>secondMockContextProvider,
        maximumAllowedTokens: 7000,
      },
    ];
    const mockSerializer = jest
      .fn()
      .mockImplementation((input) => JSON.stringify(input));
    const contextCreator = new ContextCreator({
      model: mockModel,
      contextProviders: contextProviders,
      serializer: mockSerializer,
    });
    const nextContextArgument = {
      actionResult: 'Nothing was done.',
      actionTaken: 'nop()',
      priorContext: {
        foo: {
          firstField: '0',
          secondField: 1,
        },
        bar: {
          firstField: ['0', '1'],
        },
      },
    };
    const nextContext =
      await contextCreator.createNextContext(nextContextArgument);
    expect(mockSerializer).toHaveBeenCalledTimes(4);
    expect(mockModel.getTokenCount).toHaveBeenCalledTimes(4);
    expect(firstMockContextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(secondMockContextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(firstMockContextProvider.getNextContext).toHaveBeenCalledWith(
      expect.objectContaining(nextContextArgument),
    );
    expect(secondMockContextProvider.getNextContext).toHaveBeenCalledWith(
      expect.objectContaining(nextContextArgument),
    );
    expect(nextContext).toStrictEqual({
      foo: {
        firstField: '2',
        secondField: 3,
      },
      bar: {
        firstField: ['2,', '3'],
      },
    });
  });

  it('creates next from two providers while falling back to a prior', async () => {
    expect.assertions(9);
    const mockModel = {
      getTokenCount: jest.fn().mockResolvedValue(6992),
    } as unknown as AnaplianModel;
    const contextProviders = [
      {
        provider: <ContextProvider<never, never>>firstMockContextProvider,
        maximumAllowedTokens: 6000,
      },
      {
        provider: <ContextProvider<never, never>>secondMockContextProvider,
        maximumAllowedTokens: 7000,
      },
    ];
    const mockSerializer = jest
      .fn()
      .mockImplementation((input) => JSON.stringify(input));
    const contextCreator = new ContextCreator({
      model: mockModel,
      contextProviders: contextProviders,
      serializer: mockSerializer,
    });
    const nextContextArgument = {
      actionResult: 'Nothing was done.',
      actionTaken: 'nop()',
      priorContext: {
        foo: {
          firstField: '0',
          secondField: 1,
        },
        bar: {
          firstField: ['0', '1'],
        },
      },
    };
    const nextContext =
      await contextCreator.createNextContext(nextContextArgument);
    expect(mockSerializer).toHaveBeenCalledTimes(4);
    expect(mockModel.getTokenCount).toHaveBeenCalledTimes(4);
    expect(firstMockContextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(secondMockContextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(firstMockContextProvider.getNextContext).toHaveBeenCalledWith(
      expect.objectContaining(nextContextArgument),
    );
    expect(secondMockContextProvider.getNextContext).toHaveBeenCalledWith(
      expect.objectContaining(nextContextArgument),
    );
    expect(nextContext).toStrictEqual({
      foo: {
        ERROR: {
          message:
            'Context provider "foo" used 6992 tokens, which exceeds its maximum allocation of 6000 tokens',
          code: 'CONTEXT_EXCEEDED_MAXIMUM_TOKENS',
        },
        firstField: '0',
        secondField: 1,
      },
      bar: {
        firstField: ['2,', '3'],
      },
    });
  });

  it('fails to create a next context', async () => {
    expect.assertions(7);
    const mockModel = {
      getTokenCount: jest.fn().mockRejectedValue(new Error('Something failed')),
    } as unknown as AnaplianModel;
    const contextProviders = [
      {
        provider: <ContextProvider<never, never>>firstMockContextProvider,
        maximumAllowedTokens: 7000,
      },
      {
        provider: <ContextProvider<never, never>>secondMockContextProvider,
        maximumAllowedTokens: 7000,
      },
    ];
    const mockSerializer = jest
      .fn()
      .mockImplementation((input) => JSON.stringify(input));
    const contextCreator = new ContextCreator({
      model: mockModel,
      contextProviders: contextProviders,
      serializer: mockSerializer,
    });
    const nextContextArgument = {
      actionResult: 'Nothing was done.',
      actionTaken: 'nop()',
      priorContext: {
        foo: {
          firstField: '0',
          secondField: 1,
        },
        bar: {
          firstField: ['0', '1'],
        },
      },
    };
    await expect(
      contextCreator.createNextContext(nextContextArgument),
    ).resolves.toStrictEqual({
      bar: {
        ERROR: { code: 'UNHANDLED_ERROR_THROWN', message: 'Something failed' },
        firstField: ['0', '1'],
      },
      foo: {
        ERROR: { code: 'UNHANDLED_ERROR_THROWN', message: 'Something failed' },
        firstField: '0',
        secondField: 1,
      },
    });
    expect(mockSerializer).toHaveBeenCalledTimes(2);
    expect(mockModel.getTokenCount).toHaveBeenCalledTimes(2);
    expect(firstMockContextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(secondMockContextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(firstMockContextProvider.getNextContext).toHaveBeenCalledWith(
      expect.objectContaining(nextContextArgument),
    );
    expect(secondMockContextProvider.getNextContext).toHaveBeenCalledWith(
      expect.objectContaining(nextContextArgument),
    );
  });

  it('fails to create a next context without a reason', async () => {
    expect.assertions(7);
    const mockModel = {
      getTokenCount: jest.fn().mockRejectedValue('thrown string'),
    } as unknown as AnaplianModel;
    const contextProviders = [
      {
        provider: <ContextProvider<never, never>>firstMockContextProvider,
        maximumAllowedTokens: 7000,
      },
      {
        provider: <ContextProvider<never, never>>secondMockContextProvider,
        maximumAllowedTokens: 7000,
      },
    ];
    const mockSerializer = jest
      .fn()
      .mockImplementation((input) => JSON.stringify(input));
    const contextCreator = new ContextCreator({
      model: mockModel,
      contextProviders: contextProviders,
      serializer: mockSerializer,
    });
    const nextContextArgument = {
      actionResult: 'Nothing was done.',
      actionTaken: 'nop()',
      priorContext: {
        foo: {
          firstField: '0',
          secondField: 1,
        },
        bar: {
          firstField: ['0', '1'],
        },
      },
    };
    await expect(
      contextCreator.createNextContext(nextContextArgument),
    ).resolves.toStrictEqual({
      bar: {
        ERROR: { code: 'UNHANDLED_ERROR_THROWN', message: undefined },
        firstField: ['0', '1'],
      },
      foo: {
        ERROR: { code: 'UNHANDLED_ERROR_THROWN', message: undefined },
        firstField: '0',
        secondField: 1,
      },
    });
    expect(mockSerializer).toHaveBeenCalledTimes(2);
    expect(mockModel.getTokenCount).toHaveBeenCalledTimes(2);
    expect(firstMockContextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(secondMockContextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(firstMockContextProvider.getNextContext).toHaveBeenCalledWith(
      expect.objectContaining(nextContextArgument),
    );
    expect(secondMockContextProvider.getNextContext).toHaveBeenCalledWith(
      expect.objectContaining(nextContextArgument),
    );
  });

  it('refreshes a context from two providers', async () => {
    expect.assertions(8);
    const mockModel = {
      getTokenCount: jest.fn().mockResolvedValue(6992),
    } as unknown as AnaplianModel;
    const contextProviders = [
      {
        provider: <ContextProvider<never, never>>firstMockContextProvider,
        maximumAllowedTokens: 7000,
      },
      {
        provider: <ContextProvider<never, never>>secondMockContextProvider,
        maximumAllowedTokens: 7000,
      },
    ];
    const mockSerializer = jest
      .fn()
      .mockImplementation((input) => JSON.stringify(input));
    const contextCreator = new ContextCreator({
      model: mockModel,
      contextProviders: contextProviders,
      serializer: mockSerializer,
    });
    const nextContext = {
      foo: {
        firstField: '0',
        secondField: 1,
      },
      bar: {
        firstField: ['0', '1'],
      },
    };
    const refreshedContext = await contextCreator.refreshContext(nextContext);
    expect(mockSerializer).toHaveBeenCalledTimes(4);
    expect(mockModel.getTokenCount).toHaveBeenCalledTimes(4);
    expect(firstMockContextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(secondMockContextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(firstMockContextProvider.getNextContext).not.toHaveBeenCalled();
    expect(refreshedContext).toStrictEqual({
      foo: {
        firstField: '5',
        secondField: 6,
      },
      bar: {
        firstField: ['5', '6'],
      },
    });
  });

  it('fails to refresh a context', async () => {
    expect.assertions(7);
    const mockModel = {
      getTokenCount: jest.fn().mockResolvedValue(6992),
    } as unknown as AnaplianModel;
    const contextProviders = [
      {
        provider: <ContextProvider<never, never>>firstMockContextProvider,
        maximumAllowedTokens: 6000,
      },
    ];
    const mockSerializer = jest
      .fn()
      .mockImplementation((input) => JSON.stringify(input));
    const contextCreator = new ContextCreator({
      model: mockModel,
      contextProviders: contextProviders,
      serializer: mockSerializer,
    });
    const nextContext = {
      foo: {
        firstField: '0',
        secondField: 1,
      },
    };
    const refreshedContext = await contextCreator.refreshContext(nextContext);
    expect(mockSerializer).toHaveBeenCalledTimes(2);
    expect(mockModel.getTokenCount).toHaveBeenCalledTimes(2);
    expect(firstMockContextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(secondMockContextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(firstMockContextProvider.getNextContext).not.toHaveBeenCalled();
    expect(refreshedContext).toStrictEqual({
      foo: {
        ERROR: {
          code: 'CONTEXT_EXCEEDED_MAXIMUM_TOKENS',
          message:
            'Context provider "foo" used 6992 tokens, which exceeds its maximum allocation of 6000 tokens',
        },
        firstField: '0',
        secondField: 1,
      },
    });
  });

  it('fails to refresh a context with an unknown error', async () => {
    expect.assertions(6);
    const mockModel = {
      getTokenCount: jest.fn().mockRejectedValue('thrown string'),
    } as unknown as AnaplianModel;
    const contextProviders = [
      {
        provider: <ContextProvider<never, never>>firstMockContextProvider,
        maximumAllowedTokens: 7000,
      },
    ];

    const mockSerializer = jest
      .fn()
      .mockImplementation((input) => JSON.stringify(input));
    const contextCreator = new ContextCreator({
      model: mockModel,
      contextProviders: contextProviders,
      serializer: mockSerializer,
    });
    const nextContext = {
      foo: {
        firstField: '0',
        secondField: 1,
      },
    };
    const refreshedContext = await contextCreator.refreshContext(nextContext);
    expect(mockSerializer).toHaveBeenCalledTimes(1);
    expect(mockModel.getTokenCount).toHaveBeenCalledTimes(1);
    expect(firstMockContextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(secondMockContextProvider.getInitialContext).not.toHaveBeenCalled();
    expect(firstMockContextProvider.getNextContext).not.toHaveBeenCalled();
    expect(refreshedContext).toStrictEqual({
      foo: {
        ERROR: {
          code: 'UNHANDLED_ERROR_THROWN',
          message: undefined,
        },
        firstField: '0',
        secondField: 1,
      },
    });
  });
});
