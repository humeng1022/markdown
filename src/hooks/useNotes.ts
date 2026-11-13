import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Note } from '../types/note';
import { DEFAULT_NOTE_TITLE, deriveTitle, sortNotesByUpdatedAt } from '../utils/note';
import { loadActiveId, loadNotes, saveActiveId, saveNotes } from '../utils/storage';

interface InitialState {
  notes: Note[];
  activeId: string | null;
}

function loadInitialState(): InitialState {
  const notes = loadNotes();
  const savedActiveId = loadActiveId();
  const activeId =
    savedActiveId && notes.some((note) => note.id === savedActiveId)
      ? savedActiveId
      : (notes[0]?.id ?? null);

  return { notes, activeId };
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface UseNotesResult {
  notes: Note[];
  filteredNotes: Note[];
  activeNote: Note | null;
  activeId: string | null;
  keyword: string;
  storageError: string | null;
  setKeyword: (keyword: string) => void;
  selectNote: (id: string) => void;
  createNote: () => void;
  deleteNote: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  dismissStorageError: () => void;
}

/**
 * 笔记状态中心：增删改查、搜索、LocalStorage 持久化与存储异常提示。
 */
export function useNotes(): UseNotesResult {
  const [initialState] = useState<InitialState>(loadInitialState);
  const [notes, setNotes] = useState<Note[]>(initialState.notes);
  const [activeId, setActiveId] = useState<string | null>(initialState.activeId);
  const [keyword, setKeyword] = useState('');
  const [storageError, setStorageError] = useState<string | null>(null);
  const failureNotifiedRef = useRef(false);

  // 每次 notes 变化后同步写入本地，失败只提示一次，不打断编辑。
  useEffect(() => {
    const result = saveNotes(notes);

    if (result.ok) {
      failureNotifiedRef.current = false;
      setStorageError(null);
      return;
    }

    if (!failureNotifiedRef.current) {
      failureNotifiedRef.current = true;
      setStorageError(result.message);
    }
  }, [notes]);

  useEffect(() => {
    const result = saveActiveId(activeId);

    if (!result.ok && !failureNotifiedRef.current) {
      failureNotifiedRef.current = true;
      setStorageError(result.message);
    }
  }, [activeId]);

  const activeNote = useMemo(
    () => notes.find((note) => note.id === activeId) ?? null,
    [notes, activeId],
  );

  const filteredNotes = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const sorted = sortNotesByUpdatedAt(notes);

    if (!normalizedKeyword) {
      return sorted;
    }

    return sorted.filter((note) => note.title.toLowerCase().includes(normalizedKeyword));
  }, [notes, keyword]);

  const selectNote = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const createNote = useCallback(() => {
    const now = Date.now();
    const note: Note = {
      id: createId(),
      title: DEFAULT_NOTE_TITLE,
      content: '',
      createdAt: now,
      updatedAt: now,
    };

    setNotes((previous) => [note, ...previous]);
    setActiveId(note.id);
  }, []);

  const deleteNote = useCallback(
    (id: string) => {
      const ordered = sortNotesByUpdatedAt(notes);
      const deletedIndex = ordered.findIndex((note) => note.id === id);
      const remaining = notes.filter((note) => note.id !== id);

      setNotes(remaining);

      if (activeId !== id) {
        return;
      }

      const remainingOrdered = ordered.filter((note) => note.id !== id);

      if (remainingOrdered.length === 0) {
        setActiveId(null);
        return;
      }

      const nextIndex = Math.min(
        Math.max(deletedIndex, 0),
        remainingOrdered.length - 1,
      );
      const nextNote = remainingOrdered[nextIndex] ?? remainingOrdered[0];

      setActiveId(nextNote?.id ?? null);
    },
    [notes, activeId],
  );

  const updateContent = useCallback((id: string, content: string) => {
    const nextTitle = deriveTitle(content);

    setNotes((previous) =>
      previous.map((note) =>
        note.id === id
          ? { ...note, content, title: nextTitle, updatedAt: Date.now() }
          : note,
      ),
    );
  }, []);

  const dismissStorageError = useCallback(() => {
    setStorageError(null);
  }, []);

  return {
    notes,
    filteredNotes,
    activeNote,
    activeId,
    keyword,
    storageError,
    setKeyword,
    selectNote,
    createNote,
    deleteNote,
    updateContent,
    dismissStorageError,
  };
}
