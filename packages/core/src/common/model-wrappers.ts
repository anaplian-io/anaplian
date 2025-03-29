import { AnaplianModel, isDefined } from './types';
import { RootFormatter } from '../formatters/root-formatter';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { MessageContentComplex, SystemMessage } from '@langchain/core/messages';

export const wrapModel = (
  model: BaseLanguageModel,
  rootFormatter: RootFormatter,
): AnaplianModel => ({
  invoke: async (context) => {
    const contextImages: MessageContentComplex[] = Object.values(context)
      .map((context) => context.IMAGES)
      .filter(isDefined)
      .flatMap((imageCollection) =>
        imageCollection.map(
          (imageDefinition) =>
            <MessageContentComplex>[
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
        ),
      );
    const messages: MessageContentComplex[] = [
      ...contextImages,
      {
        type: 'text',
        text: await rootFormatter.formatPartial(),
      },
      {
        type: 'text',
        text: rootFormatter.serializeContext(context),
      },
    ];
    return model.pipe(new StringOutputParser()).invoke([
      new SystemMessage({
        content: messages,
      }),
    ]);
  },
  getTokenCount: (content) => model.getNumTokens(content),
});
