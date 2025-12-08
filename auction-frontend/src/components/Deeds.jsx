import React from 'react'
import BulkMint from './BulkMint'
import './styles/Deeds.css'
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../pinata';
import NFTAuction from '../abis/NFTAuction.json'
import axios from 'axios';

const GetIpfsUrlFromPinata = (pinataUrl) => {
  var IPFSUrl = pinataUrl.split("/");
  const lastIndex = IPFSUrl.length;
  // IPFSUrl = "https://ipfs.io/ipfs/"+IPFSUrl[lastIndex-1];
  IPFSUrl = "https://gateway.pinata.cloud/ipfs/" + IPFSUrl[lastIndex - 1];
  return IPFSUrl;
};

const Deeds = () => {

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [status, setStatus] = useState('')
  const [fileURL, setFileURL] = useState(null)
  const [deedsStatus, setDeedsStatus] = useState('No deeds yet')
  const [showBulkMint, setShowBulkMint] = useState(false)
  const [showListPopup, setShowListPopup] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [listPrice, setListPrice] = useState('')


  async function OnChangeFile(e) {
    var file = e.target.files[0];

    if (!file) {
      console.log("No file selected");
      return;
    }

    try {
      setStatus("Uploading image to IPFS...");
      const response = await uploadFileToIPFS(file);
      if (response.success === true) {
        console.log("File uploaded to IPFS: ", response.pinataURL);
        setFileURL(response.pinataURL);
        setStatus("✅ Image uploaded successfully!");
      } else {
        setStatus("❌ Failed to upload image");
      }
    } catch (e) {
      console.log("Error uploading file to IPFS: ", e);
      setStatus("❌ Error uploading file: " + e.message);
    }
  }

  async function uploadMetaDataToIPFS() {
    if (!name || !description || !price || !fileURL) {
      setStatus("❌ Missing required fields for metadata");
      return;
    }

    const nftJSON = {
      name: name,
      description: description,
      price: price,
      image: fileURL
    }

    try {
      setStatus("⏳ Uploading metadata to IPFS...");
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        console.log("Metadata uploaded to IPFS: ", response.pinataURL);
        setStatus("✅ Metadata uploaded to IPFS!");
        return response.pinataURL;
      } else {
        setStatus("❌ Failed to upload metadata");
        console.error("Metadata upload failed:", response.message);
        return;
      }

    } catch (e) {
      console.error("Error uploading metadata to IPFS: ", e);
      setStatus("❌ Failed to upload metadata to IPFS");
      return;
    }
  }

  async function listNFT(e) {
    e.preventDefault();

    try {
      // Debug logging
      console.log("Form values:", { name, description, price, fileURL });

      // Better validation with specific error messages
      if (!name || name.trim() === '') {
        alert("Please enter a name!");
        return;
      }
      if (!description || description.trim() === '') {
        alert("Please enter a description!");
        return;
      }
      if (!price || parseFloat(price) <= 0) {
        alert("Please enter a price greater than 0!");
        return;
      }
      if (!fileURL) {
        alert("Please upload an image file!");
        return;
      }
      const metadataURL = await uploadMetaDataToIPFS();
      
      if (!metadataURL) {
        setStatus("❌ Failed to upload metadata to IPFS");
        console.error("Metadata URL is undefined - upload failed");
        return;
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log("Provider: ", provider);
      console.log("Signer: ", signer);
      console.log("Metadata URL: ", metadataURL);


      setStatus("Please while... Uploading(may take up to 5 mins) NFT to IPFS...");

      let contract = new ethers.Contract(
        NFTAuction.networks[5777].address,
        NFTAuction.abi,
        signer
      );

      const priceL = ethers.parseEther(price.toString())
      console.log("Price to set (wei):", priceL.toString());
      
      const transaction = await contract.createToken(metadataURL, priceL);
      console.log("Transaction hash:", transaction.hash);
      const receipt = await transaction.wait();
      console.log("Transaction confirmed!", receipt);

      setStatus("✅ NFT Created Successfully!");
      
      // Clear form
      setName('');
      setDescription('');
      setPrice('');
      setFileURL(null);

      // Wait a bit for blockchain to settle, then refresh NFTs
      setTimeout(() => {
        fetchAllNFTs();
        setStatus('');
      }, 2000);
      
      alert("✅ NFT Created Successfully!");
    } catch (e) {
      console.error("Error creating the token:", e);
      console.error("Error message:", e.message);
      console.error("Error code:", e.code);
      console.error("Error reason:", e.reason);
      console.error("Full error:", JSON.stringify(e, null, 2));
      
      // Show detailed error message
      let userMessage = "❌ Transaction failed. Please try again.";
      
      if (e.message && e.message.includes("user rejected")) {
        userMessage = "❌ Transaction rejected by user.";
      } else if (e.message && e.message.includes("insufficient funds")) {
        userMessage = "❌ Insufficient ETH balance to complete transaction.";
      } else if (e.reason) {
        userMessage = `❌ Error: ${e.reason}`;
      } else if (e.message) {
        userMessage = `❌ Error: ${e.message}`;
      }
      
      setStatus(userMessage);
      alert(`Error: ${userMessage}`);
    }
  }

  async function listNFTOnMarketplace() {
    if (!selectedNFT || !listPrice) {
      alert("Please select an NFT and enter a price");
      return;
    }

    try {
      setStatus("⏳ Listing NFT on marketplace...");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(
        NFTAuction.networks[5777].address,
        NFTAuction.abi,
        signer
      );

      // Get listing price fee
      const listingFee = await contract.getListPrice();
      
      // Update the price for the NFT
      const priceWei = ethers.parseEther(listPrice.toString());
      
      const tx = await contract.listNFTAgain(selectedNFT.tokenId, priceWei, { value: listingFee });
      await tx.wait();
      
      setStatus("✅ NFT listed on marketplace successfully!");
      setShowListPopup(false);
      setListPrice('');
      setSelectedNFT(null);
      
      setTimeout(() => {
        fetchAllNFTs();
      }, 1000);
      
    } catch (e) {
      console.error("Error listing NFT:", e);
      setStatus(`❌ Error listing NFT: ${e.message}`);
    }
  }

  //***************************************//
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deedStatus, setDeedStatus] = useState('');
  useEffect(() => {
    // run once on mount
    fetchAllNFTs();
  }, []);

  async function fetchAllNFTs() {
    try {
      setDeedStatus('⏳ Requesting wallet access...');
      // 1. connect to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      await provider.send('eth_requestAccounts', []);

      setDeedStatus('⏳ Fetching NFTs from contract…');
      // 2. instantiate contract with a provider (for read-only calls)
      const contract = new ethers.Contract(
        NFTAuction.networks[5777].address,
        NFTAuction.abi,
        signer
      );

      // 3. call your read-only getter
      const raw = await contract.getMyNFTs(true);
      console.log("Raw NFTs from contract:", raw);
      console.log("Raw NFTs length:", raw.length);

      const realRaw = raw.filter(i => i.tokenId.toString() !== "0");
      console.log("Filtered NFTs (excluding tokenId 0):", realRaw);
      console.log("Filtered NFTs length:", realRaw.length);

      // 4. hydrate each NFT
      const items = await Promise.all(

        realRaw.map(async (i) => {
          // pull tokenURI, convert to HTTP URL, fetch metadata
          const uri = GetIpfsUrlFromPinata(await contract.tokenURI(i.tokenId));
          const { data: meta } = await axios.get(uri);
          console.log(`Fetched metadata for token ${i.tokenId}:`, meta);

          return {
            tokenId: i.tokenId.toString(),  // BigInt → string
            seller: i.seller,
            owner: i.owner,
            price: ethers.formatEther(i.price), // BigNumber → string ETH
            image: meta.image,
            name: meta.name,
            description: meta.description,
            currentlyListed: i.currentlyListed,
          };
        })
      );

      console.log("Final items to display:", items);
      // 5. store in state
      setData(items);
      setDeedStatus('');
    } catch (err) {
      console.error(err);
      setDeedStatus('❌ Failed to load NFTs');
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      {showBulkMint && (
        <BulkMint onClose={() => {
          setShowBulkMint(false)
          fetchAllNFTs()
        }} />
      )}

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
      
      <div className='auction-container'>
        <div className="mint-header">
          <h1>Create NFT</h1>
          <p className="mint-subtitle">Generate and list your digital assets on the marketplace</p>
        </div>
        
        {status && <div className="status-message">{status}</div>}

        <div className="mint-section">
          {/* Form Container */}
          <div className="form-container">
            <h2 className="mint-heading">NFT Details</h2>
            <form className="form" onSubmit={listNFT}>
              <span className="input-span">
                <label htmlFor="name" className="label">Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </span>

              <span className="input-span">
                <label htmlFor="description" className="label">Description</label>
                <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </span>

              <span className="input-span">
                <label htmlFor="price" className="label">Price (ETH)</label>
                <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} />
              </span>

              <span className="input-span">
                <label htmlFor="image" className="label">Image</label>
                <input type="file" id="image" onChange={OnChangeFile} />
              </span>

              {/* Action Buttons */}
              <div className="mint-action-buttons">
                <button
                  type="button"
                  className="bulk-mint-btn"
                  onClick={() => setShowBulkMint(true)}
                >
                  <span className="btn-icon">📦</span>
                  Batch Create
                </button>
                <button
                  type="submit"
                  className="start-mint-btn"
                >
                  <span className="btn-icon">✨</span>
                  Create NFT
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 📌 Status Section */}
        <div className="status-section">
          <h2>My Deeds</h2>
          {/* {deedStatus && <p className="error">❌ {deedStatus}</p>}
          {data.length === 0 && !loading && <p className="subtext">No Deeds yet.</p>} */}

          {/* <button onClick={fetchAllNFTs} className="refresh-button">Refresh</button> */}
          {/* <h2>{deedsStatus}</h2> */}
          <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
            <div>
              {deedStatus && <p>{deedStatus}</p>}

              {data.length === 0 ? (
                <p>No NFTs found.</p>
              ) : (
                <div className="nft-list">
                  {data.map((item) => (
                    <div className="nft-card-deed" key={item.tokenId}>
                      <img src={item.image} alt={item.name} />

                      <h2>{item.name}</h2>
                      <p>{item.description}</p>

                      <p>
                        <strong>Owner:</strong> {item.owner}
                      </p>
                      <p>
                        <strong>Seller:</strong> {item.seller}
                      </p>
                      <p>
                        <strong>Price:</strong> {item.price} ETH
                      </p>

                      {!item.currentlyListed && (
                        <button
                          className="list-on-market-btn"
                          onClick={() => {
                            setSelectedNFT(item);
                            setListPrice(item.price);
                            setShowListPopup(true);
                          }}
                        >
                          📢 List on Marketplace
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </>
  )
}
export default Deeds;