import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Play, ArrowUpRight, Box, Triangle } from 'lucide-react';

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

// --- Mouse Trail Component ---
export const MouseTrail: React.FC = () => {
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const requestRef = useRef<number>();
  const timerRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPoint = { x: e.clientX, y: e.clientY, id: Date.now() };
      
      setTrail((prev) => {
        // Keep only last 15 points for performance and trail length
        const newTrail = [...prev, newPoint];
        if (newTrail.length > 20) newTrail.shift(); 
        return newTrail;
      });
      
      // Clear trailing points if mouse stops
      clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
         setTrail([]);
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <svg className="fixed inset-0 pointer-events-none z-[9998] w-full h-full overflow-visible">
      {trail.length > 1 && (
        <polyline
          points={trail.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeOpacity="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};

export const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const start = performance.now();

    const frame = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Linear progress for numbers
      setCount(Math.round(progress * 100));

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setTimeout(onComplete, 200);
      }
    };

    requestAnimationFrame(frame);
  }, [onComplete]);

  // Calculate position based on count (0 -> edge, 100 -> center)
  // At 0%, gap is large (e.g. 40vw). At 100%, gap is 0.
  // Using easeOutQuart for the "gathering" effect
  const easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4);
  const progress = count / 100;
  const easedProgress = easeOutQuart(progress);
  
  // Initial offset (distance from center)
  const maxOffset = 45; // vw
  const currentOffset = maxOffset * (1 - easedProgress);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center text-white overflow-hidden"
    >
      <div className="relative w-full h-screen flex items-center justify-center">
         {/* Left Digit Group (Tens) */}
         <div 
            className="absolute font-bg text-[15vw] md:text-[12rem] lg:text-[16rem] leading-none tracking-tighter text-white font-black text-right"
            style={{ 
                right: "50%", 
                marginRight: `${currentOffset}vw`,
                opacity: 1 // Always visible
            }}
         >
            {count === 100 ? "GUO" : Math.floor(count / 10)}
         </div>

         {/* Right Digit Group (Ones) */}
         <div 
            className="absolute font-bg text-[15vw] md:text-[12rem] lg:text-[16rem] leading-none tracking-tighter text-white font-black text-left"
            style={{ 
                left: "50%", 
                marginLeft: `${currentOffset}vw`,
                opacity: 1 // Always visible
            }}
         >
             {count === 100 ? "YIFENG" : (count % 10)}
         </div>
      </div>
      
      {/* Progress Bar Line */}
      <div className="absolute bottom-0 left-0 h-1 bg-accent transition-all duration-100 ease-linear" style={{ width: `${count}%` }}></div>
    </motion.div>
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
            
            // Check for specific cursor data attributes
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
                        ? 'bg-accent/90 w-16 h-16 border-0' 
                        : isPointer 
                            ? 'bg-white w-4 h-4' 
                            : 'bg-accent w-3 h-3 mix-blend-difference'
                }`}
            >
                <AnimatePresence mode="wait">
                    {cursorType === 'link' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                        >
                            <ArrowUpRight className="text-white w-8 h-8" strokeWidth={1.5} />
                        </motion.div>
                    )}
                    {cursorType === 'video' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                        >
                            <Play className="text-white w-6 h-6 fill-white ml-1" />
                        </motion.div>
                    )}
                    {cursorType === 'model' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                        >
                           <Triangle className="text-white w-6 h-6 stroke-[1.5]" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            
             <AnimatePresence>
                {cursorType === 'model' && (
                     <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 50 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute left-0 bg-black/80 text-white text-[10px] px-2 py-1 rounded font-mono uppercase tracking-widest whitespace-nowrap"
                     >
                        Interactive 3D
                     </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};