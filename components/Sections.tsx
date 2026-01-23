import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react';
import { Play, ArrowRight, ChevronDown, MonitorPlay, ExternalLink, ArrowDown, CheckCircle2, TrendingUp, Zap, Target, Mail, Phone, Maximize2, Crosshair, Hash } from 'lucide-react';
import { Canvas, useThree, useFrame, extend } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { ExperienceItem } from '../types';
import { SaturnModel } from './SceneElements';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { motion, useScroll, useTransform } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
extend({ EffectComposer, RenderPass, UnrealBloomPass, OutputPass });

// 萤火突击核心色
const ACCENT_GREEN = "#c3ff42";
const PIXEL_FONT_URL = "https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/HYXiangSuRuQinJ-2.ttf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vSFlYaWFuZ1N1UnVRaW5KLTIudHRmIiwiaWF0IjoxNzY4OTAzMDU5LCJleHAiOjIwODQyNjMwNTl9.HFFV9-TVa5bnCI-oKfb4m1xcqpXRPLdLduWtjm7sEB0";

const GlowEffect = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<EffectComposer>(null);

  const bloomPass = useMemo(() => {
    const pass = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 1.5, 0.4, 0.85);
    pass.strength = 0.4;
    pass.radius = 0.6;
    pass.threshold = 0.8;
    return pass;
  }, [size.width, size.height]);

  const outPass = useMemo(() => new OutputPass(), []);

  useEffect(() => {
    if (composer.current) {
      composer.current.setSize(size.width, size.height);
    }
  }, [size]);

  useFrame(() => {
    if (composer.current) {
      composer.current.render();
    }
  }, 1);

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attach="passes-0" args={[scene, camera]} />
      <primitive object={bloomPass} attach="passes-1" />
      <primitive object={outPass} attach="passes-2" />
    </effectComposer>
  );
};

// --- Experience ---
export const Experience: React.FC<{ items: ExperienceItem[] }> = ({ items }) => {
  return (
    <section className="relative pt-24 pb-12 px-[4vw] w-full max-w-[3840px] mx-auto bg-black z-10">
        <div className="mb-12 pl-6 border-l-2 border-white/20">
            <span className="text-white/40 font-mono text-xs font-bold tracking-[0.2em] uppercase block mb-2">/ EXPERIENCE</span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-2">工作经历</h2>
            <p className="text-[#c3ff42] font-mono text-[10px] tracking-widest uppercase">Career Archive / 2012-2025</p>
        </div>
        <div className="space-y-8">
            {items.map((item, idx) => (<ExperienceRow key={idx} item={item} index={idx} />))}
        </div>
    </section>
  );
};

const ExperienceRow = ({ item, index }: { item: ExperienceItem, index: number }) => {
    const parts = item.description.split('。');
    const firstSentence = parts[0] ? parts[0] + '。' : '';
    const restContent = parts.slice(1).join('。');
    return (
        <motion.div className="group relative grid grid-cols-1 md:grid-cols-[1fr_2fr_4fr] gap-4 md:gap-8 py-8 border-t border-white/10 hover:border-[#c3ff42]/50 transition-colors duration-300" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: index * 0.1 }}>
            <div className="font-mono text-sm text-white/40 group-hover:text-[#c3ff42] transition-colors duration-300 pt-1">{item.period}</div>
            <div><h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#c3ff42] transition-colors duration-300">{item.company}</h3><p className="text-white/50 font-light italic text-sm">{item.role}</p></div>
            <div className="text-sm leading-relaxed text-white/60"><span className="text-white font-bold block mb-2 group-hover:text-white transition-colors duration-300">{firstSentence}</span>{restContent && (<span className="font-light block text-justify opacity-80">{restContent}</span>)}</div>
        </motion.div>
    );
};

