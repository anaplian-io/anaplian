import { ContextProvider } from '../contexts';

export type Serializer = (obj: Record<string, unknown>) => string;
export type Context = Record<
  string,
  Record<string, unknown> & { ERROR?: string }
>;
export type ContextProviderDocumentation = Omit<
  ContextProvider<string, Record<string, unknown>>,
  'getInitialContext' | 'getNextContext'
>;
export interface AnaplianModel {
  readonly invoke: (context: Context) => Promise<string>;
  readonly getTokenCount: (content: string) => Promise<number>;
}
