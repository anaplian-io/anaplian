import { BaseLLM } from '@langchain/core/language_models/llms';
import { ContextProvider, GetNextContextProps } from './context';
import { ContextConstructionError } from '../errors/context-construction-error';

export interface ContextCreatorProps {
  readonly model: BaseLLM;
  readonly serializer: (obj: Record<string, unknown>) => string;
  readonly contextProviders: {
    readonly provider: ContextProvider<never, never>;
    readonly maximumAllowedTokens: number;
  }[];
}

export class ContextCreator {
  constructor(private readonly props: ContextCreatorProps) {}

  public readonly createInitialContext = async (): Promise<
    Record<string, unknown>
  > =>
    Object.fromEntries(
      await Promise.all(
        this.props.contextProviders.map(async (bundle) => [
          bundle.provider.key,
          await bundle.provider
            .getInitialContext({
              getTokenCount: async (context) =>
                await this.props.model.getNumTokens(
                  this.props.serializer(context),
                ),
              maximumAllowedTokens: bundle.maximumAllowedTokens,
            })
            .then(async (newContext) => {
              const tokensUsed = await this.props.model.getNumTokens(
                this.props.serializer(newContext),
              );
              if (tokensUsed > bundle.maximumAllowedTokens) {
                throw new ContextConstructionError(
                  `Context provider ${bundle.provider.key} used ${tokensUsed} tokens, which exceeds its maximum allocation of ${bundle.maximumAllowedTokens} tokens`,
                );
              }
              return newContext;
            }),
        ]),
      ),
    );

  public readonly createNextContext = async (
    prior: Omit<
      GetNextContextProps<never, never>,
      'maximumAllowedTokens' | 'getTokenCount'
    >,
  ): Promise<Record<string, unknown>> =>
    Object.fromEntries(
      await Promise.all(
        this.props.contextProviders.map(async (bundle) => [
          bundle.provider.key,
          await bundle.provider
            .getNextContext({
              getTokenCount: async (context) =>
                await this.props.model.getNumTokens(
                  this.props.serializer(context),
                ),
              maximumAllowedTokens: bundle.maximumAllowedTokens,
              actionResult: prior.actionResult,
              actionTaken: prior.actionTaken,
              priorContext: prior.priorContext,
            })
            .then(async (newContext) => {
              const tokensUsed = await this.props.model.getNumTokens(
                this.props.serializer(newContext),
              );
              if (tokensUsed > bundle.maximumAllowedTokens) {
                throw new ContextConstructionError(
                  `Context provider ${bundle.provider.key} used ${tokensUsed} tokens, which exceeds its maximum allocation of ${bundle.maximumAllowedTokens} tokens`,
                );
              }
              return newContext;
            })
            .catch((error) => {
              if (error instanceof ContextConstructionError) {
                return prior.priorContext[bundle.provider.key]!;
              }
              throw error;
            }),
        ]),
      ),
    );
}
