import yahooFinance from 'yahoo-finance2';
import { MarketQuote, MarketQuoteAction } from '../market-quote-action';

jest.mock('yahoo-finance2', () => ({
  quote: jest.fn(),
}));

describe('MarketQuoteAction', () => {
  const mockQuote = yahooFinance.quote as jest.Mock;
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches a quote for a symbol', async () => {
    const returnedData: MarketQuote = {
      symbol: 'MOCK',
      marketState: 'REGULAR',
      quoteType: 'EQUITY',
    };
    mockQuote.mockResolvedValue(returnedData);
    const marketQuoteAction = new MarketQuoteAction();
    const result = JSON.parse(
      await marketQuoteAction.apply({
        symbol: 'MOCK',
      }),
    );
    expect(result).toStrictEqual(returnedData);
    expect(mockQuote).toHaveBeenCalledTimes(1);
    expect(mockQuote).toHaveBeenCalledWith('MOCK');
  });

  it('throws an exception', async () => {
    mockQuote.mockRejectedValue(new Error('An error happened.'));
    const marketQuoteAction = new MarketQuoteAction();
    await expect(
      marketQuoteAction.apply({
        symbol: 'MOCK',
      }),
    ).resolves.toBe('Error: An error happened.');
    expect(mockQuote).toHaveBeenCalledTimes(1);
    expect(mockQuote).toHaveBeenCalledWith('MOCK');
  });
});
