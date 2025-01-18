import { HttpGetAction } from './http-get-action';
import { Action } from '@anaplian/core';
import TurndownService from 'turndown';

/**
 * Properties for HttpGetMarkdownAction.
 */
export interface HttpGetMarkdownActionProps {
  /**
   * A TurndownService for customizing the markdown conversion.
   */
  readonly turndownService?: TurndownService;
  /**
   * An HttpGetAction for customizing the HTTP request.
   */
  readonly parentAction?: HttpGetAction;
}

/**
 * Performs an HTTP GET request and returns the raw content.
 * HTML will be converted to markdown if possible.
 */
export class HttpGetMarkdownAction implements Action<'url'> {
  private readonly props: Required<HttpGetMarkdownActionProps>;

  constructor(props: HttpGetMarkdownActionProps) {
    this.props = {
      turndownService: new TurndownService(),
      parentAction: new HttpGetAction(),
      ...props,
    };
  }

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
    'Performs an HTTP GET request to the desired URL. Use this action when you want to fetch the raw content from web site. ' +
    'If the site is HTML, the result will be converted into markdown format.';
  public readonly examples: Action<'url'>['examples'] = [
    {
      arguments: ['https://example.com/index.html'],
      result: '## Heading \n* Some \n* Content',
    },
    {
      arguments: ['https://example.com/object.json'],
      result: JSON.stringify({ name: 'object', value: 55 }),
    },
  ];
  public readonly apply: Action<'url'>['apply'] = (props) =>
    this.props.parentAction
      .apply(props)
      .then((result) => this.props.turndownService.turndown(result));
}
