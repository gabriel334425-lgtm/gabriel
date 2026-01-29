import React from 'react';
import Hero3DBase from './Hero3DBase';

interface Hero3DProps {
  onLoadingComplete?: () => void;
  isMuted?: boolean;
}

const Hero3D: React.FC<Hero3DProps> = ({ onLoadingComplete, isMuted = true }) => {
  return (
    <div className="absolute inset-0 w-full h-full">
        <Hero3DBase playIntro={true} onIntroComplete={onLoadingComplete || (() => {})} isMuted={isMuted} />
    </div>
  );
};

export default Hero3D;