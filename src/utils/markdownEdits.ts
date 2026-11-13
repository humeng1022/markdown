export interface TextRange {
  start: number;
  end: number;
}

export interface EditResult {
  value: string;
  range: TextRange;
}

export type LinePrefixKind = 'quote' | 'bullet' | 'ordered' | 'task';

const LINE_PREFIXES: Record<LinePrefixKind, string> = {
  quote: '> ',
  bullet: '- ',
  ordered: '1. ',
  task: '- [ ] ',
};

const LINE_PREFIX_PATTERNS: Record<LinePrefixKind, RegExp> = {
  quote: /^\s*>\s?/,
  bullet: /^\s*[-*+]\s+(?!\[[ xX]\]\s+)/,
  ordered: /^\s*\d+[.)]\s+/,
  task: /^\s*[-*+]\s+\[[ xX]\]\s+/,
};

const ANY_PREFIX = /^\s*(?:>\s?|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)/;

function clampRange(value: string, range: TextRange): TextRange {
  const start = Math.max(0, Math.min(range.start, value.length));
  const end = Math.max(start, Math.min(range.end, value.length));

  return { start, end };
}

function lineStartAt(value: string, position: number): number {
  if (position <= 0) {
    return 0;
  }

  return value.lastIndexOf('\n', position - 1) + 1;
}

function lineEndAt(value: string, position: number): number {
  const nextNewline = value.indexOf('\n', position);

  return nextNewline === -1 ? value.length : nextNewline;
}

function lineBlockRange(value: string, range: TextRange): TextRange {
  const start = lineStartAt(value, range.start);
  const end = lineEndAt(value, Math.max(range.start, range.end - 1));

  return { start, end };
}

function stripAllPrefixes(line: string): string {
  const indentation = /^\s*/.exec(line)?.[0] ?? '';

  return indentation + line.slice(indentation.length).replace(ANY_PREFIX, '').replace(/^\s*>\s?/, '');
}

function addPrefix(line: string, prefix: string): string {
  const indentation = /^\s*/.exec(line)?.[0] ?? '';
  const content = line.slice(indentation.length);

  return `${indentation}${prefix}${content}`;
}

/** 用前后标记包裹选区；空选区时插入占位文字并选中它。 */
export function wrapSelection(
  value: string,
  range: TextRange,
  before: string,
  after: string,
  placeholder: string,
): EditResult {
  const { start, end } = clampRange(value, range);
  const selected = value.slice(start, end);
  const inner = selected.length > 0 ? selected : placeholder;
  const nextValue = `${value.slice(0, start)}${before}${inner}${after}${value.slice(end)}`;
  const innerStart = start + before.length;

  return {
    value: nextValue,
    range: { start: innerStart, end: innerStart + inner.length },
  };
}

/** 给选区覆盖的每一行切换引用 / 无序 / 有序 / 任务列表前缀。 */
export function toggleLinePrefix(
  value: string,
  range: TextRange,
  kind: LinePrefixKind,
): EditResult {
  const clamped = clampRange(value, range);
  const blockRange = lineBlockRange(value, clamped);
  const block = value.slice(blockRange.start, blockRange.end);
  const lines = block.split('\n');
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
  const pattern = LINE_PREFIX_PATTERNS[kind];
  const allPrefixed =
    nonEmptyLines.length > 0 && nonEmptyLines.every((line) => pattern.test(line));

  const nextLines = lines.map((line) => {
    if (line.trim().length === 0) {
      return line;
    }

    if (allPrefixed) {
      return line.replace(pattern, (matched) => /^\s*/.exec(matched)?.[0] ?? '');
    }

    return addPrefix(stripAllPrefixes(line), LINE_PREFIXES[kind]);
  });

  const nextBlock = nextLines.join('\n');
  const nextValue =
    value.slice(0, blockRange.start) + nextBlock + value.slice(blockRange.end);
  const hadSelection = clamped.end > clamped.start;
  const cursor = hadSelection
    ? blockRange.start + nextBlock.length
    : blockRange.start + (nextLines[0]?.length ?? 0);

  return {
    value: nextValue,
    range: hadSelection
      ? { start: blockRange.start, end: blockRange.start + nextBlock.length }
      : { start: cursor, end: cursor },
  };
}

