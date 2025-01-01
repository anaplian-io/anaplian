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
        ERROR:
          'Context provider "foo" used 6992 tokens, which exceeds its maximum allocation of 6000 tokens',
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
      getTokenCount: jest.fn().mockRejectedValue(new Error()),
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
    ).rejects.toThrow();
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
});
