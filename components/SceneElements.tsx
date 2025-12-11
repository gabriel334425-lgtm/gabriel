import React, { useRef, Suspense, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Environment, MeshTransmissionMaterial, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// --- Assets ---
const ICON_URLS = [
  "https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/ae.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vYWUuZ2xiIiwiaWF0IjoxNzY1Mzg0MjkxLCJleHAiOjE3OTY5MjAyOTF9.nacV0T-ezx0c52xD7VR5i34n8sUs9BnRvHaWNQdlRog",
  "https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/ai.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vYWkuZ2xiIiwiaWF0IjoxNzY1Mzg0MzMwLCJleHAiOjE3OTY5MjAzMzB9.CRxXVVVB2IJv0DWVlqzo9VNjhBXufDgdlO8OkS_lhRg",
  "https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/pr.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vcHIuZ2xiIiwiaWF0IjoxNzY1Mzg0MzQyLCJleHAiOjE3OTY5MjAzNDJ9.RNshtiF_phSL2KdjTSCE6MBEJ0rVBI3oqSesPWvXg0E",
  "https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/ps.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vcHMuZ2xiIiwiaWF0IjoxNzY1Mzg0MzUwLCJleHAiOjE3OTY5MjAzNTB9.lI-S6iS-iS0jEg0ME0WCOXhUkh1Mc1XTUG1olaHnIzo"
];

// Preload icons
ICON_URLS.forEach(url => useGLTF.preload(url));

const IconMesh = ({ url, scale = 1 }: { url: string; scale?: number }) => {
    const { scene } = useGLTF(url);
    const clone = useMemo(() => {
        const c = scene.clone();
        
        const toRemove: THREE.Object3D[] = [];

        c.traverse((child) => {
             if ((child as THREE.Mesh).isMesh) {
                 const m = child as THREE.Mesh;
                 
                 // Remove "plane" (backgrounds)
                 if (m.name.toLowerCase().includes('plane')) {
                     toRemove.push(m);
                 } else {
                     m.castShadow = true;
                     m.receiveShadow = true;
                     // Original material restored (no override)
                 }
             }
        });

        // Remove the detected planes
        toRemove.forEach(child => {
            child.parent?.remove(child);
        });

        return c;
    }, [scene]);

    return <primitive object={clone} scale={scale} />;
};

// --- Particle Background (2D Canvas) ---
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
      const count = Math.floor((width * height) / 15000); 
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2,
          alpha: Math.random() * 0.5 + 0.1,
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

        // Subtle mouse influence
        const dx = (pMouse.x - width / 2) * 0.02 * p.size;
        const dy = (pMouse.y - height / 2) * 0.02 * p.size;

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

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1] opacity-60"
    />
  );
};

// --- Hero Scene (Fallback 3D) ---
export const HeroScene: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
        // Smooth rotation following mouse like the reference
        const maxRot = THREE.MathUtils.degToRad(15);
        const mouseX = (state.mouse.x * window.innerWidth / 2) / (window.innerWidth / 2); // state.mouse is already -1 to 1
        const mouseY = -(state.mouse.y * window.innerHeight / 2) / (window.innerHeight / 2);

        // Interpolate rotation
        meshRef.current.rotation.x += (state.mouse.y * 0.5 - meshRef.current.rotation.x) * 0.05;
        meshRef.current.rotation.y += (state.mouse.x * 0.5 - meshRef.current.rotation.y) * 0.05;
    }
  });

  return (
    <group>
        {/* Lighting from reference */}
        <ambientLight intensity={0.4} color="#ffffff" />
        <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
        <spotLight position={[-5, 5, 0]} intensity={10} color="#ff3333" angle={0.5} penumbra={1} />
        
        {/* HDRI */}
        <Environment preset="city" />

        <mesh ref={meshRef} scale={[0.4, 0.4, 0.4]}>
            <torusKnotGeometry args={[1.2, 0.4, 150, 20]} />
            <meshStandardMaterial 
                ref={materialRef}
                color={0xaa0000}
                metalness={0.9}
                roughness={0.2}
                side={THREE.DoubleSide}
            />
        </mesh>
    </group>
  );
};

