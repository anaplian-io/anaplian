import { ContextProvider } from '@anaplian/core';
import { MarketQuote } from '../actions';
import yahooFinance from 'yahoo-finance2';

/** @see {isMarketQuoteContext} ts-auto-guard:type-guard */
export type MarketQuoteContext = {
  quotes: MarketQuote[];
};

export interface MarketQuoteContextProps {
  /**
   * A string array of market symbols (e.g. ["AAPL", "NVDA", "SPY"]).
   */
  readonly symbols: string[];
}

/**
 * Keeps a defined set of realtime market quotes in the context so that the
 * agent does not have to explicitly request them.
 */
export class MarketQuoteContextProvider
  implements ContextProvider<'marketQuotes', MarketQuoteContext>
{
  constructor(private readonly props: MarketQuoteContextProps) {}
  public readonly getNextContext: ContextProvider<
    'marketQuotes',
    MarketQuoteContext
  >['getNextContext'] = async (props) => props.priorContext.marketQuotes;
  public readonly getInitialContext: ContextProvider<
    'marketQuotes',
    MarketQuoteContext
  >['getInitialContext'] = () =>
    yahooFinance.quote(this.props.symbols).then((results) => ({
      quotes: results.map((result) => ({
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
      })),
    }));
  public readonly refresh: ContextProvider<
    'marketQuotes',
    MarketQuoteContext
  >['refresh'] = async (props) => this.getInitialContext(props);
  public readonly key = 'marketQuotes';
  public readonly description = `Contains realtime market quotes for the symbols ${this.props.symbols
    .map((symbol) => symbol.toUpperCase())
    .join(', ')}. This is refreshed each iteration.`;
  public readonly fieldDescriptions: Record<'quotes', string> = {
    quotes: `An array containing realtime market quotes for ${this.props.symbols
      .map((symbol) => symbol.toUpperCase())
      .join(', ')}.`,
  };
  public readonly examples: ContextProvider<
    'marketQuotes',
    MarketQuoteContext
  >['examples'] = [
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
  ];
}
