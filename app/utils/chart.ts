export function topNPlusOther<T extends { name: string; count: number }>(
  items: T[],
  n = 10
) {
  if (items.length <= n) return items;
  const sorted = [...items].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, n);
  const other = sorted.slice(n).reduce((a, b) => a + b.count, 0);
  return [...top, { name: "Other", count: other } as T];
}
