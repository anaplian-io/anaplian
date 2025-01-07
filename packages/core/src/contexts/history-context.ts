import { ContextProvider, GetNextContextProps } from './context';

/** @see {isHistoryContext} ts-auto-guard:type-guard */
export type HistoryContext = {
  readonly records: {
    readonly date: string;
    readonly actionTaken: string;
    readonly result: string;
  }[];
};

/**
 * Properties to pass into HistoryContextProvider.
 */
export interface HistoryContextProviderProps {
  /**
   * The number of records to drop when the size of the history exceeds maximum
   * context size. Default is 10.
   */
  readonly chunkSize?: number;
}

const DEFAULT_CHUNK_SIZE = 10;

/**
 * Tracks the agent's actions taken and results.
 */
export class HistoryContextProvider
  implements ContextProvider<'history', HistoryContext>
{
  constructor(private readonly props: HistoryContextProviderProps) {}
  public readonly getNextContext = async (
    props: GetNextContextProps<'history', HistoryContext>,
  ): Promise<HistoryContext> => {
    const chuckSize = this.props.chunkSize ?? DEFAULT_CHUNK_SIZE;
    let nextContext: HistoryContext = {
      records: [
        ...props.priorContext.history.records,
        {
          date: new Date().toISOString(),
          actionTaken: props.actionTaken,
          result: props.actionResult,
        },
      ],
    };
    while (
      nextContext.records.length > 0 &&
      (await props.getTokenCount(nextContext)) > props.maximumAllowedTokens
    ) {
      const reduction = nextContext.records.length > chuckSize ? chuckSize : 1;
      nextContext = {
        records: nextContext.records.slice(reduction),
      };
    }
    return nextContext;
  };
  public readonly getInitialContext = async (): Promise<HistoryContext> => ({
    records: [],
  });
  public readonly key = 'history';
  public readonly description =
    'This tracks the history of your actions taken and their corresponding results.';
  public readonly fieldDescriptions: Record<'records', string> = {
    records:
      'A list of records of your actions action taken the results of those actions sorted by time. Each record includes a UTC ISO date indicating when you took the action. ' +
      'In most cases, only your action taken will be shown, but if your action triggered a parsing error, your raw output will be shown. Pay attention to any errors thrown while ' +
      'processing actions, and fix your output accordingly. The last item in the list will be the action your previously executed action.',
  };
  public readonly examples: {
    readonly example: HistoryContext;
    readonly description: string;
  }[] = [
    {
      example: {
        records: [
          {
            actionTaken: 'think("I am considering my actions...")',
            result: 'I am considering my actions...',
            date: new Date(1000).toISOString(),
          },
          {
            actionTaken:
              'think("I should take the nop() action since I need to wait for more information.")',
            result:
              'I should take the nop() action since I need to wait for more information.',
            date: new Date(2000).toISOString(),
          },
          {
            actionTaken: 'nop()',
            result: 'No action was taken.',
            date: new Date(3000).toISOString(),
          },
        ],
      },
      description:
        'Three subsequent successful actions taken. The most recent action was "nop()".',
    },
    {
      example: {
        records: [
          {
            actionTaken: 'foo("this","is","not","an","action")',
            result: 'ERROR: "foo" is not a recognized action',
            date: new Date(4000).toISOString(),
          },
          {
            actionTaken: 'This is my output: <output>nop()</out',
            result:
              'ERROR: Failed to parse formatted result from <output> XML tag',
            date: new Date(5000).toISOString(),
          },
        ],
      },
      description:
        'These are examples of incorrect input by the agent and the resulting errors that were thrown.',
    },
  ];
}
