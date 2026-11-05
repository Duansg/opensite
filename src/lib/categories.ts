export const categories = ['engineering', 'design', 'thoughts', 'toolbox'] as const;
export type Category = (typeof categories)[number];

const legacyCategories = new Map<string, Category>([
  ['工程', 'engineering'],
  ['设计', 'design'],
  ['随笔', 'thoughts'],
  ['工具', 'toolbox'],
]);

// 兼容旧文章及已分享的中文分类筛选链接。
export function normalizeCategory(value: string) {
  return categories.find((category) => category === value) ?? legacyCategories.get(value);
}
