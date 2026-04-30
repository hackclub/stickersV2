import * as THREE from 'three';
import { vert, frag, backFrag } from './shaders';

type AddOptions = {
	id: number;
	src: string;
	xPct: number;
	yPct: number;
	rotationDeg: number;
	sizeRem: number;
	sizeVw: number;
	sizeScale: number;
	z: number;
	avoidZones?: ZoneFn;
};

type ZoneFn = () => Array<{ left: number; top: number; right: number; bottom: number }>;

type StickerEntry = {
	id: number;
	front: THREE.Mesh;
	back: THREE.Mesh;
	frontMat: THREE.ShaderMaterial;
	backMat: THREE.ShaderMaterial;
	xPct: number;
	yPct: number;
	rotationRad: number;
	sizeRem: number;
	sizeVw: number;
	sizeScale: number;
	z: number;
	curl: number;
	spread: number;
	curlTarget: number;
	spreadTarget: number;
	opacity: number;
	opacityTarget: number;
	wigglePos: number;
	wiggleAmt: number;
	wiggleStart: number;
	state: 'placing' | 'idle' | 'hover' | 'pressed' | 'held' | 'gone';
	planeW: number;
	planeH: number;
	avoidZones?: ZoneFn;
};

const HOVER_CURL = 0.14;
const HOVER_SPREAD = 0.3;
const PEEL_CURL = 0.34;
const PEEL_SPREAD = 0.9;
const ANIM = 0.09;
const FADE = 0.06;
const CLICK_THRESHOLD_PX = 6;

const HINGE = new THREE.Vector2(1, -1).normalize();

function ease(cur: number, target: number, k: number) {
	return cur + (target - cur) * k;
}

const textureLoader = new THREE.TextureLoader();
const textureCache = new Map<string, Promise<THREE.Texture>>();
function loadTexture(src: string) {
	let p = textureCache.get(src);
	if (!p) {
		p = new Promise<THREE.Texture>((resolve, reject) => {
			textureLoader.load(
				src,
				(tex) => {
					// matched to renderer.outputColorSpace = LinearSRGB → no conversions.
					tex.colorSpace = THREE.NoColorSpace;
					tex.generateMipmaps = true;
					tex.minFilter = THREE.LinearMipmapLinearFilter;
					tex.magFilter = THREE.LinearFilter;
					tex.anisotropy = 4;
					resolve(tex);
				},
				undefined,
				(err) => reject(err)
			);
		});
		textureCache.set(src, p);
	}
	return p;
}

export class PeelStage {
	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private camera: THREE.OrthographicCamera;
	private canvas: HTMLCanvasElement;
	private container: HTMLElement;
	private stickers: StickerEntry[] = [];
	private rafId = 0;
	private running = true;
	private resizeObserver?: ResizeObserver;
	private topRenderOrder = 100;
	private heldId: number | null = null;
	private heldOffsetPct = { x: 0, y: 0 };
	private potentialPickupId: number | null = null;
	private pressX = 0;
	private pressY = 0;
	private pressMoved = false;
	private onResize = () => this.resize();
	private onPointerDown = (e: PointerEvent) => this.handlePointerDown(e);
	private onPointerMove = (e: PointerEvent) => this.handlePointerMove(e);
	private onPointerUp = () => this.handlePointerUp();

	constructor(container: HTMLElement) {
		this.container = container;
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			premultipliedAlpha: false
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		// pass-through pipeline: no sRGB decode on sample, no sRGB encode on output.
		// the texture is already in display-ready sRGB and we want it on screen as-is.
		this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
		this.canvas = this.renderer.domElement;
		this.canvas.style.position = 'absolute';
		this.canvas.style.inset = '0';
		this.canvas.style.width = '100%';
		this.canvas.style.height = '100%';
		this.canvas.style.pointerEvents = 'none';
		this.canvas.style.zIndex = '5';
		container.appendChild(this.canvas);

		this.scene = new THREE.Scene();
		this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
		this.camera.position.z = 500;

		this.resize();
		window.addEventListener('resize', this.onResize);
		if (typeof ResizeObserver !== 'undefined') {
			this.resizeObserver = new ResizeObserver(() => this.resize());
			this.resizeObserver.observe(container);
		}

		container.addEventListener('pointerdown', this.onPointerDown);
		container.addEventListener('pointermove', this.onPointerMove);
		container.addEventListener('pointerup', this.onPointerUp);
		container.addEventListener('pointercancel', this.onPointerUp);

		this.tick();
	}

