import { ContextProvider } from '../contexts';
import { Action } from '../actions';

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
export interface AnaplianAgent {
  readonly run: () => Promise<void>;
  readonly shutdown: () => Promise<void>;
  readonly metadata: {
    readonly modelContextWindowSize: number;
    readonly modelName: string;
    readonly availableActions: Action[];
    readonly contextProviders: ContextProvider<
      string,
      Record<string, unknown>
    >[];
  };
}
