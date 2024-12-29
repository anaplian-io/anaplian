export interface Formatter<T> {
  readonly format: (item: T) => Promise<string>;
}