	private viewport() {
		const r = this.container.getBoundingClientRect();
		return { w: Math.max(1, r.width), h: Math.max(1, r.height) };
	}

	private resize() {
		const { w, h } = this.viewport();
		this.renderer.setSize(w, h, false);
		this.camera.left = -w / 2;
		this.camera.right = w / 2;
		this.camera.top = h / 2;
		this.camera.bottom = -h / 2;
		this.camera.updateProjectionMatrix();
		for (const s of this.stickers) this.recomputeSize(s);
	}

	private computePlaneSize(s: StickerEntry, texAspect: number) {
		const rootFontPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
		const { w: vw } = this.viewport();
		const baseRem = s.sizeRem * rootFontPx;
		const baseVw = (s.sizeVw / 100) * vw;
		const w = Math.max(baseRem, baseVw) * s.sizeScale;
		const h = w / texAspect;
		return { w, h };
	}

	private recomputeSize(s: StickerEntry) {
		const tex = s.frontMat.uniforms.uMap.value as THREE.Texture | null;
		const img = tex?.image as { width?: number; height?: number } | null;
		if (!img || !img.width || !img.height) return;
		const aspect = img.width / img.height;
		const { w, h } = this.computePlaneSize(s, aspect);
		s.planeW = w;
		s.planeH = h;
		const planeHalf = (w + h) / (2 * Math.SQRT2);
		const radius = Math.hypot(w, h) * 0.22;
		const targetZ = Math.max(w, h) * 0.4;
		s.frontMat.uniforms.uPlaneHalf.value = planeHalf;
		s.frontMat.uniforms.uRadius.value = radius;
		s.frontMat.uniforms.uTargetZ.value = targetZ;
		s.backMat.uniforms.uPlaneHalf.value = planeHalf;
		s.backMat.uniforms.uRadius.value = radius;
		s.backMat.uniforms.uTargetZ.value = targetZ;
		s.backMat.uniforms.uThickness.value = Math.max(w, h) * 0.025;
		// rebuild geometry at the new size; PlaneGeometry is cheap
		s.front.geometry.dispose();
		const geom = new THREE.PlaneGeometry(w, h, 80, 80);
		s.front.geometry = geom;
		s.back.geometry = geom;
	}

	private placeMesh(s: StickerEntry) {
		const { w, h } = this.viewport();
		const cx = (s.xPct / 100) * w;
		const cy = (s.yPct / 100) * h;
		const x = cx - w / 2;
		const y = -(cy - h / 2);
		s.front.position.set(x, y, 0);
		s.back.position.set(x, y, 0);
		s.front.rotation.z = -s.rotationRad;
		s.back.rotation.z = -s.rotationRad;
	}

