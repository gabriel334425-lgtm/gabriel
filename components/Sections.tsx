
import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, useVelocity, useAnimationFrame, useMotionValue } from 'framer-motion';
import { Play, ChevronDown, ExternalLink, CheckCircle2, TrendingUp, Zap, Target, Mail, Phone, Maximize2, Crosshair, Hash } from 'lucide-react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { ExperienceItem } from '../types';
import { SilverBlackHole, BlackHolePostProcessing } from './SceneElements';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { CountUp, Reveal } from './UI';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
extend({ EffectComposer, RenderPass, UnrealBloomPass, OutputPass });

// Helper for Velocity Marquee
const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

// Deprecated GlowEffect, replaced by BlackHolePostProcessing in Values section
const GlowEffect = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<EffectComposer>(null);
  const [effectComposer, renderPass, bloomPass, outputPass] = useMemo(() => {
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
      <primitive object={bloomPass} attach="passes-1" strength={0.12} radius={0.3} threshold={0.8} />
      <primitive object={outputPass} attach="passes-2" />
    </primitive>
  );
};

const Figure: React.FC<{ src: string; caption: string; subCaption?: string; accentColor?: string; onClick?: () => void; layoutId?: string }> = ({ src, caption, subCaption, accentColor = "#ff0000", onClick, layoutId }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
    return (
        <div ref={ref} className="group w-full flex flex-col cursor-pointer" onClick={onClick}>
            <div className="w-full aspect-video bg-[#111] border border-white/10 relative overflow-hidden transition-all duration-700 group-hover:border-red-600/50 group-hover:shadow-[0_0_30px_rgba(255,0,0,0.15)]" style={{ borderColor: `${accentColor}40` }}>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l z-20 opacity-50 group-hover:opacity-100 transition-opacity" style={{ borderColor: accentColor }}></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r z-20 opacity-50 group-hover:opacity-100 transition-opacity" style={{ borderColor: accentColor }}></div>
                <motion.img 
                  layoutId={layoutId}
                  style={{ y }} 
                  src={src} 
                  className="absolute inset-0 w-full h-[120%] top-[-10%] object-cover transition-all duration-1000 group-hover:scale-110" 
                  alt={caption} 
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Maximize2 className="text-white drop-shadow-md" size={32} />
                </div>
            </div>
            <div className="mt-2 flex justify-between items-center bg-white/5 p-1.5 px-2 border-l-2 transition-all duration-500 group-hover:bg-red-600/10" style={{ borderColor: accentColor }}>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider block">{caption}</span>
                {subCaption && <span className="text-[9px] font-mono uppercase" style={{ color: accentColor }}>{subCaption}</span>}
            </div>
        </div>
    );
};

const TimelineNode: React.FC<{ date: string; title: string; link?: string; thumbnail: string; videoUrl?: string; onClick?: () => void; layoutId?: string }> = ({ date, title, link, thumbnail, onClick, layoutId }) => (
    <div className="relative group w-full" onClick={onClick}>
        <div className="flex flex-col gap-2">
            <motion.div whileHover={{ y: -5, scale: 1.02 }} className="w-full aspect-video bg-[#050505] border border-white/20 relative overflow-hidden group-hover:border-red-600 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-red-600/20">
                <motion.img layoutId={layoutId} src={thumbnail} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" alt={title} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition-colors duration-500"><Play size={24} className="text-red-600 opacity-80 group-hover:scale-125 transition-transform" fill="currentColor" /></div>
                <div className="absolute top-2 left-2 text-[9px] font-mono bg-black/80 px-1 text-red-600 border border-red-600/30">{date}</div>
            </motion.div>
            <h4 className="text-xs font-bold text-white group-hover:text-red-600 transition-colors truncate mt-1">{title}</h4>
        </div>
    </div>
);

