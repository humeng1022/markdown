import type { OutlineItem } from '../types/outline';
import { ListTreeIcon } from './Icons';

interface OutlinePanelProps {
  items: OutlineItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

const LEVEL_CLASS: Record<number, string> = {
  1: 'pl-2 text-[13px] font-semibold',
  2: 'pl-5 text-[12.5px] font-medium',
  3: 'pl-8 text-[12px]',
  4: 'pl-11 text-[12px]',
  5: 'pl-14 text-[11.5px]',
  6: 'pl-16 text-[11.5px]',
};

export function OutlinePanel({ items, activeId, onSelect }: OutlinePanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          大纲
        </h2>
        <span className="text-[11px] tabular-nums text-slate-400">
          {items.length} 个标题
        </span>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        {items.length > 0 ? (
          <nav aria-label="笔记大纲">
            <ul className="space-y-0.5">
              {items.map((item) => {
                const isActive = item.id === activeId;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(item.id)}
                      aria-current={isActive ? 'location' : undefined}
                      title={item.text}
                      className={`w-full truncate rounded-lg py-1.5 pr-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                        LEVEL_CLASS[item.level] ?? LEVEL_CLASS[3]
                      } ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {item.text}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : (
          <div className="px-4 py-12 text-center">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <ListTreeIcon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">还没有大纲</p>
            <p className="mx-auto mt-1 max-w-[13rem] text-xs leading-5 text-slate-400">
              在正文中使用 <code className="rounded bg-slate-100 px-1"># 标题</code>{' '}
              或 <code className="rounded bg-slate-100 px-1">## 标题</code>，这里会自动生成目录。
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-100 px-4 py-3">
        <p className="text-[11px] leading-5 text-slate-400">
          点击标题可跳转到预览中的对应位置。
        </p>
      </div>
    </div>
  );
}
