import { FakeListChatModel } from '@langchain/core/utils/testing';
import { RootFormatter } from '../../formatters/root-formatter';
import { wrapModel } from '../model-wrappers';
import { Context } from '../types';

describe('model wrappers', () => {
  const mockRootFormatter: RootFormatter = {
    format: jest.fn().mockResolvedValue('{format}'),
    formatPartial: jest.fn().mockResolvedValue('{format partial}'),
    serializeContext: jest.fn().mockReturnValue('{serialized context}'),
  } as unknown as RootFormatter;

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

  it('invokes a LangChain BaseChatModel with images', async () => {
    expect.assertions(3);
    const context: Context = {
      dinosaur: {
        today: 't-rex',
        IMAGES: [
          {
            annotation: 'This is an image',
            imageDetail: 'auto',
            imageType: 'png',
            imageContent: Buffer.from('some image content'),
          },
        ],
      },
    };
    const result = await model.invoke(context);
    expect(result).toBe('FakeListChatModel mock invocation response');
    expect(mockChatModel.invoke).toHaveBeenCalledTimes(1);
    expect(mockChatModel.getNumTokens).not.toHaveBeenCalled();
  });
});
