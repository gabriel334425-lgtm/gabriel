
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { Float, Environment, useGLTF, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

extend({ EffectComposer, RenderPass, UnrealBloomPass, ShaderPass });

// Fix for missing R3F types in JSX.IntrinsicElements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// --- Assets ---
const ICON_URLS = [
  "https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/pr.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vcHIuZ2xiIiwiaWF0IjoxNzY4ODk1NzQxLCJleHAiOjIwODQyNTU3NDF9._bWkS7q1GkBuLhNggTtdn2_yOmSOOeioB8958QYprGc",
  "https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/ai.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vYWkuZ2xiIiwiaWF0IjoxNzY4ODk1Nzk1LCJleHAiOjIwODQyNTU3OTV9.uTHa0Pfo5faQplcfbmP4976isIPpPHSZyIIDEK8uznI",
  "https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/ae.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vYWUuZ2xiIiwiaWF0IjoxNzY4ODk1ODE2LCJleHAiOjIwODQyNTU4MTZ9.IpbWee0NRks10fdVf9w3ElHK1xrF7d6GgapLyZvbPd8",
  "https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/ps.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vcHMuZ2xiIiwiaWF0IjoxNzY4ODk1ODM5LCJleHAiOjIwODQyNTU4Mzl9.D4Zk2YjFDJpAtJ7cDp5ii_ROzMyju2HPdPk9RYLWW-A"
];

const ORBIT_DATA = [
    { label: 'PR', tiltX: 45,  tiltZ: 20,  speed: 1.1, radius: 3.3, phase: 0 },
    { label: 'AI', tiltX: -45, tiltZ: -20, speed: 1.0, radius: 3.45, phase: Math.PI * 0.7 },
    { label: 'AE', tiltX: 20,  tiltZ: -60, speed: 1.2, radius: 3.15, phase: Math.PI * 1.4 },
    { label: 'PS', tiltX: -20, tiltZ: 60,  speed: 0.9, radius: 3.6, phase: Math.PI * 0.3 } 
];

const BLACK_HOLE_SFX = "https://cdn.jsdelivr.net/gh/gabriel334425-lgtm/gabriel@main/BLACK_YINxiao.mp3";

ICON_URLS.forEach(url => useGLTF.preload(url));

// --- SHADERS FOR SILVER BLACK HOLE ---

const DISK_VERTEX = `
varying vec2 vUv;
varying float vRadius;
varying vec2 vPolarPos;
void main() {
  vUv = uv;
  vRadius = length(position.xy);
  vPolarPos = normalize(position.xy);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const DISK_FRAGMENT = `
uniform float uTime;
uniform vec3 uColorHot;
uniform vec3 uColorMid1;
uniform vec3 uColorMid2;
uniform vec3 uColorMid3;
uniform vec3 uColorOuter;
uniform float uNoiseScale;
uniform float uFlowSpeed;
uniform float uDensity;
uniform float uDiskInnerRadius;
uniform float uDiskOuterRadius;
varying vec2 vUv;
varying float vRadius;
varying vec2 vPolarPos;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute( 
    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  float normalizedRadius = smoothstep(uDiskInnerRadius, uDiskOuterRadius, vRadius);
  
  float continuousAngle = atan(vPolarPos.y, vPolarPos.x);
  float spiralBase = continuousAngle * 3.0 - (1.0 / (normalizedRadius + 0.1)) * 2.0;
  
  float spiral1 = spiralBase;
  float spiral2 = spiralBase + 2.094;
  float spiral3 = spiralBase + 4.188;

  const float PERIOD = 90.0;
  const float PHASE_SMOOTH = 0.002;
  float tMod = mod(uTime, PERIOD);
  float phase = tMod / PERIOD;
  float radialFactor = 2.0 / (vRadius * 0.3 + 1.0);
  float shiftA = (tMod + 20.0) * uFlowSpeed * radialFactor;
  float shiftB = (tMod + 20.0 - PERIOD) * uFlowSpeed * radialFactor;
  float blendStart = 1.0 - smoothstep(0.0, PHASE_SMOOTH, phase);
  float blendEnd = smoothstep(1.0 - PHASE_SMOOTH, 1.0, phase);
  float blend = max(blendStart, blendEnd);
  float shift = mix(shiftA, shiftB, blend);
  
  float angleForNoise = atan(vPolarPos.y, vPolarPos.x);
  vec2 seamlessUv = vec2(
    vRadius * cos(angleForNoise) / uDiskOuterRadius,
    vRadius * sin(angleForNoise) / uDiskOuterRadius
  );
  
  vec2 noiseUv1 = seamlessUv + vec2(shift + sin(spiral1) * 0.1, cos(spiral1) * 0.1);
  vec2 noiseUv2 = seamlessUv + vec2(shift + sin(spiral2) * 0.1, cos(spiral2) * 0.1);
  vec2 noiseUv3 = seamlessUv + vec2(shift + sin(spiral3) * 0.1, cos(spiral3) * 0.1);
  
  float noiseVal1 = snoise(vec3(noiseUv1 * uNoiseScale, uTime * 0.15));
  float noiseVal2 = snoise(vec3(noiseUv2 * uNoiseScale * 3.0 + 0.8, uTime * 0.22));
  float noiseVal3 = snoise(vec3(noiseUv3 * uNoiseScale * 6.0 + 1.5, uTime * 0.3));
  float noiseVal = (noiseVal1 * 0.45 + noiseVal2 * 0.35 + noiseVal3 * 0.2);
  noiseVal = (noiseVal + 1.0) * 0.5;
  
  vec3 color = uColorOuter;
  color = mix(color, uColorMid3, smoothstep(0.0, 0.25, normalizedRadius));
  color = mix(color, uColorMid2, smoothstep(0.2, 0.55, normalizedRadius));
  color = mix(color, uColorMid1, smoothstep(0.5, 0.75, normalizedRadius));
  color = mix(color, uColorHot, smoothstep(0.7, 0.95, normalizedRadius));
  color *= (0.5 + noiseVal * 1.0);
  
  float brightness = pow(1.0 - normalizedRadius, 1.0) * 3.5 + 0.5;
  brightness *= (0.3 + noiseVal * 2.2);
  
  float pulse = sin(uTime * 1.8 + normalizedRadius * 12.0 + continuousAngle * 2.0) * 0.15 + 0.85;
  brightness *= pulse;
  
  // Adjusted density for more gaps/voids
  float gapMask = smoothstep(0.35, 0.45, noiseVal); // Create holes in low noise areas
  float alpha = uDensity * gapMask * (0.2 + noiseVal * 0.8);
  
  alpha *= smoothstep(0.0, 0.15, normalizedRadius);
  alpha *= (1.0 - smoothstep(0.85, 1.0, normalizedRadius));
  alpha = clamp(alpha, 0.0, 1.0);
  
  gl_FragColor = vec4(color * brightness, alpha);
}
`;

const GLOW_VERTEX = `
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const GLOW_FRAGMENT = `
uniform float uTime;
uniform vec3 uCameraPosition;
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vec3 viewDirection = normalize(uCameraPosition - vPosition);
  float fresnel = 1.0 - abs(dot(vNormal, viewDirection));
  fresnel = pow(fresnel, 2.5);
  // Silver/Blueish glow
  vec3 glowColor = vec3(0.8, 0.9, 1.0);
  float pulse = sin(uTime * 2.5) * 0.15 + 0.85;
  gl_FragColor = vec4(glowColor * fresnel * pulse, fresnel * 0.4);
}
`;

const LENSING_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const LENSING_FRAGMENT = `
uniform sampler2D tDiffuse;
uniform vec2 blackHoleScreenPos;
uniform float lensingStrength;
uniform float lensingRadius;
uniform float aspectRatio;
uniform float chromaticAberration;
varying vec2 vUv;
void main() {
  vec2 screenPos = vUv;
  vec2 toCenter = screenPos - blackHoleScreenPos;
  toCenter.x *= aspectRatio;
  float dist = length(toCenter);
  float distortionAmount = lensingStrength / (dist * dist + 0.003);
  distortionAmount = clamp(distortionAmount, 0.0, 0.7);
  float falloff = smoothstep(lensingRadius, lensingRadius * 0.3, dist);
  distortionAmount *= falloff;
  vec2 offset = normalize(toCenter) * distortionAmount;
  offset.x /= aspectRatio;
  vec2 distortedUvR = screenPos - offset * (1.0 + chromaticAberration);
  vec2 distortedUvG = screenPos - offset;
  vec2 distortedUvB = screenPos - offset * (1.0 - chromaticAberration);
  float r = texture2D(tDiffuse, distortedUvR).r;
  float g = texture2D(tDiffuse, distortedUvG).g;
  float b = texture2D(tDiffuse, distortedUvB).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

// --- Silver Black Hole Scene Components ---

const BH_CONFIG = {
  blackHoleRadius: 0.9, // Reduced from 1.3
  eventHorizonShellScale: 1.05,
  diskInnerOffset: 0.2,
  diskOuterRadius: 7, // Slightly reduced
  get diskInnerRadius() { return this.blackHoleRadius + this.diskInnerOffset; },
  diskTiltAngle: Math.PI / 3,
  // Adjusted bloom settings to avoid swallowing the icons
  bloom: { strength: 0.45, radius: 0.7, threshold: 0.9 },
  lensing: { strength: 0.12, radius: 0.28, chromaticAberration: 0.005 },
};

export const SilverBlackHole: React.FC<{ isMuted: boolean }> = ({ isMuted }) => {
    const diskRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const glowMatRef = useRef<THREE.ShaderMaterial>(null);
    const diskMatRef = useRef<THREE.ShaderMaterial>(null);
    const { camera } = useThree();

    const orbitGroupsRef = useRef<(THREE.Group | null)[]>([]);
    
    // Interaction State
    const [isHovered, setIsHovered] = useState(false);
    const speedMultRef = useRef(1.0);
    const blackHoleAudio = useMemo(() => new Audio(BLACK_HOLE_SFX), []);

    // Sync Audio Mute State
    useEffect(() => {
        blackHoleAudio.muted = isMuted;
    }, [isMuted, blackHoleAudio]);

    // Handle Hover Sound
    useEffect(() => {
        if (isHovered && !isMuted) {
            blackHoleAudio.currentTime = 0;
            blackHoleAudio.play().catch(() => {});
        } else {
            blackHoleAudio.pause();
            blackHoleAudio.currentTime = 0;
        }
        return () => {
            blackHoleAudio.pause();
            blackHoleAudio.currentTime = 0;
        };
    }, [isHovered, isMuted, blackHoleAudio]);


    // Setup uniforms with Silver Palette
    const diskUniforms = useMemo(() => ({
      uTime: { value: 0 },
      uColorHot: { value: new THREE.Color(0xFFFFFF) },    // White core
      uColorMid1: { value: new THREE.Color(0xCCCCCC) },   // Light Silver
      uColorMid2: { value: new THREE.Color(0x888888) },   // Medium Silver
      uColorMid3: { value: new THREE.Color(0x555555) },   // Dark Silver
      uColorOuter: { value: new THREE.Color(0x222222) },  // Black/Charcoal edge
      uNoiseScale: { value: 2.8 },
      uFlowSpeed: { value: 0.35 },
      uDensity: { value: 1.3 },
      uDiskInnerRadius: { value: BH_CONFIG.diskInnerRadius },
      uDiskOuterRadius: { value: BH_CONFIG.diskOuterRadius }
    }), []);

    const glowUniforms = useMemo(() => ({
      uTime: { value: 0 },
      uCameraPosition: { value: new THREE.Vector3() }
    }), []);

    // Icon Material with Custom Occlusion Mask (Ray-Sphere Intersection)
    const iconMaterial = useMemo(() => {
        const mat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color("#cccccc"),
            metalness: 1.0,
            roughness: 0.1, 
            clearcoat: 1.0,
            envMapIntensity: 3.0,
            emissive: new THREE.Color("#ffffff"),
            emissiveIntensity: 0.4, 
            toneMapped: false
        });

        mat.onBeforeCompile = (shader) => {
            // Inject uniforms for black hole parameters
            shader.uniforms.uBHCenter = { value: new THREE.Vector3(0, 0, 0) };
            shader.uniforms.uBHRadius = { value: BH_CONFIG.blackHoleRadius * 2.7 }; // Match actual radius * 2 for larger mask

            // Calculate world position in vertex shader
            shader.vertexShader = `
                varying vec3 vPosWorld;
            ` + shader.vertexShader;
            
            shader.vertexShader = shader.vertexShader.replace(
                '#include <worldpos_vertex>',
                `
                #include <worldpos_vertex>
                vPosWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
                `
            );

            // Add Ray-Sphere intersection logic in fragment shader
            shader.fragmentShader = `
                uniform vec3 uBHCenter;
                uniform float uBHRadius;
                varying vec3 vPosWorld;
            ` + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
                'void main() {',
                `
                void main() {
                    // Ray-Sphere Intersection for Occlusion Mask
                    vec3 ro = cameraPosition;
                    vec3 rd = normalize(vPosWorld - ro);
                    vec3 L = uBHCenter - ro;
                    float tca = dot(L, rd);
                    float d2 = dot(L, L) - tca * tca;
                    float radius2 = uBHRadius * uBHRadius;
                    
                    if (d2 < radius2) {
                        float thc = sqrt(radius2 - d2);
                        float t0 = tca - thc;
                        float dist = distance(ro, vPosWorld);
                        
                        // If sphere intersection (t0) is valid and closer than the fragment, 
                        // it means the black hole is blocking the view of this icon pixel.
                        // Tolerance (0.2) prevents self-occlusion artifacts near the edge.
                        if (t0 > 0.0 && t0 < dist - 0.2) {
                            discard;
                        }
                    }
                `
            );
        };
        return mat;
    }, []);

    // Shadow Icon Material - Dark, semi-transparent, no metallic
    const shadowIconMaterial = useMemo(() => {
      return new THREE.MeshBasicMaterial({
        color: new THREE.Color("#000000"),
        transparent: true,
        opacity: 0.6,
      });
    }, []);

    useFrame((state, delta) => {
      const t = state.clock.elapsedTime;
      if (diskMatRef.current) diskMatRef.current.uniforms.uTime.value = t;
      if (glowMatRef.current) {
        glowMatRef.current.uniforms.uTime.value = t;
        glowMatRef.current.uniforms.uCameraPosition.value.copy(camera.position);
      }
      if (diskRef.current) diskRef.current.rotation.z += 0.002;

      // Accelerate speed when hovered
      const targetSpeedMult = isHovered ? 8.0 : 1.0;
      speedMultRef.current += (targetSpeedMult - speedMultRef.current) * 0.1;

      // Orbit updates
      orbitGroupsRef.current.forEach((orbit, i) => {
          if (orbit) {
              const config = ORBIT_DATA[i];
              orbit.rotation.y -= config.speed * 0.3 * delta * speedMultRef.current; 
          }
      });
    });

    return (
      <group
         onPointerOver={() => setIsHovered(true)} 
         onPointerOut={() => setIsHovered(false)}
      >
        {/* Invisible Hit Box for easy hovering */}
        <mesh visible={false}>
            <sphereGeometry args={[4.5, 16, 16]} />
            <meshBasicMaterial />
        </mesh>

        {/* Black Hole Core */}
        <mesh renderOrder={0}>
          <sphereGeometry args={[BH_CONFIG.blackHoleRadius, 64, 64]} />
          <meshBasicMaterial color={0x000000} />
        </mesh>

        {/* Event Horizon Glow */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[BH_CONFIG.blackHoleRadius * BH_CONFIG.eventHorizonShellScale, 64, 64]} />
          <shaderMaterial
            ref={glowMatRef}
            vertexShader={GLOW_VERTEX}
            fragmentShader={GLOW_FRAGMENT}
            uniforms={glowUniforms}
            transparent
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Accretion Disk */}
        <mesh ref={diskRef} rotation={[BH_CONFIG.diskTiltAngle, 0, 0]} renderOrder={1}>
          <ringGeometry args={[BH_CONFIG.diskInnerRadius, BH_CONFIG.diskOuterRadius, 256, 128]} />
          <shaderMaterial
            ref={diskMatRef}
            vertexShader={DISK_VERTEX}
            fragmentShader={DISK_FRAGMENT}
            uniforms={diskUniforms}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        {/* Orbiting Icons */}
        <group>
            {ICON_URLS.map((url, i) => {
                const config = ORBIT_DATA[i];
                return (
                    <group 
                        key={i} 
                        rotation={[
                            THREE.MathUtils.degToRad(config.tiltX), 
                            0, 
                            THREE.MathUtils.degToRad(config.tiltZ)
                        ]}
                    >
                        <group ref={el => orbitGroupsRef.current[i] = el}>
                            <group rotation={[0, config.phase, 0]}>
                                <group position={[config.radius, 0, 0]}>
                                    {/* Main Icon - Flipped to Face Outward */}
                                    <OrbitingIcon 
                                        url={url} 
                                        position={[0, 0, 0]} 
                                        rotation={[0, Math.PI / 2, 0]} // Changed from -Math.PI / 2 to Math.PI / 2
                                        material={iconMaterial} 
                                        scale={0.45} 
                                    />
                                    {/* Twisted Shadow Projection */}
                                    <group position={[0, -0.8, -0.2]} rotation={[0, 0, -Math.PI / 6]} scale={[1, 0.1, 1]}>
                                        <OrbitingIcon
                                            url={url}
                                            position={[0, 0, 0]}
                                            rotation={[0, Math.PI / 2, 0]}
                                            material={shadowIconMaterial}
                                            scale={0.45}
                                        />
                                    </group>
                                </group>
                            </group>
                        </group>
                    </group>
                );
            })}
        </group>

        <ambientLight intensity={0.2} />
        {/* Additional light for Layer 1 icons if needed, though emissive helps */}
        <ambientLight intensity={0.2} layers={1} />
        <Environment preset="city" />
      </group>
    );
};

export const BlackHolePostProcessing: React.FC = () => {
    const { gl, scene, camera, size } = useThree();
    const composerRef = useRef<EffectComposer | null>(null);

    const lensingUniforms = useMemo(() => ({
      tDiffuse: { value: null },
      blackHoleScreenPos: { value: new THREE.Vector2(0.5, 0.5) },
      lensingStrength: { value: BH_CONFIG.lensing.strength },
      lensingRadius: { value: BH_CONFIG.lensing.radius },
      aspectRatio: { value: size.width / size.height },
      chromaticAberration: { value: BH_CONFIG.lensing.chromaticAberration }
    }), []);

    const lensingMaterial = useMemo(() => new THREE.ShaderMaterial({
      uniforms: lensingUniforms,
      vertexShader: LENSING_VERTEX,
      fragmentShader: LENSING_FRAGMENT
    }), [lensingUniforms]);

    useEffect(() => {
        const composer = new EffectComposer(gl);
        composer.addPass(new RenderPass(scene, camera));
        
        // Bloom
        composer.addPass(new UnrealBloomPass(
            new THREE.Vector2(size.width, size.height), 
            BH_CONFIG.bloom.strength, 
            BH_CONFIG.bloom.radius, 
            BH_CONFIG.bloom.threshold
        ));
        
        // Lensing
        const lPass = new ShaderPass(lensingMaterial);
        composer.addPass(lPass);

        composerRef.current = composer;
        composer.setSize(size.width, size.height);

        return () => {
          composer.dispose();
          composerRef.current = null;
        };
    }, [gl, scene, camera, size, lensingMaterial]);

    useEffect(() => {
        if(composerRef.current) {
            composerRef.current.setSize(size.width, size.height);
            lensingUniforms.aspectRatio.value = size.width / size.height;
        }
    }, [size, lensingUniforms]);

    useFrame(() => {
        if (composerRef.current) {
            // Update lensing position
            const bhPos = new THREE.Vector3(0, 0, 0);
            bhPos.project(camera);
            lensingUniforms.blackHoleScreenPos.value.set(
                (bhPos.x + 1) / 2,
                (bhPos.y + 1) / 2
            );

            // Manual Multi-Pass Rendering to prevent icon distortion
            gl.autoClear = false;
            gl.clear();

            // 1. Render Background (Layer 0) -> Composer (Bloom + Lensing)
            camera.layers.set(0);
            composerRef.current.render();

            // 2. Render Icons (Layer 1) -> Direct to Screen (No Lensing)
            gl.clearDepth(); // Ensure icons sit on top
            camera.layers.set(1);
            gl.render(scene, camera);

            // 3. Reset for next frame/standard behavior
            camera.layers.enableAll();
        }
    }, 1);

    return null;
};

// 1. 生成平滑的山体噪波贴图
const useNoiseTexture = () => {
    return useMemo(() => {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#111111'; // 深色底
            ctx.fillRect(0, 0, size, size);
            
            // 绘制大半径、低透明度的圆，叠加出起伏感 (Perlin-like effect)
            for (let i = 0; i < 60; i++) { // 减少数量，增加尺寸 -> 更平缓的山体
                const x = Math.random() * size;
                const y = Math.random() * size;
                const r = 80 + Math.random() * 150; // 大半径
                const alpha = 0.1 + Math.random() * 0.2;
                
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }, []);
};

const OrbitingIcon = ({ url, position, rotation, material, scale = 0.22 }: any) => {
    // Add cast to any to fix property 'scene' does not exist error on union type
    const { scene } = useGLTF(url) as any;
    const clone = useMemo(() => {
        const c = scene.clone();
        const toRemove: THREE.Object3D[] = [];
        c.traverse((child: any) => {
             if ((child as THREE.Mesh).isMesh) {
                 const m = child as THREE.Mesh;
                 if (
                    m.name.toLowerCase().includes('plane') || 
                    m.geometry.type.includes('Plane') ||
                    m.name.includes('立方体') 
                 ) {
                     toRemove.push(m);
                 } else {
                     m.castShadow = true;
                     m.receiveShadow = true;
                     m.material = material;
                     // Only set to layer 1 if it is the main icon material, not the shadow
                     // Shadow uses MeshBasicMaterial which we created above
                     if (material.type === 'MeshPhysicalMaterial') {
                        m.layers.set(1); 
                     } else {
                        m.layers.set(0); // Shadows stay in layer 0 to participate in lensing/bloom if desired, or set to 0 to be behind? 
                        // Actually, if we want shadows to be distorted by lensing, they should be in layer 0.
                     }
                 }
             }
        });
        toRemove.forEach(obj => obj.parent?.remove(obj));
        return c;
    }, [scene, material]);

    // Added renderOrder={10} to prioritize rendering
    return <primitive object={clone} position={position} rotation={rotation} scale={scale} renderOrder={10} />;
};

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    let pMouse = { x: 0, y: 0 };
    let animationFrameId: number;

    const resizeParticles = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      particles = [];
      const count = Math.floor((width * height) / 8000); 
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2, 
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 1.5, 
          alpha: Math.random() * 0.6 + 0.1,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      pMouse.x = e.clientX;
      pMouse.y = e.clientY;
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        const dx = (pMouse.x - width / 2) * 0.01 * p.size;
        const dy = (pMouse.y - height / 2) * 0.01 * p.size;
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x + dx, p.y + dy, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animateParticles);
    };

    window.addEventListener('resize', resizeParticles);
    window.addEventListener('mousemove', handleMouseMove);
    resizeParticles();
    animateParticles();
    return () => {
      window.removeEventListener('resize', resizeParticles);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1] opacity-50" />;
};

export const HeroModel: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
        meshRef.current.rotation.x += (state.mouse.y * 0.5 - meshRef.current.rotation.x) * 0.05;
        meshRef.current.rotation.y += (state.mouse.x * 0.5 - meshRef.current.rotation.y) * 0.05;
    }
  });
  return (
    <group>
        <ambientLight intensity={0.4} color="#ffffff" />
        <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
        <spotLight position={[-5, 5, 0]} intensity={10} color="#ff3333" angle={0.5} penumbra={1} />
        <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
        <mesh ref={meshRef} scale={[0.4, 0.4, 0.4]}>
            <torusKnotGeometry args={[1.2, 0.4, 150, 20]} />
            <meshStandardMaterial color={0xaa0000} metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
    </group>
  );
};

// --- Saturn Model (原子轨道 + 模拟山体噪波 + 辉光) ---
// Deprecated: Replaced by SilverBlackHole in Values section, but kept for reference or other uses
export const SaturnModel: React.FC = () => {
    const groupRef = useRef<THREE.Group>(null);
    const orbitGroupsRef = useRef<(THREE.Group | null)[]>([]);
    const [isHovered, setIsHovered] = useState(false);
    
    const intensityRef = useRef(0);
    const lastScrollY = useRef(0);

    const displacementMap = useNoiseTexture();

    // 1. 核心球体材质：带噪波，模拟山体
    const sphereMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: new THREE.Color("#aaaaaa"), // 银色
            metalness: 1.0,        
            roughness: 0.2,        
            envMapIntensity: 2.5,  
            emissive: new THREE.Color("#ffffff"), 
            emissiveIntensity: 0.6, // 提升亮度，确保山脊高光
            displacementMap: displacementMap, 
            displacementScale: 0.15, // 山体隆起高度
            toneMapped: false      
        });
    }, [displacementMap]);

    // 2. 图标材质：光滑金属
    const iconMaterial = useMemo(() => {
        return new THREE.MeshPhysicalMaterial({
            color: new THREE.Color("#cccccc"),
            metalness: 1.0,
            roughness: 0.1, 
            clearcoat: 1.0,
            envMapIntensity: 3.0,
            emissive: new THREE.Color("#ffffff"),
            emissiveIntensity: 0.4, 
            toneMapped: false
        });
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;
            const delta = Math.abs(currentY - lastScrollY.current);
            intensityRef.current = Math.min(delta * 0.05, 4.0); 
            lastScrollY.current = currentY;
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        intensityRef.current = THREE.MathUtils.lerp(intensityRef.current, 0, 0.05);
        const hoverIntensity = isHovered ? 1.0 : 0;
        const totalIntensity = intensityRef.current + hoverIntensity;

        const sphereSpeed = 0.1 + totalIntensity * 0.3;
        groupRef.current.rotation.y += sphereSpeed * delta;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

        orbitGroupsRef.current.forEach((orbit, i) => {
            if (orbit) {
                const config = ORBIT_DATA[i];
                const baseSpeed = config.speed * 0.3; 
                const accelSpeed = config.speed * totalIntensity * 1.5;
                const finalSpeed = baseSpeed + accelSpeed;
                orbit.rotation.y -= finalSpeed * delta;
            }
        });
    });

    return (
        <PresentationControls
            global={false} 
            cursor={true}
            snap={true}       
            speed={1.5} 
            zoom={0.8} 
            rotation={[0, 0, 0]} 
            polar={[-Math.PI / 4, Math.PI / 4]} 
            azimuth={[-Math.PI / 4, Math.PI / 4]} 
        >
            <group 
                onPointerOver={() => setIsHovered(true)}
                onPointerOut={() => setIsHovered(false)}
            >
                <group ref={groupRef}>
                    {/* 实体球体：高分段数以支持 displacement */}
                    <mesh>
                        <sphereGeometry args={[0.9, 128, 128]} />
                        <primitive object={sphereMaterial} attach="material" />
                    </mesh>

                    {/* 独立光效层 (Halo) */}
                    <mesh scale={[1.15, 1.15, 1.15]}>
                        <sphereGeometry args={[0.9, 32, 32]} />
                        <meshBasicMaterial 
                            color="#ffffff" 
                            transparent 
                            opacity={0.15} 
                            blending={THREE.AdditiveBlending} 
                            side={THREE.BackSide} 
                        />
                    </mesh>
                </group>

                {/* 原子轨道 */}
                <group>
                    {ICON_URLS.map((url, i) => {
                        const config = ORBIT_DATA[i];
                        return (
                            <group 
                                key={i} 
                                rotation={[
                                    THREE.MathUtils.degToRad(config.tiltX), 
                                    0, 
                                    THREE.MathUtils.degToRad(config.tiltZ)
                                ]}
                            >
                                <group ref={el => orbitGroupsRef.current[i] = el}>
                                    <group rotation={[0, config.phase, 0]}>
                                        <group position={[config.radius, 0, 0]}>
                                            <OrbitingIcon 
                                                url={url} 
                                                position={[0, 0, 0]} 
                                                rotation={[0, -Math.PI / 2, 0]} 
                                                material={iconMaterial} 
                                                scale={0.25} 
                                            />
                                        </group>
                                    </group>
                                </group>
                            </group>
                        );
                    })}
                </group>

                <pointLight position={[10, 5, 5]} intensity={10} color="#ffffff" />
                <pointLight position={[-10, -5, -5]} intensity={5} color="#6666ff" />
                <spotLight position={[0, 10, 0]} intensity={15} color="#ffffff" angle={0.5} penumbra={0.5} />
                <Environment preset="city" />
            </group>
        </PresentationControls>
    );
};

export const MagnetScene: React.FC = () => null;
export const FooterSmiley: React.FC = () => null;
