
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform, Variants } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';
import { NUM_PATHS } from '../constants/svgPaths';

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

export const CountUp: React.FC<{ value: string; className?: string }> = ({ value, className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const numericValue = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
  const suffix = value.replace(/[0-9.-]/g, '');
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });
  const displayValue = useTransform(springValue, (current) => {
    if (numericValue % 1 === 0) return Math.round(current).toString() + suffix;
    return current.toFixed(1) + suffix;
  });
  useEffect(() => { if (inView) motionValue.set(numericValue); }, [inView, numericValue, motionValue]);
  return <motion.span ref={ref} className={className}>{displayValue}</motion.span>;
};

export const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });
    return (
        <motion.div
            ref={ref}
            initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
            animate={isInView ? { y: 0, opacity: 1, filter: 'blur(0px)' } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [displayNum, setDisplayNum] = useState(0);
  const [isExit, setIsExit] = useState(false);
  const sequence = [0, 33, 56, 75, 99];
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < sequence.length - 1) {
        currentIdx++;
        setDisplayNum(sequence[currentIdx]);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsExit(true);
          setTimeout(() => {
            document.body.style.overflow = '';
            onComplete();
          }, 800);
        }, 400);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [onComplete]);

  const leftDigit = Math.floor(displayNum / 10);
  const rightDigit = displayNum % 10;
  // @ts-ignore
  const getPath = (num: number) => NUM_PATHS[num] || NUM_PATHS[0];

  const containerVariants: Variants = {
    initial: { y: 0 },
    exit: { y: "-100%", transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } }
  };

  return (
    <AnimatePresence>
      {!isExit && (
        <motion.div
          variants={containerVariants}
          initial="initial"
          exit="exit"
          className="fixed inset-0 z-[9999] bg-black flex flex-col justify-center items-center overflow-hidden"
        >
          <motion.div 
            initial={{ y: 30, opacity: 0, filter: 'blur(20px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center gap-4"
          >
             <svg className="h-[12vw] md:h-[8vw] w-auto" viewBox="0 0 129 180">
                <motion.path 
                  d={getPath(leftDigit)} 
                  fill="#ffffff" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  key={`l-${leftDigit}`} 
                  transition={{ duration: 0.3 }} 
                />
             </svg>
             <svg className="h-[12vw] md:h-[8vw] w-auto" viewBox="0 0 129 180">
                <motion.path 
                  d={getPath(rightDigit)} 
                  fill="#ffffff" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  key={`r-${rightDigit}`} 
                  transition={{ duration: 0.3 }} 
                />
             </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const CustomCursor: React.FC = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [cursorType, setCursorType] = useState<'default' | 'link' | 'video'>('default');
    useEffect(() => {
      const updateMousePosition = (e: MousePosition) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        const target = e.target as HTMLElement;
        const cursorTarget = target.closest('[data-cursor]');
        setCursorType(cursorTarget ? cursorTarget.getAttribute('data-cursor') as any : 'default');
      };
      // @ts-ignore
      window.addEventListener('mousemove', updateMousePosition);
      // @ts-ignore
      return () => window.removeEventListener('mousemove', updateMousePosition);
    }, []);
    return (
      <motion.div 
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:flex items-center justify-center" 
        animate={{ x: mousePosition.x, y: mousePosition.y, translateX: "-50%", translateY: "-50%" }} 
        transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
      >
        <motion.div className={`rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${cursorType !== 'default' ? 'bg-red-600/90 w-16 h-16 border-0' : 'bg-white w-3 h-3 mix-blend-difference'}`}>
          <AnimatePresence mode="wait">
            {cursorType === 'link' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><ArrowUpRight className="text-white w-6 h-6" /></motion.div>}
            {cursorType === 'video' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Play className="text-white w-6 h-6 fill-white" /></motion.div>}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
};

interface MousePosition { clientX: number; clientY: number; target: EventTarget | null; }
