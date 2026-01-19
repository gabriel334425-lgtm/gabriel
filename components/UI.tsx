import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FONT_FAMILY = '"Sudo", monospace';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const timeline = [
      { step: 0, delay: 0 },    // 00 - Edge
      { step: 1, delay: 600 },  // 33
      { step: 2, delay: 1200 }, // 56
      { step: 3, delay: 1800 }, // 75
      { step: 4, delay: 2400 }, // 9|9 Merge
      { step: 5, delay: 3000 }, // End
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];

    timeline.forEach(({ step: s, delay }) => {
      const timer = setTimeout(() => {
        setStep(s);
        if (s === 5) {
          onComplete(); 
        }
      }, delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Position Calculation
  const getStepData = (s: number) => {
    switch(s) {
      // mode: 'normal' (distributed) | 'center' (merged)
      // pos: offset from center (vw)
      case 0: return { l: "0", r: "0", pos: 5, mode: 'normal' };   
      case 1: return { l: "3", r: "3", pos: 33, mode: 'normal' };   
      case 2: return { l: "5", r: "6", pos: 42, mode: 'normal' };   
      case 3: return { l: "7", r: "5", pos: 45, mode: 'normal' };   
      
      // 99 Merge Mode:
      // Left 9: Base is center, translate left 50% -> Stick to left of center line
      // Right 9: Base is center, translate right 50% -> Stick to right of center line
      case 4: return { l: "9", r: "9", pos: 0, mode: 'center' }; 
      case 5: return { l: "9", r: "9", pos: 0, mode: 'center' }; 
      default: return { l: "0", r: "0", pos: 0, mode: 'normal' };
    }
  };

  const { l, r, pos, mode } = getStepData(step);
  const isFinished = step === 5;

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex justify-center overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="relative w-full h-full" style={{ fontFamily: FONT_FAMILY }}>
            
            {/* Left Digit */}
            <div 
              className="absolute text-white font-bold leading-none tracking-tighter"
              style={{ 
                top: '40%',
                // If center mode, left is 50% (screen center line)
                left: mode === 'center' ? '50%' : `${pos}vw`,
                right: 'auto',
                
                // Font size adaptation
                fontSize: 'clamp(3rem, 16vw, 13rem)', 
                
                // center mode: translate(-100%) aligns right edge of text to center line
                // normal mode: translate(-50%) centers text itself
                transform: mode === 'center' ? 'translate(-100%, -50%)' : 'translate(-50%, -50%)',
                
                transition: 'none',
                textAlign: 'right'
              }}
            >
              {l}
            </div>

            {/* Right Digit */}
            <div 
              className="absolute text-white font-bold leading-none tracking-tighter"
              style={{ 
                top: '40%',
                // center mode: left is 50% (screen center line)
                // normal mode: right is pos
                left: mode === 'center' ? '50%' : 'auto',
                right: mode === 'center' ? 'auto' : `${pos}vw`,
                
                fontSize: 'clamp(3rem, 16vw, 13rem)', 
                
                // center mode: translate(0%) aligns left edge of text to center line
                // normal mode: translate(50%) centers text itself
                transform: mode === 'center' ? 'translate(0%, -50%)' : 'translate(50%, -50%)',
                
                transition: 'none',
                textAlign: 'left'
              }}
            >
              {r}
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const LayoutGrid: React.FC = () => {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none w-full h-full select-none opacity-10">
        <div className="max-w-[1920px] mx-auto w-full h-full px-6 flex justify-between">
          <div className="w-px h-full bg-white/10"></div>
          <div className="w-px h-full bg-white/10 hidden md:block"></div>
          <div className="w-px h-full bg-white/10"></div>
          <div className="w-px h-full bg-white/10 hidden md:block"></div>
          <div className="w-px h-full bg-white/10"></div>
        </div>
      </div>
    );
};

export const CustomCursor: React.FC = () => null;