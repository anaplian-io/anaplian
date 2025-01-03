import { ContextProvider } from '../contexts';

export type Serializer = (obj: Record<string, unknown>) => string;
export type ContextErrorCode =
  | 'CONTEXT_EXCEEDED_MAXIMUM_TOKENS'
  | 'UNHANDLED_ERROR_THROWN';
export type ContextError = {
  readonly ERROR?: {
    readonly code: ContextErrorCode;
    readonly message?: string;
  };
};
export type Context = Record<string, Record<string, unknown> & ContextError>;
export type ContextProviderDocumentation = Omit<
  ContextProvider<string, Record<string, unknown>>,
  'getInitialContext' | 'getNextContext'
>;
export interface AnaplianModel {
  readonly invoke: (context: Context) => Promise<string>;
  readonly getTokenCount: (content: string) => Promise<number>;
}
