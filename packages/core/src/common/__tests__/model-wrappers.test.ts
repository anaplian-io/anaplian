import { FakeListChatModel, FakeLLM } from '@langchain/core/utils/testing';
import { RootFormatter } from '../../formatters/root-formatter';
import { wrapModel } from '../model-wrappers';

describe('model wrappers', () => {
  const mockRootFormatter: RootFormatter = {
    format: jest.fn().mockResolvedValue('{format}'),
    formatPartial: jest.fn().mockResolvedValue('{format partial}'),
    serializeContext: jest.fn().mockReturnValue('{serialized context}'),
  } as unknown as RootFormatter;

  describe('wrapBaseLLM', () => {
    const mockBaseLlm = new FakeLLM({
      response: 'FakeLLM mock invocation response',
    });
    jest.spyOn(mockBaseLlm, 'invoke');
    jest.spyOn(mockBaseLlm, 'getNumTokens');
    const model = wrapModel(mockBaseLlm, mockRootFormatter);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('invokes a LangChain BaseLLM', async () => {
      expect.assertions(3);
      const result = await model.invoke({ dinosaur: { today: 't-rex' } });
      expect(result).toBe('FakeLLM mock invocation response');
      expect(mockBaseLlm.invoke).toHaveBeenCalledWith('{format}');
      expect(mockBaseLlm.getNumTokens).not.toHaveBeenCalled();
    });

    it('checks tokens with a LangChain BaseLLM', async () => {
      expect.assertions(3);
      const result = await model.getTokenCount('t-rex');
      expect(result).toBe(3);
      expect(mockBaseLlm.invoke).not.toHaveBeenCalled();
      expect(mockBaseLlm.getNumTokens).toHaveBeenCalledWith('t-rex');
    });
  });

  describe('wrapChatModel', () => {
    const mockChatModel = new FakeListChatModel({
      responses: ['FakeListChatModel mock invocation response'],
    });
    jest.spyOn(mockChatModel, 'invoke');
    jest.spyOn(mockChatModel, 'getNumTokens');
    const model = wrapModel(mockChatModel, mockRootFormatter);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('invokes a LangChain BaseChatModel', async () => {
      expect.assertions(3);
      const result = await model.invoke({ dinosaur: { today: 't-rex' } });
      expect(result).toBe('FakeListChatModel mock invocation response');
      expect(mockChatModel.invoke).toHaveBeenCalled();
      expect(mockChatModel.getNumTokens).not.toHaveBeenCalled();
    });

    it('checks tokens with a LangChain BaseChatModel', async () => {
      expect.assertions(3);
      const result = await model.getTokenCount('t-rex');
      expect(result).toBe(3);
      expect(mockChatModel.invoke).not.toHaveBeenCalled();
      expect(mockChatModel.getNumTokens).toHaveBeenCalledWith('t-rex');
    });
  });
});
