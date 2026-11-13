import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { prepareImageFile, type PreparedImage } from '../utils/image';
import { ImageIcon, SpinnerIcon, XIcon } from './Icons';

interface ImageDialogProps {
  open: boolean;
  defaultAlt: string;
  onCancel: () => void;
  onInsert: (image: { alt: string; src: string }) => void;
}

type ImageMode = 'url' | 'file';

export function ImageDialog({ open, defaultAlt, onCancel, onInsert }: ImageDialogProps) {
  const [mode, setMode] = useState<ImageMode>('url');
  const [alt, setAlt] = useState('');
  const [url, setUrl] = useState('');
  const [prepared, setPrepared] = useState<PreparedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setMode('url');
    setAlt(defaultAlt);
    setUrl('');
    setPrepared(null);
    setError(null);
    setIsBusy(false);
    window.requestAnimationFrame(() => urlInputRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [open, defaultAlt, onCancel]);

  if (!open) {
    return null;
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      const nextImage = await prepareImageFile(file);
      setPrepared(nextImage);
      setAlt((current) => current.trim() || nextImage.name);
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : '图片处理失败');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === 'file') {
      if (!prepared) {
        setError('请先选择一张本地图片');
        return;
      }

      onInsert({ alt: alt.trim() || prepared.name || '图片', src: prepared.dataUrl });
      return;
    }

    const nextUrl = url.trim();

    if (!nextUrl) {
      setError('请输入图片地址');
      return;
    }

    if (/^(?:javascript|vbscript|file):/i.test(nextUrl)) {
      setError('不支持这种图片地址');
      return;
    }

    onInsert({ alt: alt.trim() || '图片', src: nextUrl });
  };

  const canInsert = mode === 'url' ? url.trim().length > 0 : prepared !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-sm motion-reduce:animate-none"
        onClick={onCancel}
        aria-hidden="true"
      />

      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-dialog-title"
        onSubmit={handleSubmit}
        className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-lg animate-pop-in flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 motion-reduce:animate-none"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <ImageIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 id="image-dialog-title" className="text-sm font-semibold text-slate-900">
                插入图片
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-400">
                支持网络图片，也可以从本地选择后内嵌到笔记中
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="关闭插入图片"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div
            role="tablist"
            aria-label="图片来源"
            className="mb-4 flex rounded-xl bg-slate-100 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'url'}
              onClick={() => {
                setMode('url');
                setError(null);
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                mode === 'url'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              图片链接
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'file'}
              onClick={() => {
                setMode('file');
                setError(null);
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                mode === 'file'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              本地上传
            </button>
          </div>

          {mode === 'url' ? (
            <div>
              <label
                htmlFor="image-url"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                图片地址
              </label>
              <input
                ref={urlInputRef}
                id="image-url"
                type="text"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setError(null);
                }}
                placeholder="https://example.com/image.png"
                spellCheck={false}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
              <p className="mt-1.5 text-[11px] text-slate-400">
                支持 http(s) 图片地址和相对路径。
              </p>
            </div>
          ) : (
            <div>
              <input
                id="image-file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                className="sr-only"
              />
              <label
                htmlFor="image-file"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40"
              >
                {isBusy ? (
                  <>
                    <SpinnerIcon className="h-6 w-6 animate-spin text-indigo-500" />
                    <span className="mt-2 text-xs text-slate-500">正在处理图片…</span>
                  </>
                ) : prepared ? (
                  <>
                    <img
                      src={prepared.dataUrl}
                      alt={prepared.name}
                      className="max-h-40 max-w-full rounded-lg border border-slate-200 object-contain"
                    />
                    <span className="mt-2 text-xs font-medium text-slate-600">
                      {prepared.name}
                    </span>
                    <span className="mt-0.5 text-[11px] text-slate-400">
                      点击可重新选择
                    </span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-7 w-7 text-slate-400" />
                    <span className="mt-2 text-xs font-medium text-slate-600">
                      点击选择本地图片
                    </span>
                    <span className="mt-0.5 text-[11px] text-slate-400">
                      PNG / JPEG / WebP / GIF，最大 4MB
                    </span>
                  </>
                )}
              </label>
              <p className="mt-2 text-[11px] leading-5 text-slate-400">
                本地图片会压缩后以 base64 内嵌到笔记中，并占用浏览器 LocalStorage
                空间；建议单张图片不超过 2MB。
              </p>
            </div>
          )}

          <div className="mt-4">
            <label
              htmlFor="image-alt"
              className="mb-1.5 block text-xs font-medium text-slate-600"
            >
              图片描述（可选）
            </label>
            <input
              id="image-alt"
              type="text"
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              placeholder="描述图片内容，便于识别"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {error ? (
            <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-5 py-3.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={!canInsert || isBusy}
            className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            插入图片
          </button>
        </div>
      </form>
    </div>
  );
}
