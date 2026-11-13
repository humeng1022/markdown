import type { Note } from '../types/note';
import { DEFAULT_NOTE_TITLE } from './note';

/** LocalStorage key 固定不变，重命名会导致老用户数据丢失 */
const NOTES_KEY = 'markdown-notes:notes';
const ACTIVE_KEY = 'markdown-notes:activeId';

export interface StorageSuccess {
  ok: true;
}

export interface StorageFailure {
  ok: false;
  message: string;
}

export type StorageResult = StorageSuccess | StorageFailure;

const UNAVAILABLE_MESSAGE =
  '浏览器本地存储不可用（可能处于隐私模式），笔记只会保存在当前页面内存中，刷新后会丢失。';
const QUOTA_MESSAGE =
  '浏览器本地存储空间已满，最新修改未能保存。请删除部分笔记或清理浏览器存储后重试。';
const UNKNOWN_MESSAGE = '写入浏览器本地存储失败，最新修改未能保存。';

function isQuotaError(error: unknown): boolean {
  if (!(error instanceof DOMException)) {
    return false;
  }

  return (
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    error.code === 22 ||
    error.code === 1014
  );
}

function isUnavailableError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'SecurityError' ||
      error.name === 'InvalidStateError' ||
      error.name === 'NotSupportedError')
  );
}

function toFailure(error: unknown): StorageFailure {
  if (isQuotaError(error)) {
    return { ok: false, message: QUOTA_MESSAGE };
  }

  if (isUnavailableError(error)) {
    return { ok: false, message: UNAVAILABLE_MESSAGE };
  }

  return { ok: false, message: UNKNOWN_MESSAGE };
}

function isNote(value: unknown): value is Note {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    typeof candidate.title === 'string' &&
    typeof candidate.content === 'string' &&
    typeof candidate.createdAt === 'number' &&
    Number.isFinite(candidate.createdAt) &&
    typeof candidate.updatedAt === 'number' &&
    Number.isFinite(candidate.updatedAt)
  );
}

/**
 * 读取笔记。任何异常或脏数据都降级为空数组，避免白屏。
 */
export function loadNotes(): Note[] {
  try {
    const raw = window.localStorage.getItem(NOTES_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const seenIds = new Set<string>();

    return parsed
      .filter(isNote)
      .filter((note) => {
        if (seenIds.has(note.id)) {
          return false;
        }
        seenIds.add(note.id);
        return true;
      })
      .map((note) => ({
        ...note,
        title: note.title.trim() || DEFAULT_NOTE_TITLE,
      }));
  } catch {
    return [];
  }
}

/**
 * 写入笔记。失败时返回可展示的提示信息，由调用方做非阻断提示。
 */
export function saveNotes(notes: Note[]): StorageResult {
  try {
    window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

/** 读取上次选中的笔记 id，非法值返回 null */
export function loadActiveId(): string | null {
  try {
    const id = window.localStorage.getItem(ACTIVE_KEY);
    return id && id.length > 0 ? id : null;
  } catch {
    return null;
  }
}

/** 保存当前选中的笔记 id；传 null 时清除 */
export function saveActiveId(id: string | null): StorageResult {
  try {
    if (id) {
      window.localStorage.setItem(ACTIVE_KEY, id);
    } else {
      window.localStorage.removeItem(ACTIVE_KEY);
    }
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}
