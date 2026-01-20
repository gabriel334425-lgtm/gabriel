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
      onLoadingComplete();
    }
  }, [heroReady, onLoadingComplete]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
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

      {/* 核心修改：增加 max-w-3840px 和绝对居中，确保大屏下与 Header/Grid 对齐 */}
      <motion.div 
        className="absolute z-20 pointer-events-none px-[4vw] py-[4vh] flex flex-col justify-between w-full h-full max-w-[3840px] left-1/2 -translate-x-1/2"
        variants={containerVariants}
        initial="hidden"
        animate={heroReady ? "show" : "hidden"}
      >
        <div /> 

        <div className="flex justify-between items-end">
          {/* 左下角 */}
          <motion.div variants={itemVariants} className="max-w-lg pointer-events-auto mb-10">
            <div className="pl-4 border-l-2 border-red-600 space-y-2">
                <h3 className="text-white text-base font-bold">10年广告与游戏行业创意设计师。</h3>
                <p className="text-white/70 text-xs font-light leading-relaxed text-justify">
                  核心聚焦两大维度：把控S级项目的视觉质量（定标准）和利用AI工具提高团队产出效率（建流程）。
                  <br className="hidden md:block"/>
                  擅长通过梳理视觉规范及搭建AIGC工作流，将个人经验沉淀为可复用的团队资产，有效解决多方协作中的风格统一难题与产能瓶颈。
                </p>
            </div>
          </motion.div>

          {/* 右下角 */}
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