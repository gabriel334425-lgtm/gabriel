import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { Canvas } from '@react-three/fiber';
import Hero from './components/Hero';
import { Experience, Values, SelectedWorks, Marquee, VisualDesign, Showreel } from './components/Sections';
import Modal from './components/Modal';
import Header from './components/Header';
import { HeroModel, ParticleBackground } from './components/SceneElements';
import { LayoutGrid, CustomCursor } from './components/UI';
import { ExperienceItem, ProjectItem, FlagshipDetails } from './types';

const experienceData: ExperienceItem[] = [
  {
    period: "2020 - 2025",
    company: "网易游戏 (NetEase Games)",
    role: "高级创意设计师",
    description: "负责网易多款游戏的营销创意及设计工作，主要服务：《阴阳师》《萤火突击》《率土之滨》等数十款产品。具备从0-1的S级项目发行及运营的全流程经验，主导关键营销战役的视觉落地与策略执行。"
  },
  {
    period: "2017 - 2020",
    company: "广东省广告集团 (GDAD)",
    role: "美术指导",
    description: "第十事业部，主要负责Social创意及设计。服务中国移动、咪咕等头部客户，具备独立驻点服务能力。案例曾获长城铜奖及其他入围奖。"
  },
  {
    period: "2016 - 2017",
    company: "卡姿兰 (Carslan)",
    role: "设计校招生",
    description: "主要负责电商板块的内容，积累了丰富的电商、直播、广告图的制作经验。"
  },
  {
    period: "2012 - 2016",
    company: "长沙理工大学 (CSUST)",
    role: "艺术设计专业",
    description: "从事装饰艺术方面的学习，扩宽了美学思维和实践能力，铸造了坚实的美术基础。"
  }
];

