import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Menu, Phone, Mail, Instagram, ArrowRight, MessageCircle } from 'lucide-react';
import { Hero, Experience, Values, SelectedWorks, Marquee } from './components/Sections';
import Modal from './components/Modal';
import { FooterSmiley } from './components/SceneElements';
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
  { id: 'stzb', title: '率土之滨', subtitle: '地域服营销 · 增长策略', tags: ['Strategy', 'Design'], imageUrl: 'https://picsum.photos/800/450?random=1' },
  { id: 'racing', title: '巅峰极速', subtitle: 'AI应用 · 降本增效', tags: ['AI Workflow', 'Visuals'], imageUrl: 'https://picsum.photos/800/450?random=2' },
  { id: 'knives', title: '荒野行动', subtitle: '电竞赛事视觉重构', tags: ['Esports', 'Branding'], imageUrl: 'https://picsum.photos/800/450?random=3' },
  { id: 'lostlight', title: '萤火突击', subtitle: 'S级项目全案发行', tags: ['Full Case', 'Launch'], imageUrl: 'https://picsum.photos/800/450?random=4' },
];

const App: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<FlagshipDetails | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Scroll listener for nav
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Modal Handler
  const handleOpenProject = (id: string) => {
    const project = worksData.find(p => p.id === id);
    if (!project) return;

    // Simulate fetching detailed content based on ID
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
      
      {/* --- Navigation --- */}
      <nav className={`fixed top-0 w-full z-40 px-6 py-6 flex justify-between items-center transition-all duration-300 ${scrolled ? 'bg-black/20 backdrop-blur-md py-4' : 'bg-transparent'}`}>
        <a href="#" className="font-black text-2xl tracking-tighter hover:text-white transition-colors mix-blend-overlay text-white">GYF.</a>
        
        <div className="hidden md:flex gap-8 text-xs font-bold tracking-widest bg-black/20 backdrop-blur-md px-8 py-3 rounded-full border border-white/10">
            <a href="#profile" className="hover:text-white/80 text-white transition-colors">简介</a>
            <a href="#experience" className="hover:text-white/80 text-white transition-colors">经历</a>
            <a href="#value" className="hover:text-white/80 text-white transition-colors">价值</a>
            <a href="#flagship" className="hover:text-white/80 text-white transition-colors">案例</a>
            <a href="#gallery" className="hover:text-white/80 text-white transition-colors">视觉</a>
        </div>

        <div className="flex items-center gap-4">
             {/* Mobile Menu */}
             <button className="md:hidden text-white"><Menu /></button>
             
             {/* Contact Buttons (Restored) */}
             <div className="hidden md:flex items-center gap-2">
                 <button className="p-2 bg-black/20 rounded-full hover:bg-white hover:text-brandOrange transition-all duration-300 group" title="WeChat">
                    <MessageCircle size={18} className="text-white group-hover:text-brandOrange" />
                 </button>
                 <a href="tel:18390810208" className="p-2 bg-black/20 rounded-full hover:bg-white hover:text-brandOrange transition-all duration-300 group" title="Call Me">
                    <Phone size={18} className="text-white group-hover:text-brandOrange" />
                 </a>
                 <a href="mailto:408179683@qq.com" className="p-2 bg-black/20 rounded-full hover:bg-white hover:text-brandOrange transition-all duration-300 group" title="Email Me">
                    <Mail size={18} className="text-white group-hover:text-brandOrange" />
                 </a>
             </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main>
        <Hero />
        <Experience items={experienceData} />
        <Marquee />
        <Values />
        
        {/* Flagship Section (Hybrid) */}
        <section id="flagship" className="bg-white text-dark py-32 px-6 md:px-12 lg:px-24">
             <div className="max-w-[1920px] mx-auto">
                <h2 className="text-4xl md:text-6xl font-black mb-16">旗舰案例</h2>
                <div 
                    className="grid grid-cols-1 lg:grid-cols-2 gap-16 cursor-pointer group"
                    onClick={() => handleOpenProject('lostlight')}
                >
                    <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl bg-gray-900">
                        <img src="https://picsum.photos/1920/1080?random=99" className="w-full h-full object-cover transition duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" alt="Flagship" />
                        <div className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                            Explore <ArrowRight size={14} />
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <h3 className="text-5xl font-black mb-6 group-hover:text-accent transition-colors">萤火突击</h3>
                        <div className="flex gap-2 mb-8">
                            <span className="bg-dark text-white px-3 py-1 text-xs font-bold">S级项目</span>
                            <span className="bg-gray-200 text-dark px-3 py-1 text-xs font-bold">全案发行</span>
                        </div>
                        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                            本案例将完整展示我如何深度介入产品前端，系统性规划上市打法，高标准落地创意内容，并前瞻性布局长线运营。
                        </p>
                        <div className="h-[1px] w-full bg-gray-200 group-hover:bg-accent transition-colors"></div>
                    </div>
                </div>
             </div>
        </section>

        <SelectedWorks works={worksData} onSelect={handleOpenProject} />
      </main>

      {/* --- Footer --- */}
      <footer id="contact" className="bg-white text-dark py-24 px-6 md:px-12 lg:px-24 relative overflow-hidden">
        <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="flex flex-col justify-between min-h-[400px]">
                <div>
                    <h2 className="text-[10vw] md:text-[6rem] font-black leading-none mb-12 tracking-tighter">
                        LET'S<br /><span className="text-stroke text-transparent hover:text-dark transition-colors duration-500">CONNECT.</span>
                    </h2>
                    <div className="border-l-4 border-accent pl-6 max-w-xl">
                        <p className="text-xl font-bold mb-6">感谢您花时间阅读我的作品集。</p>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            我认为新兴技术的无限潜力，也相信创造力没有界限。期待用我的经验能为贵团队带来帮助。
                        </p>
                    </div>
                </div>
                <div className="mt-12 space-y-2">
                    <a href="mailto:408179683@qq.com" className="text-2xl font-bold block hover:text-accent transition-colors">408179683@qq.com</a>
                    <div className="flex items-center gap-2 text-xl font-mono font-bold">
                        <Phone size={20} className="text-accent"/> 183-9081-0208
                    </div>
                </div>
            </div>

            {/* Interactive Footer Box */}
            <div className="relative w-full h-full min-h-[400px] border-2 border-accent p-4 flex flex-col justify-end items-end bg-gray-50">
                <div className="absolute top-4 right-4 text-xs font-bold text-accent animate-pulse">INTERACTIVE AREA</div>
                
                <div className="absolute inset-0 z-0">
                    <Canvas>
                        <FooterSmiley />
                    </Canvas>
                </div>

                <div className="relative z-10 text-right pointer-events-none">
                    <p className="font-black uppercase text-xl">Guo Yifeng</p>
                    <p className="text-xs text-gray-500">© 2025 Portfolio.</p>
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