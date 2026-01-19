
import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree, extend, ThreeElement } from '@react-three/fiber';
import { Environment, Text, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';

extend({ EffectComposer, RenderPass, UnrealBloomPass, OutputPass });

// Fix for JSX intrinsic elements by augmenting the ThreeElements interface from @react-three/fiber
// Using 'any' for these properties to resolve "Subsequent property declarations" errors 
// caused by type mismatches between imported classes and existing library definitions.
declare module '@react-three/fiber' {
  interface ThreeElements {
    effectComposer: any;
    renderPass: any;
    unrealBloomPass: any;
    outputPass: any;
  }
}

const FONT_URL = 'https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/66670969d30648d8e967997c_Sudo.ttf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vNjY2NzA5NjlkMzA2NDhkOGU5Njc5OTdjX1N1ZG8udHRmIiwiaWF0IjoxNzY4ODEzODAxLCJleHAiOjE4MDAzNDk4MDF9.PijtCC_WFtprXXLQdzWSjF0bxIu_VzmMKv3DgIbAztU';

const PostProcessing = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<EffectComposer>(null);
  useEffect(() => composer.current?.setSize(size.width, size.height), [size]);
  useFrame(() => composer.current?.render(), 1);
  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attach="passes-0" args={[scene, camera]} />
      <unrealBloomPass attach="passes-1" args={[new THREE.Vector2(size.width, size.height), 1.5, 0.4, 0.85]} strength={0.4} radius={0.5} threshold={1.0} />
      <outputPass attach="passes-2" />
    </effectComposer>
  );
};

const SceneContent = ({ playIntro, onIntroComplete }: { playIntro: boolean; onIntroComplete: () => void }) => {
  const modelWrapper = useRef<THREE.Group>(null);
  const titleGroup = useRef<THREE.Group>(null);
  const modelGroup = useRef<THREE.Group>(null);
  
  const { viewport } = useThree();
  
  const isMobile = viewport.width < 5.5;

  // --- 1. 动态字号算法 ---
  // 目标宽度：视口的 92%
  const targetWidth = viewport.width * 0.92;
  const charFactor = 6.1; 
  const fontSize = targetWidth / charFactor; 

  // --- 2. 布局微调 ---
  const gap = fontSize * 0.45;
  
  // 核心微调：手机端标题整体下移 -0.75 让视觉重心更稳
  // 桌面端保持居中 (0)
  const titleBaseY = isMobile ? -0.75 : 0;

  const layout = {
    // 模型位置：手机端下移到 0.3，桌面端居中
    modelPos: isMobile 
        ? [0, 0.3, 0] as [number, number, number]  
        : [0, 0, 0] as [number, number, number],

    // 文字内部相对位置 (Gap)
    text1Pos: [0, gap, 0] as [number, number, number],
    text2Pos: [0, -gap, 0] as [number, number, number]
  };

  // 模型大小：手机端放大，比例设为 0.8 宽度占比
  const modelScale = isMobile 
    ? Math.min(3.5, viewport.width * 0.8) 
    : fontSize * 2.3;

  const gltf = useGLTF('https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/untitled.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vdW50aXRsZWQuZ2xiIiwiaWF0IjoxNzY4ODMyNjYxLCJleHAiOjE4MDAzNjg2NjF9.gjbvDyyHwynXf0kHiuu4yZorozpN429-bx-nulvx39M');

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);

    gltf.scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh;
        if (m.name.includes('棱角球')) {
           m.material = new THREE.MeshStandardMaterial({
             color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.0, toneMapped: false
           });
        } else {
           const material = new THREE.MeshPhysicalMaterial({
             color: 0xeeeeee, metalness: 0.9, roughness: 0.2, envMapIntensity: 1.0
           });
           material.onBeforeCompile = (shader) => {
             shader.uniforms.uRes = { value: 80.0 }; 
             m.userData.shader = shader;
             
             // CRITICAL FIX: Add a newline \n after uniform declaration to avoid breaking shader preprocessor directives
             shader.vertexShader = `uniform float uRes;\n${shader.vertexShader}`.replace(
               '#include <project_vertex>',
               `vec4 mvPosition = vec4( transformed, 1.0 );
               if (uRes < 1000.0) { mvPosition.xyz = floor(mvPosition.xyz * uRes) / uRes; }
               mvPosition = modelViewMatrix * mvPosition;
               gl_Position = projectionMatrix * mvPosition;`
             );
           };
           m.material = material;
        }
      }
    });
  }, [gltf.scene]);

  useEffect(() => {
    if (!playIntro) {
        if(titleGroup.current) titleGroup.current.visible = false;
        if(modelGroup.current) modelGroup.current.visible = false;
        return;
    }

    if(titleGroup.current) {
        titleGroup.current.visible = true;
    }

    const timer = setTimeout(() => {
        if(modelGroup.current) {
            modelGroup.current.visible = true;
            modelGroup.current.traverse((child) => {
                if((child as THREE.Mesh).isMesh && child.userData.shader) {
                    const shader = child.userData.shader;
                    gsap.to(shader.uniforms.uRes, {
                        value: 2000.0,
                        duration: 1.8,
                        ease: "expo.out"
                    });
                }
            });
        }
        onIntroComplete();
    }, 500);

    return () => clearTimeout(timer);
  }, [playIntro, onIntroComplete]);

  useFrame((state) => {
    if (playIntro && modelWrapper.current) {
        const targetX = state.mouse.y * -0.15; 
        const targetY = state.mouse.x * 0.15;
        modelWrapper.current.rotation.x = THREE.MathUtils.lerp(modelWrapper.current.rotation.x, targetX, 0.05);
        modelWrapper.current.rotation.y = THREE.MathUtils.lerp(modelWrapper.current.rotation.y, targetY, 0.05);
    }
  });

  return (
    <>
        {/* Title Group - 应用 titleBaseY 实现微调下移 */}
        <group ref={titleGroup} visible={false} position={[0, titleBaseY, 0]}>
             <Text font={FONT_URL} position={layout.text1Pos} fontSize={fontSize} letterSpacing={0.05} material-toneMapped={false}>GUOYIFENG</Text>
             <Text font={FONT_URL} position={layout.text2Pos} fontSize={fontSize} letterSpacing={0.05} material-toneMapped={false}>PORTFOLIO</Text>
        </group>

        {/* Model Wrapper */}
        <group ref={modelWrapper}>
             <group ref={modelGroup} visible={false} position={layout.modelPos} scale={[modelScale, modelScale, modelScale]}>
                <primitive object={gltf.scene} />
             </group>
        </group>
    </>
  );
};

interface Hero3DBaseProps {
    playIntro: boolean;
    onIntroComplete: () => void;
}

const Hero3DBase: React.FC<Hero3DBaseProps> = ({ playIntro, onIntroComplete }) => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 35 }}
        gl={{ alpha: true, antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.8 }}
        dpr={[1, 2]}
      >
        <Environment preset="city" />
        <SceneContent playIntro={playIntro} onIntroComplete={onIntroComplete} />
        <PostProcessing />
      </Canvas>
    </div>
  );
};

export default Hero3DBase;
