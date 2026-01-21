
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Environment, useGLTF, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

// --- Assets ---
const ICON_URLS = [
  "https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/pr.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vcHIuZ2xiIiwiaWF0IjoxNzY4ODk1NzQxLCJleHAiOjIwODQyNTU3NDF9._bWkS7q1GkBuLhNggTtdn2_yOmSOOeioB8958QYprGc",
  "https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/ai.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vYWkuZ2xiIiwiaWF0IjoxNzY4ODk1Nzk1LCJleHAiOjIwODQyNTU3OTV9.uTHa0Pfo5faQplcfbmP4976isIPpPHSZyIIDEK8uznI",
  "https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/ae.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vYWUuZ2xiIiwiaWF0IjoxNzY4ODk1ODE2LCJleHAiOjIwODQyNTU4MTZ9.IpbWee0NRks10fdVf9w3ElHK1xrF7d6GgapLyZvbPd8",
  "https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/ps.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vcHMuZ2xiIiwiaWF0IjoxNzY4ODk1ODM5LCJleHAiOjIwODQyNTU4Mzl9.D4Zk2YjFDJpAtJ7cDp5ii_ROzMyju2HPdPk9RYLWW-A"
];

// 原子轨道配置
const ORBIT_DATA = [
    { label: 'PR', tiltX: 45,  tiltZ: 20,  speed: 1.1, radius: 2.5, phase: 0 },
    { label: 'AI', tiltX: -45, tiltZ: -20, speed: 1.0, radius: 2.6, phase: Math.PI * 0.7 },
    { label: 'AE', tiltX: 20,  tiltZ: -60, speed: 1.2, radius: 2.4, phase: Math.PI * 1.4 },
    { label: 'PS', tiltX: -20, tiltZ: 60,  speed: 0.9, radius: 2.7, phase: Math.PI * 0.3 } 
];

ICON_URLS.forEach(url => useGLTF.preload(url));

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
                 }
             }
        });
        toRemove.forEach(obj => obj.parent?.remove(obj));
        return c;
    }, [scene, material]);

    return <primitive object={clone} position={position} rotation={rotation} scale={scale} />;
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
