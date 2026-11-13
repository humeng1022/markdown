import type { ChangeEvent, ComponentType, SVGProps } from 'react';
import {
  BoldIcon,
  HighlightIcon,
  ImageIcon,
  InlineCodeIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  QuoteIcon,
  StrikethroughIcon,
  TableIcon,
  TaskListIcon,
  UnderlineIcon,
} from './Icons';
import type { LinePrefixKind } from '../utils/markdownEdits';

interface EditorToolbarProps {
  onHeading: (level: number) => void;
  onWrap: (before: string, after: string, placeholder: string) => void;
  onInlineCode: () => void;
  onCodeBlock: (language: string) => void;
  onLinePrefix: (kind: LinePrefixKind) => void;
  onLink: () => void;
  onImage: () => void;
  onTable: () => void;
  onHr: () => void;
  onHtml: (tag: 'span' | 'mark' | 'u', className?: string) => void;
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface ToolbarButtonProps {
  label: string;
  icon: IconComponent;
  onClick: () => void;
}

const COLORS = [
  { label: '默认颜色', value: 'md-color-default' },
  { label: '深灰', value: 'md-color-slate' },
  { label: '红色', value: 'md-color-red' },
  { label: '橙色', value: 'md-color-orange' },
  { label: '琥珀', value: 'md-color-amber' },
  { label: '绿色', value: 'md-color-green' },
  { label: '青色', value: 'md-color-teal' },
  { label: '蓝色', value: 'md-color-blue' },
  { label: '紫色', value: 'md-color-violet' },
  { label: '粉色', value: 'md-color-pink' },
];

const SIZES = [
  { label: '正常字号', value: 'md-size-base' },
  { label: '小字号', value: 'md-size-sm' },
  { label: '大字号', value: 'md-size-lg' },
  { label: '特大字号', value: 'md-size-xl' },
  { label: '超大字号', value: 'md-size-2xl' },
];

const FONTS = [
  { label: '默认字体', value: 'md-font-sans' },
  { label: '衬线字体', value: 'md-font-serif' },
  { label: '等宽字体', value: 'md-font-mono' },
];

const CODE_LANGUAGES = [
  { label: 'JavaScript', value: 'js' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'SQL', value: 'sql' },
  { label: 'JSON', value: 'json' },
  { label: 'Bash', value: 'bash' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: '纯文本', value: 'text' },
];

const SELECT_CLASS =
  'h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[11px] font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100';

function ToolbarButton({ label, icon: Icon, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-white hover:text-indigo-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-slate-200" aria-hidden="true" />;
}

function SelectAction({
  label,
  options,
  onSelect,
}: {
  label: string;
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
}) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    if (value) {
      onSelect(value);
    }

    event.target.value = '';
  };

  return (
    <select
      aria-label={label}
      title={label}
      value=""
      onChange={handleChange}
      className={SELECT_CLASS}
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function EditorToolbar({
  onHeading,
  onWrap,
  onInlineCode,
  onCodeBlock,
  onLinePrefix,
  onLink,
  onImage,
  onTable,
  onHr,
  onHtml,
}: EditorToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Markdown 格式工具栏"
      className="flex shrink-0 flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50/80 px-2 py-1.5"
    >
      <select
        aria-label="段落格式"
        title="段落格式"
        value=""
        onChange={(event) => {
          const value = event.target.value;

          if (value) {
            onHeading(Number(value));
          }

          event.target.value = '';
        }}
        className={`${SELECT_CLASS} w-[74px]`}
      >
        <option value="">段落</option>
        <option value="1">标题 1</option>
        <option value="2">标题 2</option>
        <option value="3">标题 3</option>
        <option value="4">标题 4</option>
        <option value="0">正文</option>
      </select>

      <Divider />

      <ToolbarButton
        label="加粗 (Ctrl+B)"
        icon={BoldIcon}
        onClick={() => onWrap('**', '**', '加粗文字')}
      />
      <ToolbarButton
        label="斜体 (Ctrl+I)"
        icon={ItalicIcon}
        onClick={() => onWrap('*', '*', '斜体文字')}
      />
      <ToolbarButton
        label="下划线"
        icon={UnderlineIcon}
        onClick={() => onHtml('u')}
      />
      <ToolbarButton
        label="删除线"
        icon={StrikethroughIcon}
        onClick={() => onWrap('~~', '~~', '删除文字')}
      />
      <ToolbarButton
        label="高亮"
        icon={HighlightIcon}
        onClick={() => onHtml('mark', 'md-highlight')}
      />

      <Divider />

      <SelectAction label="颜色" options={COLORS} onSelect={(value) => onHtml('span', value)} />
      <SelectAction label="字号" options={SIZES} onSelect={(value) => onHtml('span', value)} />
      <SelectAction label="字体" options={FONTS} onSelect={(value) => onHtml('span', value)} />

      <Divider />

      <ToolbarButton
        label="无序列表"
        icon={ListIcon}
        onClick={() => onLinePrefix('bullet')}
      />
      <ToolbarButton
        label="有序列表"
        icon={ListOrderedIcon}
        onClick={() => onLinePrefix('ordered')}
      />
      <ToolbarButton
        label="任务列表"
        icon={TaskListIcon}
        onClick={() => onLinePrefix('task')}
      />
      <ToolbarButton
        label="引用"
        icon={QuoteIcon}
        onClick={() => onLinePrefix('quote')}
      />
      <ToolbarButton label="行内代码" icon={InlineCodeIcon} onClick={onInlineCode} />

      <SelectAction
        label="代码块"
        options={CODE_LANGUAGES}
        onSelect={onCodeBlock}
      />

      <Divider />

      <ToolbarButton label="插入链接 (Ctrl+K)" icon={LinkIcon} onClick={onLink} />
      <ToolbarButton label="插入图片" icon={ImageIcon} onClick={onImage} />
      <ToolbarButton label="插入表格" icon={TableIcon} onClick={onTable} />
      <ToolbarButton label="插入分割线" icon={MinusIcon} onClick={onHr} />

      <span className="ml-auto hidden text-[10px] font-medium uppercase tracking-wider text-slate-400 xl:block">
        Markdown
      </span>
    </div>
  );
}
