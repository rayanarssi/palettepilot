export type RGB = [number, number, number];

export type SavedPalette = {
  id: string;
  name: string;
  colors: RGB[];
  createdAt: number; 
};