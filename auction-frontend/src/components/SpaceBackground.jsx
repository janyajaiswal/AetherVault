import React from 'react';
import './styles/SpaceBackground.css';

const SpaceBackground = () => {
  return (
    <div className="space-background">
      <div className="stars"></div>
      <div className="nebula nebula-1"></div>
      <div className="nebula nebula-2"></div>
      <div className="nebula nebula-3"></div>
      
      {/* Planets */}
      <div className="planet planet-1"></div>
      <div className="planet planet-2"></div>
      <div className="planet planet-3"></div>
      <div className="planet planet-4"></div>
      
      {/* Asteroids */}
      <div className="asteroid asteroid-1"></div>
      <div className="asteroid asteroid-2"></div>
      <div className="asteroid asteroid-3"></div>
      <div className="asteroid asteroid-4"></div>
      <div className="asteroid asteroid-5"></div>
      
      {/* Comets */}
      <div className="comet comet-1"></div>
      <div className="comet comet-2"></div>
      
      {/* Spaceship */}
      <div className="spaceship"></div>
      
      {/* Shooting stars - slower and clearer */}
      <div className="shooting-star shooting-star-1"></div>
      <div className="shooting-star shooting-star-2"></div>
      <div className="shooting-star shooting-star-3"></div>
      
      <div className="space-dust">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="dust-particle"></div>
        ))}
      </div>
    </div>
  );
};

export default SpaceBackground;

