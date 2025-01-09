import { Action, ActionArgument } from '@anaplian/core';
import { tavily } from '@tavily/core';

export type TavilyClient = ReturnType<typeof tavily>;

export interface TavilySearchActionProps {
  /**
   * An instance of the official Tavily client.
   */
  readonly tavilyClient: TavilyClient;
  /**
   * The maximum number of results to include.
   */
  readonly maxResults: number;
}

/** @see {isTavilySearchResult} ts-auto-guard:type-guard */
export type TavilySearchResult = {
  readonly resultSummary: string;
  readonly error?: string;
  readonly results: {
    readonly title: string;
    readonly content: string;
    readonly url: string;
  }[];
};

/**
 * Performs an Internet search using tavily.
 */
export class TavilySearchAction implements Action {
  constructor(private readonly props: TavilySearchActionProps) {}
  public readonly name = 'search';
  public readonly arguments: ActionArgument[] = [
    {
      name: 'query',
      description: 'The Internet search query.',
      exampleValidValues: [
        'What are the top announcements from CES today?',
        'latest news',
        'langchain documentation',
        'austin, tx michelin restaurants',
      ],
    },
  ];
  public readonly description =
    'Searches the Internet and results an answer to a query as well as a list of sources with summaries. ' +
    'The exact number of returned results is not guaranteed. ' +
    'Use this action when you want to search the Internet for facts, information, news, or to verify or cross-reference ' +
    'other information. Remember that not all results may be factually correct and consider the sources carefully.';
  public readonly examples: {
    readonly arguments: string[];
    readonly result: string;
  }[] = [
    {
      arguments: ['What is the capital of Oregon?'],
      result: JSON.stringify(<TavilySearchResult>{
        resultSummary: 'The capital of Oregon is Salem.',
        results: [
          {
            title: 'US Capitals',
            content: 'All of the U.S. capitals in one place.',
            url: 'https://capitals.example.com',
          },
          {
            title: 'Meet Oregon',
            content: "Oregon's largest city is Portland. It's capital is Salem",
            url: 'https://oregon.example.com',
          },
        ],
      }),
    },
    {
      arguments: ['What is the capital of Oregon?'],
      result: JSON.stringify(<TavilySearchResult>{
        resultSummary: '',
        error:
          'Error: The search engine threw an error while processing; please try again.',
        results: [],
      }),
    },
  ];
  public readonly apply = async (
    args: Record<string, string>,
  ): Promise<string> => {
    const searchResult: TavilySearchResult = await this.props.tavilyClient
      .search(args.query!, {
        maxResults: this.props.maxResults,
        includeAnswer: true,
      })
      .then((response) => ({
        resultSummary: response.answer!,
        results: response.results.map((result) => ({
          title: result.title,
          content: result.content,
          url: result.url,
        })),
      }))
      .catch((error) => ({
        resultSummary: '',
        error: `${error}`,
        results: [],
      }));
    return JSON.stringify(searchResult);
  };
}
