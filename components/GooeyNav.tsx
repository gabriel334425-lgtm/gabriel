import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface NavItem {
  label: string;
  href: string;
}

interface GooeyNavProps {
  items: NavItem[];
}

const GooeyNav: React.FC<GooeyNavProps> = ({ items }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <nav className="relative">
      <ul className="flex items-center gap-1 md:gap-2 list-none p-0 m-0">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          const isHovered = hoveredIndex === index;
          
          // Determine if we should show the white pill background for this item
          // If something is hovered, the pill follows the hover. 
          // If nothing is hovered, the pill rests on the active item.
          const showPill = isHovered || (isActive && hoveredIndex === null);

          return (
            <li
              key={item.href}
              className="relative px-1"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setActiveIndex(index)}
            >
              <a
                href={item.href}
                className={`relative z-10 block px-5 py-2 text-sm font-semibold transition-colors duration-300 uppercase tracking-wider ${
                  showPill ? "text-black" : "text-white/60 hover:text-white"
                }`}
                onClick={(e) => {
                  if (item.href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = item.href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                      targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
              >
                {item.label}
              </a>

              {showPill && (
                <motion.div
                  layoutId="nav-pill-slider"
                  className="absolute inset-0 z-0 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  initial={false}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 35,
                    mass: 0.8
                  }}
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default GooeyNav;