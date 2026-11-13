import { useEffect, useRef } from 'react';
import type { Note } from '../types/note';
import { PencilIcon } from './Icons';

interface EditorProps {
  note: Note;
  onChange: (content: string) => void;
  /** 新建笔记后自增，用于把焦点移到编辑区 */
  focusToken: number;
}

export function Editor({ note, onChange, focusToken }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const characterCount = note.content.length;
  const lineCount = note.content.length === 0 ? 0 : note.content.split('\n').length;

  useEffect(() => {
    if (focusToken === 0) {
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.focus();
    const end = textarea.value.length;
    textarea.setSelectionRange(end, end);
  }, [focusToken]);

  return (
    <section aria-label="Markdown 编辑" className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="hidden h-11 shrink-0 items-center justify-between border-b border-slate-200 px-4 md:flex">
        <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <PencilIcon className="h-3.5 w-3.5" />
          Markdown 编辑
        </span>
        <span className="text-[11px] tabular-nums text-slate-400">
          {characterCount.toLocaleString('zh-CN')} 字符 · {lineCount} 行
        </span>
      </div>

      <textarea
        ref={textareaRef}
        value={note.content}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Markdown 编辑区"
        placeholder={'# 从这里开始写 Markdown\n\n支持标题、列表、表格、任务清单与代码块…'}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className="scrollbar-thin min-h-0 w-full flex-1 resize-none bg-white p-4 font-mono text-[13.5px] leading-6 text-slate-800 caret-indigo-600 outline-none placeholder:text-slate-400 sm:p-6"
      />
    </section>
  );
}
