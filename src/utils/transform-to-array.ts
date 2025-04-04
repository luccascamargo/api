export type Item = {
  id: string;
};

export function transformToArray(value: string): Item[] {
  return value.split(',').map((item) => ({
    id: item.trim(),
  }));
}
