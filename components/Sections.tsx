import React, { Suspense, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play } from 'lucide-react';
import { Canvas, useThree, useFrame, extend } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { ExperienceItem, ProjectItem } from '../types';
import { SaturnModel } from './SceneElements';
import * as THREE from 'three';

extend({ EffectComposer, RenderPass, UnrealBloomPass, OutputPass });

// --- 核心修改：更新为 HYXiangSuRuQinJ 字体 ---
const PIXEL_FONT_URL = "https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/HYXiangSuRuQinJ-2.ttf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vSFlYaWFuZ1N1UnVRaW5KLTIudHRmIiwiaWF0IjoxNzY4OTAzMDU5LCJleHAiOjIwODQyNjMwNTl9.HFFV9-TVa5bnCI-oKfb4m1xcqpXRPLdLduWtjm7sEB0";

const GlowEffect = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<EffectComposer>(null);
  
  useEffect(() => composer.current?.setSize(size.width, size.height), [size]);
  useFrame(() => composer.current?.render(), 1);

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attach="passes-0" args={[scene, camera]} />
      <unrealBloomPass 
        attach="passes-1" 
        args={[new THREE.Vector2(size.width, size.height), 1.5, 0.4, 0.85]} 
        strength={0.4} 
        radius={0.6} 
        threshold={0.8} 
      />
      <outputPass attach="passes-2" />
    </effectComposer>
  );
};

// --- 1. Experience (不变) ---
export const Experience: React.FC<{ items: ExperienceItem[] }> = ({ items }) => {
  return (
    <section className="relative pt-24 pb-4 px-[4vw] w-full max-w-[3840px] mx-auto">
        <div className="mb-20 pl-8 border-l-2 border-white/20">
            <span className="text-red-600 font-mono text-sm font-bold tracking-[0.2em] uppercase block mb-3">
                / EXPERIENCE
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-4">
                工作经历
            </h2>
            <p className="text-white/40 font-mono text-xs tracking-widest uppercase">
                Career Archive / 2012-2025
            </p>
        </div>

        <div className="space-y-12">
            {items.map((item, idx) => (
                <ExperienceRow key={idx} item={item} index={idx} />
            ))}
        </div>
    </section>
  );
};

const ExperienceRow = ({ item, index }: { item: ExperienceItem, index: number }) => {
    const parts = item.description.split('。');
    const firstSentence = parts[0] ? parts[0] + '。' : '';
    const restContent = parts.slice(1).join('。');

    return (
        <motion.div 
            className="group relative grid grid-cols-1 md:grid-cols-[1fr_2fr_4fr] gap-4 md:gap-12 py-10 border-t border-white/10 hover:border-white/30 transition-colors duration-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.1 }}
        >
            <div className="font-mono text-sm text-white/40 group-hover:text-red-600 transition-colors duration-300 pt-1">
                {item.period}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-red-600 transition-colors duration-300">
                    {item.company}
                </h3>
                <p className="text-white/50 font-light italic">{item.role}</p>
            </div>
            <div className="text-base leading-relaxed text-white/60">
                <span className="text-white font-bold block mb-3 group-hover:text-white transition-colors duration-300">
                    {firstSentence}
                </span>
                {restContent && (
                    <span className="font-light block text-justify opacity-80">
                        {restContent}
                    </span>
                )}
            </div>
        </motion.div>
    );
};

