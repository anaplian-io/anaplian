import { Validator } from './validator';
import { AnaplianAgent } from '../agents';

export class AgentValidator implements Validator<AnaplianAgent> {
  public readonly validate = async (
    item: AnaplianAgent,
  ): Promise<{ valid: true } | { valid: false; reason: string }> => {
    const validContext = this.validateContext(item);
    if (!validContext.valid) {
      return validContext;
    }
    if (item.metadata.paddingTokens < 0) {
      return {
        valid: false,
        reason: 'Padding tokens must be greater than or equal to 0.',
      };
    }
    if (item.metadata.instructionsTokens < 0) {
      return {
        valid: false,
        reason: 'Instruction tokens must be greater than or equal to 0.',
      };
    }
    if (item.metadata.availableActions.length === 0) {
      return {
        valid: false,
        reason: 'Agents must contain at least 1 action',
      };
    }
    return {
      valid: true,
    };
  };

  private readonly validateContext = (
    item: AnaplianAgent,
  ): { valid: true } | { valid: false; reason: string } => {
    const contextKeys = new Set(
      item.metadata.contextProviders.map(
        (contextProvider) => contextProvider.provider.key,
      ),
    );
    if (contextKeys.size !== item.metadata.contextProviders.length) {
      return {
        valid: false,
        reason:
          'Context providers have duplicated keys. All context providers in this agent must have unique keys.',
      };
    }
    if (item.metadata.contextProviders.length === 0) {
      return {
        valid: false,
        reason: 'Agents must contain at least 1 context provider',
      };
    }
    const totalContextAllocatedTokens = item.metadata.contextProviders
      .map((provider) => provider.maximumAllowedTokens)
      .reduce((total, nextValue) => total + nextValue);
    if (
      totalContextAllocatedTokens +
        item.metadata.paddingTokens +
        item.metadata.instructionsTokens >
      item.metadata.modelContextWindowSize
    ) {
      return {
        valid: false,
        reason: 'Total allocated tokens exceeds the model context window size.',
      };
    }
    const negativeContextProviderTokens = item.metadata.contextProviders.filter(
      (provider) => provider.maximumAllowedTokens < 0,
    );
    if (negativeContextProviderTokens.length > 0) {
      return {
        valid: false,
        reason: `Context proivder for key "${negativeContextProviderTokens[0]!.provider.key}" has a negative number of maximum tokens allowed.`,
      };
    }
    if (item.metadata.initialContext) {
      const initialContextKeys = Object.keys(item.metadata.initialContext);
      if (initialContextKeys.length !== contextKeys.size) {
        return {
          valid: false,
          reason: `The initial context has ${initialContextKeys.length} keys, but there are ${contextKeys.size} are context providers.`,
        };
      }
      const invalidInitialContextKeys = initialContextKeys.filter(
        (key) => !contextKeys.has(key),
      );
      if (invalidInitialContextKeys.length > 0) {
        return {
          valid: false,
          reason: `Key "${invalidInitialContextKeys[0]}" was found in the provided initial context, but no context provider was found to generate this.`,
        };
      }
    }
    return { valid: true };
  };
}
