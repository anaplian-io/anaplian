import { BaseLLM } from '@langchain/core/language_models/llms';
import { AnaplianModel } from './types';
import { RootFormatter } from '../formatters/root-formatter';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { isChatModel } from '@langchain/core/example_selectors';

const wrapBaseLLM = (
  baseLLM: BaseLLM,
  rootFormatter: RootFormatter,
): AnaplianModel => ({
  invoke: (context) =>
    rootFormatter
      .format(context)
      .then((formattedPrompt) => baseLLM.invoke(formattedPrompt)),
  getTokenCount: (content) => baseLLM.getNumTokens(content),
});

const wrapChatModel = (
  chatModel: BaseChatModel,
  rootFormatter: RootFormatter,
): AnaplianModel => ({
  invoke: async (context) => {
    const formattedPartialPrompt = rootFormatter.formatPartial();
    const serializedContext = rootFormatter.serializeContext(context);
    const messages = [
      new SystemMessage(await formattedPartialPrompt),
      new HumanMessage(serializedContext),
    ];
    return chatModel.pipe(new StringOutputParser()).invoke(messages);
  },
  getTokenCount: (content) => chatModel.getNumTokens(content),
});

export const wrapModel = (
  model: BaseChatModel | BaseLLM,
  rootFormatter: RootFormatter,
): AnaplianModel => {
  if (isChatModel(model)) {
    return wrapChatModel(model, rootFormatter);
  }
  return wrapBaseLLM(model, rootFormatter);
};
