import type { RGB } from "../types";

function toHex([r, g, b]: RGB) {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}
function textColor([r, g, b]: RGB) {
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  return l > 186 ? "#000" : "#fff";
}

export default function Swatch({ rgb }: { rgb: RGB }) {
  const hex = toHex(rgb);
  const color = textColor(rgb);

  return (
    <div className="rounded-xl overflow-hidden ring-1 ring-white/10">
      <div
        className="h-20 flex items-end justify-between p-2 text-xs"
        style={{ backgroundColor: hex, color }}
        title={hex}
      >
        <span className="font-medium">{hex}</span>
        <button
          className="px-2 py-0.5 rounded bg-black/20 hover:bg-black/30"
          onClick={() => navigator.clipboard?.writeText(hex)}
        >
          Copy
        </button>
      </div>
    </div>
  );
}
