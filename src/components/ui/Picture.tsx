import type { CSSProperties } from 'react';
import { getImage, imageSrcSet, imageUrl, type ImageName } from '@/content/images';

interface PictureProps {
  name: ImageName;
  alt: string;
  sizes?: string;
  /** Above-the-fold images load eagerly with high priority (LCP). */
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Responsive WebP image with intrinsic dimensions to prevent layout shift. */
export function Picture({ name, alt, sizes = '100vw', priority = false, className = '', style }: PictureProps) {
  const asset = getImage(name);
  const fallbackWidth = asset.widths.includes(1200) ? 1200 : asset.width;
  return (
    <img
      src={imageUrl(name, fallbackWidth)}
      srcSet={imageSrcSet(asset)}
      sizes={sizes}
      width={asset.width}
      height={asset.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={className}
      style={style}
    />
  );
}
