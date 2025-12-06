/**
 * Fotomatik Types
 */

export enum FotomatikAppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface FotomatikGeneratedImage {
  url: string;
  prompt: string;
}

export interface FotomatikImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface FotomatikEditConfig {
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  highlights: number;
  shadows: number;
  cropRatio: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  cropCenter?: { x: number, y: number };
  resize?: {
    width: number;
    height: number;
  };
}

