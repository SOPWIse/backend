export interface IFileBody {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}
export enum FILE_FORMAT_ENUM {
  JPG = 'jpg',
  PNG = 'png',
  WEBP = 'webp',
  TIFF = 'tiff',
  JPEG = 'jpeg',
  PDF = 'pdf',
}
