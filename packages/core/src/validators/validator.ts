export interface Validator<T> {
  readonly validate: (
    item: T,
  ) => Promise<{ valid: true } | { valid: false; reason: string }>;
}
