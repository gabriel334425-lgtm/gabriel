import React, { useRef, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Environment, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Define a separate component for the GLB model to handle async loading comfortably
const Model: React.FC<{ url?: string }> = ({ url }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
        // Slow complex rotation
        meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.2;
        meshRef.current.rotation.y += 0.005;
        meshRef.current.rotation.z = Math.cos(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
      <mesh ref={meshRef} scale={[1.5, 1.5, 1.5]}>
        <torusGeometry args={[1, 0.4, 64, 6]} /> 
        <MeshTransmissionMaterial 
            backside
            samples={4}
            thickness={0.5}
            chromaticAberration={0.05}
            anisotropy={0.1}
            distortion={0.1}
            distortionScale={0.1}
            temporalDistortion={0.1}
            iridescence={1}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            roughness={0.1}
            metalness={0.5}
            color="#ffffff"
        />
      </mesh>
  );
};

export const HeroScene: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle mouse parallax
      groupRef.current.rotation.y = state.mouse.x * 0.05;
      groupRef.current.rotation.x = -state.mouse.y * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#FF4400" />
      <Environment preset="studio" />
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.2, 0.2]}>
        <Suspense fallback={null}>
            <Model />
        </Suspense>
      </Float>
    </group>
  );
};

export const MagnetScene: React.FC = () => {
  // Increased count to create a "pile" feel where you can hit specific parts
  const count = 20; 
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
    const SPRING_STIFFNESS = 0.05; // Was 0.12 - Lower stiffness for slower/lazier return
    const DAMPING = 0.90;          // Was 0.85 - Higher damping for smoother, slower movement
    const MOUSE_RADIUS = 1.5;      // Slightly larger interaction radius for usability with tighter cluster
    const IMPULSE_FACTOR = 5.0;    // Adjusted impulse for new damping
    const MAX_VELOCITY = 1.0;      // Lower max velocity to prevent frantic movement

    children.forEach((child, i) => {
        if (i >= data.velocities.length) return;

        const mesh = child as THREE.Mesh;
        const v = data.velocities[i];
        const av = data.angularVelocities[i];
        const base = data.baseTargets[i];
        const phase = data.phases[i];

        // --- 1. Idle Animation (Subtle) ---
        const floatY = Math.sin(time * 1.5 + phase) * 0.05;
        const targetX = base.x;
        const targetY = base.y + floatY;
        const targetZ = base.z;

        // --- 2. Spring Force (Return to Target) ---
        const ax = (targetX - mesh.position.x) * SPRING_STIFFNESS;
        const ay = (targetY - mesh.position.y) * SPRING_STIFFNESS;
        const az = (targetZ - mesh.position.z) * SPRING_STIFFNESS;

        // --- 3. Mouse Impulse (Localized Scattering) ---
        const dx = mesh.position.x - currentMouseX;
        const dy = mesh.position.y - currentMouseY;
        // Approximation of distance to mouse ray (assuming z=0 plane interaction)
        const dist = Math.sqrt(dx*dx + dy*dy); 

        let ix = 0, iy = 0, iz = 0;

        // Only interact if mouse is moving AND close
        if (dist < MOUSE_RADIUS && mouseSpeed > 0.01) {
            // Direction away from mouse center
            const pushDirX = dx / dist;
            const pushDirY = dy / dist;

            // Sharp falloff
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
        // Soft collision to maintain volume without jitter
        const radius = 0.5; 
        let cx = 0, cy = 0, cz = 0;
        
        for (let j = 0; j < children.length; j++) {
            if (i === j) continue;
            const other = children[j] as THREE.Mesh;
            const odx = mesh.position.x - other.position.x;
            const ody = mesh.position.y - other.position.y;
            const odz = mesh.position.z - other.position.z;
            const dSq = odx*odx + ody*ody + odz*odz;
            const minDist = radius * 1.5; // Tighter packing allowed (was 1.6)

            if (dSq < minDist * minDist && dSq > 0.0001) {
                const d = Math.sqrt(dSq);
                const push = (minDist - d) * 0.05; // Gentle push
                cx += (odx / d) * push;
                cy += (ody / d) * push;
                cz += (odz / d) * push;
            }
        }

        // --- 5. Integrate Physics ---
        v.x += ax + ix + cx;
        v.y += ay + iy + cy;
        v.z += az + iz + cz;

        // Damping (Drag)
        v.x *= DAMPING;
        v.y *= DAMPING;
        v.z *= DAMPING;

        // Velocity Cap
        const speed = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
        if (speed > MAX_VELOCITY) {
            const scale = MAX_VELOCITY / speed;
            v.x *= scale;
            v.y *= scale;
            v.z *= scale;
        }

        mesh.position.x += v.x;
        mesh.position.y += v.y;
        mesh.position.z += v.z;

        // --- 6. Rotation Integration ---
        av.x *= 0.92; // Slower spin decay
        av.y *= 0.92;
        av.z *= 0.92;

        mesh.rotation.x += av.x;
        mesh.rotation.y += av.y;
        mesh.rotation.z += av.z;

        // Recover orientation slowly
        mesh.rotation.x *= 0.98;
        mesh.rotation.y *= 0.98;
        mesh.rotation.z *= 0.98;
    });
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 7]} intensity={1} />
      <pointLight position={[-10, -5, 5]} intensity={0.5} color="#ffffff" />
      
      <group ref={group}>
        {data.baseTargets.map((_, i) => {
            const type = i % 3;
            // Varied cube sizes for natural pile look
            let scale: [number, number, number] = [0.8, 0.8, 0.8];
            if (type === 0) scale = [0.7, 0.7, 0.7]; 
            if (type === 1) scale = [0.6, 0.9, 0.6]; 
            if (type === 2) scale = [0.9, 0.6, 0.6]; 

            // Start closer for tighter initial feel
            const startX = (Math.random() - 0.5) * 10; 
            const startY = (Math.random() - 0.5) * 10;
            const startZ = (Math.random() - 0.5) * 10 - 5; 

            return (
                <mesh 
                    key={i} 
                    position={[startX, startY, startZ]}
                    rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
                    scale={scale}
                >
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial 
                        color="#080808" 
                        roughness={0.15} 
                        metalness={0.9} 
                    />
                </mesh>
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