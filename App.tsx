
import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import { Experience, Values, ProjectStack, CurvedLoop } from './components/Sections';
import { ParticleBackground } from './components/SceneElements';
import { LayoutGrid, CustomCursor, Preloader } from './components/UI';
import Lightbox from './components/Lightbox';
import { ExperienceItem } from './types';

const experienceData: ExperienceItem[] = [
  {
    period: "2020 - 2025",
    company: "网易游戏 (NetEase Games)",
    role: "高级创意设计师",
    description: "从创意执行到体系搭建的关键跃迁。深度参与《阴阳师》、《率土之滨》、《萤火突击》等十余款S级项目。具备从SLG、FPS、RPG等多品类驾驭能力，覆盖从0-1新品上市到长线LTV运营的全生命周期视觉管理。"
  },
  {
    period: "2017 - 2020",
    company: "广东省广告集团 (GIMC)",
    role: "美术指导",
    description: "扎实的整合营销实战。核心服务中国移动、咪咕等巨头客户。主导的多个互动H5及视频项目获[长城奖]等多个奖项的认可，磨练了解决复杂商业诉求的策略能力。"
  },
  {
    period: "2016 - 2017",
    company: "卡姿兰 (Carslan)",
    role: "设计管培生",
    description: "商业美术的启蒙。于一线市场部与电商部轮岗，建立“创意驱动设计””数据驱动创意“的底层逻辑，确立投身广告创意的职业初心。"
  },
  {
    period: "2012 - 2016",
    company: "长沙理工大学 (CSUST)",
    role: "装饰艺术专业",
    description: "美学根基。系统的艺术理论学习，构建了坚实的审美体系。"
  }
];

const ipText = "大话西游 ✦ 梦幻西游 ✦ 荒野行动 ✦ 暗黑破坏神:不朽 ✦ 哈利波特:魔法觉醒 ✦ 率土之滨 ✦ 阴阳师IP ✦ 萤火突击 ✦ 巅峰极速 ✦ 命运:群星 ✦ 燕云十六声 ✦ 漫威争锋";

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [lightbox, setLightbox] = useState<{ open: boolean; type: 'image' | 'video'; src: string; layoutId?: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Scroll
  useEffect(() => {
    const lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    if (loading) {
        lenis.stop();
        window.scrollTo(0, 0);
    } else {
        lenis.start();
    }
    
    function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, [loading]);

  // Parallax Background Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || loading) return;
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
  }, [loading]);

  // Audio Logic
  useEffect(() => {
    // If video lightbox is active, pause BGM
    if (lightbox?.open && lightbox.type === 'video') {
       if (audioRef.current && !audioRef.current.paused) {
         audioRef.current.pause();
       }
    } else {
       // If lightbox closed (or image only) and not globally muted, play BGM
       if (!isMuted && !loading && audioRef.current?.paused) {
         audioRef.current.play().catch(e => console.log('Audio blocked', e));
       }
    }
  }, [lightbox, isMuted, loading]);

  // Global Click to Start Audio (Browser Policy)
  useEffect(() => {
      const startAudio = () => {
          if (!isMuted && audioRef.current?.paused && !loading) {
              audioRef.current.play().catch(() => {});
          }
      };
      window.addEventListener('click', startAudio);
      return () => window.removeEventListener('click', startAudio);
  }, [isMuted, loading]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isMuted) {
        // Unmuting
        if (!lightbox?.open || lightbox?.type !== 'video') {
           audioRef.current.play().catch(e => console.log('Audio blocked', e));
        }
      } else {
        // Muting
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  const handlePreloaderComplete = () => {
    setLoading(false);
    if (audioRef.current && isMuted) {
       // Auto-unmute on load complete logic if desired, or stay muted until user interacts
       // Current request implies button controls logic.
       // We'll keep default mute behavior unless changed.
       // Actually user says "click page arbitrary area to appear music".
       // So we don't auto-play here aggressively if muted.
    }
    if (lenisRef.current) lenisRef.current.start();
  };

  const handleOpenLightbox = (type: 'image' | 'video', src: string, layoutId?: string) => {
      setLightbox({ open: true, type, src, layoutId });
  };

  const handleCloseLightbox = () => {
      setLightbox(null);
  };

  return (
    <div 
      ref={containerRef}
      className={`selection:bg-red-600 selection:text-white w-full text-white font-sans relative
        ${loading ? 'h-screen overflow-hidden fixed inset-0' : 'min-h-screen'}`}
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
      
      <audio 
        ref={audioRef} 
        loop 
        src="https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/1769487780568-w12444-b8b1e2971a5b79fb.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vMTc2OTQ4Nzc4MDU2OC13MTI0NDQtYjhiMWUyOTcxYTViNzlmYi5tcDMiLCJpYXQiOjE3Njk0ODk5OTUsImV4cCI6MjA4NDg0OTk5NX0.HpB-vFnDOOgrQRBPy_8Zxv-kfNfR2Y_qyD7QYzTEmcI" 
      />

      <Lightbox 
        isOpen={!!lightbox?.open} 
        type={lightbox?.type || 'image'} 
        src={lightbox?.src || ''} 
        onClose={handleCloseLightbox}
        layoutId={lightbox?.layoutId}
      />

      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={handlePreloaderComplete} />}
      </AnimatePresence>

      <motion.div
        className="fixed top-0 left-0 w-full z-50 pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={!loading ? { opacity: 1, y: 0 } : {}}
        transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.5 }}
      >
         <div className="pointer-events-auto">
            <Header isMuted={isMuted} onToggleAudio={toggleAudio} />
         </div>
      </motion.div>

      {!loading && (
        <main className="relative z-10 w-full text-start flex flex-col items-start">
            <Hero isMuted={isMuted} />
            
            <section id="experience" className="w-full relative z-20">
                <Experience items={experienceData} />
            </section>

            <div className="w-full bg-black/0 py-4">
                <CurvedLoop marqueeText={ipText} baseVelocity={1} />
            </div>

            <Values isMuted={isMuted} />
            
            <ProjectStack works={[]} onOpenLightbox={handleOpenLightbox} />
        </main>
      )}
    </div>
  );
};

export default App;
