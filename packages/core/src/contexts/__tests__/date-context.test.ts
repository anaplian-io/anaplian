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

  it('gets the next date context', async () => {
    const contextProvider = new DateContextProvider();
    await expect(contextProvider.getNextContext()).resolves.toStrictEqual({
      isoDate: '2024-06-09T20:58:46.000Z',
      epochTimeMilliseconds: 1717966726000,
    });
  });
});
