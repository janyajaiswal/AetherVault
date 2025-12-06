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
  const [addr, setAddr] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    getNFTData();
  }, []);

  async function getNFTData() {
    try {
      const provider = await getProvider();

      // 1) get your signer and address
      const signer  = await provider.getSigner();
      const address = await signer.getAddress();
      setAddr(address);

      // 2) instantiate your contract (using provider or signer; read‑only OK)
      const contract = new ethers.Contract(
        NFTAuction.networks[5777].address,
        NFTAuction.abi,
        signer
      );

      // 3) fetch user's NFTs
      const raw = await contract.getMyNFTs(true);

      // 4) hydrate them
      let sum = 0;
      const items = await Promise.all(
        raw.map(async (i) => {
          const uri  = GetIpfsUrlFromPinata(await contract.tokenURI(i.tokenId));
          const { data: meta } = await axios.get(uri);
          const price = ethers.formatEther(i.price);
          sum += Number(price);
          
          // Check if the token is listed
          const isListed = await contract.isTokenListed(i.tokenId);
          
          return {
            price,
            tokenId: i.tokenId.toString(),
            seller: i.seller,
            owner: i.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
            isListed: isListed // Store listing status per NFT
          };
        })
      );

      setData(items);
      setTotalPrice(sum);
    } catch (err) {
      console.error('Failed to load NFTs:', err);
    }
  }

  async function listNFT(tokenId, price) {
    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        NFTAuction.networks[5777].address,
        NFTAuction.abi,
        signer
      );

      // Call the listNFT function from the contract
      const priceInEther = ethers.parseUnits(price, 'ether');
      let listingPrice = await contract.getListPrice();
      listingPrice = listingPrice.toString();

      const tx = await contract.listNFTAgain(tokenId, priceInEther, { value: listingPrice });
      await tx.wait(); // Wait for the transaction to be mined
      
      // Update only the specific NFT's listing status
      setData(prevData => 
        prevData.map(item => 
          item.tokenId === tokenId 
            ? { ...item, isListed: true } 
            : item
        )
      );
      
      alert('NFT listed successfully!');
      console.log('NFT listed successfully!');
    } catch (error) {
      console.error('Error listing NFT:', error);
    }
  }

  return (
    <div className="profile-container">
      <h1 className="profile-heading">Profile</h1>
      <div className="profile-stats">
        <p><strong>Wallet Address:</strong> {addr || 'Not connected'}</p>
        <p><strong>No. of NFTs:</strong> {data.length}</p>
        <p><strong>Total Value:</strong> {totalPrice} ETH</p>
      </div>

      <h2 className="profile-subheading">My NFTs</h2>
      {data.length === 0 ? (
        <p className="no-nfts">No NFTs found.</p>
      ) : (
        <div className="nft-grid">
          {data.map((item) => (
            <div className="nft-card-profile" key={item.tokenId}>
              <img src={item.image} alt={item.name} />
              <div className="nft-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p><strong>Token ID:</strong> {item.tokenId}</p>
                <p><strong>Owner:</strong> {item.owner}</p>
                <p><strong>Seller:</strong> {item.seller}</p>
                <p><strong>Price:</strong> {item.price} ETH</p>
              </div>
              {!item.isListed && (
                <button className='offer-button' onClick={() => listNFT(item.tokenId, item.price)}>List on Market</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}