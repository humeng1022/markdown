import { Children, isValidElement, type ReactNode } from 'react';
import ReactMarkdown, {
  defaultUrlTransform,
  type Components,
  type UrlTransform,
} from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

const SANITIZE_SCHEMA = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'span',
    'mark',
    'u',
    'sub',
    'sup',
    'kbd',
  ],
  attributes: {
    ...defaultSchema.attributes,
    span: [['className', /^md-/]],
    mark: [['className', /^md-/]],
    u: [],
    sub: [],
    sup: [],
    kbd: [],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: [...(defaultSchema.protocols?.src ?? []), 'data'],
  },
};

const DATA_IMAGE_PATTERN = /^data:image\/(?:png|jpe?g|gif|webp|avif);base64,/i;

const allowDataImages: UrlTransform = (url, key) => {
  if (key === 'src' && DATA_IMAGE_PATTERN.test(url)) {
    return url;
  }

  return defaultUrlTransform(url);
};

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
  md: 'markdown',
  'c++': 'cpp',
  cs: 'csharp',
  'c#': 'csharp',
  golang: 'go',
  rs: 'rust',
  text: 'text',
  txt: 'text',
  plaintext: 'text',
};

/** 只把确认受 Prism 支持的语言交给高亮器，其余降级为纯文本，避免运行时报错 */
const SUPPORTED_LANGUAGES = new Set([
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'python',
  'java',
  'go',
  'rust',
  'sql',
  'json',
  'bash',
  'markup',
  'css',
  'scss',
  'yaml',
  'markdown',
  'diff',
  'c',
  'cpp',
  'csharp',
  'php',
  'ruby',
  'kotlin',
  'swift',
]);

const REMARK_PLUGINS = [remarkGfm];

function resolveLanguage(language: string | null): string | null {
  if (!language) {
    return null;
  }

  const normalized = language.toLowerCase();
  const canonical = LANGUAGE_ALIASES[normalized] ?? normalized;

  return SUPPORTED_LANGUAGES.has(canonical) ? canonical : null;
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join('');
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }

  return '';
}

function CodeHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-1.5">
      <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span className="flex items-center gap-1" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]/80" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]/80" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]/80" />
      </span>
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language: string | null }) {
  const resolvedLanguage = resolveLanguage(language);

  if (!resolvedLanguage) {
    return (
      <div className="my-5 overflow-hidden rounded-xl border border-white/10 bg-[#282c34] shadow-sm">
        <CodeHeader label={language ?? 'text'} />
        <pre className="scrollbar-thin overflow-x-auto p-4 text-[13px] leading-6 text-slate-100">
          <code className="font-mono">{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-white/10 bg-[#282c34] shadow-sm">
      <CodeHeader label={language ?? resolvedLanguage} />
      <SyntaxHighlighter
        language={resolvedLanguage}
        style={oneDark}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: '1rem 1.15rem',
          background: 'transparent',
          fontSize: '0.8125rem',
          lineHeight: 1.7,
          overflowX: 'auto',
        }}
        codeTagProps={{ style: { fontFamily: 'inherit' } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-8 scroll-mt-4 border-b border-slate-100 pb-2 text-3xl font-bold tracking-tight text-slate-900">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-8 scroll-mt-4 text-2xl font-semibold tracking-tight text-slate-900">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-6 scroll-mt-4 text-xl font-semibold text-slate-900">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-5 scroll-mt-4 text-lg font-semibold text-slate-800">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="mb-1 mt-4 scroll-mt-4 text-base font-semibold text-slate-800">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="mb-1 mt-4 scroll-mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </h6>
  ),
  p: ({ children }) => <p className="my-3 leading-7 text-slate-700">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => (
    <del className="text-slate-400 line-through">{children}</del>
  ),
  u: ({ children }) => (
    <u className="underline decoration-slate-400 underline-offset-2">{children}</u>
  ),
  mark: ({ children, className }) => (
    <mark className={className ?? 'rounded bg-amber-100 px-0.5 text-inherit'}>
      {children}
    </mark>
  ),
  kbd: ({ children }) => (
    <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[0.8em] text-slate-600 shadow-sm">
      {children}
    </kbd>
  ),
  a: ({ children, href, title }) => {
    const isExternal = typeof href === 'string' && /^https?:\/\//i.test(href);

    return (
      <a
        href={href}
        title={title}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="break-words font-medium text-indigo-600 underline decoration-indigo-200 underline-offset-2 transition hover:text-indigo-700 hover:decoration-indigo-500"
      >
        {children}
      </a>
    );
  },
  ul: ({ children, className }) => {
    const isTaskList = className?.includes('contains-task-list') ?? false;

    return (
      <ul
        className={
          isTaskList
            ? 'my-3 list-none space-y-1.5 pl-1 text-slate-700'
            : 'my-3 list-disc space-y-1.5 pl-6 text-slate-700 marker:text-slate-400'
        }
      >
        {children}
      </ul>
    );
  },
  ol: ({ children }) => (
    <ol className="my-3 list-decimal space-y-1.5 pl-6 text-slate-700 marker:text-slate-400">
      {children}
    </ol>
  ),
  li: ({ children, className }) => {
    const isTaskItem = className?.includes('task-list-item') ?? false;

    return (
      <li
        className={
          isTaskItem
            ? 'flex items-start gap-2 text-slate-700'
            : 'leading-7 marker:text-slate-400'
        }
      >
        {children}
      </li>
    );
  },
  input: ({ type, checked, disabled }) => {
    if (type !== 'checkbox') {
      return null;
    }

    return (
      <input
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        readOnly
        aria-label={checked ? '已完成任务' : '未完成任务'}
        className="mt-1.5 h-4 w-4 shrink-0 cursor-not-allowed rounded border-slate-300 accent-indigo-600"
      />
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="my-4 rounded-r-xl border-l-4 border-indigo-300 bg-indigo-50/60 py-2 pl-4 pr-3 text-slate-600 [&>p]:my-1">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-t border-slate-200" />,
  img: ({ src, alt, title }) => (
    <img
      src={src}
      alt={alt ?? ''}
      title={title}
      loading="lazy"
      decoding="async"
      className="my-4 max-h-[32rem] max-w-full rounded-lg border border-slate-200 object-contain shadow-sm"
    />
  ),
  table: ({ children }) => (
    <div className="scrollbar-thin my-5 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-slate-100">{children}</tbody>,
  tr: ({ children }) => (
    <tr className="transition hover:bg-slate-50/70">{children}</tr>
  ),
  th: ({ children, style }) => (
    <th
      style={style}
      className="whitespace-nowrap border-b border-slate-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
    >
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td style={style} className="px-4 py-2.5 align-top text-slate-600">
      {children}
    </td>
  ),
  code: ({ children, className }) => {
    if (className?.includes('language-')) {
      return <code className={className}>{children}</code>;
    }

    return (
      <code className="break-keep break-words rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-rose-600">
        {children}
      </code>
    );
  },
  pre: ({ children }) => {
    const child = Children.toArray(children)[0];

    if (isValidElement<{ className?: string; children?: ReactNode }>(child)) {
      const languageMatch = /(?:^|\s)language-([\w-]+)/.exec(
        child.props.className ?? '',
      );
      const code = extractText(child.props.children).replace(/\n$/, '');

      return <CodeBlock code={code} language={languageMatch?.[1] ?? null} />;
    }

    return <CodeBlock code={extractText(children).replace(/\n$/, '')} language={null} />;
  },
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, SANITIZE_SCHEMA]]}
        urlTransform={allowDataImages}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
