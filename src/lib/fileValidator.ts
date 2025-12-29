export interface FileValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  file_info?: {
    size_mb: number;
    mime_type: string;
    width?: number;
    height?: number;
    dpi?: number;
  };
}

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'application/pdf',
  'application/postscript', // AI files
  'application/illustrator'
];

const MAX_FILE_SIZE_MB = 50;
const MIN_DPI = 300;

export async function validateFile(file: File): Promise<FileValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Проверка размера файла
  const size_mb = file.size / (1024 * 1024);
  if (size_mb > MAX_FILE_SIZE_MB) {
    errors.push(`Размер файла превышает ${MAX_FILE_SIZE_MB}MB. Текущий размер: ${size_mb.toFixed(2)}MB`);
  }

  // Проверка типа файла
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    errors.push(`Неподдерживаемый формат файла. Разрешены: PNG, JPG, SVG, PDF, AI`);
  }

  const file_info = {
    size_mb: parseFloat(size_mb.toFixed(2)),
    mime_type: file.type
  };

  // Для изображений - проверка разрешения и DPI
  if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
    try {
      const imageInfo = await getImageInfo(file);
      file_info.width = imageInfo.width;
      file_info.height = imageInfo.height;
      file_info.dpi = imageInfo.dpi;

      if (imageInfo.dpi && imageInfo.dpi < MIN_DPI) {
        warnings.push(
          `Низкое разрешение: ${imageInfo.dpi} DPI. Рекомендуется минимум ${MIN_DPI} DPI для качественной печати.`
        );
      }

      if (imageInfo.width < 1000 || imageInfo.height < 1000) {
        warnings.push(
          `Низкое разрешение изображения: ${imageInfo.width}x${imageInfo.height}px. Рекомендуется минимум 1000x1000px.`
        );
      }
    } catch (error) {
      warnings.push('Не удалось проверить качество изображения');
    }
  }

  return {
    is_valid: errors.length === 0,
    errors,
    warnings,
    file_info
  };
}

async function getImageInfo(file: File): Promise<{ width: number; height: number; dpi?: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Примерный расчет DPI (если известны физические размеры)
      // Для упрощения используем стандартное соотношение
      const dpi = Math.round((img.width / 10) * 2.54); // Предполагаем 10см ширину

      resolve({
        width: img.width,
        height: img.height,
        dpi: dpi > 72 ? dpi : undefined
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf';
}