
import React from 'react';
import { motion } from 'framer-motion';
import Hero3DBase from './Hero3DBase';

const IMG_GUOYIFENG = 'https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/guoyifeng.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vZ3VveWlmZW5nLnBuZyIsImlhdCI6MTc2OTQ3OTAxOSwiZXhwIjoyMDg0ODM5MDE5fQ.inFQrKRcfQUxPsRFozrXJMMI2B_junWKXzZjfRDTcYM';
const IMG_PORTFOLIO = 'https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/portfolio.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vcG9ydGZvbGlvLnBuZyIsImlhdCI6MTc2OTQ3OTA5MywiZXhwIjoyMDg0ODM5MDkzfQ.dnwI2TevAR3ODu7Vu4pEf9hcfMFUYp3G6JLv28-kPmU';

interface HeroProps {
  isMuted: boolean;
}

const Hero: React.FC<HeroProps> = ({ isMuted }) => {
  return (
    <section
      id="hero"
      className="relative h-screen w-full overflow-hidden bg-transparent"
    >
      {/* === Background Title Layer === */}
      <div className="absolute inset-0 z-0 flex flex-col items-center pointer-events-none select-none px-[4vw]">
         <div className="w-full max-w-[3840px] h-full flex flex-col justify-end pb-[10vh] md:justify-center md:pb-0">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }} 
               transition={{ duration: 1.2, ease: "easeOut" }}
               className="flex flex-col w-full gap-4 md:gap-8"
             >
                 <img src={IMG_GUOYIFENG} className="w-full h-auto object-contain opacity-95 drop-shadow-2xl" alt="GUO YIFENG" />
                 <img src={IMG_PORTFOLIO} className="w-full h-auto object-contain opacity-80" alt="PORTFOLIO" />
             </motion.div>
         </div>
      </div>

      {/* === WebGL Layer === */}
      <div className="absolute inset-0 z-10 pointer-events-auto">
        <Hero3DBase
          playIntro={true}
          onIntroComplete={() => {}}
          isMuted={isMuted}
        />
      </div>

      {/* === Foreground UI Layer === */}
      <motion.div
        className="absolute bottom-0 w-full z-30 px-[4vw] py-[4vh] flex flex-col justify-end pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <div className="flex justify-between items-end w-full max-w-[3840px] mx-auto">
          
          {/* Left Intro */}
          <div className="max-w-lg pointer-events-auto">
            <div className="pl-4 border-l-2 border-red-600 space-y-4">
              <h3 className="text-white text-base md:text-lg font-bold leading-relaxed">
                10年广告与游戏行业创意设计师。
              </h3>
              <p className="text-white/70 text-xs font-light leading-[2.0] text-justify"> 
                核心聚焦两大维度：把控S级项目的视觉品质（定标准）与利用AI工具提升团队产出效率（建流程）。热爱游戏行业，擅长通过梳理视觉规范及搭建AIGC工作流，将个人经验沉淀为可复用的团队资产。
              </p>
            </div>
          </div>

          {/* Right Scroll Hint */}
          <div className="flex flex-col items-end gap-2 mix-blend-difference">
            <div className="font-mono text-[10px] text-red-600 animate-bounce">
              SCROLL TO EXPLORE
            </div>
            <div className="font-mono text-[10px] text-white/50">
              2015 - 2025
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
