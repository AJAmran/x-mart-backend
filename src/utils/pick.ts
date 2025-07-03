const pick = <T extends Record<string, unknown>, K extends keyof T>(
  object: T,
  keys: K[]
): Partial<T> => {
  return keys.reduce((result, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      result[key] = object[key];
    }
    return result;
  }, {} as Partial<T>);
};

export default pick;