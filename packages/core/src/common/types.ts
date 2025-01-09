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
  'getInitialContext' | 'getNextContext' | 'refresh'
>;
export interface AnaplianModel {
  readonly invoke: (context: Context) => Promise<string>;
  readonly getTokenCount: (content: string) => Promise<number>;
}

export type UnionToIntersection<U> = (
  U extends unknown ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;

export type LastOf<U> =
  UnionToIntersection<U extends unknown ? (x: U) => void : never> extends (
    x: infer L,
  ) => void
    ? L
    : never;

export type ExcludeLast<U> = Exclude<U, LastOf<U>>;

type UnionToTuple<U> = [U] extends [never]
  ? []
  : [...UnionToTuple<ExcludeLast<U>>, LastOf<U>];

type LengthOfUnion<U> = UnionToTuple<U>['length'];

type BuildTuple<
  N extends number,
  R extends unknown[] = [],
> = R['length'] extends N ? R : BuildTuple<N, [...R, string]>;

export type TupleOfStrings<U extends string> = BuildTuple<
  LengthOfUnion<U> & number
>;
