import { useMemo } from 'react';
import type { Note } from '../types/note';
import { formatUpdatedAt } from '../utils/note';
import {
  LockIcon,
  NotebookIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  XIcon,
} from './Icons';

interface NoteListProps {
  notes: Note[];
  totalCount: number;
  activeId: string | null;
  keyword: string;
  searchId: string;
  onKeywordChange: (keyword: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRequestDelete: (note: Note) => void;
  onClose?: () => void;
}

export function NoteList({
  notes,
  totalCount,
  activeId,
  keyword,
  searchId,
  onKeywordChange,
  onSelect,
  onCreate,
  onRequestDelete,
  onClose,
}: NoteListProps) {
  const isSearching = keyword.trim().length > 0;
  const visibleCountLabel = useMemo(
    () => (isSearching ? `${notes.length} / ${totalCount}` : `${totalCount}`),
    [isSearching, notes.length, totalCount],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-slate-100 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            我的笔记
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] tabular-nums text-slate-400">
              {visibleCountLabel} 篇
            </span>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                autoFocus
                aria-label="关闭笔记列表"
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <XIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <label htmlFor={searchId} className="sr-only">
            搜索笔记标题
          </label>
          <input
            id={searchId}
            type="search"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="搜索笔记标题…"
            autoComplete="off"
            spellCheck={false}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
          {isSearching ? (
            <button
              type="button"
              onClick={() => onKeywordChange('')}
              aria-label="清空搜索"
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <PlusIcon className="h-4 w-4" />
          新建笔记
        </button>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        {notes.length > 0 ? (
          <ul aria-label="笔记列表" className="space-y-1">
            {notes.map((note) => {
              const isActive = note.id === activeId;

              return (
                <li key={note.id} className="group relative">
                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 z-10 h-8 w-1 -translate-y-1/2 rounded-r-full bg-indigo-500"
                    />
                  ) : null}

                  <button
                    type="button"
                    onClick={() => onSelect(note.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`w-full rounded-xl py-2.5 pl-3 pr-11 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-950'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block truncate text-sm font-medium">{note.title}</span>
                    <span
                      className={`mt-0.5 block text-[11px] ${
                        isActive ? 'text-indigo-400' : 'text-slate-400'
                      }`}
                    >
                      {formatUpdatedAt(note.updatedAt)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRequestDelete(note)}
                    aria-label={`删除笔记：${note.title}`}
                    title="删除笔记"
                    className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : totalCount === 0 ? (
          <EmptyNotes onCreate={onCreate} />
        ) : (
          <div className="px-4 py-12 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-400">
              <SearchIcon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">未找到匹配笔记</p>
            <p className="mt-1 text-xs text-slate-400">换个关键词试试</p>
            <button
              type="button"
              onClick={() => onKeywordChange('')}
              className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              清空搜索
            </button>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-100 px-4 py-3">
        <p className="flex items-start gap-2 text-[11px] leading-5 text-slate-400">
          <LockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          笔记只保存在当前浏览器，不会上传到服务器。清除浏览器数据会永久删除笔记。
        </p>
      </div>
    </div>
  );
}

function EmptyNotes({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="px-4 py-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-500">
        <NotebookIcon className="h-6 w-6" />
      </div>
      <p className="mt-3 text-sm font-medium text-slate-600">还没有笔记</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">
        新建一篇，开始记录你的想法
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        新建笔记
      </button>
    </div>
  );
}
