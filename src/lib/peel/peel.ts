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
	shadow: THREE.Mesh;
	frontMat: THREE.ShaderMaterial;
	backMat: THREE.ShaderMaterial;
	shadowMat: THREE.ShaderMaterial;
	xPct: number;
	yPct: number;
	rotationRad: number;
	desiredXPct: number;
	desiredYPct: number;
	desiredRotationRad: number;
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
	shadowOpacity: number;
	shadowOpacityTarget: number;
	autoPeeling: boolean;
	state: 'placing' | 'idle' | 'hover' | 'pressed' | 'held' | 'gone';
	planeW: number;
	planeH: number;
	avoidZones?: ZoneFn;
	userPlaced: boolean;
};

const shadowVert = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const shadowFrag = `
varying vec2 vUv;
uniform float uOpacity;
void main() {
	vec2 d = abs(vUv - 0.5) * 2.0;
	float edge = max(d.x, d.y);
	float a = smoothstep(1.0, 0.35, edge);
	if (a <= 0.0) discard;
	gl_FragColor = vec4(0.0, 0.0, 0.0, a * uOpacity);
}
`;

const SHADOW_SCALE = 1.22;

const HOVER_CURL = 0.5;
const HOVER_SPREAD = 0;
const PEEL_CURL = 0.34;
const PEEL_SPREAD = 0.9;
const IDLE_PEEL_CURL = 0.42;
const IDLE_PEEL_SPREAD = 0;
const ANIM = 0.09;
const FADE = 0.06;
const ZONE_FOLLOW = 0.18;
const DRAG_HINT_PX = 8;

