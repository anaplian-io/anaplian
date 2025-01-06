import { HistoryContext, HistoryContextProvider } from '../history-context';
import { GetNextContextProps } from '../context';

describe('HistoryContextProvider', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-09T20:58:46Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('gets an initial context', async () => {
    const provider = new HistoryContextProvider({});
    await expect(provider.getInitialContext()).resolves.toStrictEqual({
      records: [],
    });
  });

  it('gets a next context without adjusting the window', async () => {
    expect.assertions(3);
    const provider = new HistoryContextProvider({});
    const props: GetNextContextProps<'history', HistoryContext> = {
      actionResult: 'bar',
      actionTaken: 'foo()',
      getTokenCount: jest.fn().mockResolvedValue(1),
      maximumAllowedTokens: 1,
      priorContext: {
        history: {
          records: [
            {
              actionTaken: 'one()',
              result: 'two',
              date: '2024-06-08T20:58:46.000Z',
            },
          ],
        },
      },
    };
    await expect(provider.getNextContext(props)).resolves.toStrictEqual({
      records: [
        {
          actionTaken: 'one()',
          result: 'two',
          date: '2024-06-08T20:58:46.000Z',
        },
        {
          actionTaken: 'foo()',
          result: 'bar',
          date: '2024-06-09T20:58:46.000Z',
        },
      ],
    });
    expect(props.getTokenCount).toHaveBeenCalledTimes(1);
    expect(props.getTokenCount).toHaveBeenCalledWith({
      records: [
        {
          actionTaken: 'one()',
          result: 'two',
          date: '2024-06-08T20:58:46.000Z',
        },
        {
          actionTaken: 'foo()',
          result: 'bar',
          date: '2024-06-09T20:58:46.000Z',
        },
      ],
    });
  });

  it('returns an emtpy context if the token count is never satisfied', async () => {
    expect.assertions(2);
    const provider = new HistoryContextProvider({});
    const props: GetNextContextProps<'history', HistoryContext> = {
      actionResult: 'bar',
      actionTaken: 'foo()',
      getTokenCount: jest.fn().mockResolvedValue(1),
      maximumAllowedTokens: 0,
      priorContext: {
        history: {
          records: [
            {
              actionTaken: 'one()',
              result: 'two',
              date: '2024-06-08T20:58:46.000Z',
            },
            {
              actionTaken: 'foo()',
              result: 'bar',
              date: '2024-06-09T20:58:46.000Z',
            },
          ],
        },
      },
    };
    await expect(provider.getNextContext(props)).resolves.toStrictEqual({
      records: [],
    });
    expect(props.getTokenCount).toHaveBeenCalledTimes(3);
  });

  it('returns a context trimmed by 1', async () => {
    expect.assertions(2);
    const provider = new HistoryContextProvider({});
    const props: GetNextContextProps<'history', HistoryContext> = {
      actionResult: 'three',
      actionTaken: 'three()',
      getTokenCount: jest
        .fn()
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1),
      maximumAllowedTokens: 1,
      priorContext: {
        history: {
          records: [
            {
              actionTaken: 'one()',
              result: 'one',
              date: '2024-06-07T20:58:46.000Z',
            },
            {
              actionTaken: 'two()',
              result: 'two',
              date: '2024-06-08T20:58:46.000Z',
            },
          ],
        },
      },
    };
    await expect(provider.getNextContext(props)).resolves.toStrictEqual({
      records: [
        {
          actionTaken: 'two()',
          result: 'two',
          date: '2024-06-08T20:58:46.000Z',
        },
        {
          actionTaken: 'three()',
          result: 'three',
          date: '2024-06-09T20:58:46.000Z',
        },
      ],
    });
    expect(props.getTokenCount).toHaveBeenCalledTimes(2);
  });

  it('returns a context trimmed by the chunk size', async () => {
    expect.assertions(2);
    const provider = new HistoryContextProvider({
      chunkSize: 2,
    });
    const props: GetNextContextProps<'history', HistoryContext> = {
      actionResult: 'three',
      actionTaken: 'three()',
      getTokenCount: jest
        .fn()
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1),
      maximumAllowedTokens: 1,
      priorContext: {
        history: {
          records: [
            {
              actionTaken: 'one()',
              result: 'one',
              date: '2024-06-07T20:58:46.000Z',
            },
            {
              actionTaken: 'two()',
              result: 'two',
              date: '2024-06-08T20:58:46.000Z',
            },
          ],
        },
      },
    };
    await expect(provider.getNextContext(props)).resolves.toStrictEqual({
      records: [
        {
          actionTaken: 'three()',
          result: 'three',
          date: '2024-06-09T20:58:46.000Z',
        },
      ],
    });
    expect(props.getTokenCount).toHaveBeenCalledTimes(2);
  });
});
