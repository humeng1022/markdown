import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ className, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className ?? 'h-5 w-5'}
      {...props}
    >
      {children}
    </svg>
  );
}

export function NotebookIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.5 3.5h10A1.5 1.5 0 0 1 18 5v14a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="M8.5 8h6M8.5 12h6M8.5 16h3.5" />
      <path d="M5 7H3.5M5 12H3.5M5 17H3.5" />
    </IconBase>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M5 12h14" />
    </IconBase>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </IconBase>
  );
}

export function XIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </IconBase>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.5 7h15M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12" />
      <path d="M10 11v6M14 11v6" />
    </IconBase>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </IconBase>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20h4.2L19 9.2a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0L4 15.8V20Z" />
      <path d="m13.5 6.5 4 4" />
    </IconBase>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </IconBase>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4.5" y="10" width="15" height="10" rx="2" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
      <path d="M12 14v2" />
    </IconBase>
  );
}

export function AlertTriangleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10.3 4.5 2.8 18a1.6 1.6 0 0 0 1.4 2.4h15.6a1.6 1.6 0 0 0 1.4-2.4L13.7 4.5a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4.5M12 17.5h.01" />
    </IconBase>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.2 2.4 2.4 4.6-5" />
    </IconBase>
  );
}

export function CodeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5l-3 14" />
    </IconBase>
  );
}

export function BoldIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 5h6.5a4 4 0 0 1 0 8H7V5Zm0 8h7.2a4 4 0 0 1 0 8H7v-8Z" />
    </IconBase>
  );
}

export function ItalicIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 5h7M7 19h7M14 5l-3 14" />
    </IconBase>
  );
}

export function UnderlineIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14" />
    </IconBase>
  );
}

export function StrikethroughIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 12h16M8 8.2A3.2 3.2 0 0 1 11.2 5h2.2a3 3 0 0 1 2.9 2.2M8 15.8A3.2 3.2 0 0 0 11.2 19h2.2a3 3 0 0 0 2.9-2.2" />
    </IconBase>
  );
}

export function HighlightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 14 7.8-7.8a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L12 17H7.5l1.5-3Z" />
      <path d="M4 21h16M9 14l3 3" />
    </IconBase>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function ListOrderedIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 6h10M10 12h10M10 18h10" />
      <path d="M4 5h1.2v3M3.8 8h2.4M4 15.5a1.3 1.3 0 0 1 2.4.6c0 1-1.5 2.3-2.4 3h2.6" />
    </IconBase>
  );
}

export function TaskListIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="4.5" width="5" height="5" rx="1" />
      <path d="m4.7 7 1.1 1.1 1.9-2.2M12 6.5h8.5M12 12h8.5M12 17.5h8.5M3.5 14h5v5h-5z" />
    </IconBase>
  );
}

export function QuoteIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 7h5v5H6.5c0 2.2 1 3.4 3 4M14 7h5v5h-3.5c0 2.2 1 3.4 3 4" />
    </IconBase>
  );
}

export function InlineCodeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 8-4 4 4 4M15 8l4 4-4 4" />
    </IconBase>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 13.5a4 4 0 0 0 5.7.1l2.5-2.5a4 4 0 0 0-5.7-5.7L11 6.9" />
      <path d="M14 10.5a4 4 0 0 0-5.7-.1l-2.5 2.5a4 4 0 0 0 5.7 5.7l1.4-1.4" />
    </IconBase>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m4.5 17 4.2-4.2 3.1 3.1 2.2-2.2 5.5 5.5" />
    </IconBase>
  );
}

export function TableIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <path d="M3.5 9.5h17M3.5 14.5h17M9.5 4.5v15M15 4.5v15" />
    </IconBase>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" />
    </IconBase>
  );
}

export function ListTreeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 5v14M5 8h5M5 16h5M14 5h5M14 12h5M14 19h5" />
      <path d="M10 8v8" />
    </IconBase>
  );
}

export function SpinnerIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
    </IconBase>
  );
}
