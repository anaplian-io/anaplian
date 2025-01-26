import { Serializer } from './types';

export const serializeContextToJson: Serializer = (obj) => {
  const serializableContext = { ...obj };
  delete serializableContext.IMAGES;
  return JSON.stringify(serializableContext);
};
