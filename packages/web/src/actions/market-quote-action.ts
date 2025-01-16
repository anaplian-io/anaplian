import { Action } from '@anaplian/core';
import yahooFinance from 'yahoo-finance2';

/** @see {isMarketQuote} ts-auto-guard:type-guard */
export type MarketQuote = {
  readonly symbol: string;
  readonly quoteType: string;
  readonly marketState: string;
  readonly displayName?: string;
  readonly regularMarketPrice?: number;
  readonly currency?: string;
  readonly fiftyTwoWeekHigh?: number;
  readonly fiftyTwoWeekLow?: number;
  readonly preMarketPrice?: number;
  readonly postMarketPrice?: number;
};

/**
 * Fetches a quote for a symbol using Yahoo Finance.
 */
export class MarketQuoteAction implements Action<'symbol'> {
  public readonly name = 'stockQuote';
  public readonly arguments: Action<'symbol'>['arguments'] = [
    {
      name: 'symbol',
      description:
        'The security symbol to fetch. This may be a stock, cryptocurrency, mutual fund, ETF, currency, or option symbol.',
      exampleValidValues: ['AAPL', 'aapl', 'spy'],
      exampleInvalidValues: ['$AAPL', '$aapl'],
    },
  ];
  public readonly description =
    'Gets a live quote for the given symbol using Yahoo Finance.';
  public readonly examples: Action<'symbol'>['examples'] = [
    {
      arguments: ['AAPL'],
      result: JSON.stringify(<MarketQuote>{
        symbol: 'AAPL',
        displayName: 'Apple',
        marketState: 'REGULAR',
        quoteType: 'EQUITY',
        regularMarketPrice: 136.76,
        currency: 'USD',
        fiftyTwoWeekHigh: 145.09,
        fiftyTwoWeekLow: 53.1525,
      }),
    },
    {
      arguments: ['___'],
      result: 'Error: symbol "___" not found.',
    },
  ];
  public readonly apply: Action<'symbol'>['apply'] = (args) =>
    yahooFinance
      .quote(args.symbol.toUpperCase())
      .then(
        (result) =>
          <MarketQuote>{
            symbol: result.symbol,
            quoteType: result.quoteType,
            displayName: result.displayName,
            marketState: result.marketState,
            regularMarketPrice: result.regularMarketPrice,
            currency: result.currency,
            fiftyTwoWeekHigh: result.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: result.fiftyTwoWeekLow,
            preMarketPrice: result.preMarketPrice,
            postMarketPrice: result.postMarketPrice,
          },
      )
      .then(JSON.stringify)
      .catch((error) => `${error}`);
}
