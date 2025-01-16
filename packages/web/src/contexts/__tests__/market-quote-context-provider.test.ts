import yahooFinance from 'yahoo-finance2';
import { MarketQuoteContextProvider } from '../market-quote-context-provider';

jest.mock('yahoo-finance2', () => ({
  quote: jest.fn(),
}));

describe('MarketQuoteContextProvider', () => {
  const mockQuote = yahooFinance.quote as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const symbols = ['AAPL', 'NVDA', 'SPY'];
  const mockQuotes = [
    {
      symbol: 'AAPL',
      quoteType: 'EQUITY',
      displayName: 'Apple',
      marketState: 'REGULAR',
      regularMarketPrice: 136.76,
      currency: 'USD',
      fiftyTwoWeekHigh: 145.09,
      fiftyTwoWeekLow: 53.1525,
      preMarketPrice: 137.5,
      postMarketPrice: 136.2,
    },
    {
      symbol: 'NVDA',
      quoteType: 'EQUITY',
      displayName: 'NVIDIA',
      marketState: 'REGULAR',
      regularMarketPrice: 280.5,
      currency: 'USD',
      fiftyTwoWeekHigh: 300.0,
      fiftyTwoWeekLow: 150.0,
      preMarketPrice: 281.0,
      postMarketPrice: 280.0,
    },
  ];

  it('should fetch initial context with market quotes', async () => {
    mockQuote.mockResolvedValue(mockQuotes);
    const provider = new MarketQuoteContextProvider({ symbols });
    const context = await provider.getInitialContext({
      getTokenCount: jest.fn(),
      maximumAllowedTokens: 1000,
    });
    expect(mockQuote).toHaveBeenCalledWith(symbols);
    expect(context).toStrictEqual({
      quotes: [
        {
          symbol: 'AAPL',
          quoteType: 'EQUITY',
          displayName: 'Apple',
          marketState: 'REGULAR',
          regularMarketPrice: 136.76,
          currency: 'USD',
          fiftyTwoWeekHigh: 145.09,
          fiftyTwoWeekLow: 53.1525,
          preMarketPrice: 137.5,
          postMarketPrice: 136.2,
        },
        {
          symbol: 'NVDA',
          quoteType: 'EQUITY',
          displayName: 'NVIDIA',
          marketState: 'REGULAR',
          regularMarketPrice: 280.5,
          currency: 'USD',
          fiftyTwoWeekHigh: 300.0,
          fiftyTwoWeekLow: 150.0,
          preMarketPrice: 281.0,
          postMarketPrice: 280.0,
        },
      ],
    });
  });

  it('should handle errors gracefully when fetching initial context', async () => {
    mockQuote.mockRejectedValue(new Error('Some error occurred'));
    const provider = new MarketQuoteContextProvider({ symbols });
    await expect(
      provider.getInitialContext({
        getTokenCount: jest.fn(),
        maximumAllowedTokens: 1000,
      }),
    ).rejects.toThrow('Some error occurred');
  });

  it('should fetch next context based on prior context', async () => {
    const priorContext = { marketQuotes: { quotes: [] } };
    const provider = new MarketQuoteContextProvider({ symbols });
    const context = await provider.getNextContext({
      getTokenCount: jest.fn(),
      maximumAllowedTokens: 1000,
      actionResult: '',
      actionTaken: '',
      priorContext,
    });
    expect(context).toStrictEqual({ quotes: [] });
  });

  it('should refresh the context correctly', async () => {
    mockQuote.mockResolvedValue(mockQuotes);
    const provider = new MarketQuoteContextProvider({ symbols });
    const context = await provider.refresh?.({
      getTokenCount: jest.fn(),
      maximumAllowedTokens: 1000,
      priorContext: {
        marketQuotes: {
          quotes: [],
        },
      },
    });
    expect(mockQuote).toHaveBeenCalledWith(symbols);
    expect(context).toStrictEqual({
      quotes: [
        {
          symbol: 'AAPL',
          quoteType: 'EQUITY',
          displayName: 'Apple',
          marketState: 'REGULAR',
          regularMarketPrice: 136.76,
          currency: 'USD',
          fiftyTwoWeekHigh: 145.09,
          fiftyTwoWeekLow: 53.1525,
          preMarketPrice: 137.5,
          postMarketPrice: 136.2,
        },
        {
          symbol: 'NVDA',
          quoteType: 'EQUITY',
          displayName: 'NVIDIA',
          marketState: 'REGULAR',
          regularMarketPrice: 280.5,
          currency: 'USD',
          fiftyTwoWeekHigh: 300.0,
          fiftyTwoWeekLow: 150.0,
          preMarketPrice: 281.0,
          postMarketPrice: 280.0,
        },
      ],
    });
  });

  it('should have the correct key and description', () => {
    const provider = new MarketQuoteContextProvider({ symbols });
    expect(provider.key).toBe('marketQuotes');
    expect(provider.description).toBe(
      `Contains realtime market quotes for the symbols AAPL, NVDA, SPY. This is refreshed each iteration.`,
    );
  });

  it('should provide correct field descriptions and examples', () => {
    const provider = new MarketQuoteContextProvider({ symbols });
    expect(provider.fieldDescriptions).toStrictEqual({
      quotes: `An array containing realtime market quotes for AAPL, NVDA, SPY.`,
    });
    expect(provider.examples).toStrictEqual([
      {
        example: {
          quotes: [
            {
              symbol: 'AAPL',
              displayName: 'Apple',
              marketState: 'REGULAR',
              quoteType: 'EQUITY',
              regularMarketPrice: 136.76,
              currency: 'USD',
              fiftyTwoWeekHigh: 145.09,
              fiftyTwoWeekLow: 53.1525,
            },
          ],
        },
        description: 'Contains a single stock quote from Apple (AAPL).',
      },
    ]);
  });
});
