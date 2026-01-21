import React, { useRef, useLayoutEffect, useState, useEffect, Suspense, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, ArrowRight, ChevronDown, MonitorPlay, ExternalLink, ArrowDown, CheckCircle2, TrendingUp, Zap, Target } from 'lucide-react';
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

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
extend({ EffectComposer, RenderPass, UnrealBloomPass, OutputPass });

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
  }, [size]);

  const outPass = useMemo(() => new OutputPass(), []);

  useEffect(() => {
    composer.current?.setSize(size.width, size.height);
  }, [size]);

  useFrame(() => {
    composer.current?.render();
  }, 1);

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attach="passes-0" args={[scene, camera]} />
      {/* Use primitive to avoid JSX intrinsic element errors for non-standard R3F tags */}
      <primitive object={bloomPass} attach="passes-1" />
      <primitive object={outPass} attach="passes-2" />
    </effectComposer>
  );
};

// --- Experience ---
export const Experience: React.FC<{ items: ExperienceItem[] }> = ({ items }) => {
  return (
    <section className="relative pt-24 pb-4 px-[4vw] w-full max-w-[3840px] mx-auto bg-black z-10">
        <div className="mb-20 pl-8 border-l-2 border-white/20">
            <span className="text-red-600 font-mono text-sm font-bold tracking-[0.2em] uppercase block mb-3">/ EXPERIENCE</span>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-4">工作经历</h2>
            <p className="text-white/40 font-mono text-xs tracking-widest uppercase">Career Archive / 2012-2025</p>
        </div>
        <div className="space-y-12">
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
        <motion.div className="group relative grid grid-cols-1 md:grid-cols-[1fr_2fr_4fr] gap-4 md:gap-12 py-10 border-t border-white/10 hover:border-white/30 transition-colors duration-500" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: index * 0.1 }}>
            <div className="font-mono text-sm text-white/40 group-hover:text-red-600 transition-colors duration-300 pt-1">{item.period}</div>
            <div><h3 className="text-2xl font-bold text-white mb-2 group-hover:text-red-600 transition-colors duration-300">{item.company}</h3><p className="text-white/50 font-light italic">{item.role}</p></div>
            <div className="text-base leading-relaxed text-white/60"><span className="text-white font-bold block mb-3 group-hover:text-white transition-colors duration-300">{firstSentence}</span>{restContent && (<span className="font-light block text-justify opacity-80">{restContent}</span>)}</div>
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
          <div key={i} className="flex items-center gap-6 group cursor-default"><span className="text-2xl md:text-5xl font-black text-white/20 group-hover:text-white transition-all duration-700 uppercase italic tracking-tighter">{text}</span><div className="w-1.5 h-1.5 bg-red-600 rounded-full opacity-20 group-hover:opacity-100 transition-opacity"></div></div>
        ))}
      </motion.div>
    </div>
  );
};

// --- Values ---
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
            <div className="w-full md:w-2/3 text-left">
                {formatText(topText).map((line, i) => (
                    <h3 key={i} style={{ fontFamily: 'HYPixel, monospace' }} className="text-[clamp(2.5rem,3.5vw,5rem)] leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-[#FFFFFF] via-[#DDDDDD] to-[#777777] mb-2">{line}</h3>
                ))}
            </div>
            <div className="w-full md:w-2/3 self-end text-right mt-auto">
                {formatText(bottomText).map((line, i) => (
                    <h3 key={i} style={{ fontFamily: 'HYPixel, monospace' }} className="text-[clamp(2.5rem,3.5vw,5rem)] leading-[1.1] text-transparent bg-clip-text bg-gradient-to-tl from-[#FFFFFF] via-[#DDDDDD] to-[#777777] mb-2">{line}</h3>
                ))}
            </div>
        </motion.div>
    </section>
  );
};

// --- 内容组件 & 堆叠系统 ---

