declare const pick: <T extends Record<string, unknown>, K extends keyof T>(object: T, keys: K[]) => Partial<T>;
export default pick;
