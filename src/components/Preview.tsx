import { useCallback, useDeferredValue, useEffect, useRef } from 'react';
import type { OutlineItem } from '../types/outline';
import { createHeadingSlugger } from '../utils/outline';
import { MarkdownRenderer } from './MarkdownRenderer';
import { EyeIcon } from './Icons';

interface PreviewProps {
  content: string;
  onOutlineChange: (items: OutlineItem[]) => void;
  onActiveHeadingChange: (id: string | null) => void;
}

const SYNTAX_HINTS = ['# 标题', '**粗体**', '- [ ] 待办', '```js'];

export function Preview({
  content,
  onOutlineChange,
  onActiveHeadingChange,
}: PreviewProps) {
  const deferredContent = useDeferredValue(content);
  const isPending = deferredContent !== content;
  const isBlank = content.trim().length === 0;
  const articleRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const article = articleRef.current;

    if (!article) {
      onOutlineChange([]);
      return;
    }

    const slug = createHeadingSlugger();
    const headings = Array.from(
      article.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6'),
    );
    const items: OutlineItem[] = headings.map((heading) => {
      const text = (heading.textContent ?? '').replace(/\s+/g, ' ').trim();
      const id = slug(text || 'section');

      heading.id = id;

      return {
        id,
        text: text || '无标题',
        level: Number(heading.tagName.slice(1)),
      };
    });

    onOutlineChange(items);
  }, [deferredContent, onOutlineChange]);

  const handleScroll = useCallback(() => {
    if (scrollFrameRef.current !== null) {
      return;
    }

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;

      const container = scrollRef.current;
      const article = articleRef.current;

      if (!container || !article) {
        return;
      }

      const headings = Array.from(
        article.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6'),
      );

      if (headings.length === 0) {
        onActiveHeadingChange(null);
        return;
      }

      const threshold = container.getBoundingClientRect().top + 96;
      let activeId = headings[0]?.id || null;

      if (container.scrollTop <= 0) {
        activeId = headings[0]?.id || null;
      } else if (
        container.scrollHeight > container.clientHeight + 4 &&
        container.scrollTop + container.clientHeight >= container.scrollHeight - 2
      ) {
        // 到达底部时，最后一个标题可能因为剩余内容不足而停不在顶部。
        activeId = headings[headings.length - 1]?.id || null;
      } else {
        for (const heading of headings) {
          if (heading.getBoundingClientRect().top <= threshold) {
            activeId = heading.id || null;
          } else {
            break;
          }
        }
      }

      onActiveHeadingChange(activeId);
    });
  }, [onActiveHeadingChange]);

  useEffect(
    () => () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    },
    [],
  );

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
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain"
        aria-busy={isPending}
      >
        <article
          ref={articleRef}
          className="mx-auto w-full max-w-3xl px-5 pb-[45vh] pt-6 sm:px-8 sm:pt-8"
        >
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
        在左侧输入 Markdown，或用工具栏插入标题、表格、代码块和图片。
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
