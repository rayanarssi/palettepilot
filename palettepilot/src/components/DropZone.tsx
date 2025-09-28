import { useRef, useState } from "react";

type Props = {
	onSelect: (file: File | null) => void;
};

export default function DropZone({ onSelect }: Props) {
	const [isOver, setIsOver] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsOver(false);
		const file = e.dataTransfer.files?.[0];
		if (file && file.type.startsWith("image/")) onSelect(file);
	};

	return (
		<div
			onDragOver={(e) => {
				e.preventDefault();
				setIsOver(true);
			}}
			onDragLeave={() => setIsOver(false)}
			onDrop={handleDrop}
			className={`rounded-xl border-2 border-dashed p-8 text-center transition
        ${isOver ? "border-white/60 bg-white/5" : "border-white/20"}`}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
			}}
			aria-label="Drop an image here or choose a file"
		>
			<p className="mb-3">Drag & drop an image here</p>
			<div className="flex items-center justify-center gap-3">
				<button
					className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15"
					onClick={() => inputRef.current?.click()}
				>
					Choose file
				</button>
				<input
					ref={inputRef}
					type="file"
					accept="image/*"
					hidden
					onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
				/>
			</div>
		</div>
	);
}