// --- Marquee ---
export const Marquee: React.FC<{ items: string[] }> = ({ items }) => {
  return (
    <div className="relative w-full overflow-hidden flex py-2 bg-black border-y border-white/5 z-10">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>
      <motion.div className="flex gap-12 md:gap-24 whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, ease: "linear", duration: 30 }}>
        {[...items, ...items].map((text, i) => (
          <div key={i} className="flex items-center gap-6 group cursor-default"><span className="text-2xl md:text-4xl font-black text-white/20 group-hover:text-[#c3ff42] transition-all duration-700 uppercase italic tracking-tighter">{text}</span><div className="w-1.5 h-1.5 bg-[#c3ff42] rounded-full opacity-20 group-hover:opacity-100 transition-opacity"></div></div>
        ))}
      </motion.div>
    </div>
  );
};

const formatText = (text: string) => {
    let processed = text.replace(/：/g, ':').replace(/，/g, ',').replace(/；/g, ';').replace(/。/g, '.');
    const sentences = processed.match(/[^:;,.]*[:;,.]/g) || [processed];
    return sentences;
};

export const Values: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0.2, 0.4, 0.7, 0.9], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0.2, 0.5], [0.8, 1]);
  const topText = "我始终追求一种平衡：既要对商业数据极敏感，确保方向正确；又希望建立系统化壁垒，为伙伴留出试错空间。";
  const bottomText = "因为底层逻辑足够扎实，天马行空的创意，才能落地为打动市场的作品。";

  return (
    <section ref={containerRef} className="bg-black py-0 px-[4vw] relative overflow-hidden w-full h-[100vh] flex flex-col justify-center border-t border-white/10 z-10">
        <style>{`@font-face { font-family: 'HYPixel'; src: url('${PIXEL_FONT_URL}') format('truetype'); }`}</style>
        <motion.div style={{ opacity, scale }} className="absolute inset-0 z-0 flex items-center justify-center pointer-events-auto">
            <Canvas camera={{ position: [0, 0, 8], fov: 40 }} gl={{ alpha: true, antialias: false }}>
              <Suspense fallback={null}>
                <SaturnModel />
              </Suspense>
              <GlowEffect />
            </Canvas>
        </motion.div>
        <motion.div style={{ opacity }} className="relative z-10 w-full h-full max-w-[1920px] mx-auto flex flex-col justify-between py-[12vh] pointer-events-none">
            <div className="w-full md:w-2/3 text-left">{formatText(topText).map((line, i) => (<h3 key={i} style={{ fontFamily: 'HYPixel, monospace' }} className="text-[clamp(2.5rem,3.5vw,5rem)] leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-[#FFFFFF] via-[#DDDDDD] to-[#777777] mb-2">{line}</h3>))}</div>
            <div className="w-full md:w-2/3 self-end text-right mt-auto">{formatText(bottomText).map((line, i) => (<h3 key={i} style={{ fontFamily: 'HYPixel, monospace' }} className="text-[clamp(2.5rem,3.5vw,5rem)] leading-[1.1] text-transparent bg-clip-text bg-gradient-to-tl from-[#FFFFFF] via-[#DDDDDD] to-[#777777] mb-2">{line}</h3>))}</div>
        </motion.div>
    </section>
  );
};

// --- 辅助组件：带标题的图片框 (统一 16:9) ---
const Figure: React.FC<{ src: string; caption: string; subCaption?: string }> = ({ src, caption, subCaption }) => (
    <div className="group w-full flex flex-col">
        <div className="w-full aspect-video bg-[#111] border border-white/10 relative overflow-hidden rounded-none group-hover:border-[#c3ff42]/50 transition-colors">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#c3ff42] z-20 opacity-50 group-hover:opacity-100"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#c3ff42] z-20 opacity-50 group-hover:opacity-100"></div>
            
            <div className="w-full h-full relative overflow-hidden">
                <img src={src} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0" alt={caption} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(195,255,66,0.06),rgba(195,255,66,0.02),rgba(195,255,66,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity"></div>
            </div>
        </div>
        <div className="mt-2 flex justify-between items-center bg-white/5 p-1.5 px-2 border-l-2 border-[#c3ff42]">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider block">{caption}</span>
            {subCaption && <span className="text-[9px] font-mono text-[#c3ff42] uppercase">{subCaption}</span>}
        </div>
    </div>
);