	async add(opts: AddOptions): Promise<void> {
		const tex = await loadTexture(opts.src);

		const sharedUniforms = {
			uMap: { value: tex },
			uCurl: { value: 0 },
			uSpread: { value: 0 },
			uRadius: { value: 1 },
			uHingeDir: { value: HINGE.clone() },
			uPlaneHalf: { value: 1 },
			uTargetZ: { value: 1 },
			uLightDir: { value: new THREE.Vector3(0.25, 0.55, 1.0) },
			uWigglePos: { value: 0 },
			uWiggleAmt: { value: 0 }
		};

		const frontMat = new THREE.ShaderMaterial({
			uniforms: { ...sharedUniforms, uThickness: { value: 0.0 }, uOpacity: { value: 0 } },
			vertexShader: vert,
			fragmentShader: frag,
			side: THREE.DoubleSide,
			transparent: true,
			depthTest: false,
			depthWrite: false
		});
		const backMat = new THREE.ShaderMaterial({
			uniforms: { ...sharedUniforms, uThickness: { value: 0 }, uOpacity: { value: 0 } },
			vertexShader: vert,
			fragmentShader: backFrag,
			side: THREE.DoubleSide,
			transparent: true,
			depthTest: false,
			depthWrite: false
		});

		const geom = new THREE.PlaneGeometry(1, 1, 80, 80);
		const front = new THREE.Mesh(geom, frontMat);
		const back = new THREE.Mesh(geom, backMat);
		this.scene.add(front);
		this.scene.add(back);

		const entry: StickerEntry = {
			id: opts.id,
			front,
			back,
			frontMat,
			backMat,
			xPct: opts.xPct,
			yPct: opts.yPct,
			rotationRad: (opts.rotationDeg * Math.PI) / 180,
			sizeRem: opts.sizeRem,
			sizeVw: opts.sizeVw,
			sizeScale: opts.sizeScale,
			z: opts.z,
			curl: 0,
			spread: 0,
			curlTarget: 0,
			spreadTarget: 0,
			opacity: 0,
			opacityTarget: 0,
			wigglePos: 0,
			wiggleAmt: 0,
			wiggleStart: 0,
			state: 'placing',
			planeW: 1,
			planeH: 1,
			avoidZones: opts.avoidZones
		};
		this.stickers.push(entry);
		this.recomputeSize(entry);
		this.placeMesh(entry);
		this.setRenderOrder(entry, opts.z);
	}

	updatePosition(id: number, xPct: number, yPct: number) {
		const s = this.stickers.find((x) => x.id === id);
		if (!s) return;
		s.xPct = xPct;
		s.yPct = yPct;
	}

	updateRotation(id: number, deg: number) {
		const s = this.stickers.find((x) => x.id === id);
		if (!s) return;
		s.rotationRad = (deg * Math.PI) / 180;
	}

	scheduleAppear(id: number, delayMs: number) {
		const s = this.stickers.find((x) => x.id === id);
		if (!s) return;
		setTimeout(() => {
			s.state = 'idle';
			s.opacityTarget = 1;
		}, delayMs);
	}

	private setRenderOrder(s: StickerEntry, value: number) {
		s.front.renderOrder = value * 2 + 1;
		s.back.renderOrder = value * 2;
		s.z = value;
	}

	private bringToFront(s: StickerEntry) {
		this.topRenderOrder += 1;
		this.setRenderOrder(s, this.topRenderOrder);
	}

	private screenToContainer(e: PointerEvent) {
		const r = this.container.getBoundingClientRect();
		return { x: e.clientX - r.left, y: e.clientY - r.top };
	}

	private hitTest(px: number, py: number): StickerEntry | null {
		const { w, h } = this.viewport();
		// transform pointer into each sticker's local frame and check rectangle bounds
		// candidates are tested top-to-bottom (highest renderOrder first)
		const ordered = [...this.stickers]
			.filter((s) => s.state !== 'gone' && s.opacity > 0.01)
			.sort((a, b) => b.front.renderOrder - a.front.renderOrder);
		for (const s of ordered) {
			const cx = (s.xPct / 100) * w;
			const cy = (s.yPct / 100) * h;
			const dx = px - cx;
			const dy = py - cy;
			const cos = Math.cos(s.rotationRad);
			const sin = Math.sin(s.rotationRad);
			const localX = dx * cos + dy * sin;
			const localY = -dx * sin + dy * cos;
			if (
				Math.abs(localX) <= s.planeW / 2 &&
				Math.abs(localY) <= s.planeH / 2
			) {
				return s;
			}
		}
		return null;
	}

	private dropHeld() {
		if (this.heldId === null) return;
		const s = this.stickers.find((x) => x.id === this.heldId);
		this.heldId = null;
		if (!s) return;
		s.state = 'idle';
		s.curlTarget = 0;
		s.spreadTarget = 0;
	}

