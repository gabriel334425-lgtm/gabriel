import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlagshipDetails } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FlagshipDetails | null;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, data }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
        {isOpen && data && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex justify-center items-center bg-black/90 backdrop-blur-md p-4 md:p-8"
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="w-full max-w-6xl h-full max-h-full bg-darklighter border-t-4 border-accent shadow-2xl overflow-hidden flex flex-col relative rounded-sm"
                >
                    
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-white/10 bg-darklighter sticky top-0 z-10">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider">{data.title}</h2>
                            <p className="text-xs text-gray-400 font-mono">{data.role}</p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors group"
                        >
                            <X className="w-8 h-8 group-hover:text-accent transition-colors" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto flex-1 p-6 md:p-12 no-scrollbar">
                        {data.content}
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );
};

export default Modal;