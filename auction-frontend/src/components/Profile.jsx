// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import axios from 'axios';
// import NFTAuction from '../abis/NFTAuction.json';
// import { getProvider } from '../services/blockchainService';
// import './styles/Profile.css';

// const GetIpfsUrlFromPinata = (pinataUrl) => {
//   const parts = pinataUrl.split('/');
//   return `https://ipfs.io/ipfs/${parts[parts.length - 1]}`;
// };

// export default function Profile() {
//   const [data, setData] = useState([]);
//   const [addr, setAddr] = useState('');          // <-- start as empty string
//   const [totalPrice, setTotalPrice] = useState(0);
//   const [offerButtonVisible, setOfferButtonVisible] = useState(true);

//   useEffect(() => {
//     getNFTData();
//   }, []);

//   async function getNFTData() {
//     try {
//       const provider = await getProvider();

//       // 1) get your signer and address
//       const signer  = await provider.getSigner();
//       const address = await signer.getAddress();
//       setAddr(address);                           // <-- now a string

//       // 2) instantiate your contract (using provider or signer; read‑only OK)
//       const contract = new ethers.Contract(
//         NFTAuction.networks[5777].address,
//         NFTAuction.abi,
//         signer
//       );

//       // 3) fetch user’s NFTs
//       const raw = await contract.getMyNFTs(true);

//       // 4) hydrate them
//       let sum = 0;
//       const items = await Promise.all(
//         raw.map(async (i) => {
//           const uri  = GetIpfsUrlFromPinata(await contract.tokenURI(i.tokenId));
//           const { data: meta } = await axios.get(uri);

//           const price = ethers.formatEther(i.price);
//           sum += Number(price);
//           hideOfferButton(i.tokenId); // Check if the offer button should be hidden
//           return {
//             price,
//             tokenId: i.tokenId.toString(),
//             seller: i.seller,
//             owner: i.owner,
//             image: meta.image,
//             name: meta.name,
//             description: meta.description,
//           };
//         })
//       );

//       setData(items);
//       setTotalPrice(sum);
//     } catch (err) {
//       console.error('Failed to load NFTs:', err);
//     }
//   }

//   async function hideOfferButton(tokenId) {
//     try {
//       const provider = await getProvider();
//       const signer = await provider.getSigner();
//       const contract = new ethers.Contract(
//         NFTAuction.networks[5777].address,
//         NFTAuction.abi,
//         signer
//       );

//       // Call the hideOfferButton function from the contract
//       const tx = await contract.isTokenListed(tokenId);
//       // await tx.wait(); // Wait for the transaction to be mined
//       if (tx) {
//         setOfferButtonVisible(false);
//       }
      

//     } catch (error) {
//       console.error('Error hiding offer button:', error);
//     }

//   }

//   async function listNFT(tokenId, price) {
//     try {
//       const provider = await getProvider();
//       const signer = await provider.getSigner();
//       const contract = new ethers.Contract(
//         NFTAuction.networks[5777].address,
//         NFTAuction.abi,
//         signer
//       );

//       // try {
//       //   // 

//       //   // 1) Simulate the call
//       //   const tx = await contract.listNFTAgain.staticCall(BigInt(tokenId));
//       //   console.log("Simulated transaction:", tx);

//       // } catch (simErr) {
//       //   // callStatic will bubble up the actual `require(...)` message
//       //   console.error("callStatic error object:", simErr);

//       //   // ethers v6 puts the human‑readable reason in one of these…
//       //   const reason =
//       //     // this is set when you do `require(..., "Foo")`
//       //     simErr.reason
//       //     // v6 also surfaces a “shortMessage” containing that same text
//       //     ?? simErr.shortMessage
//       //     // some nodes drop both, but leave raw error data here
//       //     ?? simErr.data
//       //     // fallback to the generic JS error message
//       //     ?? simErr.message;

//       //   alert(`Cannot claim NFT: ${reason}`);
//       //   return;
//       // }

//       // // Call the listNFT function from the contract
//       const priceInEther = ethers.parseUnits(price, 'ether');
//       let listingPrice = await contract.getListPrice();
//       listingPrice = listingPrice.toString();

//       const tx = await contract.listNFTAgain(tokenId, priceInEther, { value: listingPrice });
//       await tx.wait(); // Wait for the transaction to be mined
//       alert('NFT listed successfully!');
//       hideOfferButton(tokenId); // Hide the button after listing
//       console.log('NFT listed successfully!');
//     } catch (error) {
//       console.error('Error listing NFT:', error);
//     }
//   }

//   return (
//     <div className="profile-container">
//       <h1 className="profile-heading">Profile</h1>
//       <div className="profile-stats">
//         <p><strong>Wallet Address:</strong> {addr || 'Not connected'}</p>
//         <p><strong>No. of NFTs:</strong> {data.length}</p>
//         <p><strong>Total Value:</strong> {totalPrice} ETH</p>
//       </div>

