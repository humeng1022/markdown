import { useCallback, useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Editor } from './components/Editor';
import {
  AlertTriangleIcon,
  EyeIcon,
  MenuIcon,
  NotebookIcon,
  PencilIcon,
  PlusIcon,
  XIcon,
} from './components/Icons';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { Welcome } from './components/Welcome';
import { useNotes } from './hooks/useNotes';
import type { Note } from './types/note';
import type { OutlineItem } from './types/outline';

type MobileTab = 'edit' | 'preview';

export default function App() {
  const {
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
  } = useNotes();

  const [mobileTab, setMobileTab] = useState<MobileTab>('edit');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Note | null>(null);
  const [focusToken, setFocusToken] = useState(0);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const toastTimerRef = useRef<number | null>(null);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);

    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4000);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const handleCreate = useCallback(() => {
    setOutline([]);
    setActiveHeadingId(null);
    createNote();
    setFocusToken((token) => token + 1);
    setMobileTab('edit');
    setIsDrawerOpen(false);
  }, [createNote]);

  const handleSelect = useCallback(
    (id: string) => {
      setOutline([]);
      setActiveHeadingId(null);
      selectNote(id);
      setMobileTab('edit');
      setIsDrawerOpen(false);
    },
    [selectNote],
  );

  const handleRequestDelete = useCallback((note: Note) => {
    setPendingDelete(note);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDelete) {
      return;
    }

    if (pendingDelete.id === activeId) {
      setOutline([]);
      setActiveHeadingId(null);
    }

    deleteNote(pendingDelete.id);
    setPendingDelete(null);
  }, [pendingDelete, activeId, deleteNote]);

  const handleCancelDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const handleOutlineChange = useCallback((items: OutlineItem[]) => {
    setOutline(items);
    setActiveHeadingId((current) => {
      if (current && items.some((item) => item.id === current)) {
        return current;
      }

      return items[0]?.id ?? null;
    });
  }, []);

  const handleActiveHeadingChange = useCallback((id: string | null) => {
    setActiveHeadingId(id);
  }, []);

  const handleSelectHeading = useCallback(
    (id: string) => {
      setActiveHeadingId(id);
      setMobileTab('preview');
      closeDrawer();
      window.requestAnimationFrame(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },
    [closeDrawer],
  );

  // 桌面宽度下关闭移动端抽屉，避免窗口放大后遮罩残留。
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = () => {
      if (mediaQuery.matches) {
        setIsDrawerOpen(false);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!isDrawerOpen || pendingDelete) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, pendingDelete, closeDrawer]);

  useEffect(() => {
    if (!activeNote) {
      setOutline([]);
      setActiveHeadingId(null);
    }
  }, [activeNote]);

  const sidebarProps = {
    notes: filteredNotes,
    totalCount: notes.length,
    activeId,
    keyword,
    outline,
    activeHeadingId,
    onKeywordChange: setKeyword,
    onSelect: handleSelect,
    onCreate: handleCreate,
    onRequestDelete: handleRequestDelete,
    onSelectHeading: handleSelectHeading,
  };

  const storageLabel = storageError ? '仅保存在内存' : '已保存到本地';

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900 supports-[height:100dvh]:h-dvh">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white/95 px-3 backdrop-blur sm:gap-3 sm:px-5">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="打开笔记列表"
            aria-expanded={isDrawerOpen}
            aria-controls="notes-drawer"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 md:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/20">
              <NotebookIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold tracking-tight text-slate-900">
                Markdown Notes
              </h1>
              <p className="hidden text-[11px] leading-3 text-slate-400 sm:block">
                本地优先 · 即写即预览
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span
              role="status"
              aria-live="polite"
              className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:flex ${
                storageError
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  storageError ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              {storageLabel}
            </span>

            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">新建笔记</span>
              <span className="sr-only sm:hidden">新建笔记</span>
            </button>
          </div>
        </header>

        {storageError ? (
          <div
            role="alert"
            className="flex shrink-0 items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs leading-5 text-amber-800 sm:px-5"
          >
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1">
              {storageError} 你仍可继续编辑，但刷新页面后这些修改可能丢失。
            </p>
            <button
              type="button"
              onClick={dismissStorageError}
              aria-label="关闭存储提醒"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-amber-600 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
            <Sidebar {...sidebarProps} searchId="note-search-desktop" />
          </aside>

          {activeNote ? (
            <main className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div
                role="tablist"
                aria-label="编辑与预览切换"
                className="flex h-11 shrink-0 items-center gap-1 border-b border-slate-200 bg-white px-2 md:hidden"
              >
                <button
                  type="button"
                  role="tab"
                  id="tab-edit"
                  aria-selected={mobileTab === 'edit'}
                  aria-controls="panel-edit"
                  onClick={() => setMobileTab('edit')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition ${
                    mobileTab === 'edit'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                  编辑
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-preview"
                  aria-selected={mobileTab === 'preview'}
                  aria-controls="panel-preview"
                  onClick={() => setMobileTab('preview')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition ${
                    mobileTab === 'preview'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <EyeIcon className="h-3.5 w-3.5" />
                  预览
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col md:flex-row">
                <div
                  id="panel-edit"
                  role="tabpanel"
                  aria-labelledby="tab-edit"
                  className={`${
                    mobileTab === 'preview' ? 'hidden md:flex' : 'flex'
                  } min-h-0 min-w-0 flex-1 flex-col border-b border-slate-200 md:border-b-0 md:border-r`}
                >
                  <Editor
                    note={activeNote}
                    onChange={(content) => updateContent(activeNote.id, content)}
                    focusToken={focusToken}
                    onNotify={notify}
                  />
                </div>

                <div
                  id="panel-preview"
                  role="tabpanel"
                  aria-labelledby="tab-preview"
                  className={`${
                    mobileTab === 'edit' ? 'hidden md:flex' : 'flex'
                  } min-h-0 min-w-0 flex-1 flex-col`}
                >
                  <Preview
                    content={activeNote.content}
                    onOutlineChange={handleOutlineChange}
                    onActiveHeadingChange={handleActiveHeadingChange}
                  />
                </div>
              </div>
            </main>
          ) : (
            <main className="flex min-h-0 min-w-0 flex-1">
              <Welcome hasNotes={notes.length > 0} onCreate={handleCreate} />
            </main>
          )}
        </div>

        {isDrawerOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-sm motion-reduce:animate-none"
              onClick={closeDrawer}
              aria-hidden="true"
            />
            <div
              id="notes-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="笔记列表"
              className="absolute inset-y-0 left-0 flex w-[84%] max-w-xs animate-slide-in flex-col bg-white shadow-2xl motion-reduce:animate-none"
            >
              <Sidebar
                {...sidebarProps}
                searchId="note-search-mobile"
                onClose={closeDrawer}
              />
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="删除这篇笔记？"
        description={
          pendingDelete
            ? `「${pendingDelete.title}」将被永久删除，且无法恢复。`
            : ''
        }
        confirmLabel="删除"
        cancelLabel="取消"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-[60] max-w-[calc(100vw-2rem)] -translate-x-1/2 animate-pop-in rounded-xl bg-slate-900/95 px-4 py-2.5 text-center text-xs font-medium text-white shadow-xl motion-reduce:animate-none"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