// --- 辅助组件：视频时间线节点 ---
const TimelineNode: React.FC<{ date: string; title: string; link: string; thumbnail: string; index: number }> = ({ date, title, link, thumbnail, index }) => (
    <div className="relative pl-6 pb-6 border-l border-white/10 group last:pb-0">
        <div className="absolute left-[-3px] top-2 w-1.5 h-1.5 bg-[#c3ff42] rounded-full shadow-[0_0_10px_#c3ff42] z-10"></div>
        <div className="flex flex-col gap-2">
            <span className="font-mono text-[9px] text-[#c3ff42]/80 tracking-widest">{date}</span>
            <a href={link} target="_blank" rel="noopener noreferrer" className="block w-full">
                <div className="w-full aspect-video bg-[#050505] border border-white/20 relative overflow-hidden group-hover:border-[#c3ff42] transition-colors">
                    <img src={thumbnail} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" alt={title} />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition-colors">
                        <Play size={24} className="text-[#c3ff42] opacity-80 group-hover:scale-110 transition-transform" fill="currentColor" />
                    </div>
                    <div className="absolute top-2 right-2 text-[9px] font-mono text-white/50 bg-black/80 px-1">REC</div>
                </div>
                <div className="mt-1.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#c3ff42] transition-colors truncate">{title}</h4>
                </div>
            </a>
        </div>
    </div>
);

