import React from 'react'
import './styles/MintButton.css'

const MintButton = ({onClick}) => {
  return (
    <button class="mint-button" onClick={onClick}>
        <div class="lid">
            <span class="side top"></span>
            <span class="side front"></span>
            <span class="side back"> </span>
            <span class="side left"></span>
            <span class="side right"></span>
        </div>
        <div class="panels">
            <div class="panel-1">
            <div class="panel-2">
                <div class="btn-trigger">
                <span class="btn-trigger-1"></span>
                <span class="btn-trigger-2"></span>
                </div>
            </div>
            </div>
        </div>
    </button>
  )
}

export default MintButton