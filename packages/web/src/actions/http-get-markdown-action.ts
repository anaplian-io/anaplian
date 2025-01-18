import { HttpGetAction } from './http-get-action';
import { Action, ActionArgument } from '@anaplian/core';
import TurndownService from 'turndown';

export interface HttpGetMarkdownActionProps {
  readonly turndownService?: TurndownService;
  readonly parentAction?: HttpGetAction;
}

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
  arguments?: [ActionArgument<'url'>] | undefined;
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
