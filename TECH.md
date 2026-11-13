# TECH.md

# Markdown 笔记应用 — 技术文档

## 1. 技术选型

| 领域          | 技术                     | 说明                           |
| :------------ | :----------------------- | :----------------------------- |
| 前端框架      | React 18 + TypeScript    | 组件化开发，类型安全           |
| 构建工具      | Vite                     | 快速冷启动与 HMR               |
| Markdown 解析 | react-markdown           | 将 Markdown 转为 React 组件树  |
| 代码高亮      | react-syntax-highlighter | 代码块语法高亮，支持多语言     |
| 样式方案      | Tailwind CSS             | 原子化 CSS，快速实现响应式布局 |
| 数据存储      | LocalStorage             | 浏览器本地持久化，无需后端     |

### 1.1 依赖安装

```bash
npm create vite@latest markdown-notes -- --template react-ts
cd markdown-notes
npm install react-markdown react-syntax-highlighter
npm install -D @types/react-syntax-highlighter
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 1.2 Tailwind 配置

`tailwind.config.js`：

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

`src/index.css`：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

------

## 2. 目录结构

```text
src/
├── components/
│   ├── NoteList.tsx        # 笔记列表（标题、搜索、新建、删除）
│   ├── Editor.tsx          # Markdown 编辑器（textarea）
│   ├── Preview.tsx         # Markdown 预览区
│   └── MarkdownRenderer.tsx# react-markdown 封装 + 代码高亮
├── hooks/
│   └── useNotes.ts         # 笔记状态管理与 LocalStorage 持久化
├── types/
│   └── note.ts             # Note 类型定义
├── utils/
│   └── storage.ts          # LocalStorage 读写封装
├── App.tsx                 # 布局与页面组装
├── main.tsx
└── index.css
```

------

## 3. 数据模型

```ts
// src/types/note.ts
export interface Note {
  id: string;          // crypto.randomUUID()
  title: string;       // 笔记标题，默认 "未命名笔记"
  content: string;     // Markdown 原文
  createdAt: number;   // 时间戳
  updatedAt: number;   // 时间戳
}
```

### 3.1 LocalStorage 约定

- Key：`markdown-notes:notes`，值为 `Note[]` 的 JSON 字符串。
- Key：`markdown-notes:activeId`，值为当前选中笔记 id。
- 读写统一封装在 `utils/storage.ts`，读取时做 `try/catch` 与数据校验，解析失败返回空数组，避免脏数据导致白屏。

```ts
// src/utils/storage.ts
import type { Note } from '../types/note';

const NOTES_KEY = 'markdown-notes:notes';
const ACTIVE_KEY = 'markdown-notes:activeId';

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNotes(notes: Note[]): void {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function loadActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveId(id: string | null): void {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}
```

------

## 4. 核心模块设计

### 4.1 基础布局（左右分栏 + 响应式）

采用 Flex 布局，`App.tsx` 结构为「笔记列表 + 编辑区 + 预览区」三栏；移动端（`< md`）改为纵向堆叠或 Tab 切换。

```tsx
// App.tsx（布局骨架）
<div className="flex h-screen flex-col bg-gray-50 text-gray-900">
  {/* 顶部工具栏 */}
  <header className="flex items-center justify-between border-b bg-white px-4 py-2">
    <h1 className="text-lg font-semibold">Markdown Notes</h1>
  </header>

  <div className="flex min-h-0 flex-1">
    {/* 左侧：笔记列表 */}
    <aside className="hidden w-60 shrink-0 border-r bg-white md:block">
      <NoteList ... />
    </aside>

    {/* 中间：编辑器 / 右侧：预览，响应式 */}
    <main className="flex min-w-0 flex-1 flex-col md:flex-row">
      <section className="flex min-h-0 flex-1 flex-col border-b md:border-b-0 md:border-r">
        <Editor ... />
      </section>
      <section className="min-h-0 flex-1 overflow-auto bg-white">
        <Preview ... />
      </section>
    </main>
  </div>
</div>
```

要点：

- 根容器 `h-screen` + 子容器 `min-h-0 flex-1`，保证内部滚动而非整页滚动。
- 编辑器与预览区各占 `flex-1`，`md` 断点以上左右分栏，以下上下堆叠。
- 移动端笔记列表可用抽屉（Drawer）或顶部下拉，MVP 阶段可先 `hidden md:block`。

### 4.2 Markdown 解析

使用 `react-markdown` 渲染，`Preview` 组件只负责展示，解析逻辑收敛到 `MarkdownRenderer`。

```tsx
import ReactMarkdown from 'react-markdown';

export function MarkdownRenderer({ content }: { content: string }) {
  return <ReactMarkdown>{content}</ReactMarkdown>;
}
```

注意：`react-markdown` 默认不渲染原始 HTML（安全），如需支持需显式引入 `rehype-raw`，本期不启用。

### 4.3 实时预览

编辑器为受控组件，`onChange` 直接更新当前笔记 `content`，React 状态驱动预览区重渲染，天然实时。

```tsx
<textarea
  className="h-full w-full resize-none p-4 font-mono text-sm outline-none"
  value={note.content}
  onChange={(e) => onContentChange(note.id, e.target.value)}
  placeholder="在此输入 Markdown..."
/>
```

性能考虑：大文档下每次击键都重新解析 Markdown 有开销，可用 `useDeferredValue` 降低预览更新优先级：

```tsx
const deferredContent = useDeferredValue(note.content);
<MarkdownRenderer content={deferredContent} />
```

### 4.4 代码高亮

通过 `react-markdown` 的 `components.code` 自定义渲染，区分行内代码与代码块，代码块交给 `react-syntax-highlighter`。

```tsx
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const code = String(children).replace(/\n$/, '');

    // 无语言标记且无换行 => 行内代码
    if (!match && !code.includes('\n')) {
      return (
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm" {...props}>
          {children}
        </code>
      );
    }

    return (
      <SyntaxHighlighter
        style={oneDark}
        language={match?.[1] ?? 'text'}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: '0.5rem' }}
      >
        {code}
      </SyntaxHighlighter>
    );
  },
};

