import { Action } from '@anaplian/core';
import axios from 'axios';

/**
 * Performs an HTTP GET request and returns the raw content.
 */
export class HttpGetAction implements Action<'url'> {
  public readonly name = 'httpGet';
  public readonly arguments: Action<'url'>['arguments'] = [
    {
      name: 'url',
      description: 'The address to get including protocol.',
      exampleValidValues: [
        'https://www.google.com',
        'https://anaplian.example.com/a.json',
      ],
      exampleInvalidValues: ['google.com'],
    },
  ];
  public readonly description =
    'Performs an HTTP GET request to the desired URL. Use this action when you want to fetch the raw content from web site.';
  public readonly examples: Action<'url'>['examples'] = [
    {
      arguments: ['https://example.com/index.html'],
      result: '<htmL lang="en"><body><p>Some content</p></body></htmL>',
    },
    {
      arguments: ['https://example.com/object.json'],
      result: JSON.stringify({ name: 'object', value: 55 }),
    },
  ];
  public readonly apply = async (
    args: Record<'url', string>,
  ): Promise<string> =>
    axios
      .get<string>(args.url, {
        responseType: 'text',
      })
      .then((response) => response.data)
      .catch((reason) => `${reason}`);
}
