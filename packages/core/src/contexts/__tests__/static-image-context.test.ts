import { StaticImageContextProvider } from '../static-image-context';
import { Image } from '../../common';

describe('StaticImageContextProvider', () => {
  it('returns its props on getInitialContext', async () => {
    const images: Image[] = [
      {
        annotation: 'This is an png',
        imageType: 'png',
        imageContent: Buffer.from('png image'),
        imageDetail: 'high',
      },
      {
        annotation: 'This is a jpeg',
        imageType: 'jpeg',
        imageContent: Buffer.from('jpeg image'),
        imageDetail: 'low',
      },
    ];
    const contextProvider = new StaticImageContextProvider({
      images,
    });
    await expect(
      contextProvider.getInitialContext({
        maximumAllowedTokens: 0,
        getTokenCount: async () => 0,
      }),
    ).resolves.toStrictEqual({
      IMAGES: images,
    });
  });

  it('returns its props on getNextContext', async () => {
    const images: Image[] = [
      {
        annotation: 'This is an png',
        imageType: 'png',
        imageContent: Buffer.from('png image'),
        imageDetail: 'high',
      },
      {
        annotation: 'This is a jpeg',
        imageType: 'jpeg',
        imageContent: Buffer.from('jpeg image'),
        imageDetail: 'low',
      },
    ];
    const contextProvider = new StaticImageContextProvider({
      images,
    });
    await expect(
      contextProvider.getNextContext({
        maximumAllowedTokens: 0,
        getTokenCount: async () => 0,
        priorContext: { staticImages: {} },
        actionTaken: '',
        actionResult: '',
      }),
    ).resolves.toStrictEqual({
      IMAGES: images,
    });
  });
});
