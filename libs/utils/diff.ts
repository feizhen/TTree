export const diff = (newVal: string[], oldVal: string[]) =>
  newVal.concat(oldVal).filter(v => oldVal.includes(v) && !newVal.includes(v));
