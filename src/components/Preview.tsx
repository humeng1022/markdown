import { useDeferredValue } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { EyeIcon } from './Icons';

interface PreviewProps {
  content: string;
}

const SYNTAX_HINTS = ['# 标题', '**粗体**', '- [ ] 待办', '```js'];

export function Preview({ content }: PreviewProps) {
  const deferredContent = useDeferredValue(content);
  const isPending = deferredContent !== content;
  const isBlank = content.trim().length === 0;

  return (
    <section
      aria-label="Markdown 预览"
      className="flex min-h-0 flex-1 flex-col bg-slate-50/70"
    >
      <div className="hidden h-11 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:flex">
        <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <EyeIcon className="h-3.5 w-3.5" />
          预览
        </span>
        <span
          className={`flex items-center gap-1.5 text-[11px] ${
            isPending ? 'text-indigo-500' : 'text-slate-400'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isPending ? 'animate-pulse bg-indigo-400' : 'bg-emerald-400'
            }`}
          />
          {isPending ? '渲染中…' : '实时同步'}
        </span>
      </div>

      <div
        className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain"
        aria-busy={isPending}
      >
        <article className="mx-auto w-full max-w-3xl px-5 py-6 sm:px-8 sm:py-8">
          {isBlank ? <BlankPreview /> : <MarkdownRenderer content={deferredContent} />}
        </article>
      </div>
    </section>
  );
}

function BlankPreview() {
  return (
    <div className="mx-auto mt-2 max-w-md rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center sm:mt-6">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-500">
        <EyeIcon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-medium text-slate-600">预览会实时出现在这里</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">
        在左侧输入 Markdown，标题、表格、任务清单和代码块都会立即渲染。
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {SYNTAX_HINTS.map((hint) => (
          <code
            key={hint}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-500"
          >
            {hint}
          </code>
        ))}
      </div>
    </div>
  );
}
