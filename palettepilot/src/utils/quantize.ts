import type { RGB } from "../types";

const SIGBITS = 5; // histogram precision per channel
const RSHIFT = 8 - SIGBITS; // right shift amount
const MULT = 1 << SIGBITS; // 32
const HISTOSIZE = MULT * MULT * MULT;

function getIndex(r: number, g: number, b: number) {
	return (r << (2 * SIGBITS)) + (g << SIGBITS) + b;
}

class VBox {
	r1: number;
	r2: number;
	g1: number;
	g2: number;
	b1: number;
	b2: number;
	hist: Uint32Array;

	constructor(
		r1: number,
		r2: number,
		g1: number,
		g2: number,
		b1: number,
		b2: number,
		hist: Uint32Array
	) {
		this.r1 = r1;
		this.r2 = r2;
		this.g1 = g1;
		this.g2 = g2;
		this.b1 = b1;
		this.b2 = b2;
		this.hist = hist;
	}

	volume() {
		return (
			(this.r2 - this.r1 + 1) *
			(this.g2 - this.g1 + 1) *
			(this.b2 - this.b1 + 1)
		);
	}

	count() {
		let npix = 0;
		for (let r = this.r1; r <= this.r2; r++) {
			for (let g = this.g1; g <= this.g2; g++) {
				let base = getIndex(r, g, this.b1);
				for (let b = this.b1; b <= this.b2; b++) {
					npix += this.hist[base++];
				}
			}
		}
		return npix;
	}

	avg(): RGB {
		let ntot = 0,
			rsum = 0,
			gsum = 0,
			bsum = 0;
		for (let r = this.r1; r <= this.r2; r++) {
			for (let g = this.g1; g <= this.g2; g++) {
				let base = getIndex(r, g, this.b1);
				for (let b = this.b1; b <= this.b2; b++) {
					const h = this.hist[base++];
					ntot += h;
					rsum += h * (r + 0.5) * (1 << RSHIFT);
					gsum += h * (g + 0.5) * (1 << RSHIFT);
					bsum += h * (b + 0.5) * (1 << RSHIFT);
				}
			}
		}
		if (!ntot) return [0, 0, 0];
		return [
			Math.max(0, Math.min(255, Math.round(rsum / ntot))),
			Math.max(0, Math.min(255, Math.round(gsum / ntot))),
			Math.max(0, Math.min(255, Math.round(bsum / ntot))),
		];
	}
}

function vboxFromPixels(pixels: RGB[]): { vbox: VBox; hist: Uint32Array } {
	const hist = new Uint32Array(HISTOSIZE);
	let rmin = 1e9,
		rmax = 0,
		gmin = 1e9,
		gmax = 0,
		bmin = 1e9,
		bmax = 0;

	for (const [r0, g0, b0] of pixels) {
		const r = r0 >> RSHIFT,
			g = g0 >> RSHIFT,
			b = b0 >> RSHIFT;
		hist[getIndex(r, g, b)]++;
		if (r < rmin) rmin = r;
		if (r > rmax) rmax = r;
		if (g < gmin) gmin = g;
		if (g > gmax) gmax = g;
		if (b < bmin) bmin = b;
		if (b > bmax) bmax = b;
	}

	return { vbox: new VBox(rmin, rmax, gmin, gmax, bmin, bmax, hist), hist };
}

function medianCutApply(hist: Uint32Array, vbox: VBox): [VBox, VBox] | null {
	if (!vbox.count()) return null;

	const rw = vbox.r2 - vbox.r1 + 1;
	const gw = vbox.g2 - vbox.g1 + 1;
	const bw = vbox.b2 - vbox.b1 + 1;
	const maxw = Math.max(rw, gw, bw);

	// Build two boxes by splitting along the widest dimension.
	function iterChannels(dim: "r" | "g" | "b"): [VBox, VBox] {
		const r1 = vbox.r1,
			r2 = vbox.r2;
		const g1 = vbox.g1,
			g2 = vbox.g2;
		const b1 = vbox.b1,
			b2 = vbox.b2;

		const len = (dim === "r" ? r2 - r1 : dim === "g" ? g2 - g1 : b2 - b1) + 1;

		// Accumulate histogram along the chosen axis
		const partials = new Array<number>(len).fill(0);
		let total = 0;

		for (let i = 0; i < len; i++) {
			let sum = 0;
			for (let rr = r1; rr <= r2; rr++) {
				for (let gg = g1; gg <= g2; gg++) {
					let base = getIndex(
						dim === "r" ? r1 + i : rr,
						dim === "g" ? g1 + i : gg,
						b1
					);
					for (let bb = b1; bb <= b2; bb++) sum += hist[base++];
				}
			}
			total += sum;
			partials[i] = total;
		}

		// Find split where cumulative passes half
		let splitPoint = -1;
		for (let i = 0; i < len; i++) {
			if (partials[i] >= total / 2) {
				splitPoint = i;
				break;
			}
		}
		if (splitPoint < 0) splitPoint = Math.floor(len / 2);

		function makeVBox(lo: number, hi: number): VBox {
			if (dim === "r") return new VBox(r1 + lo, r1 + hi, g1, g2, b1, b2, hist);
			if (dim === "g") return new VBox(r1, r2, g1 + lo, g1 + hi, b1, b2, hist);
			return new VBox(r1, r2, g1, g2, b1 + lo, b1 + hi, hist);
		}

		return [makeVBox(0, splitPoint), makeVBox(splitPoint + 1, len - 1)];
	}

	if (maxw === rw) return iterChannels("r");
	if (maxw === gw) return iterChannels("g");
	return iterChannels("b");
}

export function quantize(pixels: RGB[], maxcolors: number) {
	if (!pixels.length || maxcolors < 2 || maxcolors > 256) {
		return { palette: () => [] as RGB[] };
	}

	const { vbox, hist } = vboxFromPixels(pixels);
	const pq: VBox[] = [vbox];

	// Repeatedly split the most significant box
	while (pq.length < maxcolors) {
		pq.sort((a, b) => b.count() * b.volume() - a.count() * a.volume());
		const vb = pq.shift()!;
		if (!vb.count()) {
			pq.push(vb);
			break;
		}
		const pair = medianCutApply(hist, vb);
		if (!pair) {
			pq.push(vb);
			break;
		}
		pq.push(pair[0], pair[1]);
		if (pq.length > 1024) break; // safety
	}

	return {
		palette(): RGB[] {
			return pq.map((vb) => vb.avg()).slice(0, maxcolors);
		},
	};
}
