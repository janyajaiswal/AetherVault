import React from 'react'
import './styles/DeedCard.css'

const GetIpfsUrlFromPinata = (pinataUrl) => {
  var IPFSUrl = pinataUrl.split("/");
  const lastIndex = IPFSUrl.length;
  IPFSUrl = "https://ipfs.io/ipfs/"+IPFSUrl[lastIndex-1];
  return IPFSUrl;
};

const DeedCard = ({data}) => {

  const IPFSUrl = GetIpfsUrlFromPinata(data.data.image);

  return (
    <div class="container noselect">
        <div class="canvas">
            <div class="tracker tr-1"></div>
            <div class="tracker tr-2"></div>
            <div class="tracker tr-3"></div>
            <div class="tracker tr-4"></div>
            <div class="tracker tr-5"></div>
            <div class="tracker tr-6"></div>
            <div class="tracker tr-7"></div>
            <div class="tracker tr-8"></div>
            <div class="tracker tr-9"></div>
            <div id="card">
            <div class="card-content">
                <div class="card-glare"></div>
                <div class="cyber-lines">
                <span></span><span></span><span></span><span></span>
                </div>
                <p id="prompt">{data.data.name}</p>
                <div class="title">{data.data.name}</div>
                <div class="glowing-elements">
                <div class="glow-1"></div>
                <div class="glow-2"></div>
                <div class="glow-3"></div>
                </div>
                <div class="subtitle">
                <span><img src={IPFSUrl} alt="image" style={{width : 100}} /></span>
                <span class="highlight">{data.data.description}</span>
                </div>
                <div class="card-particles">
                <span></span><span></span><span></span> <span></span><span></span
                ><span></span>
                </div>
                <div class="corner-elements">
                <span></span><span></span><span></span><span></span>
                </div>
                <div class="scan-line"></div>
            </div>
            </div>
        </div>
    </div>
  )
}

export default DeedCard