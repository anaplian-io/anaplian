export interface ModelOutputParser {
  readonly modelInstructions: string;
  readonly parse: (input: string) => Promise<string>;
}
