import { AnaplianModel, isDefined } from './types';
import { RootFormatter } from '../formatters/root-formatter';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseLanguageModel } from '@langchain/core/language_models/base';

export const wrapModel = (
  model: BaseLanguageModel,
  rootFormatter: RootFormatter,
): AnaplianModel => ({
  invoke: async (context) => {
    const formattedPartialPrompt = rootFormatter.formatPartial();
    const serializedContext = rootFormatter.serializeContext(context);
    const contextImages: HumanMessage[] = Object.values(context)
      .map((context) => context.IMAGES)
      .filter(isDefined)
      .flatMap((imageCollection) =>
        imageCollection.map(
          (imageDefinition) =>
            new HumanMessage({
              content: [
                {
                  type: 'text',
                  text: imageDefinition.annotation,
                },
                {
                  type: 'image_url',
                  image_url: {
                    detail: imageDefinition.imageDetail,
                    url: `data:image/${imageDefinition.imageType};base64,${imageDefinition.imageContent.toString('base64')}`,
                  },
                },
              ],
            }),
        ),
      );
    const messages = [
      new SystemMessage(await formattedPartialPrompt),
      ...contextImages,
      new HumanMessage(serializedContext),
    ];
    return model.pipe(new StringOutputParser()).invoke(messages);
  },
  getTokenCount: (content) => model.getNumTokens(content),
});
