import { TavilyClient, TavilySearchAction } from '../tavily-search-action';
import { tavily } from '@tavily/core';
import { isTavilySearchResult } from '../tavily-search-action.guard';

describe('TavilySearchAction', () => {
  const tavilyClient: TavilyClient = tavily({ apiKey: 'a-fake-api-key' });
  const searchAction = new TavilySearchAction({ tavilyClient, maxResults: 5 });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('verifies the example results have the correct shape', () => {
    expect.assertions(1);
    searchAction.examples.forEach((example) =>
      expect(isTavilySearchResult(JSON.parse(example.result))).toBeTruthy(),
    );
  });

  it('performs a search with tavily', async () => {
    expect.assertions(3);
    const searchMock = jest.spyOn(tavilyClient, 'search').mockResolvedValue({
      answer: 'This is an answer!',
      query: 'What is the answer?',
      responseTime: 99,
      images: [],
      results: [
        {
          url: 'https://example.com',
          title: 'This is the title',
          content: 'Some nifty content, yeah?',
          score: 0.99,
          publishedDate: '',
        },
      ],
    });
    const actionResult = await searchAction.apply({
      query: 'What is the answer?',
    });
    const parsedResult = JSON.parse(actionResult);
    expect(isTavilySearchResult(parsedResult)).toBeTruthy();
    expect(parsedResult).toStrictEqual({
      resultSummary: 'This is an answer!',
      results: [
        {
          url: 'https://example.com',
          title: 'This is the title',
          content: 'Some nifty content, yeah?',
        },
      ],
    });
    expect(searchMock).toHaveBeenCalledTimes(1);
  });
});
