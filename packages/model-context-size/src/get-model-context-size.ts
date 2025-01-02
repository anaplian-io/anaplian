import { modelContextSizes } from './model-context-sizes';

export type SupportedModelName = keyof typeof modelContextSizes;

/**
 * A type guard that checks if a particular model's context size is available from this package.
 *
 * @param modelName - A model name as used in LangChain.js.
 */
export const isModelSupported = (
  modelName: string,
): modelName is SupportedModelName =>
  new Set(Object.keys(modelContextSizes)).has(modelName);

/**
 * Gets the context window size in tokens for the model.
 *
 * @param modelName - The supported model name as used in LangChain.js.
 */
export const getModelContextSize = (modelName: SupportedModelName): number =>
  modelContextSizes[modelName];
