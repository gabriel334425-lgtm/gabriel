import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree, extend, Object3DNode } from '@react-three/fiber';
import { Environment, Text, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';

extend({ EffectComposer, RenderPass, UnrealBloomPass, OutputPass });

declare module '@react-three/fiber' {
  interface ThreeElements {
    effectComposer: Object3DNode<EffectComposer, typeof EffectComposer>;
    renderPass: Object3DNode<RenderPass, typeof RenderPass>;
    unrealBloomPass: Object3DNode<UnrealBloomPass, typeof UnrealBloomPass>;
    outputPass: Object3DNode<OutputPass, typeof OutputPass>;
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

const SceneContent = ({ playIntro, onAnimComplete }: { playIntro: boolean; onAnimComplete: () => void }) => {
  const modelWrapper = useRef<THREE.Group>(null);
  const titleGroup = useRef<THREE.Group>(null);
  const modelGroup = useRef<THREE.Group>(null);
  
  const { viewport } = useThree();

  // --- 核心适配算法 V2 (Visual Alignment Fix) ---
  
  // 1. 目标宽度：UI padding 为 4vw，内容区占 92%。
  // 但考虑到透视关系(FOV 35)，边缘可能会有视差，我们稍微设大一点点目标让它视觉上"顶"到边
  const targetContentWidth = viewport.width * 0.94; 

  // 2. 字宽系数 (Char Factor)
  // 之前是 7.2 (太小)，现在调整为 6.4
  // 系数越小 -> 单个字越大 -> 总宽度越宽 -> 撑满屏幕
  const charFactor = 6.4; 
  
  let fontSize = targetContentWidth / charFactor;

  // 3. 最大字号限制
  // 稍微放开限制，让大屏下更有冲击力
  fontSize = Math.min(fontSize, 3.0); 

  // 4. 动态行间距 & 模型大小
  // 保持比例：行间距为字号的 0.42 倍
  const gap = fontSize * 0.42;
  // 模型大小：保持为字号的 2.2 倍，确保填满中间空隙
  const modelScale = fontSize * 2.2; 

  const gltf = useGLTF('https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/untitled.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vdW50aXRsZWQuZ2xiIiwiaWF0IjoxNzY4ODM0MzQ5LCJleHAiOjE4MDAzNzAzNDl9.hjXXSXbsC2LImfa9gfahkP8-kPN_-e5KDYb2rxGQXo8');

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
        onAnimComplete();
    }, 500);

    return () => clearTimeout(timer);
  }, [playIntro, onAnimComplete]);

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
        <group ref={titleGroup} visible={false}>
             <Text font={FONT_URL} position={[0, gap, 0]} fontSize={fontSize} letterSpacing={0.05} material-toneMapped={false}>GUOYIFENG</Text>
             <Text font={FONT_URL} position={[0, -gap, 0]} fontSize={fontSize} letterSpacing={0.05} material-toneMapped={false}>PORTFOLIO</Text>
        </group>

        <group ref={modelWrapper}>
             <group ref={modelGroup} visible={false} scale={[modelScale, modelScale, modelScale]}>
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
        <SceneContent playIntro={playIntro} onAnimComplete={onIntroComplete} />
        <PostProcessing />
      </Canvas>
    </div>
  );
};

export default Hero3DBase;