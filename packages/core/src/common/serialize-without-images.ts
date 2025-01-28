import { Serializer } from './types';

const deepFilterOutField = (
  obj: Record<string, unknown>,
  fieldName: string,
): Record<string, unknown> => {
  const localShallowCopy = { ...obj };
  return Object.fromEntries(
    Object.keys(localShallowCopy)
      .filter((key) => key !== fieldName)
      .map((key) => {
        if (typeof localShallowCopy[key] === 'object') {
          return [
            key,
            deepFilterOutField(
              <Record<string, unknown>>localShallowCopy[key],
              fieldName,
            ),
          ];
        }
        return [key, localShallowCopy[key]];
      }),
  );
};

/**
 * A utility function that stringifies an object while omitting all "IMAGES"
 * keys. This is useful if you need to log the context object while excluding
 * image buffers.
 *
 * @param obj - An object, such as a context or partial context.
 */
export const serializeWithoutImages: Serializer = (obj) => {
  const serializableContext = deepFilterOutField(obj, 'IMAGES');
  return JSON.stringify(serializableContext);
};
