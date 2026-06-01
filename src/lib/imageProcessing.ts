/**
 * Processamento de imagens clínicas:
 * - valida tipo e tamanho do arquivo original
 * - redimensiona para no máximo MAX_DIMENSION (mantém proporção)
 * - re-codifica em JPEG com qualidade controlada para padronizar o prontuário
 */
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_INPUT_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_DIMENSION = 1920; // px (lado maior)
export const MIN_DIMENSION = 200; // px (lado menor)
export const JPEG_QUALITY = 0.85;

export interface ProcessedPhoto {
  file: File;
  width: number;
  height: number;
  originalBytes: number;
  finalBytes: number;
}

export class PhotoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoValidationError";
  }
}

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new PhotoValidationError("Não foi possível ler a imagem."));
    };
    img.src = url;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new PhotoValidationError("Falha ao processar a imagem."))),
      "image/jpeg",
      quality,
    );
  });

export const processClinicalPhoto = async (file: File): Promise<ProcessedPhoto> => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new PhotoValidationError(
      `Formato não suportado (${file.type || "desconhecido"}). Use JPG, PNG ou WEBP.`,
    );
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new PhotoValidationError(
      `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Limite: 15 MB.`,
    );
  }

  const img = await loadImage(file);
  const { width: w0, height: h0 } = img;

  if (Math.min(w0, h0) < MIN_DIMENSION) {
    throw new PhotoValidationError(
      `Resolução muito baixa (${w0}×${h0}). Mínimo: ${MIN_DIMENSION}px no menor lado.`,
    );
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(w0, h0));
  const width = Math.round(w0 * scale);
  const height = Math.round(h0 * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new PhotoValidationError("Falha ao processar a imagem.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, JPEG_QUALITY);
  const baseName = file.name.replace(/\.[^.]+$/, "") || "foto";
  const processed = new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });

  return {
    file: processed,
    width,
    height,
    originalBytes: file.size,
    finalBytes: processed.size,
  };
};