//       <h2 className="profile-subheading">My NFTs</h2>
//       {data.length === 0 ? (
//         <p className="no-nfts">No NFTs found.</p>
//       ) : (
//         <div className="nft-grid">
//           {data.map((item) => (
//             <div className="nft-card" key={item.tokenId}>
//               <img src={item.image} alt={item.name} />
//               <div className="nft-info">
//                 <h3>{item.name}</h3>
//                 <p>{item.description}</p>
//                 <p><strong>Token ID:</strong> {item.tokenId}</p>
//                 <p><strong>Owner:</strong> {item.owner}</p>
//                 <p><strong>Seller:</strong> {item.seller}</p>
//                 <p><strong>Price:</strong> {item.price} ETH</p>
//               </div>
//               {offerButtonVisible && (
//                 <button className='offer-button' onClick={() => listNFT(item.tokenId, item.price)}>List on Market</button>
//               )}
              
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import NFTAuction from '../abis/NFTAuction.json';
import Auction from '../abis/Auction.json';
import { getProvider } from '../services/blockchainService';
import './styles/Profile.css';

// const GetIpfsUrlFromPinata = (pinataUrl) => {
//   // const parts = pinataUrl.split('/');
//   var IPFSUrl = pinataUrl.split("/");
//   IPFSUrl = "https://gateway.pinata.cloud/ipfs/" + IPFSUrl[lastIndex - 1];
//   // return `https://ipfs.io/ipfs/${parts[parts.length - 1]}`;
//   return IPFSUrl;
// };

const GetIpfsUrlFromPinata = (pinataUrl) => {
  var IPFSUrl = pinataUrl.split("/");
  const lastIndex = IPFSUrl.length; // Add this line to define lastIndex
  IPFSUrl = "https://gateway.pinata.cloud/ipfs/" + IPFSUrl[lastIndex - 1];
  return IPFSUrl;
};

