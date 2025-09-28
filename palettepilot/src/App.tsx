import { useEffect, useMemo, useState } from "react";
import DropZone from "./components/DropZone";
import Swatch from "./components/Swatch";
import PaletteControls from "./components/PaletteControls";
import { extractPalette } from "./utils/extractPalette";
import type { RGB } from "./types";

export default function App() {
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [palette, setPalette] = useState<RGB[]>([]);
	const [loading, setLoading] = useState(false);

	const [colors, setColors] = useState(8);
	const [quality, setQuality] = useState(10);

	// Create a preview URL for the selected file
	const previewUrl = useMemo(() => {
		if (!file) return null;
		return URL.createObjectURL(file);
	}, [file]);

	useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	// Handle file selection and validation
	const handleSelect = (f: File | null) => {
		if (!f) {
			setFile(null);
			setError(null);
			return;
		}
		if (!f.type.startsWith("image/")) {
			setFile(null);
			setError("Only image files are supported.");
			return;
		}
		setFile(f);
		setError(null);
	};

	// When we have a preview URL, extract colors
	useEffect(() => {
		if (!previewUrl) return;
		setLoading(true);
		extractPalette(previewUrl, { colors, quality })
			.then((cols) => setPalette(cols))
			.catch(() => setError("Failed to extract colors"))
			.finally(() => setLoading(false));
	}, [previewUrl, colors, quality]);

	return (
		<div className="min-h-screen">
			<header className="sticky top-0 bg-black/30 backdrop-blur border-b border-white/10">
				<div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
					<div className="size-7 rounded bg-white/10 overflow-hidden">
						<img
							src="/public/logo_white.png"
							alt="PalettePilot logo"
							className="w-full h-full object-cover"
						/>
					</div>
					<h1 className="text-lg font-semibold">PalettePilot</h1>{" "}
				</div>
			</header>

			<main className="max-w-5xl mx-auto p-4 grid md:grid-cols-2 gap-6">
				<section>
					<DropZone onSelect={handleSelect} />

					{error ? (
						<p className="mt-3 text-sm text-red-400">{error}</p>
					) : (
						<p className="mt-3 text-sm text-white/60">
							Selected:{" "}
							{file ? <span className="text-white">{file.name}</span> : "none"}
						</p>
					)}
					{loading && (
						<p className="mt-2 text-sm text-white/60">Extracting colors…</p>
					)}
					{file && previewUrl && (
						<div className="mt-4 rounded-xl overflow-hidden ring-1 ring-white/10">
							<img src={previewUrl} alt="Selected" className="w-full" />
						</div>
					)}
				</section>

				<section className="grid gap-">
					<PaletteControls
						colors={colors}
						quality={quality}
						loading={loading}
						onChange={({ colors: c, quality: q }) => {
							setColors(c);
							setQuality(q);
						}}
					/>

					<div>
						<h2 className="font-medium mb-3">Palette</h2>
						{!palette.length && !loading ? (
							<p className="text-white/60">
								Drop an image to generate a palette.
							</p>
						) : (
							<div className="grid grid-cols-4 gap-3">
								{palette.map((rgb, i) => (
									<Swatch key={i} rgb={rgb} />
								))}
							</div>
						)}
					</div>
				</section>
			</main>
		</div>
	);
}
