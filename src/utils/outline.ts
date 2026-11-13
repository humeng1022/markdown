/**
 * 生成与 GitHub 风格接近的标题 id。
 * 中文、字母、数字保留，空白转为连字符；无有效字符时回退为 section。
 */
export function slugifyHeading(text: string): string {
  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'section';
}

/**
 * 每次渲染预览时创建一个 slugger，保证同名标题得到唯一 id。
 */
export function createHeadingSlugger(): (text: string) => string {
  const counts = new Map<string, number>();

  return (text: string) => {
    const base = `heading-${slugifyHeading(text)}`;
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);

    return count === 0 ? base : `${base}-${count}`;
  };
}