export default function Profile() {
  const [data, setData] = useState([]);
  const [marketplaceNFTs, setMarketplaceNFTs] = useState([]);
  const [auctionNFTs, setAuctionNFTs] = useState([]);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [addr, setAddr] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [showListPopup, setShowListPopup] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [listPrice, setListPrice] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Refresh data every time Profile component is visited
    getNFTData();
    
    // Also set up an interval to refresh every 5 seconds for real-time updates
    const interval = setInterval(getNFTData, 5000);
    
    // Listen for nftClaimed event to refresh immediately
    const handleNFTClaimed = () => {
      getNFTData();
    };
    window.addEventListener('nftClaimed', handleNFTClaimed);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('nftClaimed', handleNFTClaimed);
    };
  }, []);

  async function getNFTData() {
    try {
      const provider = await getProvider();

      // 1) get your signer and address
      const signer  = await provider.getSigner();
      const address = await signer.getAddress();
      setAddr(address);

      // 2) instantiate your contracts
      const nftContract = new ethers.Contract(
        NFTAuction.networks[5777].address,
        NFTAuction.abi,
        signer
      );

      const auctionContract = new ethers.Contract(
        Auction.networks[5777].address,
        Auction.abi,
        signer
      );

      // 3) fetch user's NFTs - including both owned and listed
      const raw = await nftContract.getMyNFTsForProfile();

      // 4) fetch active auctions to see which NFTs are being auctioned
      const activeAuctions = await auctionContract.getActiveAuctions();
      const auctionTokenIds = new Set(activeAuctions.map(a => a.tokenId.toString()));

      // 5) hydrate NFT data
      let sum = 0;
      const items = await Promise.all(
        raw.map(async (i) => {
          const uri  = GetIpfsUrlFromPinata(await nftContract.tokenURI(i.tokenId));
          const { data: meta } = await axios.get(uri);
          const price = ethers.formatEther(i.price);
          sum += Number(price);
          
          // Check if the token is listed on marketplace
          const isListed = await nftContract.isTokenListed(i.tokenId);
          
          // Check if the token is in an active auction
          const inAuction = auctionTokenIds.has(i.tokenId.toString());
          
          return {
            price,
            tokenId: i.tokenId.toString(),
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
            isListed: isListed,
            inAuction: inAuction
          };
        })
      );

      setData(items);
      setTotalPrice(sum);
      
      // Categorize NFTs
      const marketplace = items.filter(item => item.isListed === true);
      const auctioned = items.filter(item => item.inAuction === true);
      const owned = items.filter(item => item.isListed !== true && item.inAuction !== true);
      
      setMarketplaceNFTs(marketplace);
      setAuctionNFTs(auctioned);
      setOwnedNFTs(owned);
    } catch (err) {
      console.error('Failed to load NFTs:', err);
    }
  }

  async function listNFTOnMarketplace() {
    if (!selectedNFT || !listPrice) {
      alert('Please enter a price');
      return;
    }

    try {
      setStatus('⏳ Listing NFT on marketplace...');
      
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        NFTAuction.networks[5777].address,
        NFTAuction.abi,
        signer
      );

      // Get listing fee
      const listingFee = await contract.getListPrice();
      
      // Parse the price the user entered
      const priceWei = ethers.parseEther(listPrice.toString());
      
      const tx = await contract.listNFTAgain(selectedNFT.tokenId, priceWei, { value: listingFee });
      await tx.wait();
      
      setStatus('✅ NFT listed successfully!');
      
      // Update only the specific NFT's listing status
      const updatedData = data.map(item => 
        item.tokenId === selectedNFT.tokenId
          ? { ...item, isListed: true }
          : item
      );
      setData(updatedData);
      
      // Recategorize NFTs after listing
      const marketplace = updatedData.filter(item => item.isListed === true);
      const auctioned = updatedData.filter(item => item.inAuction === true);
      const owned = updatedData.filter(item => item.isListed !== true && item.inAuction !== true);
      
      setMarketplaceNFTs(marketplace);
      setAuctionNFTs(auctioned);
      setOwnedNFTs(owned);
      
      setShowListPopup(false);
      setListPrice('');
      setSelectedNFT(null);
      
      setTimeout(() => {
        setStatus('');
      }, 3000);
      
      alert('✅ NFT listed successfully!');
    } catch (error) {
      console.error('Error listing NFT:', error);
      setStatus(`❌ Error: ${error.message}`);
      alert(`Error listing NFT: ${error.message}`);
    }
  }

  return (
    <div className="profile-container">
      {showListPopup && selectedNFT && (
        <div className="popup-overlay" onClick={() => setShowListPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>List on Marketplace</h2>
              <button className="popup-close" onClick={() => setShowListPopup(false)}>×</button>
            </div>
            <div className="popup-body">
              <div className="nft-preview">
                <img src={selectedNFT.image} alt={selectedNFT.name} />
                <h3>{selectedNFT.name}</h3>
              </div>
              <div className="form-group">
                <label>Listing Price (ETH)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  placeholder="Enter price in ETH"
                  className="price-input"
                />
              </div>
              {status && <p className="status-message">{status}</p>}
              <div className="popup-actions">
                <button onClick={() => setShowListPopup(false)} className="btn-cancel">Cancel</button>
                <button onClick={listNFTOnMarketplace} className="btn-publish">Publish to Marketplace</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <h1 className="profile-heading">Profile</h1>
      <div className="profile-stats">
        <p><strong>Wallet Address:</strong> {addr || 'Not connected'}</p>
        <p><strong>No. of NFTs:</strong> {data.length}</p>
        <p><strong>Total Value:</strong> {totalPrice} ETH</p>
      </div>

      <h2 className="profile-subheading">📢 Listed on Marketplace</h2>
      {marketplaceNFTs.length === 0 ? (
        <p className="no-nfts">No NFTs listed on marketplace.</p>
      ) : (
        <div className="nft-grid">
          {marketplaceNFTs.map((item) => (
            <div className="nft-card-profile" key={item.tokenId}>
              <img src={item.image} alt={item.name} />
              <div className="nft-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p><strong>Token ID:</strong> {item.tokenId}</p>
                <p><strong>Price:</strong> {item.price} ETH</p>
              </div>
              <span className="badge-listed">Listed</span>
            </div>
          ))}
        </div>
      )}

      <h2 className="profile-subheading">🏆 In Auctions</h2>
      {auctionNFTs.length === 0 ? (
        <p className="no-nfts">No NFTs in auctions.</p>
      ) : (
        <div className="nft-grid">
          {auctionNFTs.map((item) => (
            <div className="nft-card-profile" key={item.tokenId}>
              <img src={item.image} alt={item.name} />
              <div className="nft-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p><strong>Token ID:</strong> {item.tokenId}</p>
                <p><strong>Starting Price:</strong> {item.price} ETH</p>
              </div>
              <span className="badge-auction">Auctioning</span>
            </div>
          ))}
        </div>
      )}

      <h2 className="profile-subheading">💎 Your Collection</h2>
      {ownedNFTs.length === 0 ? (
        <p className="no-nfts">No NFTs in your collection.</p>
      ) : (
        <div className="nft-grid">
          {ownedNFTs.map((item) => (
            <div className="nft-card-profile" key={item.tokenId}>
              <img src={item.image} alt={item.name} />
              <div className="nft-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p><strong>Token ID:</strong> {item.tokenId}</p>
                <p><strong>Price:</strong> {item.price} ETH</p>
              </div>
              <button className='offer-button' onClick={() => {
                setSelectedNFT(item);
                setListPrice(item.price);
                setShowListPopup(true);
              }}>📢 List on Marketplace</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}