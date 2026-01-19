import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import Hero3DBase from './Hero3DBase';
import { Preloader } from './UI';

interface HeroProps {
  onLoadingComplete?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onLoadingComplete }) => {
  const [loadingFinished, setLoadingFinished] = useState(false);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    if (heroReady && onLoadingComplete) {
      // 3D 动画一结束，立即通知 App 显示顶部 Header
      onLoadingComplete();
    }
  }, [heroReady, onLoadingComplete]);

  // --- UI 弹性动效 ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        // 让底部内容稍微晚一点点点出现，给 Header 一个“先发”的机会，或者几乎同时
        delayChildren: 0.1, 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 40, 
      filter: 'blur(10px)' 
    },
    show: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { 
        type: "spring", 
        stiffness: 80, 
        damping: 15 
      }
    }
  };

  return (
    <section id="hero" className="relative h-screen w-full bg-transparent overflow-hidden">
      
      {!loadingFinished && (
        <Preloader onComplete={() => setLoadingFinished(true)} />
      )}

      <div className="absolute inset-0 z-10 pointer-events-auto">
        <Hero3DBase 
            playIntro={loadingFinished} 
            onIntroComplete={() => setHeroReady(true)} 
        />
      </div>

      {/* 底部 UI */}
      <motion.div 
        className="absolute inset-0 z-20 pointer-events-none px-[4vw] py-[4vh] flex flex-col justify-between"
        variants={containerVariants}
        initial="hidden"
        animate={heroReady ? "show" : "hidden"}
      >
        <div /> 

        <div className="flex justify-between items-end">
          <motion.div variants={itemVariants} className="max-w-md pointer-events-auto mb-10">
            <p className="text-white/70 text-sm font-light leading-relaxed pl-4 border-l-2 border-red-600">
              10年广告与游戏行业创意设计师。<br />
              核心聚焦：把控S级项目的视觉品质（定标准）与利用AI工具提升团队产出效率（建流程）。
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="text-white/50 font-mono text-xs tracking-widest uppercase flex flex-col items-center gap-2 mb-10">
            <div className="animate-bounce flex flex-col items-center">
              Scroll for more 
              <span className="text-red-600 text-lg">↓</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;