// --- Magnet Scene (Existing Physics - Tuned) ---
export const MagnetScene: React.FC = () => {
  // Use 16 items to have 4 icons repeated 4 times
  const count = 16; 
  const group = useRef<THREE.Group>(null);
  const previousMouse = useRef(new THREE.Vector2(0, 0));
  
  // Use useMemo to maintain stable physics state
  const data = useMemo(() => ({
    // Linear Velocity
    velocities: Array(count).fill(0).map(() => ({ x: 0, y: 0, z: 0 })),
    // Angular Velocity (Spin)
    angularVelocities: Array(count).fill(0).map(() => ({ x: 0, y: 0, z: 0 })),
    // Target positions (form a rough cloud/cluster)
    baseTargets: Array(count).fill(0).map(() => ({
       x: (Math.random() - 0.5) * 1.5, // Reduced spread for tighter cluster (was 2.5)
       y: (Math.random() - 0.5) * 1.5, // Reduced spread (was 2.5)
       z: (Math.random() - 0.5) * 0.5  // Flatter profile
    })),
    // Resting Rotation (random scatter)
    baseRotations: Array(count).fill(0).map(() => ({
       x: (Math.random() - 0.5) * Math.PI * 0.6, // +/- random tilt
       y: (Math.random() - 0.5) * Math.PI * 0.6,
       z: (Math.random() - 0.5) * Math.PI * 0.2
    })),
    // Random offsets for sine wave bobbing
    phases: Array(count).fill(0).map(() => Math.random() * Math.PI * 2)
  }), []);

  useFrame((state) => {
    if (!group.current) return;
    
    const { mouse, viewport, clock } = state;
    const time = clock.getElapsedTime();
    
    // 1. Calculate Mouse Velocity (Impulse)
    // Convert normalized mouse to world coords at approx z=0
    const currentMouseX = (mouse.x * viewport.width) / 2;
    const currentMouseY = (mouse.y * viewport.height) / 2;
    
    // Delta per frame (Velocity)
    const mouseVelX = (currentMouseX - previousMouse.current.x);
    const mouseVelY = (currentMouseY - previousMouse.current.y);
    const mouseSpeed = Math.sqrt(mouseVelX * mouseVelX + mouseVelY * mouseVelY);

    previousMouse.current.set(currentMouseX, currentMouseY);

    const children = group.current.children;

    // --- PHYSICS CONSTANTS ---
    // Slower, tighter, more controlled
    const SPRING_STIFFNESS = 0.05; // Position stiffness
    const ROT_STIFFNESS = 0.03;    // Rotation stiffness (to return to base rotation)
    const DAMPING = 0.90;          // Linear damping
    const ROT_DAMPING = 0.92;      // Angular damping
    const MOUSE_RADIUS = 1.5;      
    const IMPULSE_FACTOR = 5.0;    
    const MAX_VELOCITY = 1.0;      

    children.forEach((child, i) => {
        if (i >= data.velocities.length) return;

        const object = child as THREE.Object3D;
        const v = data.velocities[i];
        const av = data.angularVelocities[i];
        const base = data.baseTargets[i];
        const baseRot = data.baseRotations[i];
        const phase = data.phases[i];

        // --- 1. Idle Animation (Subtle) ---
        const floatY = Math.sin(time * 1.5 + phase) * 0.05;
        const targetX = base.x;
        const targetY = base.y + floatY;
        const targetZ = base.z;

        // --- 2. Spring Force (Return to Target Position) ---
        const ax = (targetX - object.position.x) * SPRING_STIFFNESS;
        const ay = (targetY - object.position.y) * SPRING_STIFFNESS;
        const az = (targetZ - object.position.z) * SPRING_STIFFNESS;

        // --- 3. Mouse Impulse (Localized Scattering) ---
        const dx = object.position.x - currentMouseX;
        const dy = object.position.y - currentMouseY;
        const dist = Math.sqrt(dx*dx + dy*dy); 

        let ix = 0, iy = 0, iz = 0;

        // Only interact if mouse is moving AND close
        if (dist < MOUSE_RADIUS && mouseSpeed > 0.01) {
            const pushDirX = dx / dist;
            const pushDirY = dy / dist;
            const proximity = Math.pow(1 - dist / MOUSE_RADIUS, 2); 

            // Combine movement direction (drag) with radial push (explosion)
            const forceX = (mouseVelX * 0.6 + pushDirX * 0.4 * mouseSpeed) * IMPULSE_FACTOR * proximity;
            const forceY = (mouseVelY * 0.6 + pushDirY * 0.4 * mouseSpeed) * IMPULSE_FACTOR * proximity;
            
            ix += forceX;
            iy += forceY;
            iz += mouseSpeed * proximity * (Math.random() - 0.5) * 2.0;

            // Spin on impact
            av.x += forceY * 0.5;
            av.y -= forceX * 0.5;
            av.z += (Math.random() - 0.5) * mouseSpeed;
        }

        // --- 4. Collision Avoidance ---
        const radius = 0.5; 
        let cx = 0, cy = 0, cz = 0;
        
        for (let j = 0; j < children.length; j++) {
            if (i === j) continue;
            const other = children[j] as THREE.Object3D;
            const odx = object.position.x - other.position.x;
            const ody = object.position.y - other.position.y;
            const odz = object.position.z - other.position.z;
            const dSq = odx*odx + ody*ody + odz*odz;
            const minDist = radius * 1.5; 

            if (dSq < minDist * minDist && dSq > 0.0001) {
                const d = Math.sqrt(dSq);
                const push = (minDist - d) * 0.05; 
                cx += (odx / d) * push;
                cy += (ody / d) * push;
                cz += (odz / d) * push;
            }
        }

        // --- 5. Integrate Position ---
        v.x += ax + ix + cx;
        v.y += ay + iy + cy;
        v.z += az + iz + cz;

        v.x *= DAMPING;
        v.y *= DAMPING;
        v.z *= DAMPING;

        const speed = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
        if (speed > MAX_VELOCITY) {
            const scale = MAX_VELOCITY / speed;
            v.x *= scale;
            v.y *= scale;
            v.z *= scale;
        }

        object.position.x += v.x;
        object.position.y += v.y;
        object.position.z += v.z;

        // --- 6. Integrate Rotation (Spring to Base Rotation) ---
        // Apply torque towards base rotation
        av.x += (baseRot.x - object.rotation.x) * ROT_STIFFNESS;
        av.y += (baseRot.y - object.rotation.y) * ROT_STIFFNESS;
        av.z += (baseRot.z - object.rotation.z) * ROT_STIFFNESS;

        av.x *= ROT_DAMPING;
        av.y *= ROT_DAMPING;
        av.z *= ROT_DAMPING;

        object.rotation.x += av.x;
        object.rotation.y += av.y;
        object.rotation.z += av.z;
    });
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7]} intensity={0.8} />
      <pointLight position={[-10, -5, 5]} intensity={0.5} color="#ffffff" />
      <Environment preset="studio" />

      <group ref={group}>
        {data.baseTargets.map((_, i) => {
            const iconUrl = ICON_URLS[i % ICON_URLS.length];
            const startX = (Math.random() - 0.5) * 10; 
            const startY = (Math.random() - 0.5) * 10;
            const startZ = (Math.random() - 0.5) * 10 - 5; 

            // Scale adjusted to 0.3 as requested
            const scale = 0.3;

            return (
                <group 
                    key={i} 
                    position={[startX, startY, startZ]}
                    rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
                >
                     <IconMesh url={iconUrl} scale={scale} />
                </group>
            );
        })}
      </group>
    </>
  );
};

export const FooterSmiley: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
        const x = (state.mouse.x * Math.PI) / 4;
        const y = (state.mouse.y * Math.PI) / 4;
        meshRef.current.rotation.set(-y, x, 0);
    }
  });

  return (
    <group>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} />
        <Float speed={5} rotationIntensity={0.2} floatIntensity={0.2}>
            <mesh ref={meshRef}>
                 <torusKnotGeometry args={[1, 0.3, 100, 16]} />
                 <meshStandardMaterial color="#FF3333" roughness={0.2} metalness={0.8} />
            </mesh>
        </Float>
    </group>
  );
};