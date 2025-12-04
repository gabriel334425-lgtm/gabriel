import React from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { ExperienceItem, ProjectItem } from '../types';
import { HeroScene, MagnetScene } from './SceneElements';

// --- Hero Section ---
export const Hero: React.FC = () => {
  return (
    <section id="profile" className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-brandOrange">
      {/* 1. Background Noise Overlay for texture (optional, mimics reference) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      {/* 2. Main Typography Layer (Behind 3D) */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "circOut" }}
            className="text-center"
          >
              <h1 className="font-serif text-[18vw] leading-[0.8] text-black font-black tracking-tighter">
                  GUO
              </h1>
              <h1 className="font-serif text-[18vw] leading-[0.8] text-black font-black tracking-tighter">
                  YIFENG
              </h1>
          </motion.div>
      </div>

      {/* 3. 3D Scene Layer (In Front of Text) */}
      <div className="absolute inset-0 z-20">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ alpha: true }}>
          <HeroScene />
        </Canvas>
      </div>
      
      {/* 4. Foreground Info Layer */}
      <div className="absolute bottom-12 left-0 right-0 z-30 px-6 md:px-12 flex justify-between items-end">
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-black font-medium max-w-md text-sm md:text-base leading-relaxed"
        >
             <span className="block mb-2 font-bold uppercase text-xs tracking-widest text-white/80">[ 简介 / Profile ]</span>
             10年创意美术实战经验。从4A美术指导到网易市场中心创意核心成员，致力于以<span className="underline decoration-2 underline-offset-2">创意设计解决商业问题</span>。
        </motion.p>

        <div className="text-black text-xs font-bold font-mono animate-bounce hidden md:block">
            SCROLL TO EXPLORE ↓
        </div>
      </div>
    </section>
  );
};

// --- Experience Section ---
export const Experience: React.FC<{ items: ExperienceItem[] }> = ({ items }) => {
  return (
    <section id="experience" className="relative py-24 md:py-32 bg-white text-dark w-full overflow-visible">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Sticky Sidebar */}
        {/* Added z-10 to text to ensure it sits on top of canvas if they overlap */}
        <div className="lg:col-span-4 relative pointer-events-none lg:pointer-events-auto">
            {/* 
                UPDATED: 
                - Changed `justify-center` to `justify-start` 
                - Added `pt-32` padding to align text to top
            */}
            <div className="sticky top-0 h-screen flex flex-col justify-start pt-32">
                
                {/* Text Content */}
                <div className="relative z-10 pointer-events-none mix-blend-difference text-gray-800">
                    <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">工作经历</h2>
                    <p className="text-xs font-mono text-accent uppercase tracking-widest mb-8">Professional Journey</p>
                </div>
                
                {/* 
                  Interactive 3D Container 
                  - UPDATED: Now constrained to `w-[120%]` to fit within the column area more strictly
                  - Removed the massive 250% scale
                */}
                <div className="absolute top-0 left-0 w-[120%] -ml-[10%] h-full -z-10 pointer-events-auto">
                    <Canvas camera={{ position: [0, 0, 10], fov: 40 }} gl={{ alpha: true }}>
                        <MagnetScene />
                    </Canvas>
                </div>
            </div>
        </div>

        {/* Timeline Content */}
        <div className="lg:col-span-8 space-y-20 pt-12 relative z-10">
            {items.map((item, index) => (
                <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group border-l-2 border-gray-200 pl-8 hover:border-accent transition-colors duration-500"
                >
                    <div className="text-4xl md:text-6xl font-black text-gray-200 mb-4 group-hover:text-dark transition-colors duration-500">
                        {item.period}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">
                        {item.company} <span className="text-lg font-light text-gray-500">/ {item.role}</span>
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
                        {item.description}
                    </p>
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
};

// --- Values Section ---
export const Values: React.FC = () => {
    const values = [
        { title: "全案操盘", desc: "从0-1产品定位推导到1-N长线运营的全链路操盘经验。", highlight: "从产品定位(0-1)到长线运营(1-N)" },
        { title: "视觉把控", desc: "设计科班出身，具备极高的商业美学标准。亲自监修KV、PV、CG等高品质物料。", highlight: "直接把控KV、PV、CG的高品质交付" },
        { title: "效能体系", desc: "构建标准化产出SOP与引入前沿AIGC工作流。实战中有效降低外包成本。", highlight: "SOP+AIGC，提升人效20%以上" }
    ];

    return (
        <section id="value" className="bg-dark text-white py-32 px-6 md:px-12 lg:px-24">
             <div className="max-w-[1920px] mx-auto">
                <div className="mb-24 flex items-end gap-4">
                    <h2 className="text-4xl md:text-6xl font-bold">核心能力</h2>
                    <div className="w-16 h-1 bg-accent mb-4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {values.map((v, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="group p-6 border border-white/5 hover:border-accent/50 bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-sm"
                        >
                            <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-accent transition-colors">{v.title}</h3>
                            <p className="text-gray-400 text-base leading-relaxed mb-6">{v.desc}</p>
                            <div className="pt-4 border-t border-white/10 text-xs font-bold text-accent">
                                {v.highlight}
                            </div>
                        </motion.div>
                    ))}
                </div>
             </div>
        </section>
    );
};

// --- Works Section ---
export const SelectedWorks: React.FC<{ works: ProjectItem[], onSelect: (id: string) => void }> = ({ works, onSelect }) => {
    return (
        <section id="gallery" className="bg-darklighter text-white py-32 px-6 md:px-12 lg:px-24 border-t border-white/5">
            <div className="max-w-[1920px] mx-auto">
                <h2 className="text-4xl md:text-6xl font-bold mb-16">精选项目</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {works.map((work, index) => (
                        <motion.div 
                            key={work.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="group relative aspect-video bg-black overflow-hidden cursor-pointer"
                            onClick={() => onSelect(work.id)}
                        >
                            <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                            {/* Simulate video hover with CSS opacity on a container if we had real video elements */}
                            
                            <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black via-black/50 to-transparent">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-3xl font-bold mb-2 group-hover:text-accent transition-colors">{work.title}</h3>
                                    <p className="text-sm text-gray-400 mb-4">{work.subtitle}</p>
                                    <div className="flex gap-2">
                                        {work.tags.map(tag => (
                                            <span key={tag} className="text-[10px] font-mono border border-white/20 px-2 py-1 rounded-full text-white/70">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-accent rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-300">
                                <Play fill="white" className="ml-1" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// --- Marquee Section ---
export const Marquee: React.FC = () => {
    return (
        <div className="bg-gray-100 py-12 overflow-hidden relative border-y border-gray-200">
             <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-100 to-transparent z-10"></div>
             <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-100 to-transparent z-10"></div>
             
             <div className="flex w-max animate-marquee gap-24 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Simulated Logos with Text for now */}
                {[...Array(8)].map((_, i) => (
                    <span key={i} className="text-4xl font-black text-gray-400 tracking-tighter uppercase">
                        PARTNER LOGO {i+1}
                    </span>
                ))}
                 {[...Array(8)].map((_, i) => (
                    <span key={`dup-${i}`} className="text-4xl font-black text-gray-400 tracking-tighter uppercase">
                        PARTNER LOGO {i+1}
                    </span>
                ))}
             </div>
        </div>
    )
}