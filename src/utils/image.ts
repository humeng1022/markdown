export interface PreparedImage {
  dataUrl: string;
  width: number;
  height: number;
  name: string;
}

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_DIMENSION = 1600;
const MAX_DATA_URL_LENGTH = 1_800_000;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('读取图片失败'));
    };
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片格式无法解析'));
    image.src = src;
  });
}

function baseName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '').slice(0, 60) || '图片';
}

/**
 * 把本地图片转成可内嵌的 data URL。
 * 非 GIF 图片会压缩到最长边 1600px，尽量降低 LocalStorage 压力。
 */
export async function prepareImageFile(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('请选择图片文件');
  }

  if (file.type === 'image/svg+xml') {
    throw new Error('出于安全考虑，暂不支持 SVG 图片');
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error('图片不能超过 4MB，请先压缩后再插入');
  }

  const originalDataUrl = await readAsDataUrl(file);
  const name = baseName(file.name);

  if (file.type === 'image/gif') {
    if (originalDataUrl.length > MAX_DATA_URL_LENGTH) {
      throw new Error('GIF 图片过大，请压缩到约 1.8MB 以下');
    }

    return { dataUrl: originalDataUrl, width: 0, height: 0, name };
  }

  const image = await loadImage(originalDataUrl);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    if (originalDataUrl.length > MAX_DATA_URL_LENGTH) {
      throw new Error('图片过大，请先压缩后再插入');
    }
    return { dataUrl: originalDataUrl, width, height, name };
  }

  context.drawImage(image, 0, 0, width, height);
  let dataUrl = canvas.toDataURL('image/webp', 0.85);

  if (!dataUrl.startsWith('data:image/webp')) {
    dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  }

  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    throw new Error('图片压缩后仍然过大，请换一张更小的图片');
  }

  return { dataUrl, width, height, name };
}
