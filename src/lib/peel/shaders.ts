// Page-curl vertex shader: a hinge sweeps across the plane and everything
// past the hinge wraps around a cylinder of radius uRadius. uSpread then
// lifts the unwrapped portion to uTargetZ in a wave, while the curled
// corner translates upward as a unit so the curl stays visible.
export const vert = /* glsl */ `
	uniform float uCurl;
	uniform float uSpread;
	uniform float uRadius;
	uniform vec2  uHingeDir;
	uniform float uPlaneHalf;
	uniform float uTargetZ;
	uniform float uThickness;
	uniform float uWigglePos;
	uniform float uWiggleAmt;
	uniform float uLiftFactor;

	varying vec2  vUv;
	varying float vSide;
	varying vec3  vNormalW;

	void main() {
		vUv = uv;
		vec3 p = position;
		vec3 n = vec3(0.0, 0.0, 1.0);

		float hingeX = mix(uPlaneHalf, -uPlaneHalf, uCurl);
		float along  = dot(p.xy, uHingeDir) - hingeX;
		float isWrapped = step(0.0, along);

		if (along > 0.0) {
			float theta = along / uRadius;
			float sinT = sin(theta);
			float cosT = cos(theta);

			float newAlong = hingeX + uRadius * sinT;
			float newZ     = uRadius - uRadius * cosT;

			vec2 perp = p.xy - dot(p.xy, uHingeDir) * uHingeDir;
			vec2 xy   = perp + newAlong * uHingeDir;
			p = vec3(xy, newZ);

			n = vec3(-sinT * uHingeDir.x, -sinT * uHingeDir.y, cosT);
		}

		float uAlong = (dot(position.xy, uHingeDir) / uPlaneHalf + 1.0) * 0.5;
		float blendStart = (1.0 - uAlong) * 0.6;
		float blend = smoothstep(blendStart, blendStart + 0.4, uSpread);

		vec3 flatP      = vec3(position.xy, uTargetZ);
		vec3 unwrappedP = mix(p, flatP, blend);
		vec3 wrappedP   = p + vec3(0.0, 0.0, blend * uTargetZ);
		p = mix(unwrappedP, wrappedP, isWrapped);

		vSide = n.z > 0.0 ? 1.0 : -1.0;
		vNormalW = normalize((modelMatrix * vec4(n, 0.0)).xyz);

		// traveling wave / "worm" bump — a Gaussian along the hinge direction whose
		// center moves over time. Independent of curl/spread so it can play while
		// the sticker is otherwise idle.
		float wd = (uAlong - uWigglePos) / 0.22;
		float wiggle = uWiggleAmt * exp(-wd * wd);
		p.z += wiggle * uTargetZ * 0.55;

		p -= n * uThickness;
		p.y += p.z * uLiftFactor;

		gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
	}
`;

export const frag = /* glsl */ `
	uniform sampler2D uMap;
	uniform vec3  uLightDir;
	uniform float uOpacity;

	varying vec2  vUv;
	varying float vSide;
	varying vec3  vNormalW;

	void main() {
		if (vSide < 0.0) discard;
		vec4 front = texture2D(uMap, vUv);
		gl_FragColor = vec4(front.rgb, front.a * uOpacity);
	}
`;

export const backFrag = /* glsl */ `
	uniform sampler2D uMap;
	uniform vec3 uLightDir;
	uniform float uOpacity;
	varying vec2 vUv;
	varying vec3 vNormalW;
	void main() {
		float a = texture2D(uMap, vUv).a * uOpacity;
		if (a < 0.01) discard;
		vec3 N = -normalize(vNormalW);
		float ndl = clamp(dot(N, normalize(uLightDir)), 0.0, 1.0);
		float lighting = clamp(0.5 + 0.45 * ndl, 0.0, 1.0);
		gl_FragColor = vec4(vec3(0.86) * lighting, a);
	}
`;
