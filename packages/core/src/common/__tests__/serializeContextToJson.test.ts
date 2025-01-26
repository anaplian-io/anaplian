import { serializeContextToJson } from '../serializeContextToJson';

describe('serializeContextToJson', () => {
  it('serializes to JSON without images', () => {
    const obj = {
      content: 'some mock content',
      IMAGES: [
        {
          image: 'this is an image',
        },
      ],
    };
    expect(serializeContextToJson(obj)).toBe('{"content":"some mock content"}');
    expect(obj).toStrictEqual({
      content: 'some mock content',
      IMAGES: [
        {
          image: 'this is an image',
        },
      ],
    });
  });
});
