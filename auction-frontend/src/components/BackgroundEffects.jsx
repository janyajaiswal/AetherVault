import React from 'react';
import './styles/BackgroundEffects.css';

const BackgroundEffects = () => {
  return (
    <div className="background-effects">
      {/* Animated grid pattern */}
      <div className="animated-grid"></div>
      
      {/* Floating orbs */}
      <div className="floating-orb orb-1"></div>
      <div className="floating-orb orb-2"></div>
      <div className="floating-orb orb-3"></div>
      <div className="floating-orb orb-4"></div>
      <div className="floating-orb orb-5"></div>
      
      {/* Geometric shapes */}
      <div className="geometric-shape shape-1"></div>
      <div className="geometric-shape shape-2"></div>
      <div className="geometric-shape shape-3"></div>
      
      {/* Glowing lines */}
      <div className="glow-line line-1"></div>
      <div className="glow-line line-2"></div>
      <div className="glow-line line-3"></div>
      
      {/* Particle effects */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>
      
      {/* Corner accents */}
      <div className="corner-accent top-left"></div>
      <div className="corner-accent top-right"></div>
      <div className="corner-accent bottom-left"></div>
      <div className="corner-accent bottom-right"></div>
    </div>
  );
};

export default BackgroundEffects;