/** 设置当前行（或选区首行）的标题级别；level = 0 表示正文。 */
export function setHeading(value: string, range: TextRange, level: number): EditResult {
  const clamped = clampRange(value, range);
  const blockRange = lineBlockRange(value, clamped);
  const line = value.slice(blockRange.start, blockRange.end);
  const indentation = /^\s*/.exec(line)?.[0] ?? '';
  const content = line
    .slice(indentation.length)
    .replace(/^#{1,6}\s+/, '')
    .trimEnd();
  const headingPrefix = level > 0 ? `${'#'.repeat(level)} ` : '';
  const nextLine = `${indentation}${headingPrefix}${content}`;
  const nextValue =
    value.slice(0, blockRange.start) + nextLine + value.slice(blockRange.end);
  const hadSelection = clamped.end > clamped.start;

  return {
    value: nextValue,
    range: hadSelection
      ? { start: blockRange.start, end: blockRange.start + nextLine.length }
      : {
          start: blockRange.start + nextLine.length,
          end: blockRange.start + nextLine.length,
        },
  };
}

/** 在选区位置插入代码块，语言为空时使用无语言围栏。 */
export function wrapCodeBlock(
  value: string,
  range: TextRange,
  language: string,
): EditResult {
  const { start, end } = clampRange(value, range);
  const selected = value.slice(start, end);
  const before = value.slice(0, start);
  const after = value.slice(end);
  const leading = before.length === 0 || before.endsWith('\n') ? '' : '\n';
  const trailing = after.length === 0 || after.startsWith('\n') ? '' : '\n';
  const fence = `\`\`\`${language}\n`;
  const closingGap = selected.endsWith('\n') ? '' : '\n';
  const block = `${leading}${fence}${selected}${closingGap}\`\`\`${trailing}`;
  const nextValue = before + block + after;
  const codeStart = start + leading.length + fence.length;

  return {
    value: nextValue,
    range: { start: codeStart, end: codeStart + selected.length },
  };
}

/** 在选区位置插入一个独立块（表格、分割线等），并确保前后有空行。 */
export function insertBlock(
  value: string,
  range: TextRange,
  block: string,
): EditResult {
  const { start, end } = clampRange(value, range);
  const before = value.slice(0, start);
  const after = value.slice(end);
  const leading = before.length === 0 || before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
  const trailing = after.length === 0 || after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n';
  const nextValue = before + leading + block + trailing + after;
  const cursor = before.length + leading.length + block.length;

  return { value: nextValue, range: { start: cursor, end: cursor } };
}

/** 插入行内内容，并把光标放到内容末尾。 */
export function insertInline(
  value: string,
  range: TextRange,
  text: string,
): EditResult {
  const { start, end } = clampRange(value, range);
  const nextValue = value.slice(0, start) + text + value.slice(end);
  const cursor = start + text.length;

  return { value: nextValue, range: { start: cursor, end: cursor } };
}

/** 插入 Markdown 链接；选中文本作为链接文字，url 占位符会被选中。 */
export function insertLink(value: string, range: TextRange): EditResult {
  const { start, end } = clampRange(value, range);
  const selected = value.slice(start, end);
  const text = selected.length > 0 ? selected.replace(/\]/g, '\\]') : '链接文字';
  const inserted = `[${text}](https://)`;
  const nextValue = value.slice(0, start) + inserted + value.slice(end);
  const urlStart = start + text.length + 3;

  return {
    value: nextValue,
    range: { start: urlStart, end: urlStart + 'https://'.length },
  };
}

function formatDestination(url: string): string {
  return /[\s()<>]/.test(url) ? `<${url}>` : url;
}

/** 插入 Markdown 图片；光标位置按独立块插入，替换选区时保持行内。 */
export function insertImage(
  value: string,
  range: TextRange,
  alt: string,
  src: string,
): EditResult {
  const safeAlt = alt.replace(/\]/g, '\\]').trim() || '图片';
  const markdown = `![${safeAlt}](${formatDestination(src)})`;
  const { start, end } = clampRange(value, range);

  if (start !== end) {
    return insertInline(value, { start, end }, markdown);
  }

  const before = value.slice(0, start);
  const after = value.slice(end);
  const leading = before.length === 0 || before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
  const trailing = after.length === 0 || after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n';
  const nextValue = before + leading + markdown + trailing + after;
  const cursor = before.length + leading.length + markdown.length;

  return { value: nextValue, range: { start: cursor, end: cursor } };
}

/** 用 HTML 标签包裹选区，用于下划线、高亮、颜色、字号、字体。 */
export function wrapHtml(
  value: string,
  range: TextRange,
  tag: 'span' | 'mark' | 'u',
  className?: string,
): EditResult {
  const attributes = className ? ` class="${className}"` : '';
  const before = `<${tag}${attributes}>`;
  const after = `</${tag}>`;

  return wrapSelection(value, range, before, after, '文字');
}
