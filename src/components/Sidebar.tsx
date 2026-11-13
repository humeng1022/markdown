import { useState } from 'react';
import type { Note } from '../types/note';
import type { OutlineItem } from '../types/outline';
import { ListTreeIcon, NotebookIcon, XIcon } from './Icons';
import { NoteList } from './NoteList';
import { OutlinePanel } from './OutlinePanel';

interface SidebarProps {
  notes: Note[];
  totalCount: number;
  activeId: string | null;
  keyword: string;
  searchId: string;
  outline: OutlineItem[];
  activeHeadingId: string | null;
  onKeywordChange: (keyword: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRequestDelete: (note: Note) => void;
  onSelectHeading: (id: string) => void;
  onClose?: () => void;
}

type SidebarTab = 'notes' | 'outline';

export function Sidebar({
  notes,
  totalCount,
  activeId,
  keyword,
  searchId,
  outline,
  activeHeadingId,
  onKeywordChange,
  onSelect,
  onCreate,
  onRequestDelete,
  onSelectHeading,
  onClose,
}: SidebarProps) {
  const [tab, setTab] = useState<SidebarTab>('notes');

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex shrink-0 items-center gap-1 border-b border-slate-100 p-2">
        <button
          type="button"
          onClick={() => setTab('notes')}
          aria-pressed={tab === 'notes'}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            tab === 'notes'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          <NotebookIcon className="h-3.5 w-3.5" />
          笔记
          <span className="text-[10px] tabular-nums opacity-60">{totalCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('outline')}
          aria-pressed={tab === 'outline'}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            tab === 'outline'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          <ListTreeIcon className="h-3.5 w-3.5" />
          大纲
          <span className="text-[10px] tabular-nums opacity-60">{outline.length}</span>
        </button>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="关闭笔记列表"
            className="ml-auto grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <XIcon className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1">
        {tab === 'notes' ? (
          <NoteList
            notes={notes}
            totalCount={totalCount}
            activeId={activeId}
            keyword={keyword}
            searchId={searchId}
            onKeywordChange={onKeywordChange}
            onSelect={onSelect}
            onCreate={onCreate}
            onRequestDelete={onRequestDelete}
          />
        ) : (
          <OutlinePanel
            items={outline}
            activeId={activeHeadingId}
            onSelect={onSelectHeading}
          />
        )}
      </div>
    </div>
  );
}