// --- 1. 旗舰案例：萤火突击 ---
const FlagshipContent = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const handleMouseEnter = () => videoRef.current?.play();
    const handleMouseLeave = () => { if(videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } }

    return (
        <div className="w-full min-h-screen flex flex-col relative bg-[#050505]">
            <div className="w-full h-screen relative group cursor-pointer overflow-hidden flex-shrink-0" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <img src="https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/H75-1.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vSDc1LTEuanBnIiwiaWF0IjoxNzY4ODk5NzM2LCJleHAiOjIwODQyNTk3MzZ9.RoEErK2ORTUb0oR6gGo06_ag62wFQNBstCC_-SZsloU" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" alt="Lost Light" />
                <video ref={videoRef} src="https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/LL_Head_KV.mp4" muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"></div>
                
                <div className="absolute top-0 left-0 w-full h-full px-[4vw] py-[6vh] flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-start">
                        <div className="text-white/50 font-mono text-[10px] tracking-[0.4em] uppercase">FLAGSHIP CASE</div>
                        <div className="text-[#c3ff42] font-mono text-[10px] tracking-[0.2em] uppercase hidden md:block border border-[#c3ff42] px-2 py-1 rounded-full">NETEASE GAMES</div>
                    </div>
                    <div>
                        <h1 className="text-[clamp(4rem,10vw,12rem)] font-black text-white leading-[0.8] tracking-tighter uppercase mb-6 drop-shadow-2xl">萤火突击</h1>
                        <div className="flex flex-col md:flex-row md:items-end gap-6 border-l-4 border-[#c3ff42] pl-6">
                            <p className="text-xl md:text-2xl text-white/90 font-bold max-w-xl leading-tight">从0到1架构全链路市场策略</p>
                            <div className="flex gap-4 text-[10px] font-mono text-[#c3ff42] uppercase tracking-wider">
                                <span>STRATEGY</span><span>//</span><span>LAUNCH</span><span>//</span><span>OPERATION</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-8 right-8 animate-bounce"><ChevronDown className="text-[#c3ff42] w-6 h-6" /></div>
            </div>

            <div className="w-full text-white px-[4vw] py-12 z-10 relative bg-[#050505]">
                <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-0">
                    <div className="flex items-center gap-4"><div className="w-2 h-2 bg-[#c3ff42]"></div><h3 className="text-lg font-bold">创意负责人</h3></div>
                    <p className="text-white/30 font-mono text-[10px]">ROLE: CREATIVE DIRECTOR</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 border-l border-white/10 border-b border-white/10">
                    <div className="lg:col-span-4 border-r border-white/10 p-8 flex flex-col gap-6">
                        <div>
                            <span className="text-[#c3ff42] font-mono text-[10px] tracking-widest block mb-2">01 / INSIGHT</span>
                            <h3 className="text-2xl font-black uppercase mb-3">定义战场</h3>
                            <p className="text-white/60 text-sm leading-relaxed text-justify">
                                面对红海市场，通过深度竞品分析，提炼<strong className="text-white">“策略射击”</strong>差异化定位，反向输出直击痛点的产品 Slogan。
                            </p>
                        </div>
                        <div className="space-y-6 flex-1">
                            <Figure src="https://picsum.photos/600/338?random=1" caption="竞品差异化分析" subCaption="DATA CHART" />
                            <Figure src="https://picsum.photos/600/338?random=2" caption="Slogan 演变推导" subCaption="BRANDING" />
                        </div>
                    </div>

                    <div className="lg:col-span-5 border-r border-white/10 p-8 flex flex-col gap-6 bg-white/[0.01]">
                        <div>
                            <span className="text-[#c3ff42] font-mono text-[10px] tracking-widest block mb-2">02 / STRATEGY</span>
                            <h3 className="text-2xl font-black uppercase mb-3">设计蓝图</h3>
                            <p className="text-white/60 text-sm leading-relaxed text-justify">
                                从 0 到 1 构建<strong className="text-white">《视觉标准库》</strong>，统一多方协作标准。规划投放节奏与素材配比模型。
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Figure src="https://picsum.photos/1200/675?random=5" caption="视觉标准库总览" subCaption="VI SYSTEM" />
                            </div>
                            <div className="col-span-1">
                                <Figure src="https://picsum.photos/600/338?random=6" caption="素材配比" subCaption="MATRIX" />
                            </div>
                            <div className="col-span-1">
                                <Figure src="https://picsum.photos/600/338?random=7" caption="协作流程" subCaption="WORKFLOW" />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 border-r border-white/10 p-6 flex flex-col gap-6 bg-[#080808]">
                        <div>
                            <span className="text-[#c3ff42] font-mono text-[10px] tracking-widest block mb-2">03 / EXECUTION</span>
                            <h3 className="text-2xl font-black uppercase mb-3">长线赋能</h3>
                            <p className="text-white/60 text-xs leading-relaxed mb-4">
                                监修核心物料，驱动社区生态。
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <TimelineNode index={1} date="PHASE 1" title="萤火情报站" thumbnail="https://picsum.photos/800/450?random=20" link="https://www.bilibili.com/video/BV1At421a7s1" />
                            <TimelineNode index={2} date="PHASE 2" title="520 发布会" thumbnail="https://picsum.photos/800/450?random=21" link="https://www.bilibili.com/video/BV1Si421U7BF" />
                            <TimelineNode index={3} date="PHASE 3" title="公测 PV" thumbnail="https://picsum.photos/800/450?random=22" link="https://www.bilibili.com/video/BV1LS411c7co" />
                            <TimelineNode index={4} date="PHASE 4" title="公测 CG" thumbnail="https://picsum.photos/800/450?random=23" link="https://www.bilibili.com/video/BV1ti421U7bL" />
                        </div>
                    </div>
                </div>

                <div className="border border-t-0 border-white/10 bg-[#080808] grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
                    <div className="p-6 flex items-center justify-center bg-[#c3ff42]/10">
                        <h3 className="text-lg font-black uppercase text-white">价值成果 <span className="text-[#c3ff42]">.</span></h3>
                    </div>
                    {[
                        { icon: TrendingUp, label: "COMMERCIAL", val: "40W+", desc: "核心视频播放" },
                        { icon: Zap, label: "EFFICIENCY", val: "-30%", desc: "制作周期缩短" },
                        { icon: Target, label: "STRATEGY", val: "SOP", desc: "沉淀方法论" }
                    ].map((s, i) => (
                        <div key={i} className="p-6 flex flex-col justify-center hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-2 mb-1 text-[#c3ff42]">
                                <s.icon size={14} />
                                <span className="font-mono text-[9px] tracking-widest">{s.label}</span>
                            </div>
                            <div className="text-2xl font-bold text-white leading-none mb-1">{s.val}</div>
                            <div className="text-[10px] text-white/40">{s.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="h-[20vh] bg-[#050505]"></div>
        </div>
    );
};

// 2. 通用案例卡片
const CaseStudyContent: React.FC<{ 
    title: string; subtitle: string; bgImage: string; 
    challenge: string; strategy: string; result: string; stats?: string;
}> = ({ title, subtitle, bgImage, challenge, strategy, result, stats }) => {
    return (
        <div className="w-full h-screen relative flex flex-col lg:flex-row bg-[#050505] overflow-hidden">
            <div className="w-full lg:w-[60%] h-[40vh] lg:h-full relative group border-r border-white/10 overflow-hidden bg-[#111] flex items-center justify-center">
                <img src={bgImage} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-110" alt="" />
                <div className="w-[90%] aspect-video relative shadow-2xl border border-white/20 group-hover:border-[#c3ff42] transition-colors z-10">
                    <img src={bgImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={title} />
                    <div className="absolute bottom-4 left-4">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg">{title}</h2>
                        <span className="text-[#c3ff42] font-mono text-[10px] tracking-widest uppercase">{subtitle}</span>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-[40%] h-full bg-[#050505] flex flex-col justify-center p-12 relative z-10">
                <div className="space-y-10">
                    <div>
                        <h4 className="text-[10px] font-bold text-[#c3ff42] font-mono uppercase tracking-widest mb-3 flex items-center gap-2"><Crosshair size={12}/> Challenge</h4>
                        <p className="text-sm text-white/80 leading-relaxed font-light text-justify border-l border-white/10 pl-4">{challenge}</p>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold text-[#c3ff42] font-mono uppercase tracking-widest mb-3 flex items-center gap-2"><Hash size={12}/> Strategy</h4>
                        <p className="text-sm text-white/80 leading-relaxed font-light text-justify border-l border-white/10 pl-4">{strategy}</p>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold text-[#c3ff42] font-mono uppercase tracking-widest mb-3 flex items-center gap-2"><CheckCircle2 size={12}/> Result</h4>
                        <p className="text-base text-white leading-relaxed font-bold border-l-2 border-[#c3ff42] pl-4 bg-[#c3ff42]/5 py-2">{result}</p>
                        {stats && <div className="text-xl font-mono text-[#c3ff42] mt-2 pl-4">{stats}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3. SOP & AI 赋能
const SOPContent = () => {
    return (
        <div className="w-full min-h-screen bg-[#080808] text-white px-[4vw] py-24 flex flex-col justify-center relative border-t border-white/10">
            <div className="mb-12 max-w-4xl">
                <span className="text-[#c3ff42] font-mono text-sm tracking-[0.2em] uppercase block mb-4">/ WORKFLOW REVOLUTION</span>
                <h2 className="text-5xl font-black uppercase mb-4">团队SOP与AI赋能</h2>
                <p className="text-lg text-white/60 font-light">不仅仅是设计，更是设计管理。搭建了一套完整的 AIGC 辅助设计流程与团队协作 SOP。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/10 divide-y md:divide-y-0 md:divide-x divide-white/10">
                {[
                    { title: "SLG 白皮书", desc: "拉齐团队认知，建立统一标准。", result: "跨部门工具落地", img: "https://picsum.photos/600/338?random=10" },
                    { title: "视频制作 SOP", desc: "标准化流程，减少沟通成本。", result: "人效提升 20%", img: "https://picsum.photos/600/338?random=11" },
                    { title: "MJ / SD 培训", desc: "全员技术赋能，验证落地性。", result: "播放超 50W+", img: "https://picsum.photos/600/338?random=12" }
                ].map((item, i) => (
                    <div key={i} className="group relative bg-[#111] p-6 flex flex-col justify-between overflow-hidden hover:bg-[#151515] transition-colors h-[400px]">
                        <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity"><ArrowDown className="text-[#c3ff42]" size={20} /></div>
                        <div className="w-full aspect-video relative border border-white/10 overflow-hidden mb-4">
                             <img src={item.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={item.title}/>
                        </div>
                        <div className="relative z-10 mt-auto">
                            <h3 className="text-xl font-bold mb-1 text-white group-hover:text-[#c3ff42] transition-colors">{item.title}</h3>
                            <p className="text-white/50 text-xs mb-4">{item.desc}</p>
                            <div className="border-t border-white/10 pt-3">
                                <span className="text-[#c3ff42] font-mono font-bold block text-xs">RESULT: {item.result}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="h-[10vh] bg-[#080808]"></div>
        </div>
    );
};

// 4. 视觉实验
const VisualContent = () => {
    return (
        <div className="w-full min-h-screen bg-[#020204] px-[4vw] py-24 flex flex-col justify-center">
            <div className="mb-8 flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                    <span className="text-[#c3ff42] font-mono text-sm tracking-widest block mb-2">/ VISUAL ARCHIVE</span>
                    <h2 className="text-5xl font-black text-white">视觉实验</h2>
                </div>
                <div className="text-right hidden md:block">
                    <span className="text-white/30 font-mono text-xs">EXPLORATION & RENDER</span>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 border-t border-l border-white/10">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-[#111] aspect-video overflow-hidden group relative cursor-pointer border-r border-b border-white/10">
                        <img src={`https://picsum.photos/600/338?random=${i+800}`} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 grayscale group-hover:grayscale-0" alt="Visual" />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 size={16} className="text-[#c3ff42]" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="h-[10vh]"></div>
        </div>
    );
};

// 5. 视频 + 致谢
const VideoFooterContent = () => {
    return (
        <div className="w-full min-h-screen bg-[#000] grid grid-cols-1 lg:grid-cols-2">
            <div className="relative group border-r border-white/10 overflow-hidden bg-white/5 flex items-center justify-center h-[50vh] lg:h-auto">
                <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?random=99')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-700 blur-sm group-hover:blur-0 grayscale group-hover:grayscale-0"></div>
                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 rounded-full border border-[#c3ff42] text-[#c3ff42] flex items-center justify-center mb-6 group-hover:bg-[#c3ff42] group-hover:text-black transition-all cursor-pointer mx-auto shadow-[0_0_30px_rgba(195,255,66,0.2)]">
                        <Play size={32} fill="currentColor" />
                    </div>
                    <h2 className="text-3xl font-black uppercase text-white">Watch Showreel</h2>
                    <p className="font-mono text-xs mt-3 text-[#c3ff42] tracking-[0.3em]">2024 - 2025</p>
                </div>
            </div>

            <div className="flex flex-col justify-center p-[6vw] bg-[#050505] relative h-[50vh] lg:h-auto">
                <span className="text-[#c3ff42] font-mono text-sm tracking-widest block mb-6">/ ENDING</span>
                <h2 className="text-[clamp(3rem,6vw,5rem)] font-black leading-none uppercase mb-12 text-white">
                    Thanks for<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#555]">Watching.</span>
                </h2>
                <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                        <Mail className="text-white/30 group-hover:text-[#c3ff42] transition-colors" />
                        <a href="mailto:408179683@qq.com" className="text-2xl font-bold text-white hover:text-[#c3ff42] transition-colors">408179683@qq.com</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Phone className="text-white/30" />
                        <p className="text-xl font-mono text-white/50">183-9081-0208</p>
                    </div>
                </div>
                <div className="mt-auto pt-12 flex justify-between items-end border-t border-white/10">
                    <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase">© 2025 ARCHIVE</p>
                    <p className="font-black uppercase text-xl italic text-white/90">Guo Yifeng</p>
                </div>
            </div>
        </div>
    );
};

interface PinnedSectionProps { id: string; index: number; children: React.ReactNode; isSticky?: boolean; }
const PinnedSection: React.FC<PinnedSectionProps> = ({ id, index, children, isSticky = true }) => {
    return (
        <section 
            id={id} 
            className={`w-full bg-[#050505] border-t border-white/10 shadow-2xl overflow-hidden ${isSticky ? 'sticky top-0' : 'relative'}`}
            style={{ zIndex: 30 + index, top: isSticky ? 'calc(100vh - 100%)' : 'auto' }}
        >
            {children}
        </section>
    );
};

export const BottomDock: React.FC<{ items: { id: string; label: string }[] }> = ({ items }) => {
    const [activeId, setActiveId] = useState(items[0].id);
    useEffect(() => {
        const handleScroll = () => {
            const center = window.innerHeight / 2;
            for (let i = items.length - 1; i >= 0; i--) {
                const item = items[i];
                const el = document.getElementById(item.id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= center + 100 && rect.bottom > 0) {
                        setActiveId(item.id);
                        break;
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [items]);
    const scrollTo = (id: string) => { gsap.to(window, { duration: 1, scrollTo: `#${id}`, ease: "power2.inOut" }); };
    
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1 p-1 bg-[#111]/80 backdrop-blur-md border border-[#c3ff42]/30 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-90 md:scale-100 origin-bottom">
            {items.map((item) => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className={`px-4 py-2 rounded-full text-[10px] font-bold font-sans uppercase tracking-widest transition-all duration-300 ${activeId === item.id ? 'bg-[#c3ff42] text-black shadow-[0_0_10px_#c3ff42] scale-105' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>{item.label}</button>
            ))}
        </div>
    );
};

export const ProjectStack: React.FC<{ works: any[] }> = ({ works }) => {
    const navItems = [
        { id: 'lostlight', label: '萤火' }, 
        { id: 'stzb', label: '率土' }, 
        { id: 'racing', label: '巅峰' }, 
        { id: 'knives', label: '荒野' }, 
        { id: 'sop', label: 'SOP' }, 
        { id: 'visual', label: '视觉' },
        { id: 'footer', label: 'End' }
    ];
    return (
        <div className="relative w-full bg-black pb-[50vh]">
            <PinnedSection id="lostlight" index={0} isSticky={false}><FlagshipContent /></PinnedSection>
            
            <PinnedSection id="stzb" index={1}><CaseStudyContent title="率土之滨" subtitle="CASE A: 存量激活" bgImage="https://picsum.photos/1920/1080?random=101" challenge="成熟期产品，如何突破圈层固化？" strategy="引入“文旅内容营销”策略。主导4条史诗级视频，以情感共鸣激活玩家。" result="地域服流水增长 +150% | 全网播放 1000W+" /></PinnedSection>
            
            <PinnedSection id="racing" index={2}><CaseStudyContent title="巅峰极速" subtitle="CASE B: 极致ROI" bgImage="https://picsum.photos/1920/1080?random=102" challenge="预算仅为常规发布会的20%，如何制造S级声量？" strategy="创意降本（植入趣味广告）+ 技术降本（AI生成音乐）。" result="抖音热榜 Top 51 | 话题播放 1.2亿+" /></PinnedSection>
            
            <PinnedSection id="knives" index={3}><CaseStudyContent title="荒野行动" subtitle="CASE C: 品牌重塑" bgImage="https://picsum.photos/1920/1080?random=103" challenge="时间紧、预算少，从0构建KOPL职业联赛视觉。" strategy="提炼“向上突破”视觉概念，建立完整VI系统，高效统筹多方供应商。" result="沉淀赛事视觉资产，被后续赛季持续沿用。" /></PinnedSection>
            
            <PinnedSection id="sop" index={4}><SOPContent /></PinnedSection>
            
            <PinnedSection id="visual" index={5}><VisualContent /></PinnedSection>
            
            <PinnedSection id="footer" index={6}><VideoFooterContent /></PinnedSection>
            
            <BottomDock items={navItems} />
        </div>
    );
};