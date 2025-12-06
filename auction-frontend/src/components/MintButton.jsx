import React from 'react'
import './styles/MintButton.css'

const MintButton = ({onClick}) => {
  return (
    <button className="mint-button" onClick={onClick}>
      <span className="mint-button-text">
        <span className="mint-icon">✨</span>
        Start Minting
      </span>
      <div className="mint-button-shine"></div>
    </button>
  )
}

export default MintButton