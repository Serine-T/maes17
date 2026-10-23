import manifest from './images.generated.json';

export type ImageName = keyof typeof manifest;

export interface ImageCredit {
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  page: string;
}

export interface ImageAsset {
  name: ImageName;
  widths: number[];
  width: number;
  height: number;
  /** null for owner-supplied images, which need no third-party attribution. */
  credit: ImageCredit | null;
}

export function getImage(name: ImageName): ImageAsset {
  return { name, ...manifest[name] };
}

export function imageUrl(name: ImageName, width: number): string {
  return `/images/photos/${name}-${width}.webp`;
}

export function imageSrcSet(asset: ImageAsset): string {
  return asset.widths.map((w) => `${imageUrl(asset.name, w)} ${w}w`).join(', ');
}

export const allImages: ImageAsset[] = (Object.keys(manifest) as ImageName[]).map(getImage);