const formatDescription = (desc: string) => {
    const periodIndex = desc.indexOf('。');
    if (periodIndex === -1) return desc;
    const firstSentence = desc.substring(0, periodIndex + 1);
    const rest = desc.substring(periodIndex + 1);
    return (
        <div className="flex flex-col gap-2">
            <strong className="text-white font-black tracking-wide block">{firstSentence}</strong>
            <span className="block">{rest}</span>
        </div>
    );
};

export const Experience: React.FC<{ items: ExperienceItem[] }> = ({ items }) => (
    <section className="relative pt-24 pb-12 px-[4vw] w-full max-w-[3840px] mx-auto bg-black z-10">
        <div className="mb-12 pl-6 border-l-2 border-white/20">
            <span className="text-white/40 font-mono text-xs font-bold tracking-[0.2em] uppercase block mb-2">/ EXPERIENCE</span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-2">工作经历</h2>
            <p className="text-red-600 font-mono text-[10px] tracking-widest uppercase">Career Archive / 2012-2025</p>
        </div>
        <div className="space-y-4">
            {items.map((item, idx) => (
                <Reveal key={idx} delay={idx*0.1}>
                    <motion.div whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.02)' }} className="group grid grid-cols-1 md:grid-cols-[1fr_2fr_4fr] gap-4 py-8 border-t border-white/10 hover:border-red-600/50 transition-all duration-500 px-4 -mx-4">
                        <div className="font-mono text-sm text-white/40 group-hover:text-red-600 transition-colors">{item.period}</div>
                        <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-red-600 transition-colors">{item.company}</h3>
                            <p className="text-white/50 text-sm italic">{item.role}</p>
                        </div>
                        <div className="text-sm text-white/60 leading-relaxed text-justify group-hover:text-white/80 transition-colors">
                            {formatDescription(item.description)}
                        </div>
                    </motion.div>
                </Reveal>
            ))}
        </div>
    </section>
);

export const CurvedLoop: React.FC<{ marqueeText: string; baseVelocity?: number; className?: string }> = ({ marqueeText, baseVelocity = 3, className = "" }) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  
  // Acceleration factor based on scroll speed
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  const x = useTransform(baseX, (v) => `${wrap(0, -25, v)}%`);

  const directionFactor = useRef<number>(1);
  
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000); 

    // Add velocity effect
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }
    
    // Always move left (negative) for marquee effect
    // We just want to speed up. So we add abs(velocityFactor)
    moveBy += moveBy * Math.abs(velocityFactor.get());
    
    // Force direction to be negative for standard left marquee, or use directionFactor if bi-directional wanted.
    // For this design, standard left scroll is better.
    baseX.set(baseX.get() - Math.abs(moveBy));
  });

  return (
    <div className={`relative w-full overflow-hidden flex py-10 bg-black border-y border-white/5 z-10 ${className}`}>
        <motion.div 
          className="flex whitespace-nowrap"
          style={{ x }}
        >
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-2">
                    <span className="group text-[clamp(2rem,6vw,5rem)] font-black text-white/30 hover:text-red-600 transition-all duration-500 italic uppercase tracking-tighter flex items-center">
                        {marqueeText.split('✦').map((txt, idx) => (
                            <React.Fragment key={idx}>
                                {txt.trim()}
                                {/* Always render separator after item to ensure loop continuity */}
                                <span className="mx-3 text-[0.6em] text-white/10 group-hover:text-red-600 transition-colors duration-500">✦</span>
                            </React.Fragment>
                        ))}
                    </span>
                </div>
            ))}
        </motion.div>
    </div>
  );
};

