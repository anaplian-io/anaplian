import { serializeWithoutImages } from '../serialize-without-images';

describe('serializeContextToJson', () => {
  it('serializes to JSON without images - shallow', () => {
    const obj = {
      content: 'some mock content',
      IMAGES: [
        {
          image: 'this is an image',
        },
      ],
    };
    expect(serializeWithoutImages(obj)).toBe('{"content":"some mock content"}');
    expect(obj).toStrictEqual({
      content: 'some mock content',
      IMAGES: [
        {
          image: 'this is an image',
        },
      ],
    });
  });

  it('serializes to JSON without images - deep', () => {
    const obj = {
      content: 'some mock content',
      deepContent: {
        IMAGES: [],
        deeperContent: {
          IMAGES: [
            {
              image: 'this is some image content',
            },
          ],
        },
        moreContent: 'still more mock content',
      },
    };
    const expectedObject = {
      content: 'some mock content',
      deepContent: {
        deeperContent: {},
        moreContent: 'still more mock content',
      },
    };
    expect(serializeWithoutImages(obj)).toBe(JSON.stringify(expectedObject));
    expect(obj).toStrictEqual({
      content: 'some mock content',
      deepContent: {
        IMAGES: [],
        deeperContent: {
          IMAGES: [
            {
              image: 'this is some image content',
            },
          ],
        },
        moreContent: 'still more mock content',
      },
    });
  });
});
