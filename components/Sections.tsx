import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, ArrowUpRight, ArrowRight } from 'lucide-react';
import { ExperienceItem, ProjectItem } from '../types.ts';
import { MagnetScene } from './SceneElements.tsx';

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() { return { hasError: true }; }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="p-4 text-[10px] font-mono opacity-50 uppercase tracking-widest">3D Context Error</div>;
    }
    return this.props.children;
  }
}

// --- Experience Section ---
export const Experience: React.FC<{ items: ExperienceItem[] }> = ({ items }) => {
  return (
    <section id="experience" className="bg-dark text-white w-full py-32 border-t border-white/5 overflow-visible relative">
      <div className="w-full px-[4vw] grid grid-cols-1 lg:grid-cols-4 gap-16 text-start">
        <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-32">
                <span className="text-accent text-xs font-mono tracking-widest block mb-6 uppercase italic">01 / CAREER ARCHIVE</span>
                <h2 className="text-[clamp(2.5rem,4vw,4rem)] font-black tracking-tighter leading-none italic uppercase mb-10">工作经历</h2>
                <div className="w-full aspect-square relative opacity-30 mix-blend-screen max-w-[280px]">
                    <ErrorBoundary>
                        <Canvas gl={{ alpha: true }}>
                            <Suspense fallback={null}>
                                <MagnetScene />
                            </Suspense>
                        </Canvas>
                    </ErrorBoundary>
                </div>
            </div>
        </div>
        <div className="lg:col-span-3 relative">
            <div className="flex flex-col border-t border-white/5">
                {items.map((item, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: index * 0.15, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                        className="grid grid-cols-1 md:grid-cols-12 py-16 border-b border-white/5 group relative cursor-pointer overflow-hidden"
                        data-cursor="link"
                    >
                        <div className="md:col-span-2 text-gray-500 font-mono text-sm group-hover:text-accent transition-colors duration-500 uppercase tracking-tighter">
                            {item.period}
                        </div>
                        <div className="md:col-span-10 pl-0 md:pl-10 relative">
                            <h3 className="text-[clamp(1.5rem,2.8vw,2.8rem)] font-bold mb-4 text-white group-hover:text-accent transition-colors duration-500 uppercase italic tracking-tighter leading-none">
                                {item.company}
                            </h3>
                            <p className="text-[10px] font-mono uppercase tracking-[4px] text-gray-400 mb-8 flex items-center gap-3">
                                <span className="w-4 h-[1px] bg-gray-600"></span> {item.role}
                            </p>
                            <p className="text-gray-500 group-hover:text-gray-300 transition-colors duration-700 leading-relaxed text-[clamp(1rem,1.1vw,1.2rem)] font-light max-w-4xl">
                                {item.description}
                            </p>
                        </div>
                        {/* Interactive Background Reveal on Hover */}
                        <div className="absolute inset-0 bg-white/[0.02] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-[0.23,1,0.32,1] pointer-events-none"></div>
                    </motion.div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

// --- Values Section ---
export const Values: React.FC = () => {
    const values = [
        { title: "全案操盘与策略落地", enTitle: "Full-link Strategy", desc: "具备从0-1产品定位推导到1-N长线运营的全链路操盘经验，精准把控营销节奏。" },
        { title: "商业导向的视觉把控", enTitle: "Commercial Art Direction", desc: "设计科班出身，致力于将抽象策略转化为具象视觉，构建项目核心竞争壁垒。" },
        { title: "效能体系与AIGC革新", enTitle: "Workflow Efficiency", desc: "擅长构建标准化产出SOP，通过引入前沿AIGC工作流，重构传统产能天花板。" }
    ];
    return (
        <section id="masterpiece" className="bg-dark text-white border-t border-white/5 py-32 w-full px-[4vw] text-start">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
                <div className="lg:col-span-1">
                    <span className="text-accent text-xs font-mono tracking-widest block mb-6 uppercase italic">02 / CORE CAPABILITY</span>
                    <h2 className="text-[clamp(2.5rem,4vw,4rem)] font-black tracking-tighter italic uppercase leading-none">核心能力</h2>
                </div>
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-12">
                    {values.map((v, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2, duration: 0.8 }} className="group relative border-t border-white/10 pt-16" data-cursor="link">
                            <div className="absolute top-6 left-0 text-white/5 text-[clamp(4rem,7vw,8rem)] font-black z-0 pointer-events-none italic">0{i+1}</div>
                            <div className="relative z-10">
                                <h3 className="text-[clamp(1.25rem,1.6vw,1.6rem)] font-bold mb-4 group-hover:text-accent transition-colors duration-500 uppercase italic leading-tight">{v.title}</h3>
                                <p className="text-[9px] text-gray-500 font-mono mb-8 uppercase tracking-[4px]">{v.enTitle}</p>
                                <p className="text-gray-400 text-[1rem] leading-relaxed font-light">{v.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- Project Card Component with Parallax ---
const ProjectCard: React.FC<{ work: ProjectItem, onSelect: (id: string) => void }> = ({ work, onSelect }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]); // Parallax movement

    return (
        <motion.div 
            ref={ref}
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }} 
            onClick={() => onSelect(work.id)} 
            className="group cursor-pointer relative aspect-[16/10] overflow-hidden rounded-sm bg-white/[0.03]" 
            data-cursor="link"
        >
            <motion.div style={{ y }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
                 <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
            </motion.div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-70"></div>
            <div className="absolute bottom-0 left-0 w-full p-[4vw] md:p-12 flex justify-between items-end">
                <div className="max-w-[70%]">
                    <h3 className="text-[clamp(1.5rem,3vw,3rem)] font-black text-white mb-3 uppercase italic tracking-tighter leading-none">{work.title}</h3>
                    <p className="text-accent text-[10px] font-mono uppercase tracking-[4px] mb-1">{work.subtitle}</p>
                </div>
                <div className="w-14 h-14 border border-white/20 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:scale-110 transition-all duration-500">
                    <ArrowUpRight size={28} className="text-white" strokeWidth={1.5} />
                </div>
            </div>
        </motion.div>
    )
}

// --- Selected Works Section ---
export const SelectedWorks: React.FC<{ works: ProjectItem[], onSelect: (id: string) => void }> = ({ works, onSelect }) => {
    return (
        <section id="showcase" className="bg-darklighter text-white border-t border-white/5 py-32 w-full px-[4vw] text-start">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 pb-12 border-b border-white/10">
                <div>
                    <span className="text-accent text-xs font-mono tracking-widest block mb-6 uppercase italic">03 / PROJECT ARCHIVE</span>
                    <h2 className="text-[clamp(2.5rem,4vw,4rem)] font-black tracking-tighter italic uppercase leading-none">精选项目</h2>
                </div>
                <div className="text-gray-500 font-mono text-[9px] text-right uppercase tracking-[4px] opacity-40">NetEase Games division / 2025</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                {works.map((work) => (
                    <ProjectCard key={work.id} work={work} onSelect={onSelect} />
                ))}
            </div>
        </section>
    );
}

// --- Marquee Section ---
export const Marquee: React.FC = () => {
    const games = ["阴阳师", "哈利波特", "暗黑破坏神", "率土之滨", "萤火突击", "巅峰极速", "漫威争锋", "明日之后"];
    return (
        <div className="bg-accent border-y border-accent py-12 overflow-hidden relative z-10 w-full flex items-center">
             <div className="flex whitespace-nowrap gap-24 animate-marquee items-center">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center gap-24">
                        {games.map((game, idx) => (
                            <React.Fragment key={`${i}-${idx}`}>
                                <span className="text-white font-black text-[clamp(2rem,3.5vw,4rem)] tracking-tighter italic uppercase leading-none">{game}</span>
                                <div className="w-4 h-4 bg-white rounded-full opacity-30 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                            </React.Fragment>
                        ))}
                    </div>
                ))}
             </div>
        </div>
    )
}

// --- Visual Archive Section ---
export const VisualDesign: React.FC = () => {
    return (
        <section id="visuals" className="bg-dark text-white w-full py-32 border-t border-white/5 px-[4vw]">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 text-start">
                <div className="lg:col-span-1">
                    <span className="text-accent text-xs font-mono tracking-widest block mb-6 uppercase italic">04 / VISUAL ARCHIVE</span>
                    <h2 className="text-[clamp(2.5rem,4vw,4rem)] font-black tracking-tighter italic uppercase mb-10">视觉创意</h2>
                    <button className="text-[10px] font-bold border border-white/20 px-10 py-5 hover:bg-white hover:text-black hover:border-white transition-all duration-500 uppercase tracking-[4px] italic" data-cursor="link">DISCOVERY</button>
                </div>
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[...Array(8)].map((_, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="aspect-square bg-white/5 relative group overflow-hidden cursor-pointer" 
                            data-cursor="link"
                        >
                            <img src={`https://picsum.photos/600/600?random=${i+100}`} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="Design Fragment" />
                            <div className="absolute inset-0 bg-accent/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-110 group-hover:scale-100"><ArrowRight className="text-white w-12 h-12" strokeWidth={1.5} /></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// --- Video Showreel Section ---
export const Showreel: React.FC = () => {
    return (
        <section id="video" className="bg-dark border-t-4 border-accent w-full" data-cursor="video">
            <div className="w-full aspect-video relative group cursor-pointer overflow-hidden">
                <img src="https://picsum.photos/1920/1080?random=200" alt="Video Cover" className="w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-all duration-[1.5s] ease-in-out group-hover:scale-110" />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mb-12 group-hover:scale-110 transition-transform duration-700 shadow-[0_0_50px_rgba(255,51,51,0.5)]">
                        <Play className="w-10 h-10 text-white fill-white ml-2" />
                    </div>
                    <h2 className="text-[clamp(2.5rem,8vw,10rem)] font-black text-white tracking-tighter italic uppercase leading-none">SHOWREEL 2025</h2>
                    <p className="mt-6 text-[10px] font-mono tracking-[12px] text-gray-500 uppercase opacity-40 italic">FULL MOTION ARCHIVE / MOTION GRAPHICS</p>
                </div>
                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
            </div>
        </section>
    );
}