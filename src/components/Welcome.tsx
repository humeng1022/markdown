import { CodeIcon, EyeIcon, LockIcon, NotebookIcon, PlusIcon } from './Icons';

interface WelcomeProps {
  hasNotes: boolean;
  onCreate: () => void;
}

const FEATURES = [
  { icon: EyeIcon, title: '实时预览', description: '边写边看排版效果' },
  { icon: CodeIcon, title: '代码高亮', description: '常见语言开箱即用' },
  { icon: LockIcon, title: '本地存储', description: '数据不离开浏览器' },
];

export function Welcome({ hasNotes, onCreate }: WelcomeProps) {
  return (
    <div className="scrollbar-thin flex min-h-0 flex-1 items-center justify-center overflow-y-auto bg-slate-50/60 p-5 sm:p-8">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
          <NotebookIcon className="h-7 w-7" />
        </div>

        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
          {hasNotes ? '选择一篇笔记开始' : '开始你的第一篇 Markdown 笔记'}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          {hasNotes
            ? '从左侧列表选择一篇，或新建一篇继续记录。'
            : '左侧编辑、右侧实时预览，所有内容只保存在你的浏览器里。'}
        </p>

        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <PlusIcon className="h-4 w-4" />
          新建笔记
        </button>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
            >
              <Icon className="h-4 w-4 text-indigo-500" />
              <p className="mt-2 text-xs font-semibold text-slate-700">{title}</p>
              <p className="mt-0.5 text-[11px] leading-4 text-slate-400">{description}</p>
            </div>
          ))}
        </div>

        {!hasNotes ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              试试这些语法
            </p>
            <div className="mt-2 grid gap-1.5 font-mono text-xs text-slate-500 sm:grid-cols-2">
              <code># 一级标题</code>
              <code>**加粗** 和 *斜体*</code>
              <code>- [ ] 任务清单</code>
              <code>```js 代码块</code>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
