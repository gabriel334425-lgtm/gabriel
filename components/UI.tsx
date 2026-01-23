import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';

const FONT_FAMILY = '"Sudo", "Courier New", monospace';

// 动效曲线
const REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DURATION = 1.0;

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

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const timeline = [
      { step: 0, delay: 0 },    
      { step: 1, delay: 600 },  
      { step: 2, delay: 1200 }, 
      { step: 3, delay: 1800 }, 
      { step: 4, delay: 2400 }, 
      { step: 5, delay: 3000 }, 
    ];

    // Fix: replaced NodeJS.Timeout[] with any[] to avoid namespace error in browser environments.
    const timers: any[] = [];

    timeline.forEach(({ step: s, delay }) => {
      const timer = setTimeout(() => {
        setStep(s);
        if (s === 5) {
          setTimeout(onComplete, 1200); 
        }
      }, delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // 垂直位移幅度也随字号减小而调整 (从 35 -> 20)
  const getStepData = (s: number) => {
    switch(s) {
      case 0: return { l: "0", r: "0", vOffset: 20 };   
      case 1: return { l: "3", r: "3", vOffset: 15 };   
      case 2: return { l: "5", r: "6", vOffset: 10 };   
      case 3: return { l: "7", r: "5", vOffset: 5 };   
      case 4: return { l: "9", r: "9", vOffset: 0 };    
      case 5: return { l: "9", r: "9", vOffset: 0 };    
      default: return { l: "0", r: "0", vOffset: 0 };
    }
  };

  const { l, r, vOffset } = getStepData(step);
  const isFinished = step === 5;

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex justify-center items-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }} 
          transition={{ duration: 0.8, ease: "easeInOut", delay: 0.4 }} 
        >
          <div className="relative w-full h-full max-w-[1920px]">
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full select-none"
              style={{ fontFamily: FONT_FAMILY }}
            >
              {/* 左侧数字 */}
              <motion.text
                x="48%" 
                y="50%"
                textAnchor="end"
                dominantBaseline="middle"
                fill="#dbdcdc" // 修改颜色
                fontSize="24"  // 修改字号 (原 40)
                fontWeight="bold"
                initial={{ y: 0 }}
                animate={{ 
                  y: -vOffset, 
                  skewX: 0 
                }}
                exit={{ 
                  y: -150, 
                  opacity: 0,
                  skewX: -20 
                }}
                transition={{ duration: 0.6, ease: REVEAL_EASE }}
              >
                {l}
              </motion.text>

              {/* 右侧数字 */}
              <motion.text
                x="52%" 
                y="50%"
                textAnchor="start"
                dominantBaseline="middle"
                fill="#dbdcdc" // 修改颜色
                fontSize="24"  // 修改字号 (原 40)
                fontWeight="bold"
                initial={{ y: 0 }}
                animate={{ 
                  y: vOffset,
                  skewX: 0
                }}
                exit={{ 
                  y: -150,
                  opacity: 0,
                  skewX: -20
                }}
                transition={{ duration: 0.6, ease: REVEAL_EASE }}
              >
                {r}
              </motion.text>
            </svg>
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