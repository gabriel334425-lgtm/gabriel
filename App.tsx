import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Menu, Phone, Mail, ArrowRight, MessageCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Hero, Experience, Values, SelectedWorks, Marquee, VisualDesign, Showreel } from './components/Sections';
import Modal from './components/Modal';
import { FooterSmiley } from './components/SceneElements';
import { Preloader, CustomCursor, LayoutGrid, MouseTrail } from './components/UI';
import { ExperienceItem, ProjectItem, FlagshipDetails } from './types';

// --- Data ---
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
  { 
      id: 'stzb', 
      title: '率土之滨', 
      subtitle: '地域服营销 · 增长策略', 
      tags: ['Strategy', 'Design'], 
      imageUrl: 'https://picsum.photos/800/450?random=1',
      videoUrl: 'https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4' 
  },
  { 
      id: 'racing', 
      title: '巅峰极速', 
      subtitle: 'AI应用 · 降本增效', 
      tags: ['AI Workflow', 'Visuals'], 
      imageUrl: 'https://picsum.photos/800/450?random=2',
      videoUrl: 'https://videos.pexels.com/video-files/853800/853800-hd_1920_1080_25fps.mp4'
  },
  { 
      id: 'knives', 
      title: '荒野行动', 
      subtitle: '电竞赛事视觉重构', 
      tags: ['Esports', 'Branding'], 
      imageUrl: 'https://picsum.photos/800/450?random=3',
      videoUrl: 'https://videos.pexels.com/video-files/4443653/4443653-hd_1920_1080_30fps.mp4'
  },
  { 
      id: 'lostlight', 
      title: '萤火突击', 
      subtitle: 'S级项目全案发行', 
      tags: ['Full Case', 'Launch'], 
      imageUrl: 'https://picsum.photos/800/450?random=4',
      videoUrl: 'https://videos.pexels.com/video-files/5532772/5532772-hd_1920_1080_25fps.mp4'
  },
];

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<FlagshipDetails | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [flagshipHovered, setFlagshipHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const flagshipVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const handleFlagshipMouseEnter = () => {
    setFlagshipHovered(true);
    if (flagshipVideoRef.current) {
        flagshipVideoRef.current.currentTime = 0;
        flagshipVideoRef.current.play().catch(e => console.log('Autoplay blocked', e));
    }
  };

  const handleFlagshipMouseLeave = () => {
    setFlagshipHovered(false);
    if (flagshipVideoRef.current) {
        flagshipVideoRef.current.pause();
    }
  };

  const handleOpenProject = (id: string) => {
    const project = worksData.find(p => p.id === id);
    if (!project) return;

    const contentMap: Record<string, React.ReactNode> = {
        'lostlight': (
            <div className="space-y-12">
                <div className="border-l-4 border-accent pl-6">
                    <p className="text-xl font-bold mb-6">项目深度解析</p>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        作为S级项目，萤火突击面临红海市场竞争激烈的挑战。我主导了从“定义战场”的差异化定位，到上市爆发期的视觉蓝图构建。
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                     <div className="bg-white/5 p-6 rounded border border-white/10">
                        <h4 className="text-accent font-bold mb-2">01. 策略</h4>
                        <p className="text-sm text-gray-400">挖掘"策略射击"与"爽快出金"的核心卖点。</p>
                     </div>
                     <div className="bg-white/5 p-6 rounded border border-white/10">
                        <h4 className="text-accent font-bold mb-2">02. 视觉</h4>
                        <p className="text-sm text-gray-400">建立完整的VI System，确保全渠道视觉统一。</p>
                     </div>
                     <div className="bg-white/5 p-6 rounded border border-white/10">
                        <h4 className="text-accent font-bold mb-2">03. 运营</h4>
                        <p className="text-sm text-gray-400">搭建AIGC工作流，赋能长线内容产出。</p>
                     </div>
                </div>
                <img src="https://picsum.photos/1200/600?random=10" className="w-full rounded-lg opacity-80" alt="Case Detail" />
            </div>
        )
    };

    setActiveProject({
        id: project.id,
        title: project.title,
        role: "Lead Designer / Art Direction",
        content: contentMap[id] || (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-gray-500">Project details loading or under NDA.</p>
                <p className="text-gray-600 text-sm mt-2">ID: {id}</p>
            </div>
        )
    });
    setModalOpen(true);
  };

  return (
    <div className="bg-dark text-white min-h-screen selection:bg-accent selection:text-white">
      <CustomCursor />
      <MouseTrail />
      <LayoutGrid />
      
      {/* Background Audio */}
      <audio ref={audioRef} loop src="https://assets.mixkit.co/music/preview/mixkit-sci-fi-drone-ambience-2708.mp3" />

      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      
      {/* --- Navigation --- */}
      <nav className={`fixed top-0 w-full z-40 px-4 md:px-8 py-6 flex justify-between items-center transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md py-4 border-b border-white/5' : 'bg-transparent'}`}>
        <a href="#" className="font-black text-2xl tracking-tighter hover:text-white transition-colors mix-blend-overlay text-white cursor-hover" data-cursor="link">GYF.</a>
        
        <div className="hidden md:flex gap-8 text-xs font-bold tracking-widest bg-black/40 backdrop-blur-md px-8 py-3 rounded-full border border-white/10">
            <a href="#" className="hover:text-accent text-white transition-colors cursor-hover" data-cursor="link">简历</a>
            <a href="#experience" className="hover:text-accent text-white transition-colors cursor-hover" data-cursor="link">经历</a>
            <a href="#value" className="hover:text-accent text-white transition-colors cursor-hover" data-cursor="link">价值</a>
            <a href="#flagship" className="hover:text-accent text-white transition-colors cursor-hover" data-cursor="link">案例</a>
            <a href="#works" className="hover:text-accent text-white transition-colors cursor-hover" data-cursor="link">视觉</a>
        </div>

        <div className="flex items-center gap-4">
             {/* Audio Toggle - Text Only */}
             <button 
                onClick={toggleAudio}
                className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-hover w-[120px] text-right"
                data-cursor="link"
             >
                 {isMuted ? "SOUND NO (OFF)" : "SOUND ON"}
             </button>

             <button className="md:hidden text-white cursor-hover"><Menu /></button>
             
             <div className="hidden md:flex items-center gap-2">
                 <button className="p-2 bg-white/5 rounded-full hover:bg-accent transition-all duration-300 group cursor-hover border border-white/10" title="WeChat" data-cursor="link">
                    <MessageCircle size={18} className="text-white" />
                 </button>
                 <a href="tel:18390810208" className="p-2 bg-white/5 rounded-full hover:bg-accent transition-all duration-300 group cursor-hover border border-white/10" title="Call Me" data-cursor="link">
                    <Phone size={18} className="text-white" />
                 </a>
                 <a href="mailto:408179683@qq.com" className="p-2 bg-white/5 rounded-full hover:bg-accent transition-all duration-300 group cursor-hover border border-white/10" title="Email Me" data-cursor="link">
                    <Mail size={18} className="text-white" />
                 </a>
             </div>
        </div>
      </nav>

      <main className="relative z-10">
        <Hero />
        <Experience items={experienceData} />
        <Marquee />
        <Values />
        
        {/* Flagship Section - Updated Hierarchy */}
        <section id="flagship" className="relative w-full h-screen overflow-hidden group" data-cursor="video">
             <div 
                className="absolute inset-0 w-full h-full cursor-pointer"
                onClick={() => handleOpenProject('lostlight')}
                onMouseEnter={handleFlagshipMouseEnter}
                onMouseLeave={handleFlagshipMouseLeave}
             >
                 {/* Static Background Image */}
                 <img 
                    src="https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/H75-1.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vSDc1LTEuanBnIiwiaWF0IjoxNzY1NDQ0NTkzLCJleHAiOjE3OTY5ODA1OTN9.h_Yb-KOlcVjdWEMKk1KORtrVlp0yfw-M62Lv-J0QUFE" 
                    className={`absolute inset-0 w-full h-full object-cover transition duration-1000 ${flagshipHovered ? 'scale-105 opacity-0' : 'scale-100 opacity-100'}`} 
                    alt="Flagship Case - Lost Light" 
                 />
                 {/* Video Background */}
                 <video
                    ref={flagshipVideoRef}
                    src="https://videos.pexels.com/video-files/5532772/5532772-hd_1920_1080_25fps.mp4"
                    muted
                    loop
                    playsInline
                    preload="none"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${flagshipHovered ? 'opacity-100' : 'opacity-0'}`}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>

                {/* Content - Bottom Left, Left Aligned */}
                <div className="absolute top-0 left-0 w-full h-full p-8 md:p-16 lg:p-24 flex flex-col justify-end items-start z-10">
                    {/* Top Label - Absolute relative to container */}
                    <div className="absolute top-24 left-8 md:left-24 flex items-center gap-4">
                        <span className="text-white/60 text-xs font-mono uppercase tracking-wide">NETEASE GAMES / S-TIER</span>
                    </div>

                    {/* Main Title: "Flagship Case" in Chinese, Large Size */}
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4 text-left">
                        旗舰案例
                    </h2>

                    {/* Subtitle: "Firefly Assault", Smaller Size */}
                    <h3 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-8 leading-[0.9] hover:text-accent transition-colors text-left">
                        萤火突击
                    </h3>
                    
                    <div className="max-w-xl border-l-2 border-accent pl-6 text-left">
                        <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed mb-6">
                            本案例将完整展示我如何深度介入产品前端，系统性规划上市打法，高标准落地创意内容，并前瞻性布局长线运营。
                        </p>
                        
                        {/* Chinese Keywords */}
                        <div className="flex flex-wrap gap-3 mb-6">
                             {['策略射击', '全案营销', '视觉体系', 'AIGC工作流'].map(tag => (
                                 <span key={tag} className="border border-white/20 px-3 py-1 text-xs text-gray-400 rounded-full">{tag}</span>
                             ))}
                        </div>

                        <div className="flex items-center gap-2 text-accent text-sm font-bold tracking-widest uppercase hover:text-white transition-colors">
                            Click to Explore <ArrowRight size={16} />
                        </div>
                    </div>
                </div>
             </div>
        </section>

        <SelectedWorks works={worksData} onSelect={handleOpenProject} />
        <VisualDesign />
        <Showreel />
      </main>

      {/* --- Footer --- */}
      <footer id="contact" className="bg-white text-dark py-24 px-6 md:px-12 lg:px-24 relative overflow-hidden border-t border-gray-200">
        <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="flex flex-col justify-between min-h-[400px]">
                <div>
                    <h2 className="text-[10vw] md:text-[8rem] font-black leading-none mb-12 tracking-tighter">
                        LET'S<br /><span className="text-stroke text-transparent hover:text-dark transition-colors duration-500">CONNECT.</span>
                    </h2>
                    <div className="border-l-4 border-accent pl-8 max-w-xl">
                        <p className="text-2xl font-bold mb-6">感谢您花时间阅读我的作品集。</p>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            我相信新兴技术的无限潜力，也相信创造力没有界限。期待用我的经验能为贵团队带来帮助。
                        </p>
                    </div>
                </div>
                <div className="mt-16 space-y-4">
                    <a href="mailto:408179683@qq.com" className="text-3xl md:text-4xl font-black block hover:text-accent transition-colors cursor-hover tracking-tight" data-cursor="link">408179683@qq.com</a>
                    <div className="flex items-center gap-3 text-xl font-mono font-bold text-gray-500">
                        <Phone size={20} className="text-accent"/> 183-9081-0208
                    </div>
                </div>
            </div>

            {/* Interactive Footer Box */}
            <div className="relative w-full h-full min-h-[400px] border border-gray-200 bg-gray-50 flex flex-col justify-between">
                <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                    <div className="text-xs font-mono uppercase tracking-widest text-gray-400">Interactive</div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                </div>
                
                <div className="absolute inset-0 z-0 cursor-hover" data-cursor="model">
                    <Canvas>
                        <FooterSmiley />
                    </Canvas>
                </div>

                <div className="relative z-10 p-6 flex justify-between items-end pointer-events-none">
                    <p className="text-xs text-gray-400">Designed & Built by GYF</p>
                    <div className="text-right">
                        <p className="font-black uppercase text-2xl tracking-tighter">Guo Yifeng</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">© 2025 PORTFOLIO</p>
                    </div>
                </div>
            </div>
        </div>
      </footer>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        data={activeProject} 
      />
    </div>
  );
};

export default App;