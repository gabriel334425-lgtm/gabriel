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
  { label: '旗舰', href: '#masterpiece' },
  { label: '案例', href: '#showcase' },
  { label: '视觉', href: '#visuals' },
];

const Header: React.FC<HeaderProps> = ({ isMuted, onToggleAudio }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isWeChatHovered, setIsWeChatHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
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
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-[4vw] py-4 flex items-center justify-between
      ${scrolled ? 'bg-black/40 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}
    >
      {/* Logo */}
      <div className="flex-none">
        <a href="#hero" onClick={handleLogoClick} className="block">
          <img 
            src="https://osjktzwgjlluqjifhxpa.supabase.co/storage/v1/object/sign/protfolio/gyf_logo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNTg5OTEyYS1lYTBlLTRhOTYtYTIzZC1iY2RmMmM2ZDNhNTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm90Zm9saW8vZ3lmX2xvZ28uc3ZnIiwiaWF0IjoxNzY4MjE4ODQzLCJleHAiOjE3OTk3NTQ4NDN9.u-Qt-BWLkkieJCjem0qp_9-Revq8qujLPF3BWdLJIpI" 
            alt="GYF Logo" 
            className="h-10 md:h-14 w-auto object-contain brightness-200 cursor-pointer"
          />
        </a>
      </div>

      {/* Gooey Navigation - Center */}
      <div className="hidden lg:block">
        <GooeyNav items={navItems} />
      </div>

      {/* Tools - Right */}
      <div className="flex items-center gap-5">
        {/* BGM Toggle */}
        <button 
          onClick={onToggleAudio}
          className="text-white/50 hover:text-white transition-all p-2 rounded-full hover:bg-white/5 group"
          title="BGM Toggle"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-white animate-pulse" />}
        </button>

        {/* WeChat */}
        <div 
          className="relative"
          onMouseEnter={() => setIsWeChatHovered(true)}
          onMouseLeave={() => setIsWeChatHovered(false)}
        >
          <button className="text-white/50 hover:text-white transition-all p-2 rounded-full hover:bg-white/5">
            <MessageCircle size={18} />
          </button>
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
                            QR CODE PLACEHOLDER
                        </div>
                    </div>
                </div>
                <div className="absolute top-[-6px] right-4 w-3 h-3 bg-white rotate-45"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tel */}
        <a 
          href="tel:18390810208"
          className="text-white/50 hover:text-white transition-all p-2 rounded-full hover:bg-white/5 hidden sm:block"
        >
          <Phone size={18} />
        </a>

        {/* Mail */}
        <a 
          href="mailto:408179683@qq.com"
          className="text-white/50 hover:text-white transition-all p-2 rounded-full hover:bg-white/5"
        >
          <Mail size={18} />
        </a>
      </div>
    </motion.nav>
  );
};

export default Header;