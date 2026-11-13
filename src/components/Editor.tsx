import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
  type KeyboardEvent,
} from 'react';
import type { Note } from '../types/note';
import type { LinePrefixKind, TextRange } from '../utils/markdownEdits';
import {
  insertBlock,
  insertImage,
  insertLink,
  setHeading,
  toggleLinePrefix,
  wrapCodeBlock,
  wrapHtml,
  wrapSelection,
  type EditResult,
} from '../utils/markdownEdits';
import { prepareImageFile } from '../utils/image';
import { EditorToolbar } from './EditorToolbar';
import { ImageDialog } from './ImageDialog';
import { SpinnerIcon } from './Icons';

interface EditorProps {
  note: Note;
  onChange: (content: string) => void;
  /** 新建笔记后自增，用于把焦点移到编辑区 */
  focusToken: number;
  onNotify: (message: string) => void;
}

const TABLE_SNIPPET = ['| 列 1 | 列 2 |', '| --- | --- |', '| 内容 | 内容 |'].join('\n');

export function Editor({ note, onChange, focusToken, onNotify }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelectionRef = useRef<TextRange | null>(null);
  const imageSelectionRef = useRef<TextRange | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageDefaultAlt, setImageDefaultAlt] = useState('');
  const [isImageBusy, setIsImageBusy] = useState(false);
  const characterCount = note.content.length;
  const lineCount = note.content.length === 0 ? 0 : note.content.split('\n').length;

  const getSelectionRange = useCallback((): TextRange => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return { start: note.content.length, end: note.content.length };
    }

    return { start: textarea.selectionStart, end: textarea.selectionEnd };
  }, [note.content.length]);

  const applyRange = useCallback((range: TextRange) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.focus();
    textarea.setSelectionRange(range.start, range.end);
  }, []);

  const commit = useCallback(
    (result: EditResult) => {
      if (result.value === note.content) {
        applyRange(result.range);
        return;
      }

      pendingSelectionRef.current = result.range;
      onChange(result.value);
    },
    [applyRange, note.content, onChange],
  );

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

  useEffect(() => {
    const pending = pendingSelectionRef.current;

    if (!pending) {
      return;
    }

    applyRange(pending);
    pendingSelectionRef.current = null;
  }, [note.content, applyRange]);

  const applyWrap = (before: string, after: string, placeholder: string) => {
    commit(wrapSelection(note.content, getSelectionRange(), before, after, placeholder));
  };

  const applyHeading = (level: number) => {
    commit(setHeading(note.content, getSelectionRange(), level));
  };

  const applyLinePrefix = (kind: LinePrefixKind) => {
    commit(toggleLinePrefix(note.content, getSelectionRange(), kind));
  };

  const applyInlineCode = () => {
    applyWrap('`', '`', '代码');
  };

  const applyCodeBlock = (language: string) => {
    commit(
      wrapCodeBlock(note.content, getSelectionRange(), language === 'text' ? '' : language),
    );
  };

  const applyLink = () => {
    commit(insertLink(note.content, getSelectionRange()));
  };

  const applyTable = () => {
    commit(insertBlock(note.content, getSelectionRange(), TABLE_SNIPPET));
  };

  const applyHr = () => {
    commit(insertBlock(note.content, getSelectionRange(), '---'));
  };

  const applyHtml = (tag: 'span' | 'mark' | 'u', className?: string) => {
    commit(wrapHtml(note.content, getSelectionRange(), tag, className));
  };

  const openImageDialog = () => {
    const range = getSelectionRange();
    imageSelectionRef.current = range;
    setImageDefaultAlt(note.content.slice(range.start, range.end).trim().slice(0, 80));
    setIsImageDialogOpen(true);
  };

  const closeImageDialog = useCallback(() => {
    setIsImageDialogOpen(false);
  }, []);

  const insertImageFromDialog = (image: { alt: string; src: string }) => {
    const range = imageSelectionRef.current ?? getSelectionRange();
    commit(insertImage(note.content, range, image.alt, image.src));
    setIsImageDialogOpen(false);
  };

  const insertImageFile = useCallback(
    async (file: File) => {
      const range = getSelectionRange();
      setIsImageBusy(true);

      try {
        const prepared = await prepareImageFile(file);
        const result = insertImage(
          note.content,
          range,
          prepared.name || '图片',
          prepared.dataUrl,
        );
        pendingSelectionRef.current = result.range;
        onChange(result.value);
      } catch (error) {
        onNotify(error instanceof Error ? error.message : '图片处理失败');
      } finally {
        setIsImageBusy(false);
      }
    },
    [getSelectionRange, note.content, onChange, onNotify],
  );

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const imageFile = Array.from(event.clipboardData.files).find((file) =>
      file.type.startsWith('image/'),
    );

    if (!imageFile) {
      return;
    }

    event.preventDefault();
    void insertImageFile(imageFile);
  };

  const handleDrop = (event: DragEvent<HTMLTextAreaElement>) => {
    const imageFile = Array.from(event.dataTransfer.files).find((file) =>
      file.type.startsWith('image/'),
    );

    if (!imageFile) {
      return;
    }

    event.preventDefault();
    void insertImageFile(imageFile);
  };

  const handleDragOver = (event: DragEvent<HTMLTextAreaElement>) => {
    if (event.dataTransfer.types.includes('Files')) {
      event.preventDefault();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.metaKey || event.ctrlKey)) {
      return;
    }

    const key = event.key.toLowerCase();

    if (key === 'b') {
      event.preventDefault();
      applyWrap('**', '**', '加粗文字');
      return;
    }

    if (key === 'i') {
      event.preventDefault();
      applyWrap('*', '*', '斜体文字');
      return;
    }

    if (key === 'e') {
      event.preventDefault();
      applyInlineCode();
      return;
    }

    if (key === 'k') {
      event.preventDefault();
      applyLink();
    }
  };

  return (
    <section aria-label="Markdown 编辑" className="flex min-h-0 flex-1 flex-col bg-white">
      <EditorToolbar
        onHeading={applyHeading}
        onWrap={applyWrap}
        onInlineCode={applyInlineCode}
        onCodeBlock={applyCodeBlock}
        onLinePrefix={applyLinePrefix}
        onLink={applyLink}
        onImage={openImageDialog}
        onTable={applyTable}
        onHr={applyHr}
        onHtml={applyHtml}
      />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <textarea
          ref={textareaRef}
          value={note.content}
          onChange={(event) => onChange(event.target.value)}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onKeyDown={handleKeyDown}
          aria-label="Markdown 编辑区"
          placeholder={
            '# 从这里开始写 Markdown\n\n支持标题、列表、表格、任务清单、代码块与图片…'
          }
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="scrollbar-thin min-h-0 w-full flex-1 resize-none bg-white p-4 font-mono text-[13.5px] leading-6 text-slate-800 caret-indigo-600 outline-none placeholder:text-slate-400 sm:p-6"
        />

        {isImageBusy ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-white/80 text-xs font-medium text-slate-600 backdrop-blur-[1px]">
            <SpinnerIcon className="h-4 w-4 animate-spin text-indigo-500" />
            正在处理图片，请稍候…
          </div>
        ) : null}
      </div>

      <div className="flex h-7 shrink-0 items-center justify-between border-t border-slate-100 px-3 text-[10px] text-slate-400">
        <span className="font-medium uppercase tracking-wider">Markdown</span>
        <span className="tabular-nums">
          {characterCount.toLocaleString('zh-CN')} 字符 · {lineCount} 行
        </span>
      </div>

      <ImageDialog
        open={isImageDialogOpen}
        defaultAlt={imageDefaultAlt}
        onCancel={closeImageDialog}
        onInsert={insertImageFromDialog}
      />
    </section>
  );
}
