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

// Fix for JSX intrinsic elements by augmenting the ThreeElements interface.
// Using 'any' to avoid "Subsequent property declarations" errors caused by type mismatches with existing definitions in some versions of @react-three/fiber.
declare module '@react-three/fiber' {
  interface ThreeElements {
    effectComposer: any;
    renderPass: any;
    unrealBloomPass: any;
    outputPass: any;
  }
}

const FONT_URL = 'https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/66670969d30648d8e967997c_Sudo.ttf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vNjY2NzA5NjlkMzA2NDhkOGU5Njc5OTdjX1N1ZG8udHRmIiwiaWF0IjoxNzY4ODEzODAxLCJleHAiOjE4MDAzNDk4MDF9.PijtCC_WFtprXXLQdzWSjF0bxIu_VzmMKv3DgIbAztU';

const MODEL_URL = 'https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/untitled.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vdW50aXRsZWQuZ2xiIiwiaWF0IjoxNzY4ODMyNjYxLCJleHAiOjE4MDAzNjg2NjF9.gjbvDyyHwynXf0kHiuu4yZorozpN429-bx-nulvx39M';

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
  const modelGroup = useRef<THREE.Group>(null);
  
  const text1Ref = useRef<any>(null);
  const text2Ref = useRef<any>(null);
  
  const { viewport } = useThree();
  
  const isMobile = viewport.width < 5.5;

  const targetWidth = viewport.width * 0.92;
  const charFactor = 6.1; 
  const fontSize = targetWidth / charFactor; 

  const gap = fontSize * 0.45;
  const titleBaseY = isMobile ? -0.35 : 0;

  const layout = {
    modelPos: isMobile 
        ? [0, 0.3, 0] as [number, number, number]  
        : [0, 0, 0] as [number, number, number],
    
    text1Y: titleBaseY + gap,
    text2Y: titleBaseY - gap
  };

  const modelScale = isMobile 
    ? Math.min(3.5, viewport.width * 0.8) 
    : fontSize * 2.0;

  const gltf = useGLTF(MODEL_URL);

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
               // Fixed: Added \n after uniform declaration to prevent concatenation with preprocessor directives
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
        if(text1Ref.current) {
            text1Ref.current.position.y = layout.text1Y - 2.5; 
            text1Ref.current.fillOpacity = 0; 
        }
        if(text2Ref.current) {
            text2Ref.current.position.y = layout.text2Y - 2.5; 
            text2Ref.current.fillOpacity = 0; 
        }
        if(modelGroup.current) {
            modelGroup.current.visible = false;
        }
        return;
    }

    if(text1Ref.current && text2Ref.current) {
        const tl = gsap.timeline({ delay: 0.1 }); 

        tl.to(text1Ref.current.position, {
            y: layout.text1Y,
            duration: 1.4,
            ease: "power4.out" 
        }, 0)
        .to(text1Ref.current, {
            fillOpacity: 1,
            duration: 1.2,
            ease: "power2.out"
        }, 0);

        tl.to(text2Ref.current.position, {
            y: layout.text2Y,
            duration: 1.4,
            ease: "power4.out"
        }, 0.25)
        .to(text2Ref.current, {
            fillOpacity: 1,
            duration: 1.2,
            ease: "power2.out"
        }, 0.25);
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
    }, 800); 

    return () => clearTimeout(timer);
  }, [playIntro, onAnimComplete, layout.text1Y, layout.text2Y]);

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
        <group position={[0, titleBaseY, 0]}>
             <Text 
                ref={text1Ref}
                font={FONT_URL} 
                position={[0, gap, 0]} 
                fontSize={fontSize} 
                letterSpacing={0.05} 
                material-toneMapped={false}
                color="white"
                fillOpacity={0} 
             >
                GUOYIFENG
             </Text>

             <Text 
                ref={text2Ref}
                font={FONT_URL} 
                position={[0, -gap, 0]} 
                fontSize={fontSize} 
                letterSpacing={0.05} 
                material-toneMapped={false}
                color="white"
                fillOpacity={0} 
             >
                PORTFOLIO
             </Text>
        </group>

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
        <SceneContent playIntro={playIntro} onAnimComplete={onIntroComplete} />
        <PostProcessing />
      </Canvas>
    </div>
  );
};

export default Hero3DBase;
