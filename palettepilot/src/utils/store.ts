import type { RGB, SavedPalette } from "../types";

const KEY = "palettepilot:saved";

function read(): SavedPalette[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedPalette[]) : [];
  } catch {
    return [];
  }
}

function write(all: SavedPalette[]) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function listPalettes(): SavedPalette[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function savePalette(colors: RGB[], name?: string): SavedPalette {
  const all = read();
  const id = crypto.randomUUID?.() ?? String(Date.now());
  const item: SavedPalette = {
    id,
    name: (name?.trim() || "Untitled palette") + "",
    colors,
    createdAt: Date.now(),
  };
  all.push(item);
  write(all);
  return item;
}

export function deletePalette(id: string) {
  const all = read().filter(p => p.id !== id);
  write(all);
}

export function renamePalette(id: string, name: string) {
  const all = read().map(p => (p.id === id ? { ...p, name: name.trim() || p.name } : p));
  write(all);
}