// 1. 旗舰案例：萤火突击 (长滚动模式)
const FlagshipContent = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
      videoRef.current?.play().catch(() => {
        console.warn("Video play failed - likely needs user interaction or broken source.");
      });
    };
    
    const handleMouseLeave = () => {
        if(videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }

    return (
        <div className="w-full min-h-screen flex flex-col relative bg-[#050505]">
            {/* 封面区 */}
            <div className="w-full h-screen relative group cursor-pointer overflow-hidden flex-shrink-0" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <img src="https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/H75-1.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vSDc1LTEuanBnIiwiaWF0IjoxNzY4ODk5NzM2LCJleHAiOjIwODQyNTk3MzZ9.RoEErK2ORTUb0oR6gGo06_ag62wFQNBstCC_-SZsloU" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" alt="Lost Light" />
                <video 
                  ref={videoRef} 
                  src="https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/LL_Head_KV.mp4" 
                  muted 
                  loop 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                
                <div className="absolute top-0 left-0 w-full h-full px-[4vw] py-[6vh] flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-start">
                        <div className="text-white/50 font-mono text-xs tracking-[0.2em] uppercase">旗舰项目</div>
                        <div className="text-white/50 font-mono text-xs tracking-[0.2em] uppercase hidden md:block">NETEASE GAMES</div>
                    </div>
                    <div>
                        <h1 className="text-[clamp(4rem,10vw,12rem)] font-black text-white leading-[0.8] tracking-tighter uppercase mb-6">萤火突击</h1>
                        <div className="flex flex-col md:flex-row md:items-end gap-6">
                            <p className="text-xl md:text-3xl text-white/90 font-bold max-w-2xl">从0到1架构全链路市场策略</p>
                            <div className="flex gap-3 text-xs font-mono text-white/50 uppercase tracking-wider">
                                <span>产品策略输入</span><span>/</span><span>上市全案规划</span><span>/</span><span>创意执行落地</span><span>/</span><span>长线运营赋能</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-10 right-10 animate-bounce"><ChevronDown className="text-white w-8 h-8 opacity-50" /></div>
            </div>

            {/* 详情内容区 */}
            <div className="w-full text-white px-[4vw] py-32 space-y-32 z-10 relative">
                <div className="border-l-4 border-red-600 pl-6">
                    <h3 className="text-4xl font-bold mb-2">创意负责人</h3>
                    <p className="text-white/50 font-mono">ROLE: CREATIVE DIRECTOR</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 border-t border-white/10 pt-16">
                    <div className="space-y-8">
                        <div>
                            <span className="text-red-600 font-mono text-sm tracking-widest block mb-4">01 / INSIGHT</span>
                            <h3 className="text-4xl font-black uppercase mb-6">定义战场</h3>
                            <p className="text-white/70 leading-relaxed text-lg font-light text-justify">竞品差异化分析 & 提炼“萤火”核心卖点。提出“策略射击”定位，反向输出产品Slogan。</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                             <div className="aspect-[4/3] bg-white/5 rounded-sm overflow-hidden"><img src="https://picsum.photos/300/200?random=1" className="w-full h-full object-cover" alt="img"/></div>
                             <div className="aspect-[4/3] bg-white/5 rounded-sm overflow-hidden"><img src="https://picsum.photos/300/200?random=2" className="w-full h-full object-cover" alt="img"/></div>
                             <div className="aspect-[4/3] bg-white/5 rounded-sm overflow-hidden"><img src="https://picsum.photos/300/200?random=3" className="w-full h-full object-cover" alt="img"/></div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <span className="text-red-600 font-mono text-sm tracking-widest block mb-4">02 / STRATEGY</span>
                            <h3 className="text-4xl font-black uppercase mb-6">设计蓝图</h3>
                            <p className="text-white/70 leading-relaxed text-lg font-light text-justify">规划投放节奏与素材配比模型。从0-1构建《视觉标准库》，确保多方协作统一。</p>
                        </div>
                        <div className="aspect-square bg-white/5 rounded-sm overflow-hidden"><img src="https://picsum.photos/600/600?random=5" className="w-full h-full object-cover" alt="Model"/></div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <span className="text-red-600 font-mono text-sm tracking-widest block mb-4">03 / EXECUTION</span>
                            <h3 className="text-4xl font-black uppercase mb-6">长线赋能</h3>
                            <p className="text-white/70 leading-relaxed text-lg font-light text-justify mb-4">监修520发布会、公测PV及CG，把控核心物料品质。</p>
                            <p className="text-white/40 leading-relaxed text-sm font-mono">前瞻性规划1.1版本内容，以此驱动社区生态。</p>
                        </div>
                        <div className="space-y-3">
                            {[
                                { title: '萤火情报站 / 萤火之声', url: 'https://www.bilibili.com/video/BV1At421a7s1' },
                                { title: '520 发布会', url: 'https://www.bilibili.com/video/BV1Si421U7BF' },
                                { title: '公测 PV - 倒计时', url: 'https://www.bilibili.com/video/BV1LS411c7co' },
                                { title: '公测 CG - 剧情片', url: 'https://www.bilibili.com/video/BV1ti421U7bL' },
                            ].map((video, i) => (
                                <a key={i} href={video.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 hover:border-red-600 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] text-black font-bold font-mono">{i+1}</div>
                                        <span className="font-bold text-sm group-hover:text-white transition-colors text-white/80">{video.title}</span>
                                    </div>
                                    <MonitorPlay className="text-white/30 w-4 h-4 group-hover:text-red-600 transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full bg-[#111] px-[4vw] py-24 border-t border-white/10">
                <div className="mb-12"><h3 className="text-3xl font-black uppercase text-white">价值成果 <span className="text-red-600">.</span></h3></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white/5 rounded-sm border-t-2 border-white/20 hover:border-red-600 transition-colors">
                        <div className="flex items-center gap-3 mb-4 text-white/50"><TrendingUp size={20} /><span className="font-mono text-sm tracking-widest">COMMERCIAL</span></div>
                        <div className="text-2xl font-bold mb-2 text-white">护航产品冷启动</div>
                        <div className="text-sm text-white/60">公测核心视频播放均超 <span className="text-white font-mono font-bold">40W+</span></div>
                    </div>
                    <div className="p-8 bg-white/5 rounded-sm border-t-2 border-white/20 hover:border-red-600 transition-colors">
                        <div className="flex items-center gap-3 mb-4 text-white/50"><Zap size={20} /><span className="font-mono text-sm tracking-widest">EFFICIENCY</span></div>
                        <div className="text-2xl font-bold mb-2 text-white">搭建素材管线</div>
                        <div className="text-sm text-white/60">制作周期缩短 <span className="text-white font-mono font-bold">30-40%</span></div>
                    </div>
                    <div className="p-8 bg-white/5 rounded-sm border-t-2 border-white/20 hover:border-red-600 transition-colors">
                        <div className="flex items-center gap-3 mb-4 text-white/50"><Target size={20} /><span className="font-mono text-sm tracking-widest">STRATEGY</span></div>
                        <div className="text-2xl font-bold mb-2 text-white">确立差异化视觉</div>
                        <div className="text-sm text-white/60">沉淀可复用 <span className="text-white font-mono font-bold">SOP</span></div>
                    </div>
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
        <div className="w-full h-screen relative flex flex-col bg-[#050505] overflow-hidden">
            <div className="relative h-[60%] w-full overflow-hidden group">
                <img src={bgImage} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" alt={title} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
                
                <div className="absolute bottom-8 left-[4vw] z-10">
                    <span className="inline-block px-3 py-1 rounded-full border border-white/20 text-xs font-mono tracking-widest uppercase mb-4 text-white bg-black/50 backdrop-blur-md">
                        {subtitle}
                    </span>
                    <h2 className="text-[clamp(3rem,6vw,6rem)] font-black text-white leading-none uppercase tracking-tighter drop-shadow-2xl">
                        {title}
                    </h2>
                </div>
            </div>

            <div className="h-[40%] w-full px-[4vw] bg-[#050505] z-10 flex items-center border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white/40 font-mono uppercase tracking-widest border-b border-white/10 pb-2">Challenge</h4>
                        <p className="text-lg text-white/90 leading-relaxed font-light">{challenge}</p>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white/40 font-mono uppercase tracking-widest border-b border-white/10 pb-2">Strategy</h4>
                        <p className="text-lg text-white/90 leading-relaxed font-light">{strategy}</p>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white/40 font-mono uppercase tracking-widest border-b border-red-600/50 pb-2 text-red-500">Result</h4>
                        <p className="text-lg text-white/90 leading-relaxed font-bold">{result}</p>
                        {stats && <div className="text-xl font-mono text-white mt-1 opacity-80">{stats}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3. SOP & AI 赋能
const SOPContent = () => {
    return (
        <div className="w-full h-screen bg-[#080808] text-white px-[4vw] flex flex-col justify-center relative border-t border-white/10">
            <div className="mb-12 max-w-4xl">
                <span className="text-blue-500 font-mono text-sm tracking-[0.2em] uppercase block mb-4">/ WORKFLOW REVOLUTION</span>
                <h2 className="text-6xl font-black uppercase mb-4">团队SOP与AI赋能</h2>
                <p className="text-xl text-white/60 font-light">不仅仅是设计，更是设计管理。搭建了一套完整的 AIGC 辅助设计流程与团队协作 SOP。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[55%]">
                {[
                    { title: "SLG 白皮书", desc: "拉齐团队认知，建立统一标准。", result: "跨部门工具落地", img: "https://picsum.photos/600/800?random=10" },
                    { title: "视频制作 SOP", desc: "标准化流程，减少沟通成本。", result: "人效提升 20%", img: "https://picsum.photos/600/800?random=11" },
                    { title: "MJ / SD 培训", desc: "全员技术赋能，验证落地性。", result: "播放超 50W+", img: "https://picsum.photos/600/800?random=12" }
                ].map((item, i) => (
                    <div key={i} className="group relative bg-white/5 border border-white/10 p-8 flex flex-col justify-between overflow-hidden rounded-sm hover:border-blue-500/50 transition-colors">
                        <img src={item.img} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity grayscale group-hover:grayscale-0" alt={item.title}/>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                            <p className="text-white/50 text-sm">{item.desc}</p>
                        </div>
                        <div className="relative z-10 mt-auto">
                            <div className="flex items-center gap-2 mb-2 opacity-50">
                                <ArrowDown size={16} />
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-sm backdrop-blur-md">
                                <span className="text-blue-400 font-bold block text-sm">成果：{item.result}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 4. 终极页脚
const CombinedFooter: React.FC = () => {
    return (
        <section className="w-full min-h-screen bg-[#020204] flex flex-col border-t border-white/10">
            <div className="py-24 px-[4vw] border-b border-white/10 flex-1">
                <div className="mb-12 flex items-baseline justify-between">
                    <div>
                        <span className="text-red-600 font-mono text-sm tracking-widest block mb-2">/ VISUAL ARCHIVE</span>
                        <h2 className="text-5xl font-black text-white">视觉实验</h2>
                    </div>
                    <span className="font-mono text-white/30 hidden md:block">EXPLORATION</span>
                </div>
                <div className="grid grid-cols-4 gap-2 h-48 md:h-64">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white/5 overflow-hidden group relative cursor-pointer rounded-sm">
                            <img src={`https://picsum.photos/600/600?random=${i+800}`} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt="Visual" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 flex-[2] min-h-[60vh]">
                <div className="relative group border-r border-white/10 overflow-hidden bg-white/5 flex items-center justify-center min-h-[400px]">
                    <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?random=99')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-700 blur-sm group-hover:blur-0"></div>
                    <div className="relative z-10 text-center">
                        <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform cursor-pointer mx-auto shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                            <Play size={32} fill="currentColor" />
                        </div>
                        <h2 className="text-3xl font-black uppercase text-white">Watch Showreel</h2>
                        <p className="font-mono text-xs mt-2 text-white/70 tracking-widest">2024 - 2025</p>
                    </div>
                </div>

                <div className="flex flex-col justify-center p-[6vw] bg-[#050505] relative">
                    <span className="text-red-600 font-mono text-sm tracking-widest block mb-4">/ CONTACT</span>
                    <h2 className="text-[clamp(3rem,6vw,5rem)] font-black leading-none uppercase mb-12 text-white">
                        Let's<br /><span className="text-stroke-white text-transparent">Connect.</span>
                    </h2>
                    <div className="space-y-4">
                        <a href="mailto:408179683@qq.com" className="block text-2xl font-bold text-white hover:text-red-600 transition-colors">408179683@qq.com</a>
                        <p className="text-xl font-mono text-white/50">183-9081-0208</p>
                    </div>
                    <div className="mt-auto pt-16 flex justify-between items-end">
                        <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase">© 2025 ARCHIVE</p>
                        <p className="font-black uppercase text-xl italic text-white/90">Guo Yifeng</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

interface PinnedSectionProps { id: string; index: number; children: React.ReactNode; isSticky?: boolean; }

const PinnedSection: React.FC<PinnedSectionProps> = ({ id, index, children, isSticky = true }) => {
    return (
        <section 
            id={id} 
            className={`w-full bg-[#050505] border-t border-white/10 shadow-2xl overflow-hidden ${isSticky ? 'sticky top-0 h-screen' : 'relative'}`}
            style={{ zIndex: 30 + index }}
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
                    if (rect.top <= 100 && rect.bottom > 0) {
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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1 p-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full shadow-2xl scale-90 md:scale-100 origin-bottom">
            {items.map((item) => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className={`px-4 py-2 rounded-full text-[10px] font-bold font-sans uppercase tracking-widest transition-all duration-300 ${activeId === item.id ? 'bg-white text-black shadow-lg scale-105' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>{item.label}</button>
            ))}
        </div>
    );
};

export const ProjectStack: React.FC<{ works: any[] }> = ({ works }) => {
    const navItems = [{ id: 'lostlight', label: '萤火' }, { id: 'stzb', label: '率土' }, { id: 'racing', label: '巅峰' }, { id: 'knives', label: '荒野' }, { id: 'sop', label: 'SOP' }, { id: 'footer', label: 'End' }];
    return (
        <div className="relative w-full bg-black pb-[50vh]">
            <PinnedSection id="lostlight" index={0} isSticky={false}>
                <FlagshipContent />
            </PinnedSection>
            
            <PinnedSection id="stzb" index={1}>
                <CaseStudyContent 
                    title="率土之滨" subtitle="CASE A: 存量激活" 
                    bgImage="https://picsum.photos/1920/1080?random=101" 
                    challenge="成熟期产品，如何突破圈层固化？" 
                    strategy="引入“文旅内容营销”策略。主导4条史诗级视频，以情感共鸣激活玩家。" 
                    result="地域服流水增长 +150% | 全网播放 1000W+" 
                />
            </PinnedSection>
            
            <PinnedSection id="racing" index={2}>
                <CaseStudyContent 
                    title="巅峰极速" subtitle="CASE B: 极致ROI" 
                    bgImage="https://picsum.photos/1920/1080?random=102" 
                    challenge="预算仅为常规发布会的20%，如何制造S级声量？" 
                    strategy="创意降本（植入趣味广告）+ 技术降本（AI生成音乐）。" 
                    result="抖音热榜 Top 51 | 话题播放 1.2亿+" 
                />
            </PinnedSection>
            
            <PinnedSection id="knives" index={3}>
                <CaseStudyContent 
                    title="荒野行动" subtitle="CASE C: 品牌重塑" 
                    bgImage="https://picsum.photos/1920/1080?random=103" 
                    challenge="时间紧、预算少，从0构建KOPL职业联赛视觉。" 
                    strategy="提炼“向上突破”视觉概念，建立完整VI系统，高效统筹多方供应商。" 
                    result="沉淀赛事视觉资产，被后续赛季持续沿用。" 
                />
            </PinnedSection>
            
            <PinnedSection id="sop" index={4}>
                <SOPContent />
            </PinnedSection>
            
            <PinnedSection id="footer" index={5}>
                <CombinedFooter />
            </PinnedSection>
            
            <BottomDock items={navItems} />
        </div>
    );
};
