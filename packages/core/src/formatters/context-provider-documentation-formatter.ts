import { ActionDocumentationFormatterProps } from './action-documentation-formatter';
import { Formatter } from './formatter';
import { ContextProvider } from '../contexts';
import { PromptTemplate } from '@langchain/core/prompts';

export type ContextProviderDocumentationFormatterProps =
  ActionDocumentationFormatterProps & {
    readonly objectSerializer: (obj: Record<string, unknown>) => string;
  };

const headerPrompt = PromptTemplate.fromTemplate(
  '{padding}Context Component: {name}',
);
const descriptionPrompt = PromptTemplate.fromTemplate(
  '{padding}{padding}Description: {description}',
);
const fieldDescriptionPrompt =
  PromptTemplate.fromTemplate(`{padding}{padding}Field: {name}
{padding}{padding}{padding}Description: {description}
`);
const examplePrompt =
  PromptTemplate.fromTemplate(`{padding}{padding}Example {n}:
{padding}{padding}{padding}Example Context Component: {example}
{padding}{padding}{padding}Description: {description}
`);
const fullPrompt = PromptTemplate.fromTemplate(`
{header}
{description}
{fieldDescriptions}
{examples}
`);

export class ContextProviderDocumentationFormatter
  implements
    Formatter<
      Omit<
        ContextProvider<string, Record<string, unknown>>,
        'getInitialContext' | 'getNextContext'
      >
    >
{
  constructor(
    private readonly props: ContextProviderDocumentationFormatterProps,
  ) {}
  public readonly format = async (
    item: Omit<
      ContextProvider<string, Record<string, unknown>>,
      'getInitialContext' | 'getNextContext'
    >,
  ): Promise<string> => {
    const headerFormatter = headerPrompt.format({
      padding: this.props.leftPadding,
      name: item.key,
    });
    const descriptionFormatter = descriptionPrompt.format({
      padding: this.props.leftPadding,
      description: item.description.trimEnd(),
    });
    const fieldDescriptionFormatter = Promise.all(
      Object.entries(item.fieldDescriptions).map((fieldDescription) =>
        fieldDescriptionPrompt
          .format({
            description: fieldDescription[1],
            name: fieldDescription[0],
            padding: this.props.leftPadding,
          })
          .then((result) => result.trimEnd()),
      ),
    ).then((result) => result.join('\n'));
    const exampleFormatter = Promise.all(
      item.examples?.map((example, index) =>
        examplePrompt
          .format({
            description: example.description,
            example: this.props.objectSerializer({
              [item.key]: example.example,
            }),
            n: index,
            padding: this.props.leftPadding,
          })
          .then((result) => result.trimEnd()),
      ) || [],
    ).then((result) => result.join('\n'));
    return await fullPrompt
      .format({
        description: (await descriptionFormatter).trimEnd(),
        examples: (await exampleFormatter).trimEnd(),
        fieldDescriptions: (await fieldDescriptionFormatter).trimEnd(),
        header: (await headerFormatter).trimEnd(),
      })
      .then((result) => result.trimEnd());
  };
}