export function MarkdownRenderer({ content }: { content: string }) {
  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
}
```

支持语言：Prism 内置 JS/TS/Python/Java/Go/Rust/SQL/JSON/Bash 等常见语言，`language` 取不到时回退为纯文本。

### 4.5 笔记管理

状态集中在 `useNotes` Hook：

```ts
// src/hooks/useNotes.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Note } from '../types/note';
import { loadNotes, saveNotes, loadActiveId, saveActiveId } from '../utils/storage';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [activeId, setActiveId] = useState<string | null>(() => {
    const saved = loadActiveId();
    const list = loadNotes();
    return saved && list.some((n) => n.id === saved) ? saved : list[0]?.id ?? null;
  });
  const [keyword, setKeyword] = useState('');

  // 持久化
  useEffect(() => saveNotes(notes), [notes]);
  useEffect(() => saveActiveId(activeId), [activeId]);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeId) ?? null,
    [notes, activeId]
  );

  const filteredNotes = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
    return kw ? sorted.filter((n) => n.title.toLowerCase().includes(kw)) : sorted;
  }, [notes, keyword]);

  const createNote = useCallback(() => {
    const now = Date.now();
    const note: Note = {
      id: crypto.randomUUID(),
      title: '未命名笔记',
      content: '',
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [note, ...prev]);
    setActiveId(note.id);
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      setActiveId((cur) => (cur === id ? next[0]?.id ?? null : cur));
      return next;
    });
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<Pick<Note, 'title' | 'content'>>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n))
    );
  }, []);

  return {
    notes, filteredNotes, activeNote, activeId, keyword,
    setKeyword, setActiveId, createNote, deleteNote, updateNote,
  };
}
```

功能映射：

- 笔记列表：`filteredNotes` 渲染标题，`activeId` 高亮。
- 切换笔记：`setActiveId`。
- 新建：`createNote`，插入列表头部并选中。
- 删除：`deleteNote`，若删除当前笔记则自动选中下一条。
- 搜索：`keyword` 按标题 `includes` 过滤（忽略大小写）。
- 持久化：`useEffect` 监听 `notes` / `activeId` 变化写入 LocalStorage。

标题策略：MVP 阶段取 `content` 第一行非空文本作为标题（去掉 `#`），无内容时显示「未命名笔记」；也可提供独立标题输入框。

------

## 5. 组件职责

| 组件               | 职责                                     | Props                                |
| :----------------- | :--------------------------------------- | :----------------------------------- |
| `NoteList`         | 搜索框、新建按钮、笔记标题列表、删除按钮 | `notes`、`activeId`、`keyword`、回调 |
| `Editor`           | 受控 textarea，展示/编辑当前笔记内容     | `value`、`onChange`                  |
| `Preview`          | 滚动容器 + `MarkdownRenderer`            | `content`                            |
| `MarkdownRenderer` | react-markdown + 代码高亮配置            | `content`                            |

------

## 6. 边界与异常处理

- LocalStorage 不可用（隐私模式/超限）：`saveNotes` 包 `try/catch`，失败时提示用户，不阻断编辑。
- 空笔记列表：展示空状态与「新建笔记」引导。
- 无选中笔记：编辑区与预览区展示占位提示。
- 删除确认：删除前 `window.confirm` 二次确认，防止误删。
- 搜索无结果：列表区展示「未找到匹配笔记」。

------

## 7. 开发与构建

```bash
npm run dev      # 本地开发
npm run build    # 生产构建（tsc + vite build）
npm run preview  # 预览构建产物
```

------

## 8. 后续演进（非本期范围）

- 笔记导入/导出（`.md` 文件）。
- 分屏比例拖拽、编辑/预览 Tab 切换。
- 自动保存防抖、字数统计。
- 从 LocalStorage 迁移到 IndexedDB 或后端 API。
- 深色模式、目录（TOC）导航。