export const Values: React.FC<{ isMuted: boolean }> = ({ isMuted }) => {
    return (
        <section className="bg-transparent py-0 px-[4vw] relative overflow-hidden w-full h-[100vh] flex flex-col justify-center border-t border-white/10 z-10">
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-auto">
                <Canvas 
                    camera={{ position: [2, 6, 8], fov: 60 }} 
                    gl={{ 
                        alpha: true, 
                        antialias: false,
                        toneMapping: THREE.ACESFilmicToneMapping,
                        toneMappingExposure: 1.2
                    }}
                >
                  <Suspense fallback={null}>
                    <SilverBlackHole isMuted={isMuted} />
                  </Suspense>
                  <BlackHolePostProcessing />
                </Canvas>
            </div>
            <div className="relative z-10 w-full h-full max-w-[1920px] mx-auto flex flex-col justify-between py-[12vh] pointer-events-none">
                <div className="w-full md:w-2/3 text-left">
                    <h3 className="text-[clamp(1.8rem,3vw,3.5rem)] font-bold leading-[1.3] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 mb-2 font-sans tracking-tight">
                        我始终追求一种平衡：<br/>既要对商业数据极敏感，确保方向正确；<br/>又希望建立系统化壁垒，为品牌留出试错空间。
                    </h3>
                </div>
                <div className="w-full md:w-2/3 self-end text-right mt-auto">
                    <h3 className="text-[clamp(1.8rem,3vw,3.5rem)] font-bold leading-[1.3] text-transparent bg-clip-text bg-gradient-to-tl from-white via-white to-white/50 mb-2 font-sans tracking-tight">
                        因为底层逻辑足够扎实，<br/>天马行空的创意，<br/>才能落地为打动市场的作品。
                    </h3>
                </div>
            </div>
        </section>
    );
};

