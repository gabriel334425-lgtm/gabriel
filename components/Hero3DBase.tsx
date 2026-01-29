
import React, { useEffect, useRef, useLayoutEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';

extend({ EffectComposer, RenderPass, UnrealBloomPass, OutputPass });

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/gabriel334425-lgtm/gabriel@ff009d7be3f7eff9d973ae5de17ed6cc779adb7a/untitled.glb?v=1';
const HOVER_SFX = 'https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/hero_xiao.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vaGVyb194aWFvLm1wMyIsImlhdCI6MTc2OTUxMTUwNSwiZXhwIjoyMDg0ODcxNTA1fQ.eBc6kT6dZd2CpnD0IQyZS9UqO4ebdW8LXWrtyq9xkkE';

const PostProcessing = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<EffectComposer>(null);

  const [effectComposer, renderPass, bloomPass, outPass] = useMemo(() => {
    const ec = new EffectComposer(gl);
    const rp = new RenderPass(scene, camera);
    const bp = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 1.5, 0.4, 0.85);
    const op = new OutputPass();
    return [ec, rp, bp, op];
  }, [gl, scene, camera, size.width, size.height]);

  useEffect(() => composer.current?.setSize(size.width, size.height), [size]);
  useFrame(() => composer.current?.render(), 1);
  
  return (
    <primitive object={effectComposer} ref={composer}>
      <primitive object={renderPass} attach="passes-0" />
      {/* Adjusted bloom strength for light model */}
      <primitive object={bloomPass} attach="passes-1" strength={0.25} radius={0.3} threshold={0.8} />
      <primitive object={outPass} attach="passes-2" />
    </primitive>
  );
};

const SceneContent = ({ playIntro, onAnimComplete, isMuted }: { playIntro: boolean; onAnimComplete: () => void; isMuted: boolean }) => {
  const modelWrapper = useRef<THREE.Group>(null);
  const modelGroup = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 5.5;

  const gltf = useGLTF(MODEL_URL);
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  const hoverAudio = useMemo(() => {
    const audio = new Audio(HOVER_SFX);
    audio.volume = 0.4;
    return audio;
  }, []);

  useEffect(() => {
    hoverAudio.muted = isMuted;
  }, [isMuted, hoverAudio]);

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    scene.position.sub(center);
    scene.position.y = isMobile ? 0.5 : -1.1; 

    const scale = (isMobile ? 1.6 : 3.6) / (maxDim || 1);
    scene.scale.setScalar(scale);

    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
         const m = o as THREE.Mesh;
         m.castShadow = true;
         m.receiveShadow = true;
         
         const isGlowPart = m.name === "棱角球" || m.name === "棱角球1";

         const material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(isGlowPart ? "#111111" : "#e0e0e0"), // Revert to light metallic
            metalness: isGlowPart ? 1.0 : 0.9,
            roughness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            envMapIntensity: 2.0,
            flatShading: true,
            emissive: isGlowPart ? new THREE.Color("#ff0000") : new THREE.Color("#000000"),
            emissiveIntensity: isGlowPart ? 5.0 : 0.0,
         });

         material.onBeforeCompile = (shader) => {
           shader.uniforms.uRes = { value: isMobile ? 3000.0 : 5.0 };
           shader.vertexShader = `uniform float uRes;\n` + shader.vertexShader;
           shader.vertexShader = shader.vertexShader.replace(
             '#include <project_vertex>',
             `
             vec4 mvPosition = vec4( transformed, 1.0 );
             if (uRes > 0.0 && uRes < 2000.0) {
                 mvPosition.xyz = floor(mvPosition.xyz * uRes) / uRes;
             }
             mvPosition = modelViewMatrix * mvPosition;
             gl_Position = projectionMatrix * mvPosition;
             `
           );
           m.userData.shader = shader;
         };
         m.material = material;
      }
    });
  }, [scene, isMobile]);

  useEffect(() => {
    if (!playIntro) {
        if(modelGroup.current) modelGroup.current.visible = false;
        return;
    }

    const timer = setTimeout(() => {
        if(modelGroup.current) modelGroup.current.visible = true;
        if (isMobile) { onAnimComplete(); return; }

        const animObj = { val: 5.0 };
        gsap.to(animObj, {
            val: 3000.0, 
            duration: 2.5,
            ease: "expo.out",
            delay: 0.6,
            onUpdate: () => {
                scene.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh && child.userData.shader) {
                        child.userData.shader.uniforms.uRes.value = animObj.val;
                    }
                });
            },
            onComplete: onAnimComplete
        });
    }, 100);
    return () => clearTimeout(timer);
  }, [playIntro, scene, onAnimComplete, isMobile]);

  const handlePointerEnter = () => {
    if (!isMuted) {
      hoverAudio.currentTime = 0;
      hoverAudio.play().catch(() => {});
    }
    const animObj = { val: 20.0 };
    gsap.to(animObj, {
        val: 3000.0,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
            scene.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && child.userData.shader) {
                    child.userData.shader.uniforms.uRes.value = animObj.val;
                }
            });
        }
    });
  };

  useFrame((state) => {
    if (modelWrapper.current) {
        modelWrapper.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
        let targetRotY = state.mouse.x * 0.25;
        let targetRotX = -state.mouse.y * 0.25;
        modelWrapper.current.rotation.y += (targetRotY - modelWrapper.current.rotation.y) * 0.05;
        modelWrapper.current.rotation.x += (targetRotX - modelWrapper.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={modelWrapper} onPointerEnter={handlePointerEnter}>
         <group ref={modelGroup} visible={false}>
            <primitive object={scene} />
         </group>
    </group>
  );
};

interface Hero3DBaseProps {
    playIntro: boolean;
    onIntroComplete: () => void;
    isMuted: boolean;
}

const Hero3DBase: React.FC<Hero3DBaseProps> = ({ playIntro, onIntroComplete, isMuted }) => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 35 }}
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
            <Environment preset="city" />
            <SceneContent playIntro={playIntro} onAnimComplete={onIntroComplete} isMuted={isMuted} />
        </Suspense>
        <PostProcessing />
      </Canvas>
    </div>
  );
};

export default Hero3DBase;
