
import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LightboxProps {
  isOpen: boolean;
  type: 'image' | 'video';
  src: string;
  onClose: () => void;
  layoutId?: string;
}

const Lightbox: React.FC<LightboxProps> = ({ isOpen, type, src, onClose, layoutId }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center cursor-pointer p-4 md:p-10"
        >
          <button 
            onClick={onClose} 
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[1001] p-2 bg-black/20 rounded-full"
          >
            <X size={32} />
          </button>
          
          <div 
            className="relative w-full h-full flex items-center justify-center pointer-events-none"
          >
             {type === 'video' ? (
                 <motion.video 
                   layoutId={layoutId}
                   src={src} 
                   controls 
                   autoPlay 
                   className="max-w-full max-h-[90vh] shadow-2xl rounded-sm outline-none pointer-events-auto"
                   style={{ width: 'auto', height: 'auto' }}
                   onClick={(e) => e.stopPropagation()} 
                 />
             ) : (
                 <motion.img 
                   layoutId={layoutId}
                   src={src} 
                   alt="Enlarged" 
                   className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-sm select-none pointer-events-auto"
                   onClick={(e) => e.stopPropagation()} 
                 />
             )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Lightbox;
