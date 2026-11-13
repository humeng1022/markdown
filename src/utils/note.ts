import type { Note } from '../types/note';

export const DEFAULT_NOTE_TITLE = '未命名笔记';

const MAX_TITLE_LENGTH = 60;

/** 行首的 Markdown 标记：标题、引用、列表、任务列表、有序列表 */
const LEADING_MARKDOWN = /^(?:#{1,6}\s+|>\s*|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)/;
/** 代码围栏、分割线不应该成为笔记标题 */
const NON_TITLE_LINE = /^(?:```|~~~|(?:-{3,}|\*{3,}|_{3,}))$/;

/**
 * 从正文推导标题：取第一行有意义的文本，去掉常见 Markdown 标记。
 * 没有可用内容时返回「未命名笔记」。
 */
export function deriveTitle(content: string): string {
  const firstLine = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !NON_TITLE_LINE.test(line));

  if (!firstLine) {
    return DEFAULT_NOTE_TITLE;
  }

  const title = firstLine
    .replace(LEADING_MARKDOWN, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~`]+/g, '')
    .trim();

  if (title.length === 0) {
    return DEFAULT_NOTE_TITLE;
  }

  return title.length > MAX_TITLE_LENGTH ? `${title.slice(0, MAX_TITLE_LENGTH)}…` : title;
}

/** 按最后修改时间倒序排列（不修改入参） */
export function sortNotesByUpdatedAt(notes: readonly Note[]): Note[] {
  return [...notes].sort((a, b) => b.updatedAt - a.updatedAt || b.createdAt - a.createdAt);
}

const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const monthDayFormatter = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
});

const fullDateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

/** 列表中展示的简短更新时间 */
export function formatUpdatedAt(timestamp: number, now = Date.now()): string {
  const diff = now - timestamp;

  if (diff < 60_000) {
    return '刚刚';
  }

  if (diff < 3_600_000) {
    return `${Math.floor(diff / 60_000)} 分钟前`;
  }

  const date = new Date(timestamp);
  const current = new Date(now);
  const startOfToday = new Date(
    current.getFullYear(),
    current.getMonth(),
    current.getDate(),
  ).getTime();

  if (timestamp >= startOfToday) {
    return timeFormatter.format(date);
  }

  if (timestamp >= startOfToday - 86_400_000) {
    return '昨天';
  }

  if (date.getFullYear() === current.getFullYear()) {
    return monthDayFormatter.format(date);
  }

  return fullDateFormatter.format(date);
}