	private startPotentialPickup(hit: StickerEntry, e: PointerEvent, p: { x: number; y: number }) {
		this.potentialPickupId = hit.id;
		this.pressX = e.clientX;
		this.pressY = e.clientY;
		this.pressMoved = false;
		const { w, h } = this.viewport();
		this.heldOffsetPct = {
			x: ((p.x - (hit.xPct / 100) * w) / w) * 100,
			y: ((p.y - (hit.yPct / 100) * h) / h) * 100
		};
		hit.state = 'pressed';
		hit.curlTarget = HOVER_CURL;
		hit.spreadTarget = HOVER_SPREAD;
	}

	private handlePointerDown(e: PointerEvent) {
		const p = this.screenToContainer(e);
		const hit = this.hitTest(p.x, p.y);

		// If something is currently held, this click drops it.
		if (this.heldId !== null) {
			const sameSticker = hit && hit.id === this.heldId;
			this.dropHeld();
			if (hit && !sameSticker && hit.state !== 'gone') {
				// chained pickup: clicking a different sticker drops the held and lifts the new one
				this.startPotentialPickup(hit, e, p);
				e.stopPropagation();
				e.preventDefault();
			}
			// dropping into empty space or onto the same sticker → don't consume,
			// let the click reach the form/link behind if the user clicked there.
			return;
		}

		if (hit && hit.state !== 'gone' && hit.state !== 'placing') {
			this.startPotentialPickup(hit, e, p);
			e.stopPropagation();
			e.preventDefault();
		}
	}

	private updateHover(p: { x: number; y: number }) {
		const hit = this.hitTest(p.x, p.y);
		for (const s of this.stickers) {
			if (s.state === 'gone' || s.state === 'placing' || s.state === 'held') continue;
			if (hit && s.id === hit.id) {
				if (s.state !== 'hover' && s.state !== 'pressed') {
					s.state = 'hover';
				}
				s.curlTarget = HOVER_CURL;
				s.spreadTarget = HOVER_SPREAD;
			} else if (s.state === 'hover') {
				s.state = 'idle';
				s.curlTarget = 0;
				s.spreadTarget = 0;
			}
		}
	}

	private handlePointerMove(e: PointerEvent) {
		const p = this.screenToContainer(e);

		// A held sticker tracks the pointer regardless of button state.
		if (this.heldId !== null) {
			const held = this.stickers.find((s) => s.id === this.heldId);
			if (held) {
				const { w, h } = this.viewport();
				held.xPct = (p.x / w) * 100 - this.heldOffsetPct.x;
				held.yPct = (p.y / h) * 100 - this.heldOffsetPct.y;
			}
			this.updateHover(p);
			return;
		}

		// In the press-and-release window, watch for movement; on movement past the
		// threshold, promote the press to a held pickup so the sticker follows the drag.
		if (this.potentialPickupId !== null) {
			const dist = Math.hypot(e.clientX - this.pressX, e.clientY - this.pressY);
			if (!this.pressMoved && dist > CLICK_THRESHOLD_PX) {
				this.pressMoved = true;
				const id = this.potentialPickupId;
				this.potentialPickupId = null;
				const s = this.stickers.find((x) => x.id === id);
				if (s) {
					s.state = 'held';
					s.curlTarget = PEEL_CURL;
					s.spreadTarget = PEEL_SPREAD;
					this.heldId = id;
					this.bringToFront(s);
					this.stopIdleWiggleLoop();
					// position the newly-held sticker under the cursor immediately
					const { w, h } = this.viewport();
					s.xPct = (p.x / w) * 100 - this.heldOffsetPct.x;
					s.yPct = (p.y / h) * 100 - this.heldOffsetPct.y;
				}
			}
			return;
		}

		this.updateHover(p);
	}

	private handlePointerUp() {
		// If the press already promoted into a held drag, nothing to do here —
		// the sticker stays held and continues to track the cursor.
		if (this.potentialPickupId === null) {
			this.pressMoved = false;
			return;
		}
		const id = this.potentialPickupId;
		this.potentialPickupId = null;
		const s = this.stickers.find((x) => x.id === id);
		if (!s) return;

		// Press-and-release without movement → click → lift
		s.state = 'held';
		s.curlTarget = PEEL_CURL;
		s.spreadTarget = PEEL_SPREAD;
		this.heldId = id;
		this.bringToFront(s);
		// User discovered the interaction; stop nagging them with the idle wiggle.
		this.stopIdleWiggleLoop();
	}

