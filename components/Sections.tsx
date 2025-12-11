import React, { Component, ReactNode, Suspense, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Float, Center } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Play, ArrowUpRight, ArrowRight, ArrowDown } from 'lucide-react';
import { ExperienceItem, ProjectItem } from '../types';
import { MagnetScene, ParticleBackground } from './SceneElements';

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("3D Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <span className="text-gray-600 text-[10px] font-mono tracking-widest opacity-50">3D MODEL LOAD ERROR</span>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- GLB Model Component ---
const MODEL_URL = "https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/untitled.glb?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vdW50aXRsZWQuZ2xiIiwiaWF0IjoxNzY1Mjg0Njk1LCJleHAiOjE3OTY4MjA2OTV9.WTrAYwojQ6Umf_mOZ7rycadbhN0y6qzxXsTKiQO9BFI";

const HeroModel = () => {
  const { scene } = useGLTF(MODEL_URL);
  const groupRef = useRef<THREE.Group>(null);

  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        if (m.name.includes('棱角球')) {
             m.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#ffffff'),
                emissive: new THREE.Color('#ffffff'),
                emissiveIntensity: 5,
                toneMapped: false,
                wireframe: false
             });
        } else {
             m.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#aa0000'),
                metalness: 0.9,
                roughness: 0.2,
                side: THREE.DoubleSide
             });
        }
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (groupRef.current) {
        const MAX_ROTATION = THREE.MathUtils.degToRad(15);
        const targetRotX = -state.mouse.y * MAX_ROTATION; 
        const targetRotY = state.mouse.x * MAX_ROTATION;
        
        groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.1;
        groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
        <Center>
            <primitive object={scene} scale={2.5} />
        </Center>
    </group>
  );
};

// --- Hero Section ---
const InteractiveWord: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex justify-center w-full" data-cursor="link">
      {text.split('').map((char, i) => (
        <span 
          key={i} 
          className="inline-block transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-accent hover:font-thin hover:scale-110 hover:-translate-y-2 cursor-default text-white font-black tracking-tight"
        >
          {char}
        </span>
      ))}
    </div>
);