// --- 2. Marquee (不变) ---
export const Marquee: React.FC<{ items: string[] }> = ({ items }) => {
  return (
    <div className="relative w-full overflow-hidden flex py-2 bg-black border-y border-white/5">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>
      <motion.div 
        className="flex gap-12 md:gap-24 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
      >
        {[...items, ...items].map((text, i) => (
          <div key={i} className="flex items-center gap-6 group cursor-default">
             <span className="text-2xl md:text-5xl font-black text-white/20 group-hover:text-white transition-all duration-700 uppercase italic tracking-tighter">
                {text}
             </span>
             <div className="w-1.5 h-1.5 bg-red-600 rounded-full opacity-20 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// --- 3. Values (设计理念) - 像素字体 & 噪波材质 ---
const formatText = (text: string) => {
    let processed = text
        .replace(/：/g, ':')
        .replace(/，/g, ',')
        .replace(/；/g, ';')
        .replace(/。/g, '.');
    
    // 按标点分行
    const parts = processed.split(/([:;,.] )|([:;,.\n])/g).filter(Boolean).join("").split('|');
    const sentences = processed.match(/[^:;,.]*[:;,.]/g) || [processed];
    return sentences;
};

export const Values: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0.2, 0.4, 0.7, 0.9], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0.2, 0.5], [0.8, 1]);

  const topText = "我始终追求一种平衡：既要对商业数据极敏感，确保方向正确；又希望建立系统化壁垒，为伙伴留出试错空间。";
  const bottomText = "因为底层逻辑足够扎实，天马行空的创意，才能落地为打动市场的作品。";

  return (
    <section 
        ref={containerRef} 
        className="bg-black py-0 px-[4vw] relative overflow-hidden w-full h-[100vh] flex flex-col justify-center border-t border-white/10"
    >
        {/* 注入 HYPixel 字体 */}
        <style>{`
            @font-face {
                font-family: 'HYPixel';
                src: url('${PIXEL_FONT_URL}') format('truetype');
            }
        `}</style>

        {/* 3D 背景 */}
        <motion.div 
            style={{ opacity, scale }}
            className="absolute inset-0 z-0 flex items-center justify-center pointer-events-auto"
        >
            <Canvas camera={{ position: [0, 0, 8], fov: 40 }} gl={{ alpha: true, antialias: false }}>
                <Suspense fallback={null}>
                    <SaturnModel />
                </Suspense>
                <GlowEffect />
            </Canvas>
        </motion.div>

        {/* 文本层：应用 HYPixel 字体 */}
        <motion.div 
            style={{ opacity }}
            className="relative z-10 w-full h-full max-w-[1920px] mx-auto flex flex-col justify-between py-[12vh] pointer-events-none"
        >
            {/* 左上 */}
            <div className="w-full md:w-2/3 text-left">
                {formatText(topText).map((line, i) => (
                    <h3 
                        key={i} 
                        style={{ fontFamily: 'HYPixel, monospace' }}
                        className="text-[clamp(2.5rem,3.5vw,5rem)] leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-[#FFFFFF] via-[#DDDDDD] to-[#777777] mb-2"
                    >
                        {line}
                    </h3>
                ))}
            </div>

            {/* 右下 */}
            <div className="w-full md:w-2/3 self-end text-right mt-auto">
                {formatText(bottomText).map((line, i) => (
                    <h3 
                        key={i} 
                        style={{ fontFamily: 'HYPixel, monospace' }}
                        className="text-[clamp(2.5rem,3.5vw,5rem)] leading-[1.1] text-transparent bg-clip-text bg-gradient-to-tl from-[#FFFFFF] via-[#DDDDDD] to-[#777777] mb-2"
                    >
                        {line}
                    </h3>
                ))}
            </div>
        </motion.div>
    </section>
  );
};

// --- 其他组件保持不变 ---
export const SelectedWorks: React.FC<{ works: ProjectItem[], onSelect: (id: string) => void }> = ({ works, onSelect }) => {
    return (
        <section id="works" className="bg-dark text-white py-32 px-[4vw]">
            <div className="flex justify-between items-end mb-20 border-b border-white/10 pb-10">
                <div>
                    <span className="text-red-600 font-mono text-sm font-bold tracking-[0.2em] uppercase block mb-3">/ SELECTED WORKS</span>
                    <h2 className="text-5xl font-black tracking-tighter leading-none">精选案例</h2>
                </div>
                <span className="font-mono text-[10px] text-white/30 uppercase tracking-[4px] hidden md:block">Project Archive 2020-2025</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                {works.map((work) => (
                    <div key={work.id} onClick={() => onSelect(work.id)} className="group cursor-pointer relative aspect-[16/10] overflow-hidden rounded-sm bg-white/[0.03]">
                        <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-10 left-10">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter">{work.title}</h3>
                            <p className="text-accent font-mono text-[10px] tracking-[4px] uppercase mt-2">{work.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export const VisualDesign: React.FC = () => {
    return (
        <section id="visual" className="bg-dark text-white py-32 px-[4vw] border-t border-white/5">
            <div className="mb-20">
                <span className="text-red-600 font-mono text-sm font-bold tracking-[0.2em] uppercase block mb-3">/ VISUAL ARCHIVE</span>
                <h2 className="text-5xl font-black tracking-tighter">视觉实验</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square bg-white/5 group overflow-hidden relative cursor-pointer">
                        <img src={`https://picsum.photos/600/600?random=${i+200}`} className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="Design" />
                    </div>
                ))}
            </div>
        </section>
    );
};

export const Showreel: React.FC = () => {
    return (
        <section id="showreel" className="bg-dark border-t-4 border-accent w-full py-40 flex flex-col items-center">
            <div className="absolute pointer-events-none flex flex-col items-center">
                <span className="text-red-600 font-mono text-sm font-bold tracking-[0.2em] uppercase block mb-4">/ SHOWREEL</span>
                <h2 className="text-[12vw] font-black text-white/10 tracking-tighter leading-none">动态影像</h2>
            </div>
            <div className="w-full max-w-6xl aspect-video bg-white/5 flex items-center justify-center border border-white/10 group cursor-pointer relative overflow-hidden rounded-sm z-10 hover:border-accent/50 transition-colors duration-500">
                <Play size={80} className="text-accent group-hover:scale-110 transition-transform duration-500 fill-accent" />
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
        </section>
    );
};