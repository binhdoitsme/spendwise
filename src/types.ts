export type ExcludeMethods<T> = {
  // eslint-disable-next-line
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};
