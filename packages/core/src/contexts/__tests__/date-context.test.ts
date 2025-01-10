import { DateContextProvider } from '../date-context';

describe('DateContextProvider', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-09T20:58:46Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('gets the initial date context', async () => {
    const contextProvider = new DateContextProvider();
    await expect(contextProvider.getInitialContext()).resolves.toStrictEqual({
      isoDate: '2024-06-09T20:58:46.000Z',
      epochTimeMilliseconds: 1717966726000,
    });
  });

  it('gets echoes back the old date on get next date', async () => {
    const contextProvider = new DateContextProvider();
    await expect(
      contextProvider.getNextContext({
        actionResult: '',
        actionTaken: '',
        getTokenCount: jest.fn().mockRejectedValue(new Error()),
        maximumAllowedTokens: 0,
        priorContext: {
          date: {
            epochTimeMilliseconds: 10,
            isoDate: 'January 1, 1970',
          },
        },
      }),
    ).resolves.toStrictEqual({
      epochTimeMilliseconds: 10,
      isoDate: 'January 1, 1970',
    });
  });

  it('refreshes the date context', async () => {
    const contextProvider = new DateContextProvider();
    await expect(contextProvider.refresh()).resolves.toStrictEqual({
      isoDate: '2024-06-09T20:58:46.000Z',
      epochTimeMilliseconds: 1717966726000,
    });
  });
});
