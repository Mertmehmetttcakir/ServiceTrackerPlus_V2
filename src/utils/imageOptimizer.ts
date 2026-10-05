export type ImageFormat = 'webp' | 'avif' | 'jpeg';

export interface OptimizeImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: ImageFormat;
}

/**
 * Supabase Storage tabanlı görseller için basit bir URL tabanlı optimizasyon helper'ı.
 *
 * Not:
 * - Sunucu tarafında gerçek bir görüntü işleme yapılmıyor; Supabase'in
 *   görüntü işleme / CDN parametrelerini kullanmak için tasarlandı.
 * - Diğer kaynaklar (örn. yerel / public klasörü) için URL olduğu gibi döndürülür.
 */
export const optimizeImage = (url: string, options: OptimizeImageOptions = {}): string => {
  if (!url) return url;

  // Sadece Supabase URL'leri için parametre uygula
  if (!url.includes('supabase')) {
    return url;
  }

  const [base, existingQuery] = url.split('?');
  const params = new URLSearchParams(existingQuery ?? '');

  if (typeof options.width === 'number') {
    params.set('width', String(options.width));
  }

  if (typeof options.height === 'number') {
    params.set('height', String(options.height));
  }

  if (typeof options.quality === 'number') {
    params.set('quality', String(options.quality));
  }

  if (options.format) {
    params.set('format', options.format);
  }

  const query = params.toString();
  return query ? `${base}?${query}` : base;
};




