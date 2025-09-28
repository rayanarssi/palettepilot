import { quantize } from "./quantize";
import type { RGB } from "../types";

export async function extractPalette(
  src: string,
  { colors = 8, quality = 10 }: { colors?: number; quality?: number } = {}
): Promise<RGB[]> {
  const img = await loadImage(src);
  const { data } = drawAndGetImageData(img);

  const pixels: RGB[] = [];
  for (let i = 0; i < data.length; i += 4 * quality) {
    const a = data[i + 3];
    if (a < 125) continue;
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  if (!pixels.length) return [];
  const cmap = quantize(pixels, colors);
  return cmap.palette();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function drawAndGetImageData(img: HTMLImageElement): ImageData {
  const maxSide = 800;
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.max(1, Math.floor(img.width * scale));
  const h = Math.max(1, Math.floor(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}
