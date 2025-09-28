import type { SavedPalette } from "../types";

type Props = {
  items: SavedPalette[];
  onLoad: (p: SavedPalette) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
};

export default function SavedPalettes({ items, onLoad, onDelete, onRename }: Props) {
  if (!items.length) {
    return <p className="text-white/60 text-sm">No saved palettes yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {items.map((p) => (
        <div key={p.id} className="rounded-xl ring-1 ring-white/10 p-3 flex items-center gap-3">
          <div className="flex-1">
            <input
              defaultValue={p.name}
              className="bg-transparent outline-none text-sm font-medium"
              onBlur={(e) => onRename(p.id, e.target.value)}
            />
            <div className="mt-2 flex gap-1">
              {p.colors.slice(0, 10).map((c, i) => (
                <span
                  key={i}
                  className="h-5 w-5 rounded"
                  style={{ backgroundColor: `rgb(${c[0]} ${c[1]} ${c[2]})` }}
                  title={`rgb(${c.join(",")})`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/15"
              onClick={() => onLoad(p)}
            >
              Load
            </button>
            <button
              className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/15"
              onClick={() => onDelete(p.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
