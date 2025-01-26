import { ContextProvider } from '../contexts';
import { ImageDetail } from '@langchain/core/messages';

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
export type Image = {
  /**
   * An annotation provided with the image indicating to the model how it should be interpreted.
   */
  readonly annotation: string;
  /**
   * Optionally configure the level of detail of the image.
   */
  readonly imageDetail?: ImageDetail;
  /**
   * Specify what kind of image this is. JPEG and PNG are supported.
   */
  readonly imageType: 'png' | 'jpeg';
  /**
   * The raw image content as a Buffer.
   */
  readonly imageContent: Buffer;
};
export type ContextImages = {
  /**
   * Optionally, images may be included in partial context. Note that
   * images are not counted towards the token allocation for this provider
   * since they cannot be counted prior to inference. The model must be able
   * to support base64 encoded images.
   */
  readonly IMAGES?: Image[];
};
export type Context = Record<
  string,
  Record<string, unknown> & ContextError & ContextImages
>;
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
export const isDefined = <T>(obj: T | undefined): obj is T =>
  typeof obj !== 'undefined';