export const Hero: React.FC = () => {
  return (
    <section id="profile" className="relative h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden">
      <ParticleBackground />

      {/* Background Text */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0 opacity-40"
        style={{ fontFamily: "'Six Caps', sans-serif" }}
      >
          <div className="w-full text-center flex flex-col items-center justify-center">
             <span className="block text-[38vw] text-white/5 leading-[0.85] tracking-[-0.05em]">GUOYIFENG</span>
             <span className="block text-[38vw] text-white/5 leading-[0.85] tracking-[-0.05em]">PORTFOLIO</span>
          </div>
      </div>

      {/* 3D Scene */}
      <div className="absolute inset-0 z-10" data-cursor="model">
         <ErrorBoundary>
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ alpha: true, antialias: true }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} intensity={2} />
                    <Environment preset="city" />
                    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
                        <HeroModel />
                    </Float>
                </Suspense>
            </Canvas>
         </ErrorBoundary>
      </div>
      
      {/* Foreground Typography - Reduced size per request */}
      <div className="relative z-20 w-full max-w-[1920px] px-6 h-full flex flex-col justify-center pointer-events-none">
          
          <div className="pointer-events-auto mix-blend-difference text-white flex flex-col items-center gap-0">
            <div className="text-[12vw] md:text-[9rem] lg:text-[11rem] leading-[0.85] font-black tracking-tighter">
                <InteractiveWord text="GUOYIFENG" />
            </div>
            <div className="text-[12vw] md:text-[9rem] lg:text-[11rem] leading-[0.85] font-black tracking-tighter">
                <InteractiveWord text="PORTFOLIO" />
            </div>
          </div>

          {/* Intro Text */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-12 left-6 md:left-12 max-w-sm pointer-events-auto"
          >
              <div className="text-accent font-bold text-xs mb-4 tracking-widest flex items-center gap-3">
                  <div className="h-[2px] w-8 bg-accent"></div>
                  <span>[ 简介 / PROFILE ]</span>
              </div>
              <p className="text-gray-300 text-sm md:text-base font-light leading-relaxed">
                  <span className="block mb-2 text-white font-bold text-lg">10年创意美术实战经验。</span>
                  从4A美术指导到网易市场中心创意核心成员，致力于以创意设计解决商业问题。
              </p>
          </motion.div>

          {/* Scroll Hint - Bottom Right */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="absolute bottom-12 right-6 md:right-12 pointer-events-auto flex flex-col items-center gap-2"
          >
               <span className="text-xs font-mono tracking-widest text-gray-500 uppercase writing-vertical-rl">SCROLL</span>
               <ArrowDown className="text-accent animate-bounce" size={20} />
          </motion.div>
      </div>
    </section>
  );
};

// --- Experience Section ---
export const Experience: React.FC<{ items: ExperienceItem[] }> = ({ items }) => {
  return (
    <section id="experience" className="bg-white text-dark w-full py-24">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-4 px-6 md:px-12 lg:px-24 gap-6 lg:gap-12">
        
        {/* Header Column */}
        <div className="lg:col-span-1 relative flex flex-col">
            <div className="lg:sticky lg:top-32 w-full">
                <span className="text-accent text-xs font-mono tracking-widest block mb-4">01 / EXPERIENCES</span>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8">工作<br/>经历</h2>
                {/* 3D Scene - Interaction Area: Square, Transparent, Full Width */}
                <div className="w-full aspect-square relative bg-transparent mt-4" data-cursor="model">
                    <Canvas gl={{ alpha: true }}>
                        <MagnetScene />
                    </Canvas>
                </div>
            </div>
        </div>

        {/* Content Columns - Tightened Grid */}
        <div className="lg:col-span-3 mt-12 lg:mt-0">
            {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 mb-12 last:mb-0 group" data-cursor="link">
                    {/* Date Column - Narrower (2 cols instead of 3 or 4) */}
                    <div className="md:col-span-2 pt-2 text-gray-400 font-mono text-sm">
                        {item.period}
                    </div>
                    {/* Content Column - Wider (10 cols), reduced gap */}
                    <div className="md:col-span-10 pl-0 md:pl-4">
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">{item.company}</h3>
                        <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">{item.role}</p>
                        <p className="text-gray-600 leading-relaxed text-sm md:text-base font-light">{item.description}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

// --- Values Section ---
export const Values: React.FC = () => {
    const values = [
        { 
            title: "全案操盘与策略落地", 
            enTitle: "Strategy & Execution",
            desc: "具备从0-1产品定位推导到1-N长线运营的全链路操盘经验。能够深度介入研发前端制定GTM策略，精准把控营销节奏与预算分配。" 
        },
        { 
            title: "商业导向的视觉把控", 
            enTitle: "Art Direction",
            desc: "设计科班出身，具备极高的商业美学标准。擅长将抽象策略转化为具象的视觉语言，从0到1构建高辨识度的品牌视觉壁垒。" 
        },
        { 
            title: "效能体系与AIGC革新", 
            enTitle: "AI Workflow & Efficiency",
            desc: "擅长构建标准化产出SOP与引入前沿AIGC工作流。通过工具革新与流程优化，解决传统产能瓶颈，提升团队综合人效。" 
        }
    ];

    return (
        <section id="value" className="bg-dark text-white border-t border-white/5 py-24">
             <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-0">
                    
                    {/* Header */}
                    <div className="lg:col-span-1 pr-12">
                        <span className="text-accent text-xs font-mono tracking-widest block mb-4">02 / CORE VALUES</span>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter">核心<br/>能力</h2>
                    </div>

                    {/* Grid Items */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-12">
                        {values.map((v, i) => (
                            <div key={i} className="group relative" data-cursor="link">
                                <div className="absolute -top-6 left-0 text-white/10 text-6xl font-black z-0">0{i+1}</div>
                                <div className="relative z-10 pt-8">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{v.title}</h3>
                                    <p className="text-xs text-gray-500 font-mono mb-6">{v.enTitle}</p>
                                    <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        </section>
    );
};

// --- Works Section ---
export const SelectedWorks: React.FC<{ works: ProjectItem[], onSelect: (id: string) => void }> = ({ works, onSelect }) => {
    return (
        <section id="works" className="bg-darklighter text-white border-t border-white/5 py-24">
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 pb-8 border-b border-white/10">
                    <div>
                        <span className="text-accent text-xs font-mono tracking-widest block mb-4">03 / SELECTED WORKS</span>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter">精选项目</h2>
                    </div>
                    <div className="mt-8 md:mt-0">
                         <p className="text-gray-500 font-mono text-xs text-right">NETEASE GAMES<br/>2020-2025</p>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {works.map((work) => (
                        <div 
                            key={work.id} 
                            onClick={() => onSelect(work.id)}
                            className="group cursor-pointer relative aspect-[16/10] overflow-hidden rounded-sm"
                            data-cursor="link"
                        >
                            <img 
                                src={work.imageUrl} 
                                alt={work.title} 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" 
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            
                            <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end">
                                <div>
                                    <h3 className="text-3xl font-bold text-white mb-2">{work.title}</h3>
                                    <p className="text-gray-400 text-sm font-mono">{work.subtitle}</p>
                                </div>
                                <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-colors">
                                    <ArrowUpRight size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// --- Marquee Section ---
export const Marquee: React.FC = () => {
    const games = [
        "阴阳师IP", "哈利波特：魔法觉醒", "暗黑破坏神：不朽", "一梦江湖2", "天下3", 
        "大话西游", "梦幻西游", "燕云十六声", "明日之后", "七日世界", 
        "荒野行动", "萤火突击", "巅峰极速", "漫威争锋"
    ];

    return (
        <div className="bg-accent border-y border-accent py-6 overflow-hidden relative z-10">
             <div className="flex whitespace-nowrap gap-12 animate-marquee items-center">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center gap-12">
                        {games.map((game, idx) => (
                            <React.Fragment key={`${i}-${idx}`}>
                                <span className="text-white font-black text-2xl tracking-tighter">{game}</span>
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </React.Fragment>
                        ))}
                    </div>
                ))}
             </div>
        </div>
    )
}

// --- Visual Design Section ---
export const VisualDesign: React.FC = () => {
    return (
        <section id="gallery" className="bg-white text-dark w-full py-24">
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-0">
                    <div className="lg:col-span-1 pr-12">
                        <span className="text-accent text-xs font-mono tracking-widest block mb-4">04 / ARCHIVE</span>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8">视觉<br/>平面</h2>
                        <button className="text-xs font-bold border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors uppercase tracking-widest" data-cursor="link">
                            View All
                        </button>
                    </div>
                    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-100 relative group overflow-hidden cursor-pointer" data-cursor="link">
                                <img 
                                    src={`https://placehold.co/600x600/eeeeee/333?text=Design+${i+1}`}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                    alt="Visual"
                                />
                                <div className="absolute inset-0 bg-accent/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <ArrowRight className="text-white w-8 h-8" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// --- Showreel Section ---
export const Showreel: React.FC = () => {
    return (
        <section id="video" className="bg-dark border-t-4 border-accent" data-cursor="video">
            <div className="w-full aspect-video relative group cursor-pointer overflow-hidden">
                 <img 
                    src="https://placehold.co/1920x1080/111/666?text=PLAY+SHOWREEL" 
                    alt="Video Cover" 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition duration-500" 
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">SHOWREEL 2025</h2>
                </div>
            </div>
        </section>
    );
}