const FlagshipContent: React.FC<{ onOpenLightbox: (type: 'image' | 'video', src: string, layoutId: string) => void }> = ({ onOpenLightbox }) => {
    const accent = "#ff0000";
    // Mock video URL for demo purposes. In real app, provide actual MP4 link.
    const mockVideoUrl = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
    
    return (
        <section className="relative w-full bg-[#050505] text-white border-t border-white/10">
            <div className="w-full h-screen relative group overflow-hidden border-b border-white/10">
                <img src="https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/H75-1.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vSDc1LTEuanBnIiwiaWF0IjoxNzY4ODk5NzM2LCJleHAiOjIwODQyNTk3MzZ9.RoEErK2ORTUb0oR6gGo06_ag62wFQNBstCC_-SZsloU" className="absolute inset-0 w-full h-full object-cover opacity-80 transition-all duration-1000 group-hover:scale-110" alt="KV" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-[6vw] w-full">
                    <div className="flex items-center gap-4 mb-4"><span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 shadow-xl shadow-red-600/20">FLAGSHIP</span><span className="text-red-600 font-mono text-xs tracking-widest uppercase">NetEase Games</span></div>
                    {/* Removed entrance animation */}
                    <h1 className="text-[15vw] md:text-[12rem] font-black leading-none uppercase mb-6 tracking-tighter text-white drop-shadow-2xl">萤火突击</h1>
                    <p className="text-xl md:text-3xl font-bold text-white/90 border-l-4 pl-6" style={{ borderColor: accent }}>从0到1架构全链路市场策略</p>
                </div>
                <div className="absolute bottom-10 right-10 animate-bounce cursor-pointer hover:text-red-600 transition-colors"><ChevronDown className="w-10 h-10" /></div>
            </div>
            <div className="max-w-[1920px] mx-auto border-x border-white/10">
                <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-white/10">
                    <div className="lg:col-span-4 p-12 border-r border-white/10 flex flex-col justify-center">
                        <Reveal><span className="text-red-600 font-mono text-sm tracking-widest block mb-4 uppercase">01 / Insight</span><h2 className="text-5xl font-black uppercase mb-6">定义战场</h2><p className="text-white/60 text-sm leading-relaxed text-justify">面对红海市场，通过深度竞品分析，提炼<strong style={{ color: accent }}>“策略射击”</strong>差异化定位，反向输出直击痛点的产品 Slogan。</p></Reveal>
                    </div>
                    <div className="lg:col-span-8 p-12 bg-white/[0.01]">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 h-full items-center">
                            <Figure layoutId="flagship-img-1" onClick={() => onOpenLightbox('image', "https://picsum.photos/1200/800?random=1", "flagship-img-1")} src="https://picsum.photos/600/400?random=1" caption="竞品分析" subCaption="DATA" accentColor={accent} />
                            <Figure layoutId="flagship-img-2" onClick={() => onOpenLightbox('image', "https://picsum.photos/1200/800?random=2", "flagship-img-2")} src="https://picsum.photos/600/400?random=2" caption="SLOGAN 推导" subCaption="BRANDING" accentColor={accent} />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-white/10">
                    <div className="lg:col-span-4 p-12 border-r border-white/10 flex flex-col justify-center">
                        <Reveal><span className="text-red-600 font-mono text-sm tracking-widest block mb-4 uppercase">02 / Strategy</span><h2 className="text-5xl font-black uppercase mb-6">设计蓝图</h2><p className="text-white/60 text-sm leading-relaxed text-justify">从 0 到 1 构建<strong style={{ color: accent }}>《视觉标准库》</strong>，统一多方协作标准。规划投放节奏与素材配比模型。</p></Reveal>
                    </div>
                    <div className="lg:col-span-8 p-12">
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 h-full items-end">
                            <div className="sm:col-span-1"><Figure layoutId="flagship-img-3" onClick={() => onOpenLightbox('image', "https://picsum.photos/600/800?random=6", "flagship-img-3")} src="https://picsum.photos/600/800?random=6" caption="素材配比" accentColor={accent} /></div>
                            <div className="sm:col-span-2"><Figure layoutId="flagship-img-4" onClick={() => onOpenLightbox('image', "https://picsum.photos/1200/600?random=5", "flagship-img-4")} src="https://picsum.photos/1200/600?random=5" caption="VI 系统总览" subCaption="SYSTEM" accentColor={accent} /></div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-white/10">
                    <div className="lg:col-span-4 p-12 border-r border-white/10 flex flex-col justify-center bg-[#080808]">
                        <Reveal><span className="text-red-600 font-mono text-sm tracking-widest block mb-4 uppercase">03 / Execution</span><h2 className="text-5xl font-black uppercase mb-6">长线赋能</h2><p className="text-white/60 text-sm leading-relaxed text-justify">监修核心物料，把控品质，驱动社区生态内容。</p></Reveal>
                    </div>
                    <div className="lg:col-span-8 p-12 bg-[#080808]">
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[{t:"情报站", d:"PHASE 1"}, {t:"发布会", d:"PHASE 2"}, {t:"公测 PV", d:"PHASE 3"}, {t:"公测 CG", d:"PHASE 4"}].map((v, i) => (
                                <TimelineNode layoutId={`flagship-video-${i}`} onClick={() => onOpenLightbox('video', mockVideoUrl, `flagship-video-${i}`)} key={i} date={v.d} title={v.t} thumbnail={`https://picsum.photos/800/450?random=${20+i}`} link="#" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 bg-[#080808] border-t border-white/10">
                <div className="p-8 flex items-center justify-center bg-red-600/5">
                    <h3 className="text-lg font-black uppercase text-white tracking-widest">价值成果 <span className="text-red-600">.</span></h3>
                </div>
                {[
                    { icon: TrendingUp, label: "COMMERCIAL", val: "40W+", desc: "核心视频播放" },
                    { icon: Zap, label: "EFFICIENCY", val: "-30%", desc: "制作周期缩短" },
                    { icon: Target, label: "STRATEGY", val: "SOP", desc: "沉淀方法论" }
                ].map((s, i) => (
                    <div key={i} className="p-8 flex flex-col justify-center hover:bg-white/5 transition-all duration-500 group">
                        <div className="flex items-center gap-2 mb-1 text-red-600 group-hover:scale-110 origin-left transition-transform">
                            <s.icon size={16} />
                            <span className="font-mono text-[10px] tracking-widest uppercase">{s.label}</span>
                        </div>
                        <div className="text-3xl font-black text-white leading-none mb-1 group-hover:text-red-600 transition-colors"><CountUp value={s.val} /></div>
                        <div className="text-[11px] text-white/40 uppercase font-mono">{s.desc}</div>
                    </div>
                ))}
            </div>
            <div className="h-[15vh] bg-[#050505]"></div>
        </section>
    );
};

const CaseStudyContent: React.FC<{ title: string; subtitle: string; bgImage: string; challenge: string; strategy: string; result: string; stats?: string; themeColor: string; onOpenLightbox: (type: 'image' | 'video', src: string, layoutId: string) => void; id: string }> = ({ title, subtitle, bgImage, challenge, strategy, result, stats, themeColor, onOpenLightbox, id }) => (
    <div className="w-full min-h-screen flex flex-col bg-black border-t border-white/10 group/case">
        <div className="w-full h-[65vh] relative overflow-hidden group cursor-pointer" onClick={() => onOpenLightbox('image', bgImage, `case-study-${id}`)}>
            <motion.img layoutId={`case-study-${id}`} initial={{ scale: 1.2 }} whileInView={{ scale: 1 }} transition={{ duration: 2, ease: [0.19, 1, 0.22, 1] }} src={bgImage} className="absolute inset-0 w-full h-full object-cover opacity-100 transition-all duration-1000" alt={title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="absolute bottom-10 left-[4vw] pointer-events-none">
                <h2 className="text-[clamp(3.5rem,8vw,8rem)] font-black text-white uppercase tracking-tighter drop-shadow-xl transition-all duration-700 group-hover:translate-x-6">{title}</h2>
                <span className="font-mono text-xs tracking-[0.3em] uppercase text-black px-4 py-2 font-black inline-block shadow-xl" style={{ backgroundColor: themeColor }}>{subtitle}</span>
            </div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Maximize2 className="text-white drop-shadow-lg" size={48} />
            </div>
        </div>
        <div className="flex-1 px-[4vw] py-20 grid grid-cols-1 md:grid-cols-3 gap-16 bg-black relative z-10 border-b border-white/5">
            <Reveal><h4 className="text-xs font-black font-mono uppercase tracking-[0.4em] mb-6 flex items-center gap-3" style={{ color: themeColor }}><Crosshair size={14}/> Challenge</h4><p className="text-white/60 font-light leading-relaxed text-justify">{challenge}</p></Reveal>
            <Reveal delay={0.1}><h4 className="text-xs font-black font-mono uppercase tracking-[0.4em] mb-6 flex items-center gap-3" style={{ color: themeColor }}><Hash size={14}/> Strategy</h4><p className="text-white/60 font-light leading-relaxed text-justify">{strategy}</p></Reveal>
            <Reveal delay={0.2}>
                <motion.div whileHover={{ y: -10, backgroundColor: 'rgba(255,255,255,0.05)' }} className="p-10 border-l-4 bg-white/[0.03] transition-all duration-500 shadow-2xl" style={{ borderColor: themeColor }}>
                    <h4 className="text-xs font-black font-mono uppercase tracking-[0.4em] mb-4 flex items-center gap-3" style={{ color: themeColor }}><CheckCircle2 size={14}/> Result</h4>
                    <p className="text-2xl font-black text-white mb-2">{result}</p>
                    {stats && <div className="text-5xl font-black font-mono tracking-tighter" style={{ color: themeColor }}><CountUp value={stats} /></div>}
                </motion.div>
            </Reveal>
        </div>
    </div>
);

const CombinedFooter: React.FC<{ onOpenLightbox: (type: 'image' | 'video', src: string, layoutId: string) => void }> = ({ onOpenLightbox }) => (
    <section className="w-full bg-[#080808] border-t border-white/10">
        <div className="py-24 px-[4vw]">
            <div className="mb-16"><span className="text-white/40 font-mono text-xs font-black tracking-[0.4em] block mb-4 uppercase">/ Workflow</span><h2 className="text-5xl font-black text-white tracking-tighter uppercase">团队 SOP 与 AI 赋能</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[{t:"SLG 白皮书", r:"落地"}, {t:"视频制作 SOP", r:"提效 20%"}, {t:"MJ 培训", r:"50W+"}].map((x,i)=>(
                    <motion.div key={i} whileHover={{ y: -10, borderColor: "rgba(255,0,0,0.5)", backgroundColor: "rgba(255,0,0,0.02)" }} className="bg-[#111] p-10 border border-white/10 transition-all duration-500 group relative">
                        <div className="absolute bottom-4 right-4 text-red-600 opacity-20 group-hover:opacity-100 transition-opacity"><Zap size={40} /></div>
                        <h3 className="text-2xl font-black text-white mb-4 group-hover:text-red-600 transition-colors uppercase">{x.t}</h3>
                        <div className="text-xs font-mono text-white/30 tracking-widest">Result: <span className="text-white font-black">{x.r}</span></div>
                    </motion.div>
                ))}
            </div>
        </div>
        <div id="visual" className="py-24 px-[4vw] bg-[#020204] border-t border-white/10">
            <h2 className="text-5xl font-black text-white mb-12 tracking-tighter uppercase">视觉案例 <span className="text-red-600">.</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[...Array(8)].map((_,i)=>(
                    <div 
                        key={i} 
                        className="aspect-video bg-[#111] overflow-hidden group border border-white/5 cursor-pointer"
                        onClick={() => onOpenLightbox('image', `https://picsum.photos/1200/800?random=${800+i}`, `visual-case-${i}`)}
                    >
                        <motion.img 
                            layoutId={`visual-case-${i}`}
                            src={`https://picsum.photos/600/338?random=${800+i}`} 
                            className="w-full h-full object-cover transition-all duration-1000 scale-110 group-hover:scale-100" 
                            alt="" 
                        />
                    </div>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[75vh] border-t border-white/10 bg-black">
            <div className="relative group border-r border-white/10 overflow-hidden bg-white/5 flex items-center justify-center min-h-[500px]">
                <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?random=99')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-all duration-1000 blur-sm group-hover:blur-0 grayscale group-hover:grayscale-0"></div>
                <div className="relative z-10 text-center">
                    <motion.div whileHover={{ scale: 1.15, rotate: 90 }} whileTap={{ scale: 0.9 }} className="w-32 h-32 rounded-full border-2 border-white text-white flex items-center justify-center mb-10 hover:bg-white hover:text-black transition-all duration-700 cursor-pointer mx-auto shadow-2xl group-hover:shadow-red-600/30">
                        <Play size={48} fill="currentColor" />
                    </motion.div>
                    <h2 className="text-6xl font-black uppercase text-white tracking-[0.2em] transition-all duration-1000 group-hover:tracking-[0.4em]">Showreel</h2>
                </div>
            </div>
            <div className="flex flex-col justify-center p-[8vw]">
                <span className="text-white/40 font-mono text-xs font-black tracking-[0.5em] block mb-10 uppercase">/ Ending</span>
                <h2 className="text-[clamp(3.5rem,6vw,6rem)] font-black leading-none uppercase mb-10 text-white tracking-tighter">Thanks for<br /><span className="text-white/30 italic">Watching.</span></h2>
                <div className="space-y-8 mb-16">
                     <p className="text-white/50 font-light max-w-lg leading-relaxed text-justify italic">致力于探索美术创意与技术流程的边界。通过 AIGC 赋能与标准化管理，为品牌创造可持续的视觉价值。</p>
                    <motion.a whileHover={{ x: 10, color: '#ff0000' }} href="mailto:408179683@qq.com" className="text-3xl md:text-5xl font-black text-white transition-all block tracking-tighter uppercase">408179683@qq.com</motion.a>
                    <p className="text-2xl font-mono text-white/30 tracking-widest font-light">183-9081-0208</p>
                </div>
                <div className="mt-auto pt-16 flex justify-between items-end border-t border-white/10 opacity-70 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-mono text-white/40 tracking-[0.4em] uppercase">© 2025 Archive</p>
                    <p className="font-black uppercase text-2xl italic text-white/90 tracking-tighter">Guo Yifeng <span className="text-red-600">.</span></p>
                </div>
            </div>
        </div>
    </section>
);

interface PinnedSectionProps { id: string; index: number; children: React.ReactNode; isSticky?: boolean }
const PinnedSection: React.FC<PinnedSectionProps> = ({ id, index, children, isSticky = true }) => (
    <section id={id} className={`w-full bg-[#050505] border-t border-white/10 shadow-2xl rounded-t-[3rem] md:rounded-t-[5rem] overflow-hidden ${isSticky ? 'sticky top-0' : 'relative'}`} style={{ zIndex: 30 + index, top: isSticky ? 0 : 'auto' }}>{children}</section>
);

export const BottomDock: React.FC<{ items: { id: string; label: string }[] }> = ({ items }) => {
    const scrollTo = (id: string) => { gsap.to(window, { duration: 1.5, scrollTo: `#${id}`, ease: "expo.inOut" }); };
    return (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 p-1.5 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full shadow-2xl scale-90 md:scale-100 origin-bottom hover:scale-105 transition-all duration-500">
            {items.map((item) => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className="px-5 py-2.5 rounded-full text-[11px] font-black font-sans uppercase tracking-[0.2em] transition-all duration-500 text-white/40 hover:text-white hover:bg-white/10 active:scale-95">{item.label}</button>
            ))}
        </div>
    );
};

export const ProjectStack: React.FC<{ works: any[]; onOpenLightbox: (type: 'image' | 'video', src: string, layoutId: string) => void }> = ({ works, onOpenLightbox }) => {
    const navItems = [{ id: 'flagship', label: '萤火' }, { id: 'stzb', label: '率土' }, { id: 'racing', label: '巅峰' }, { id: 'knives', label: '荒野' }, { id: 'combined-footer', label: '更多' }];
    return (
        <div className="relative w-full bg-black pb-[20vh]">
            <div id="flagship" className="relative z-30"><FlagshipContent onOpenLightbox={onOpenLightbox} /></div>
            <div id="works" className="relative">
                <PinnedSection id="stzb" index={1}><CaseStudyContent id="stzb" onOpenLightbox={onOpenLightbox} themeColor="#a73a3a" title="率土之滨" subtitle="Case A" bgImage="https://picsum.photos/1920/1080?random=101" challenge="如何突破圈层固化？" strategy="文旅内容营销策略。" result="流水增长" stats="+150%" /></PinnedSection>
                <PinnedSection id="racing" index={2}><CaseStudyContent id="racing" onOpenLightbox={onOpenLightbox} themeColor="#ff2e00" title="巅峰极速" subtitle="Case B" bgImage="https://picsum.photos/1920/1080?random=102" challenge="如何制造S级声量？" strategy="创意降本+技术降本。" result="抖音热榜" stats="Top 51" /></PinnedSection>
                <PinnedSection id="knives" index={3}><CaseStudyContent id="knives" onOpenLightbox={onOpenLightbox} themeColor="#2952ff" title="荒野行动" subtitle="Case C" bgImage="https://picsum.photos/1920/1080?random=103" challenge="赛事视觉重塑。" strategy="建立完整VI系统。" result="资产复用" stats="VI Sys" /></PinnedSection>
            </div>
            <PinnedSection id="combined-footer" index={4} isSticky={false}><CombinedFooter onOpenLightbox={onOpenLightbox} /><BottomDock items={navItems} /></PinnedSection>
        </div>
    );
};
