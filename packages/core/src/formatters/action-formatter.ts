import { Formatter } from './formatter';
import { Action } from '../actions';
import { PromptTemplate } from '@langchain/core/prompts';

export interface ActionFormatterProps {
  readonly leftPadding: string;
}

const headerPrompt = PromptTemplate.fromTemplate('{padding}Action: {name}');
const descriptionPrompt = PromptTemplate.fromTemplate(
  '{padding}{padding}Description: {description}',
);
const argumentPrompt =
  PromptTemplate.fromTemplate(`{padding}{padding}Argument {n}: {name} - {description}
{padding}{padding}{padding}{validExamples}
{padding}{padding}{padding}{invalidExamples}
`);
const examplePrompt =
  PromptTemplate.fromTemplate(`{padding}{padding}Example {n}:
{padding}{padding}{padding}YOU: {input}
{padding}{padding}{padding}RESULT: {output}
`);
const fullPrompt = PromptTemplate.fromTemplate(`
{header}
{description}
{arguments}
{examples}
`);

export class ActionFormatter implements Formatter<Action> {
  private readonly props: ActionFormatterProps;
  constructor(props: ActionFormatterProps) {
    this.props = props;
  }
  public readonly format = async (item: Action): Promise<string> => {
    const headerFormatter = headerPrompt.format({
      padding: this.props.leftPadding,
      name: `${item.name}(${item.arguments?.map((arg) => arg.name).join(',') || ''})`,
    });
    const descriptionFormatter = descriptionPrompt.format({
      padding: this.props.leftPadding,
      description: item.description.trimEnd(),
    });
    const argumentFormatter = Promise.all(
      item.arguments?.map((argument, index) =>
        argumentPrompt
          .format({
            name: argument.name,
            description: argument.description.trimEnd(),
            n: index,
            padding: this.props.leftPadding,
            validExamples:
              argument.exampleValidValues &&
              argument.exampleValidValues.length > 0
                ? `Example valid values: ${argument.exampleValidValues.map((value) => `"${value}"`).join(', ')}`
                : '',
            invalidExamples:
              argument.exampleInvalidValues &&
              argument.exampleInvalidValues.length > 0
                ? `Example invalid values: ${argument.exampleInvalidValues.map((value) => `"${value}"`).join(', ')}`
                : '',
          })
          .then((result) => result.trimEnd()),
      ) || [Promise.resolve('')],
    ).then((result) => result.join('\n'));
    const exampleFormatter = Promise.all(
      item.examples?.map((example, index) =>
        examplePrompt
          .format({
            input: `${item.name}(${example.arguments?.map((arg) => `"${arg}"`) || ''})`,
            n: index,
            output: example.result,
            padding: this.props.leftPadding,
          })
          .then((result) => result.trimEnd()),
      ) || [Promise.resolve('')],
    ).then((result) => result.join('\n'));
    return (
      await fullPrompt.format({
        arguments: (await argumentFormatter).trimEnd(),
        description: (await descriptionFormatter).trimEnd(),
        examples: (await exampleFormatter).trimEnd(),
        header: (await headerFormatter).trimEnd(),
      })
    ).trimEnd();
  };
}