const HINGE_CORNERS: ReadonlyArray<THREE.Vector2> = [
	new THREE.Vector2(1, -1).normalize(),
	new THREE.Vector2(-1, -1).normalize(),
	new THREE.Vector2(-1, 1).normalize(),
	new THREE.Vector2(1, 1).normalize()
];
function pickHingeCorner() {
	return HINGE_CORNERS[Math.floor(Math.random() * HINGE_CORNERS.length)].clone();
}

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
	private hintEl: HTMLDivElement | null = null;
	private hintHideTimer = 0;
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

		this.hintEl = document.createElement('div');
		this.hintEl.textContent = 'click to pick up a sticker';
		this.hintEl.style.cssText = [
			'position: absolute',
			'pointer-events: none',
			'z-index: 50',
			'padding: 0.4em 0.7em',
			'border-radius: 0.5em',
			'background: rgba(20, 20, 20, 0.85)',
			'color: #fff',
			'font-size: 0.85rem',
			'font-family: inherit',
			'white-space: nowrap',
			'transform: translate(-50%, calc(-100% - 0.6rem))',
			'opacity: 0',
			'transition: opacity 0.15s ease',
			'top: 0',
			'left: 0'
		].join(';');
		container.appendChild(this.hintEl);

		this.tick();
	}

	private showHint(p: { x: number; y: number }) {
		if (!this.hintEl) return;
		this.hintEl.style.left = `${p.x}px`;
		this.hintEl.style.top = `${p.y}px`;
		this.hintEl.style.opacity = '1';
		if (this.hintHideTimer) {
			clearTimeout(this.hintHideTimer);
			this.hintHideTimer = 0;
		}
	}

	private hideHint(delayMs = 0) {
		if (!this.hintEl) return;
		const el = this.hintEl;
		if (this.hintHideTimer) clearTimeout(this.hintHideTimer);
		this.hintHideTimer = window.setTimeout(() => {
			el.style.opacity = '0';
			this.hintHideTimer = 0;
		}, delayMs);
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
		s.shadow.geometry.dispose();
		s.shadow.geometry = new THREE.PlaneGeometry(w * SHADOW_SCALE, h * SHADOW_SCALE);
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

		const shadowOffsetX = s.planeW * 0.04;
		const shadowOffsetY = -s.planeH * 0.06;
		s.shadow.position.set(x + shadowOffsetX, y + shadowOffsetY, 0);
		s.shadow.rotation.z = -s.rotationRad;
	}

	private resolveZones(s: StickerEntry): { x: number; y: number } {
		let x = s.desiredXPct;
		const y = s.desiredYPct;
		if (s.userPlaced || !s.avoidZones) return { x, y };
		const { w, h } = this.viewport();
		const sWpct = (s.planeW / w) * 100;
		const sHpct = (s.planeH / h) * 100;
		const pad = 1;
		for (const z of s.avoidZones()) {
			const left = x - sWpct / 2;
			const right = x + sWpct / 2;
			const top = y - sHpct / 2;
			const bottom = y + sHpct / 2;
			if (right <= z.left || left >= z.right || bottom <= z.top || top >= z.bottom) continue;
			const zoneCenterX = (z.left + z.right) / 2;
			if (x < zoneCenterX) {
				x = Math.max(sWpct / 2 + pad, z.left - sWpct / 2 - pad);
			} else {
				x = Math.min(100 - sWpct / 2 - pad, z.right + sWpct / 2 + pad);
			}
		}
		return { x, y };
	}

	async add(opts: AddOptions): Promise<void> {
		const tex = await loadTexture(opts.src);

		const sharedUniforms = {
			uMap: { value: tex },
			uCurl: { value: 0 },
			uSpread: { value: 0 },
			uRadius: { value: 1 },
			uHingeDir: { value: pickHingeCorner() },
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

		const shadowMat = new THREE.ShaderMaterial({
			uniforms: { uOpacity: { value: 0 } },
			vertexShader: shadowVert,
			fragmentShader: shadowFrag,
			transparent: true,
			depthTest: false,
			depthWrite: false
		});
		const shadowGeom = new THREE.PlaneGeometry(1, 1);
		const shadow = new THREE.Mesh(shadowGeom, shadowMat);
		this.scene.add(shadow);

		const rotationRad = (opts.rotationDeg * Math.PI) / 180;
		const entry: StickerEntry = {
			id: opts.id,
			front,
			back,
			shadow,
			frontMat,
			backMat,
			shadowMat,
			xPct: opts.xPct,
			yPct: opts.yPct,
			rotationRad,
			desiredXPct: opts.xPct,
			desiredYPct: opts.yPct,
			desiredRotationRad: rotationRad,
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
			shadowOpacity: 0,
			shadowOpacityTarget: 0,
			autoPeeling: false,
			state: 'placing',
			planeW: 1,
			planeH: 1,
			avoidZones: opts.avoidZones,
			userPlaced: false
		};
		this.stickers.push(entry);
		this.recomputeSize(entry);
		this.placeMesh(entry);
		this.setRenderOrder(entry, opts.z);
	}

	updatePosition(id: number, xPct: number, yPct: number) {
		const s = this.stickers.find((x) => x.id === id);
		if (!s) return;
		s.desiredXPct = xPct;
		s.desiredYPct = yPct;
	}

	updateRotation(id: number, deg: number) {
		const s = this.stickers.find((x) => x.id === id);
		if (!s) return;
		s.desiredRotationRad = (deg * Math.PI) / 180;
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
		s.front.renderOrder = value * 3 + 2;
		s.back.renderOrder = value * 3 + 1;
		s.shadow.renderOrder = value * 3;
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
		this.container.style.cursor = '';
		if (!s) return;
		s.state = 'idle';
		s.curlTarget = 0;
		s.spreadTarget = 0;
		s.userPlaced = true;
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
		hit.autoPeeling = false;
		hit.curlTarget = HOVER_CURL;
		hit.spreadTarget = HOVER_SPREAD;
		this.container.style.cursor = 'grabbing';
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
				s.autoPeeling = false;
				s.curlTarget = HOVER_CURL;
				s.spreadTarget = HOVER_SPREAD;
			} else if (s.state === 'hover') {
				s.state = 'idle';
				s.curlTarget = 0;
				s.spreadTarget = 0;
			}
		}
		this.refreshCursor(hit);
	}

	private refreshCursor(hit: StickerEntry | null) {
		if (this.heldId !== null || this.potentialPickupId !== null) {
			this.container.style.cursor = 'grabbing';
		} else if (hit) {
			this.container.style.cursor = 'grab';
		} else {
			this.container.style.cursor = '';
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

		// User is pressing on a sticker and dragging — surface the hint that
		// dragging isn't the interaction; clicking is. Mark the press as a drag
		// attempt so pointerup aborts the pickup instead of teleporting the
		// sticker to the cursor.
		if (this.potentialPickupId !== null) {
			const dist = Math.hypot(e.clientX - this.pressX, e.clientY - this.pressY);
			if (dist > DRAG_HINT_PX) {
				this.pressMoved = true;
				this.showHint(p);
			}
		}

		this.updateHover(p);
	}

	private handlePointerUp() {
		if (this.potentialPickupId === null) {
			this.hideHint();
			return;
		}
		const id = this.potentialPickupId;
		this.potentialPickupId = null;
		const s = this.stickers.find((x) => x.id === id);
		if (!s) {
			this.hideHint();
			return;
		}

		// Drag attempt → abort pickup; the sticker stays put. Leave the hint up
		// briefly so the user reads "click to pick up a sticker."
		if (this.pressMoved) {
			this.pressMoved = false;
			s.state = 'idle';
			s.curlTarget = 0;
			s.spreadTarget = 0;
			this.container.style.cursor = '';
			this.hideHint(900);
			return;
		}

		// Press-and-release without movement → lift (sticky held). Move the pointer
		// to reposition, then click again to place.
		this.hideHint();
		s.state = 'held';
		s.curlTarget = PEEL_CURL;
		s.spreadTarget = PEEL_SPREAD;
		s.autoPeeling = false;
		this.heldId = id;
		this.bringToFront(s);
		// User discovered the interaction; stop nagging them with the idle peel.
		this.stopIdlePeelLoop();
	}

	stopIdlePeelLoop() {
		if (this.idlePeelTimer) {
			clearTimeout(this.idlePeelTimer);
			this.idlePeelTimer = 0;
		}
	}

	private removeNow(s: StickerEntry) {
		s.state = 'gone';
		this.scene.remove(s.front);
		this.scene.remove(s.back);
		this.scene.remove(s.shadow);
		s.front.geometry.dispose();
		s.shadow.geometry.dispose();
		s.frontMat.dispose();
		s.backMat.dispose();
		s.shadowMat.dispose();
		const idx = this.stickers.indexOf(s);
		if (idx >= 0) this.stickers.splice(idx, 1);
	}

	private tick = () => {
		if (!this.running) return;
		for (const s of this.stickers) {
			if (s.state === 'gone') continue;
			s.curl = ease(s.curl, s.curlTarget, ANIM);
			s.spread = ease(s.spread, s.spreadTarget, ANIM);
			s.opacity = ease(s.opacity, s.opacityTarget, FADE);

			s.shadowOpacityTarget =
				(s.state === 'held' || s.state === 'pressed') && s.opacity > 0.05 ? 0.55 : 0;
			s.shadowOpacity = ease(s.shadowOpacity, s.shadowOpacityTarget, ANIM);

			if (s.state === 'held' || s.state === 'pressed') {
				s.desiredXPct = s.xPct;
				s.desiredYPct = s.yPct;
				s.desiredRotationRad = s.rotationRad;
			} else {
				const resolved = this.resolveZones(s);
				s.xPct = ease(s.xPct, resolved.x, ZONE_FOLLOW);
				s.yPct = ease(s.yPct, resolved.y, ZONE_FOLLOW);
				s.rotationRad = ease(s.rotationRad, s.desiredRotationRad, ZONE_FOLLOW);
			}

			const u = s.frontMat.uniforms;
			u.uCurl.value = s.curl;
			u.uSpread.value = s.spread;
			(u.uOpacity as { value: number }).value = s.opacity;
			const ub = s.backMat.uniforms;
			ub.uCurl.value = s.curl;
			ub.uSpread.value = s.spread;
			(ub.uOpacity as { value: number }).value = s.opacity;
			(s.shadowMat.uniforms.uOpacity as { value: number }).value = s.shadowOpacity;
			this.placeMesh(s);
		}
		this.renderer.render(this.scene, this.camera);
		this.rafId = requestAnimationFrame(this.tick);
	};

	private peelOnce(s: StickerEntry) {
		if (s.state !== 'idle' || s.autoPeeling) return;
		s.autoPeeling = true;
		// Pick a fresh corner so different peels lift different corners.
		const corner = pickHingeCorner();
		(s.frontMat.uniforms.uHingeDir.value as THREE.Vector2).copy(corner);
		s.curlTarget = IDLE_PEEL_CURL;
		s.spreadTarget = IDLE_PEEL_SPREAD;
		const upMs = 700 + Math.random() * 500;
		window.setTimeout(() => {
			// Bail if the user took over (hover/press/held), so we don't fight their state.
			if (!s.autoPeeling || s.state !== 'idle') {
				s.autoPeeling = false;
				return;
			}
			s.curlTarget = 0;
			s.spreadTarget = 0;
			s.autoPeeling = false;
		}, upMs);
	}

	private idlePeelTimer = 0;
	startIdlePeelLoop(minMs = 4500, maxMs = 9000) {
		const fire = () => {
			const idle = this.stickers.filter(
				(s) => s.state === 'idle' && s.opacity > 0.9 && !s.autoPeeling
			);
			if (idle.length > 0) {
				const pick = idle[Math.floor(Math.random() * idle.length)];
				this.peelOnce(pick);
			}
			const next = minMs + Math.random() * (maxMs - minMs);
			this.idlePeelTimer = window.setTimeout(fire, next);
		};
		this.idlePeelTimer = window.setTimeout(fire, 2200);
	}

	destroy() {
		this.running = false;
		cancelAnimationFrame(this.rafId);
		if (this.idlePeelTimer) clearTimeout(this.idlePeelTimer);
		if (this.hintHideTimer) clearTimeout(this.hintHideTimer);
		this.hintEl?.parentElement?.removeChild(this.hintEl);
		this.hintEl = null;
		this.container.style.cursor = '';
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
