import React, { useState } from 'react'
import './styles/BulkMint.css'
import { ethers } from 'ethers'
import { uploadFileToIPFS, uploadJSONToIPFS } from '../pinata'
import NFTAuction from '../abis/NFTAuction.json'

const BulkMint = ({ onClose }) => {
  const [nfts, setNfts] = useState([])
  const [status, setStatus] = useState('')
  const [minting, setMinting] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  // Add a new empty NFT form
  const addNewNFT = () => {
    const newNFT = {
      id: Date.now(),
      name: '',
      description: '',
      price: '',
      imageFile: null,
      imageURL: null,
      status: 'pending'
    }
    setNfts([...nfts, newNFT])
  }

  // Remove an NFT from the list
  const removeNFT = (id) => {
    setNfts(nfts.filter(nft => nft.id !== id))
  }

  // Update NFT field
  const updateNFT = (id, field, value) => {
    setNfts(nfts.map(nft =>
      nft.id === id ? { ...nft, [field]: value } : nft
    ))
  }

  // Handle image upload for specific NFT
  const handleImageUpload = (e, nftId) => {
    const file = e.target.files[0]
    if (!file) return

    updateNFT(nftId, 'imageFile', file)
  }

  // Validate all NFTs
  const validateNFTs = () => {
    for (let nft of nfts) {
      if (!nft.name.trim()) {
        setStatus('Please enter name for all NFTs')
        return false
      }
      if (!nft.description.trim()) {
        setStatus('Please enter description for all NFTs')
        return false
      }
      if (!nft.price || parseFloat(nft.price) <= 0) {
        setStatus('Please enter valid price for all NFTs')
        return false
      }
      if (!nft.imageFile) {
        setStatus('Please upload image for all NFTs')
        return false
      }
    }
    return true
  }

  // Upload image to IPFS
  const uploadImage = async (file) => {
    try {
      const response = await uploadFileToIPFS(file)
      if (response.success) {
        return response.pinataURL
      } else {
        throw new Error(response.message || 'Failed to upload image')
      }
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`)
    }
  }

  // Mint a single NFT
  const mintSingleNFT = async (nft, contract) => {
    try {
      // Upload image
      if (!nft.imageFile) {
        throw new Error('No image file selected')
      }

      let imageURL = nft.imageURL
      if (!imageURL && nft.imageFile) {
        imageURL = await uploadImage(nft.imageFile)
      }

      // Create metadata
      const nftJSON = {
        name: nft.name,
        description: nft.description,
        price: nft.price,
        image: imageURL
      }

      // Upload metadata
      const metadataResponse = await uploadJSONToIPFS(nftJSON)
      if (!metadataResponse.success) {
        throw new Error('Failed to upload metadata')
      }

      const metadataURL = metadataResponse.pinataURL

      // Mint on blockchain
      const priceInWei = ethers.parseEther(nft.price.toString())
      const transaction = await contract.createToken(metadataURL, priceInWei)
      await transaction.wait()

      return { success: true }
    } catch (error) {
      throw error
    }
  }

  // Bulk mint all NFTs
  const handleBulkMint = async () => {
    if (nfts.length === 0) {
      setStatus('Please add at least one NFT')
      return
    }

    if (!validateNFTs()) {
      return
    }

    setMinting(true)
    setProgress({ current: 0, total: nfts.length })

    try {
      // Connect wallet
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      await provider.send('eth_requestAccounts', [])

      // Get contract
      const contractAddress = NFTAuction.networks[5777]?.address
      if (!contractAddress) {
        throw new Error('Contract not deployed on Ganache network (5777). Please ensure Ganache is running with network ID 5777.')
      }

      const contract = new ethers.Contract(
        contractAddress,
        NFTAuction.abi,
        signer
      )

      // Get listing price with error handling
      // Mint each NFT
      const results = []
      for (let i = 0; i < nfts.length; i++) {
        try {
          setStatus(`Minting NFT ${i + 1} of ${nfts.length}: ${nfts[i].name}...`)
          await mintSingleNFT(nfts[i], contract)
          
          setNfts(prevNfts =>
            prevNfts.map((nft, idx) =>
              idx === i ? { ...nft, status: 'minted' } : nft
            )
          )
          results.push({ nft: nfts[i].name, success: true })
        } catch (error) {
          setNfts(prevNfts =>
            prevNfts.map((nft, idx) =>
              idx === i ? { ...nft, status: 'failed', error: error.message } : nft
            )
          )
          results.push({ nft: nfts[i].name, success: false, error: error.message })
        }
        setProgress({ current: i + 1, total: nfts.length })
      }

      // Summary
      const successful = results.filter(r => r.success).length
      setStatus(`Bulk minting complete! ${successful}/${nfts.length} NFTs minted successfully`)
    } catch (error) {
      setStatus(`Bulk minting failed: ${error.message}`)
      console.error('Bulk mint error:', error)
    } finally {
      setMinting(false)
    }
  }

  return (
    <div className="bulk-mint-modal">
      <div className="bulk-mint-container">
        <div className="bulk-mint-header">
          <h2>Bulk Mint NFTs</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="bulk-mint-content">
          {/* Instructions */}
          <div className="instructions">
            <p>Add NFTs one by one using the form below, then mint them all together.</p>
          </div>

          {/* Status */}
          {status && (
            <div className={`status-box ${minting ? 'minting' : ''}`}>
              <p>{status}</p>
            </div>
          )}

          {/* Progress */}
          {minting && progress.total > 0 && (
            <div className="progress-section">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              <p className="progress-text">
                {progress.current} / {progress.total} NFTs minted
              </p>
            </div>
          )}

          {/* NFT Forms */}
          <div className="nft-forms-container">
            {nfts.map((nft, idx) => (
              <div key={nft.id} className={`nft-form status-${nft.status}`}>
                <div className="form-header">
                  <h3>NFT #{idx + 1}</h3>
                  {nft.status === 'minted' && (
                    <span className="status-badge success">✓ Minted</span>
                  )}
                  {nft.status === 'failed' && (
                    <span className="status-badge error" title={nft.error}>✗ Failed</span>
                  )}
                  {nft.status !== 'minted' && nft.status !== 'failed' && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeNFT(nft.id)}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                {nft.status !== 'minted' && nft.status !== 'failed' && (
                  <div className="form-fields">
                    <div className="form-group">
                      <label>NFT Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Cosmic Art #1"
                        value={nft.name}
                        onChange={(e) => updateNFT(nft.id, 'name', e.target.value)}
                        disabled={minting}
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        placeholder="Describe your NFT"
                        value={nft.description}
                        onChange={(e) => updateNFT(nft.id, 'description', e.target.value)}
                        disabled={minting}
                      />
                    </div>

                    <div className="form-group">
                      <label>Price (ETH)</label>
                      <input
                        type="number"
                        step="0.001"
                        placeholder="0.5"
                        value={nft.price}
                        onChange={(e) => updateNFT(nft.id, 'price', e.target.value)}
                        disabled={minting}
                      />
                    </div>

                    <div className="form-group">
                      <label>Image</label>
                      <label className="file-input">
                        {nft.imageFile ? (
                          <>
                            <span className="file-name">✓ {nft.imageFile.name}</span>
                          </>
                        ) : (
                          <>
                            <span>Choose Image</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, nft.id)}
                          disabled={minting}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {(nft.status === 'minted' || nft.status === 'failed') && (
                  <div className="form-result">
                    <p className={nft.status === 'minted' ? 'success' : 'error'}>
                      {nft.status === 'minted' ? '✓ Successfully minted!' : `✗ ${nft.error}`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add More Button */}
          {!minting && (
            <button className="add-nft-btn" onClick={addNewNFT}>
              <span className="plus-icon">+</span> Add NFT
            </button>
          )}

          {/* Mint Button */}
          <button
            className="mint-btn"
            onClick={handleBulkMint}
            disabled={nfts.length === 0 || minting}
          >
            <span>{minting ? `Minting... (${progress.current}/${progress.total})` : `Bulk Mint All (${nfts.length})`}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default BulkMint
