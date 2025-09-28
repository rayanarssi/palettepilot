import { useEffect, useMemo, useState } from "react";
import DropZone from "./components/DropZone";

export default function App() {
	const [file, setFile] = useState<File | null>(null);

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

	return (
		<div className="min-h-screen">
			<header className="sticky top-0 bg-black/30 backdrop-blur border-b border-white/10">
				<div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
					<div className="size-7 rounded bg-white/10" />
					<h1 className="text-lg font-semibold">PalettePilot</h1>{" "}
				</div>
			</header>

			<main className="max-w-5xl mx-auto p-4 grid md:grid-cols-2 gap-6">
				<section>
					<DropZone onSelect={setFile} />
					<p className="mt-3 text-sm text-white/60">
						Selected:{" "}
						{file ? <span className="text-white">{file.name}</span> : "none"}
					</p>
				</section>

				<section>
					<h2 className="font-medium mb-3">Preview</h2>
					{previewUrl ? (
						<div className="rounded-xl overflow-hidden ring-1 ring-white/10">
							<img src={previewUrl} alt="Selected" className="w-full" />
						</div>
					) : (
						<p className="text-white/60">
							No image yet. Pick or drop one on the left.
						</p>
					)}
				</section>
			</main>
		</div>
	);
}
