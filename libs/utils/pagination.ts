export const pagination = (array: any[], current: number, pageSize: number) => {
  const offset = (current - 1) * pageSize;

  const result =
    offset + pageSize > array.length
      ? array.slice(offset, array.length)
      : array.slice(offset, offset + pageSize);

  return result;
};
