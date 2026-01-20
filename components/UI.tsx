
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';

const FONT_FAMILY = '"Sudo", monospace';

// 核心：统一的动效参数 (The Golden Curve)
// 这个曲线对应 CSS 的 cubic-bezier(0.22, 1, 0.36, 1)
// Fix: Explicitly typed as a tuple [number, number, number, number] to satisfy Framer Motion's ease type requirement.
const REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DURATION = 1.0; // 统一动画时长

export const LayoutGrid: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full select-none opacity-10">
      <div className="max-w-[3840px] mx-auto w-full h-full px-6 flex justify-between">
        <div className="w-px h-full bg-white/10"></div>
        <div className="w-px h-full bg-white/10 hidden md:block"></div>
        <div className="w-px h-full bg-white/10"></div>
        <div className="w-px h-full bg-white/10 hidden md:block"></div>
        <div className="w-px h-full bg-white/10"></div>
      </div>
    </div>
  );
};

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [fontLoaded, setFontLoaded] = useState(false);

  useLayoutEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() => {
        document.fonts.load('1em "Sudo"').then(() => {
          setFontLoaded(true);
        });
      });
    } else {
      setTimeout(() => setFontLoaded(true), 100);
    }
  }, []);

  useEffect(() => {
    if (!fontLoaded) return;

    document.body.style.overflow = 'hidden';

    const timeline = [
      { step: 0, delay: 0 },    
      { step: 1, delay: 600 },  
      { step: 2, delay: 1200 }, 
      { step: 3, delay: 1800 }, 
      { step: 4, delay: 2400 }, // 9|9 Merge
      { step: 5, delay: 3000 }, // Exit Start
    ];

    const timers: NodeJS.Timeout[] = [];

    timeline.forEach(({ step: s, delay }) => {
      const timer = setTimeout(() => {
        setStep(s);
        if (s === 5) {
          // 给足时间让 exit 动画播完 (1.2s)
          setTimeout(onComplete, 1200); 
        }
      }, delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [onComplete, fontLoaded]);

  const getStepData = (s: number) => {
    switch(s) {
      case 0: return { l: "0", r: "0", vPos: 35 };   
      case 1: return { l: "3", r: "3", vPos: 25 };   
      case 2: return { l: "5", r: "6", vPos: 15 };   
      case 3: return { l: "7", r: "5", vPos: 8 };   
      case 4: return { l: "9", r: "9", vPos: 0 };    
      case 5: return { l: "9", r: "9", vPos: 0 };    
      default: return { l: "0", r: "0", vPos: 0 };
    }
  };

  const { l, r, vPos } = getStepData(step);
  const isFinished = step === 5;

  return (
    <AnimatePresence>
      {fontLoaded && !isFinished && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }} 
          // 背景稍微延迟一点点淡出，确保数字先开始移动
          transition={{ duration: 0.8, ease: "easeInOut", delay: 0.4 }} 
        >
          <div className="relative w-full h-full" style={{ fontFamily: FONT_FAMILY }}>
            
            {/* Left Digit */}
            <div 
               className="absolute font-bold leading-none tracking-tighter text-white"
               style={{
                 top: `calc(50% - ${vPos}vh)`,
                 left: '50%',
                 transform: 'translate(-100%, -50%)',
                 fontSize: 'clamp(2.5rem, 12vw, 10rem)', 
                 textAlign: 'right',
                 transition: 'top 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
               }}
            >
              <motion.div
                // 核心退场：向上飞出，带拉伸
                exit={{ y: "-150%", skewY: 5, opacity: 0 }}
                transition={{ duration: DURATION, ease: REVEAL_EASE }}
              >
                {l}
              </motion.div>
            </div>

            {/* Right Digit */}
            <div 
               className="absolute font-bold leading-none tracking-tighter text-white"
               style={{
                 top: `calc(50% + ${vPos}vh)`,
                 left: '50%',
                 transform: 'translate(0%, -50%)',
                 fontSize: 'clamp(2.5rem, 12vw, 10rem)', 
                 textAlign: 'left',
                 transition: 'top 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
               }}
            >
              <motion.div
                // 核心退场：向上飞出，带拉伸
                exit={{ y: "-150%", skewY: 5, opacity: 0 }}
                transition={{ duration: DURATION, ease: REVEAL_EASE }}
              >
                {r}
              </motion.div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const CustomCursor: React.FC = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [cursorType, setCursorType] = useState<'default' | 'link' | 'video' | 'model'>('default');
    const [isPointer, setIsPointer] = useState(false);
  
    useEffect(() => {
      const updateMousePosition = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        const target = e.target as HTMLElement;
        const cursorTarget = target.closest('[data-cursor]');
        const type = cursorTarget ? cursorTarget.getAttribute('data-cursor') : 'default';
        setCursorType(type as any);
  
        const computedStyle = window.getComputedStyle(target);
        if (computedStyle.cursor === 'pointer' && type === 'default') {
          setIsPointer(true);
        } else {
          setIsPointer(false);
        }
      };
  
      window.addEventListener('mousemove', updateMousePosition);
      return () => window.removeEventListener('mousemove', updateMousePosition);
    }, []);
  
    return (
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:flex items-center justify-center"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          translateX: "-50%",
          translateY: "-50%"
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
      >
        <motion.div 
          className={`rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${
            cursorType !== 'default' 
              ? 'bg-red-600/90 w-16 h-16 border-0' 
              : isPointer 
                ? 'bg-white w-4 h-4' 
                : 'bg-red-600 w-3 h-3 mix-blend-difference'
          }`}
        >
          <AnimatePresence mode="wait">
            {cursorType === 'link' && (
              <motion.div key="link" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}>
                <ArrowUpRight className="text-white w-6 h-6" />
              </motion.div>
            )}
            {cursorType === 'video' && (
              <motion.div key="video" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}>
                <Play className="text-white w-6 h-6 fill-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
};
