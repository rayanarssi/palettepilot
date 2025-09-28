import type { RGB, SavedPalette } from "../types";

function toHex([r, g, b]: RGB) {
	return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function download(filename: string, text: string, type: string) {
	const blob = new Blob([text], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

export function exportAsJSON(palette: RGB[]) {
	const json = JSON.stringify(
		palette.map((c) => ({ r: c[0], g: c[1], b: c[2], hex: toHex(c) })),
		null,
		2
	);
	download("palette.json", json, "application/json");
}

export function exportAsHex(palette: RGB[]) {
	const hexList = palette.map(toHex).join("\n");
	download("palette.txt", hexList, "text/plain");
}

export function exportAsCSS(palette: RGB[]) {
	const css = palette
		.map((c, i) => `--color-${i + 1}: ${toHex(c)};`)
		.join("\n");
	download("palette.css", `:root {\n${css}\n}`, "text/css");
}

export function exportAllSavedAsJSON(items: SavedPalette[]) {
	const payload = items.map((p) => ({
		id: p.id,
		name: p.name,
		createdAt: p.createdAt,
		colors: p.colors.map((c) => ({ r: c[0], g: c[1], b: c[2], hex: toHex(c) })),
	}));
	download(
		"palettes.json",
		JSON.stringify(payload, null, 2),
		"application/json"
	);
}

export function exportAllSavedAsHex(items: SavedPalette[]) {
	// One block per palette, separated by a blank line
	const blocks = items.map((p) => {
		const lines = p.colors.map(toHex).join("\n");
		return `# ${p.name}\n${lines}`;
	});
	download("palettes.txt", blocks.join("\n\n"), "text/plain");
}
