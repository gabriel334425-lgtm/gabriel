
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import GooeyNav from './GooeyNav';

interface HeaderProps {
  isMuted: boolean;
  onToggleAudio: () => void;
}

const navItems = [
  { label: '首页', href: '#hero' },
  { label: '经历', href: '#experience' },
  { label: '旗舰', href: '#flagship' }, 
  { label: '案例', href: '#works' },    
  { label: '视觉', href: '#visual' },   
];

const Header: React.FC<HeaderProps> = ({ isMuted, onToggleAudio }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isWeChatHovered, setIsWeChatHovered] = useState(false);
  const [activeSection, setActiveSection] = useState('#hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Scroll Spy Logic
      const sections = navItems.map(item => item.href.substring(1));
      let current = '';

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Check if element is at least partially visible and near the top/middle of viewport
          // We prioritize the last section that satisfies the condition in DOM order if checking from top,
          // but here we just check if the top is above the middle of screen.
          if (rect.top <= window.innerHeight * 0.5) {
             current = '#' + id;
          }
        }
      }
      
      if (current) {
        setActiveSection(current);
      } else if (window.scrollY < 100) {
        // Fallback for very top
        setActiveSection('#hero');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 2.4, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
      ${scrolled ? 'bg-black/40 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}
    >
      <div className="w-full max-w-[3840px] mx-auto px-[4vw] py-4 flex items-center justify-between">
        
        <div className="flex-none z-20">
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#hero" 
            onClick={handleLogoClick} 
            className="block"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/gabriel334425-lgtm/gabriel@4abf8aa142ee4a43ed00a9b5db3b606efa8e9db4/GYF_logo2.png" 
              alt="GYF Logo" 
              className="h-10 md:h-14 w-auto object-contain brightness-200 cursor-pointer"
            />
          </motion.a>
        </div>

        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2">
          <GooeyNav items={navItems} activeSection={activeSection} />
        </div>

        <div className="flex items-center gap-5 z-20">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleAudio}
            className="text-white/50 hover:text-white transition-all p-2 rounded-full hover:bg-white/5 group"
            title="BGM Toggle"
          >
            <AnimatePresence mode="wait">
              {isMuted ? (
                <motion.div key="mute" initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 45 }} transition={{ duration: 0.2 }}>
                  <VolumeX size={18} />
                </motion.div>
              ) : (
                <motion.div key="unmute" initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 45 }} transition={{ duration: 0.2 }}>
                  <Volume2 size={18} className="text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <div 
            className="relative"
            onMouseEnter={() => setIsWeChatHovered(true)}
            onMouseLeave={() => setIsWeChatHovered(false)}
          >
            <motion.button whileHover={{ scale: 1.1 }} className="text-white/50 hover:text-white transition-all p-2 rounded-full hover:bg-white/5">
              <MessageCircle size={18} />
            </motion.button>
            <AnimatePresence>
              {isWeChatHovered && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.9 }}
                  className="absolute top-full right-0 mt-5 p-3 bg-white rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20"
                >
                  <div className="w-32 h-32 bg-gray-50 flex items-center justify-center border-4 border-white">
                      <div className="flex flex-col items-center gap-1">
                          <div className="w-24 h-24 bg-zinc-200 border-2 border-dashed border-zinc-400 flex items-center justify-center text-[10px] text-zinc-500 font-mono text-center px-2">
                              QR CODE
                          </div>
                      </div>
                  </div>
                  <div className="absolute top-[-6px] right-4 w-3 h-3 bg-white rotate-45"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.a 
            whileHover={{ scale: 1.1 }}
            href="tel:18390810208"
            className="text-white/50 hover:text-white transition-all p-2 rounded-full hover:bg-white/5 hidden sm:block"
          >
            <Phone size={18} />
          </motion.a>

          <motion.a 
            whileHover={{ scale: 1.1 }}
            href="mailto:408179683@qq.com"
            className="text-white/50 hover:text-white transition-all p-2 rounded-full hover:bg-white/5"
          >
            <Mail size={18} />
          </motion.a>
        </div>
      </div>
    </motion.nav>
  );
};

export default Header;
