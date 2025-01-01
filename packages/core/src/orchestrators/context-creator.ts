import { ContextProvider, GetNextContextProps } from '../contexts/context';
import { ContextConstructionError } from '../errors/context-construction-error';
import { AnaplianModel, Context, Serializer } from '../common/types';

export interface ContextCreatorProps {
  readonly model: AnaplianModel;
  readonly serializer: Serializer;
  readonly contextProviders: {
    readonly provider: ContextProvider<never, never>;
    readonly maximumAllowedTokens: number;
  }[];
}

export class ContextCreator {
  constructor(private readonly props: ContextCreatorProps) {}

  public readonly createInitialContext = async (): Promise<Context> =>
    Object.fromEntries(
      await Promise.all(
        this.props.contextProviders.map(async (bundle) => [
          bundle.provider.key,
          await bundle.provider
            .getInitialContext({
              getTokenCount: async (context) =>
                await this.props.model.getTokenCount(
                  this.props.serializer(context),
                ),
              maximumAllowedTokens: bundle.maximumAllowedTokens,
            })
            .then(async (newContext) => {
              const tokensUsed = await this.props.model.getTokenCount(
                this.props.serializer(newContext),
              );
              if (tokensUsed > bundle.maximumAllowedTokens) {
                throw new ContextConstructionError(
                  `Context provider ${bundle.provider.key} used ${tokensUsed} tokens, which exceeds its maximum allocation of ${bundle.maximumAllowedTokens} tokens`,
                );
              }
              return Object.freeze(newContext);
            }),
        ]),
      ),
    );

  public readonly createNextContext = async (
    prior: Omit<
      GetNextContextProps<never, never>,
      'maximumAllowedTokens' | 'getTokenCount'
    >,
  ): Promise<Context> =>
    Object.fromEntries(
      await Promise.all(
        this.props.contextProviders.map(async (bundle) => [
          bundle.provider.key,
          await bundle.provider
            .getNextContext({
              getTokenCount: async (context) =>
                await this.props.model.getTokenCount(
                  this.props.serializer(context),
                ),
              maximumAllowedTokens: bundle.maximumAllowedTokens,
              actionResult: prior.actionResult,
              actionTaken: prior.actionTaken,
              priorContext: prior.priorContext,
            })
            .then(async (newContext) => {
              const tokensUsed = await this.props.model.getTokenCount(
                this.props.serializer(newContext),
              );
              if (tokensUsed > bundle.maximumAllowedTokens) {
                throw new ContextConstructionError(
                  `Context provider "${bundle.provider.key}" used ${tokensUsed} tokens, which exceeds its maximum allocation of ${bundle.maximumAllowedTokens} tokens`,
                );
              }
              return Object.freeze(newContext);
            })
            .catch((error) => {
              if (error instanceof ContextConstructionError) {
                return Object.freeze({
                  ...prior.priorContext[bundle.provider.key]!,
                  ERROR: error.message,
                });
              }
              throw error;
            }),
        ]),
      ),
    );
}
