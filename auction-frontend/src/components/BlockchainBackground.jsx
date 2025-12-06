import React from 'react';
import './styles/BlockchainBackground.css';

const BlockchainBackground = () => {
  return (
    <div className="blockchain-background">
      {/* Animated grid pattern */}
      <div className="blockchain-grid"></div>
      
      {/* Hexagonal patterns */}
      <div className="hex-pattern hex-1"></div>
      <div className="hex-pattern hex-2"></div>
      <div className="hex-pattern hex-3"></div>
      
      {/* Blockchain nodes */}
      <div className="blockchain-node node-1"></div>
      <div className="blockchain-node node-2"></div>
      <div className="blockchain-node node-3"></div>
      <div className="blockchain-node node-4"></div>
      <div className="blockchain-node node-5"></div>
      <div className="blockchain-node node-6"></div>
      
      {/* Connection lines between nodes */}
      <div className="connection-line line-1"></div>
      <div className="connection-line line-2"></div>
      <div className="connection-line line-3"></div>
      <div className="connection-line line-4"></div>
      
      {/* Crypto coins floating */}
      <div className="crypto-coin coin-1">₿</div>
      <div className="crypto-coin coin-2">Ξ</div>
      <div className="crypto-coin coin-3">₿</div>
      <div className="crypto-coin coin-4">Ξ</div>
      
      {/* Data streams */}
      <div className="data-stream stream-1"></div>
      <div className="data-stream stream-2"></div>
      <div className="data-stream stream-3"></div>
      
      {/* Circuit board patterns */}
      <div className="circuit-pattern circuit-1"></div>
      <div className="circuit-pattern circuit-2"></div>
      
      {/* Digital particles */}
      <div className="digital-particles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className={`digital-particle particle-${i + 1}`}></div>
        ))}
      </div>
      
      {/* Binary code rain */}
      <div className="binary-rain">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`binary-column col-${i + 1}`}>
            {[...Array(10)].map((_, j) => (
              <span key={j} className="binary-digit">{Math.random() > 0.5 ? '1' : '0'}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockchainBackground;