const worksData: ProjectItem[] = [
  { id: 'stzb', title: '率土之滨', subtitle: '地域服营销 · 增长策略', tags: ['Strategy', 'Design'], imageUrl: 'https://picsum.photos/800/450?random=1' },
  { id: 'racing', title: '巅峰极速', subtitle: 'AI应用 · 降本增效', tags: ['AI Workflow', 'Visuals'], imageUrl: 'https://picsum.photos/800/450?random=2' },
  { id: 'knives', title: '荒野行动', subtitle: '电竞赛事视觉重构', tags: ['Esports', 'Branding'], imageUrl: 'https://picsum.photos/800/450?random=3' },
  { id: 'lostlight', title: '萤火突击', subtitle: 'S级项目全案发行', tags: ['Full Case', 'Launch'], imageUrl: 'https://picsum.photos/800/450?random=4' },
];

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<FlagshipDetails | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
    });
    function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      const move1 = { x: x * -25, y: y * -25 };
      const move2 = { x: x * -12, y: y * -12 };
      const move3 = { x: x * -6, y: y * -6 };
      containerRef.current.style.backgroundPosition = `
        calc(0px + ${move1.x}px) calc(0px + ${move1.y}px),
        calc(40px + ${move2.x}px) calc(60px + ${move2.y}px),
        calc(130px + ${move3.x}px) calc(270px + ${move3.y}px)
      `;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(e => console.log('Audio blocked', e));
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleOpenProject = (id: string) => {
    const project = worksData.find(p => p.id === id);
    if (!project) return;
    setActiveProject({
        id: project.id,
        title: project.title,
        role: "Lead Designer / Art Direction",
        content: <div className="py-20 text-center text-white/40 font-mono text-sm tracking-widest uppercase">Project details loading...</div>
    });
    setModalOpen(true);
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen selection:bg-white selection:text-black w-full overflow-hidden text-white font-sans relative"
      style={{
        backgroundColor: '#000',
        backgroundImage: `
          radial-gradient(white 1.5px, transparent 2px), 
          radial-gradient(rgba(255,255,255,0.6) 1.5px, transparent 2px),
          radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1.5px)
        `,
        backgroundSize: '550px 550px, 350px 350px, 250px 250px',
        backgroundPosition: '0 0, 40px 60px, 130px 270px',
        boxShadow: 'inset 0 0 200px rgba(0,0,0,0.8)',
        transition: 'background-position 0.15s ease-out'
      }}
    >
      <ParticleBackground />
      <LayoutGrid />
      <CustomCursor />
      
      <audio ref={audioRef} loop src="https://assets.mixkit.co/music/preview/mixkit-sci-fi-drone-ambience-2708.mp3" />

      {/* Modified: Header uses Framer Motion spring entry */}
      <motion.div
        className="fixed top-0 left-0 w-full z-50 pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={!loading ? { opacity: 1, y: 0 } : {}}
        transition={{ 
            type: "spring", 
            stiffness: 80, 
            damping: 15, 
            delay: 0.05 // Slight delay to sync with bottom UI but appear Top-Down
        }}
      >
         <div className="pointer-events-auto">
            <Header isMuted={isMuted} onToggleAudio={toggleAudio} />
         </div>
      </motion.div>

      <main className="relative z-10 w-full text-start flex flex-col items-start">
        <Hero onLoadingComplete={() => setLoading(false)} />
        
        <Experience items={experienceData} />
        <Marquee />
        <Values />
        
        <section id="flagship" className="relative w-full h-[80vh] overflow-hidden group border-y border-white/5" data-cursor="video">
             <div className="absolute inset-0 w-full h-full cursor-pointer" onClick={() => handleOpenProject('lostlight')}>
                 <img src="https://picsum.photos/1920/1080?random=5" className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-1000 group-hover:scale-105" alt="Flagship" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-transparent to-[#020204]/40"></div>
                 <div className="absolute top-0 left-0 w-full h-full px-[4vw] flex flex-col justify-center pt-32 items-start z-10">
                    <span className="text-white/40 text-[10px] font-mono uppercase tracking-[6px] mb-4">S-TIER FLAGSHIP CASE</span>
                    <h2 className="text-[clamp(3rem,8vw,8rem)] font-black text-white tracking-tighter leading-none mb-8 italic uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">萤火突击</h2>
                    <div className="max-w-xl border-l-4 border-white/20 pl-6">
                        <p className="text-white/70 text-[clamp(1rem,1.5vw,1.25rem)] font-light leading-relaxed mb-6">本案例展示如何通过标准化的视觉规范与前置 AIGC 工作流，重构 S 级项目的创作效能。</p>
                    </div>
                </div>
             </div>
        </section>

        <SelectedWorks works={worksData} onSelect={handleOpenProject} />
        <VisualDesign />
        <Showreel />
      </main>

      <footer id="contact" className="bg-[#020204]/50 backdrop-blur-sm text-white py-32 px-[4vw] relative overflow-hidden border-t border-white/10 w-full">
        {/* Footer content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full relative z-10">
            <div className="flex flex-col justify-between min-h-[400px]">
                <h2 className="text-[clamp(4rem,10vw,12rem)] font-black leading-none tracking-tighter italic uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">LET'S<br /><span className="text-stroke-white text-transparent hover:text-white transition-all duration-700 shadow-[0_0_15px_rgba(255,255,255,0.3)]">CONNECT.</span></h2>
                <div className="mt-16 space-y-4">
                    <a href="mailto:408179683@qq.com" className="text-[clamp(1.5rem,3vw,3rem)] font-black block hover:text-white transition-all tracking-tight text-white/90 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">408179683@qq.com</a>
                    <div className="flex items-center gap-3 text-xl font-mono font-bold text-white/40 hover:text-white transition-all duration-300">
                        <span className="w-10 h-[1px] bg-white/20"></span> 183-9081-0208
                    </div>
                </div>
            </div>
            <div className="relative w-full h-full min-h-[400px] border border-white/10 bg-white/[0.02] flex flex-col justify-between rounded-sm overflow-hidden group backdrop-blur-sm">
                <div className="p-6 border-b border-white/5 flex justify-between items-start">
                    <div className="text-[9px] font-mono uppercase tracking-[4px] text-white/30 italic">Reactive Geometry Fragment</div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,1)]"></div>
                </div>
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                    <div className="w-full h-full">
                        <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ alpha: true }}>
                            <Suspense fallback={null}>
                                <HeroModel />
                            </Suspense>
                        </Canvas>
                    </div>
                </div>
                <div className="relative z-10 p-6 flex justify-between items-end">
                    <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase">© 2025 ARCHIVE / GYF</p>
                    <div className="text-right">
                        <p className="font-black uppercase text-2xl tracking-tighter italic text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">Guo Yifeng</p>
                    </div>
                </div>
            </div>
        </div>
        <div className="absolute -bottom-64 -right-64 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none"></div>
      </footer>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} data={activeProject} />
    </div>
  );
};

export default App;