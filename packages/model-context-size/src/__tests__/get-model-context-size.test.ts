import {
  getModelContextSize,
  isModelSupported,
} from '../get-model-context-size';

describe('get-model-context-size.ts', () => {
  describe('isModelSupported', () => {
    it('is not supported', () => {
      expect(isModelSupported('a-fake-model')).toBe(false);
    });
    it('is supported', () => {
      expect(isModelSupported('gpt-4')).toBe(true);
    });
  });
  describe('getModelContextSize', () => {
    it('gets the context window size of a supported model', () => {
      expect(getModelContextSize('gpt-4-32k')).toBe(32768);
    });
  });
});
