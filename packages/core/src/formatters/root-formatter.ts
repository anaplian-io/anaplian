import { Formatter } from './formatter';
import { Action } from '../actions';
import {
  Context,
  ContextProviderDocumentation,
  Serializer,
} from '../common/types';
import { PromptTemplate } from '@langchain/core/prompts';

export interface RootFormatterProps {
  readonly actionDocumentationFormatter: Formatter<Action>;
  readonly availableActions: Action[];
  readonly contextProviderDocumentationFormatter: Formatter<ContextProviderDocumentation>;
  readonly contextProviderDocumentations: ContextProviderDocumentation[];
  readonly serializer: Serializer;
  readonly roleAssignmentDirective: string;
  readonly functionalInstructions: string;
}

const promptTemplate = PromptTemplate.fromTemplate(`
{roleAssignmentDirective}

Available Actions:
{actionsDocumentation}

Context Object Components:
{contextComponentsDocumentation}

Instructions:
{functionalInstructions}
`);

export class RootFormatter implements Formatter<Context> {
  constructor(private readonly props: RootFormatterProps) {}

  public readonly format = async (item: Context): Promise<string> =>
    this.formatPartial().then((result) => result + this.serializeContext(item));

  public readonly formatPartial = async (): Promise<string> =>
    promptTemplate.format({
      actionsDocumentation: await Promise.all(
        this.props.availableActions.map((action) =>
          this.props.actionDocumentationFormatter.format(action),
        ),
      ).then((result) => result.join('\n')),
      contextComponentsDocumentation: await Promise.all(
        this.props.contextProviderDocumentations.map((provider) =>
          this.props.contextProviderDocumentationFormatter.format(provider),
        ),
      ).then((result) => result.join('\n')),
      functionalInstructions: this.props.functionalInstructions,
      roleAssignmentDirective: this.props.roleAssignmentDirective,
    });

  public readonly serializeContext = (item: Context): string =>
    '\nCurrent Context Object:\n' + this.props.serializer(item);
}