	stopIdleWiggleLoop() {
		if (this.idleWiggleTimer) {
			clearInterval(this.idleWiggleTimer);
			this.idleWiggleTimer = 0;
		}
	}

	private removeNow(s: StickerEntry) {
		s.state = 'gone';
		this.scene.remove(s.front);
		this.scene.remove(s.back);
		s.front.geometry.dispose();
		s.frontMat.dispose();
		s.backMat.dispose();
		const idx = this.stickers.indexOf(s);
		if (idx >= 0) this.stickers.splice(idx, 1);
	}

	private tick = () => {
		if (!this.running) return;
		const now = performance.now();
		for (const s of this.stickers) {
			if (s.state === 'gone') continue;
			s.curl = ease(s.curl, s.curlTarget, ANIM);
			s.spread = ease(s.spread, s.spreadTarget, ANIM);
			s.opacity = ease(s.opacity, s.opacityTarget, FADE);

			// drive wiggle animation if active; only on idle stickers
			if (s.wiggleStart > 0 && s.state === 'idle') {
				const dur = 1700;
				const t = (now - s.wiggleStart) / dur;
				if (t >= 1) {
					s.wigglePos = 0;
					s.wiggleAmt = 0;
					s.wiggleStart = 0;
				} else {
					// position sweeps from 1 (peeled corner) to 0 (opposite); slight ease
					const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
					s.wigglePos = 1 - ease;
					// amplitude bell curve so the bump rises and falls as it travels
					s.wiggleAmt = Math.sin(t * Math.PI) * 1.2;
				}
			} else if (s.state !== 'idle') {
				s.wiggleAmt = 0;
				s.wiggleStart = 0;
			}

			const u = s.frontMat.uniforms;
			u.uCurl.value = s.curl;
			u.uSpread.value = s.spread;
			u.uWigglePos.value = s.wigglePos;
			u.uWiggleAmt.value = s.wiggleAmt;
			(u.uOpacity as { value: number }).value = s.opacity;
			const ub = s.backMat.uniforms;
			ub.uCurl.value = s.curl;
			ub.uSpread.value = s.spread;
			ub.uWigglePos.value = s.wigglePos;
			ub.uWiggleAmt.value = s.wiggleAmt;
			(ub.uOpacity as { value: number }).value = s.opacity;
			this.placeMesh(s);
		}
		this.renderer.render(this.scene, this.camera);
		this.rafId = requestAnimationFrame(this.tick);
	};

	wiggle(id: number) {
		const s = this.stickers.find((x) => x.id === id);
		if (!s || s.state !== 'idle' || s.wiggleStart > 0) return;
		s.wiggleStart = performance.now();
	}

	private idleWiggleTimer = 0;
	startIdleWiggleLoop(intervalMs = 6000) {
		const fire = () => {
			const idle = this.stickers.filter(
				(s) => s.state === 'idle' && s.opacity > 0.9 && s.wiggleStart === 0
			);
			if (idle.length > 0) {
				const pick = idle[Math.floor(Math.random() * idle.length)];
				this.wiggle(pick.id);
			}
		};
		this.idleWiggleTimer = window.setInterval(fire, intervalMs);
		// kick once after a short delay so the first wiggle isn't intervalMs away
		window.setTimeout(fire, 1800);
	}

	destroy() {
		this.running = false;
		cancelAnimationFrame(this.rafId);
		if (this.idleWiggleTimer) clearInterval(this.idleWiggleTimer);
		window.removeEventListener('resize', this.onResize);
		this.resizeObserver?.disconnect();
		this.container.removeEventListener('pointerdown', this.onPointerDown);
		this.container.removeEventListener('pointermove', this.onPointerMove);
		this.container.removeEventListener('pointerup', this.onPointerUp);
		this.container.removeEventListener('pointercancel', this.onPointerUp);
		while (this.stickers.length) this.removeNow(this.stickers[0]);
		this.canvas.parentElement?.removeChild(this.canvas);
		this.renderer.dispose();
	}
}
