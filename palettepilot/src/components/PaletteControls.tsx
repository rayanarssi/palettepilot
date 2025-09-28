type Props = {
  colors: number;
  quality: number;
  loading?: boolean;
  onChange: (next: { colors: number; quality: number }) => void;
};

export default function PaletteControls({ colors, quality, loading, onChange }: Props) {
  return (
    <div className="rounded-xl ring-1 ring-white/10 p-4 grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm text-white/80">Colors</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={3}
            max={12}
            step={1}
            value={colors}
            onChange={(e) => onChange({ colors: Number(e.target.value), quality })}
            disabled={loading}
            className="w-40"
          />
          <input
            type="number"
            min={3}
            max={12}
            value={colors}
            onChange={(e) => onChange({ colors: clamp(+e.target.value, 3, 12), quality })}
            disabled={loading}
            className="w-16 rounded bg-white/10 border border-white/10 px-2 py-1 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="text-sm text-white/80">Quality (sampling)</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={quality}
            onChange={(e) => onChange({ colors, quality: Number(e.target.value) })}
            disabled={loading}
            className="w-40"
          />
          <input
            type="number"
            min={1}
            max={20}
            value={quality}
            onChange={(e) => onChange({ colors, quality: clamp(+e.target.value, 1, 20) })}
            disabled={loading}
            className="w-16 rounded bg-white/10 border border-white/10 px-2 py-1 text-sm"
          />
        </div>
      </div>

      <p className="text-xs text-white/50">
        Lower <span className="font-medium">quality</span> = more pixels sampled (slower, potentially more accurate).
      </p>
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, isNaN(n) ? min : n));
}
