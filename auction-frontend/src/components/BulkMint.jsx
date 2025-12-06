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

  // Handle CSV file upload
  const handleCSVUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csv = event.target.result
        const lines = csv.trim().split('\n')
        
        // Parse CSV: name,description,price
        const parsedNfts = lines.slice(1).map((line, idx) => {
          const [name, description, price] = line.split(',').map(s => s.trim())
          return {
            id: idx,
            name: name || '',
            description: description || '',
            price: price || '',
            imageFile: null,
            imageURL: null,
            status: 'pending'
          }
        }).filter(nft => nft.name && nft.description && nft.price)

        setNfts(parsedNfts)
        setStatus(`Loaded ${parsedNfts.length} NFTs from CSV`)
      } catch (error) {
        setStatus(`Error parsing CSV: ${error.message}`)
      }
    }
    reader.readAsText(file)
  }

  // Handle image file upload for specific NFT
  const handleImageUpload = (e, nftId) => {
    const file = e.target.files[0]
    if (!file) return

    setNfts(prevNfts =>
      prevNfts.map(nft =>
        nft.id === nftId
          ? { ...nft, imageFile: file, status: 'image-pending' }
          : nft
      )
    )
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
  const mintSingleNFT = async (nft, provider, signer, contract, listingPrice) => {
    try {
      // Upload image
      if (!nft.imageFile && !nft.imageURL) {
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
      const transaction = await contract.createToken(metadataURL, priceInWei, {
        value: listingPrice
      })
      await transaction.wait()

      return { success: true }
    } catch (error) {
      throw error
    }
  }

  // Bulk mint all NFTs
  const handleBulkMint = async () => {
    if (nfts.length === 0) {
      setStatus('Please load NFTs first')
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
      const contract = new ethers.Contract(
        NFTAuction.networks[5777].address,
        NFTAuction.abi,
        signer
      )

      // Get listing price
      const listingPrice = await contract.getListPrice()

      // Mint each NFT
      const results = []
      for (let i = 0; i < nfts.length; i++) {
        try {
          setStatus(`Minting NFT ${i + 1} of ${nfts.length}: ${nfts[i].name}...`)
          await mintSingleNFT(nfts[i], provider, signer, contract, listingPrice)
          
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
          {/* CSV Upload */}
          <div className="section">
            <h3>Step 1: Upload CSV</h3>
            <p className="hint">CSV format: name, description, price</p>
            <label className="file-input">
              <span>Choose CSV File</span>
              <input type="file" accept=".csv" onChange={handleCSVUpload} />
            </label>
          </div>

          {/* NFT List */}
          {nfts.length > 0 && (
            <div className="section">
              <h3>Step 2: Upload Images ({nfts.length} NFTs)</h3>
              <div className="nft-list">
                {nfts.map((nft, idx) => (
                  <div key={idx} className={`nft-item status-${nft.status}`}>
                    <div className="nft-info">
                      <p className="nft-name">{nft.name}</p>
                      <p className="nft-price">{nft.price} ETH</p>
                      <p className="nft-desc">{nft.description.substring(0, 50)}...</p>
                    </div>
                    
                    {nft.status !== 'minted' && nft.status !== 'failed' && (
                      <label className="image-input">
                        <span>Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, nft.id)}
                        />
                      </label>
                    )}
                    
                    {nft.imageFile && (
                      <p className="image-ok">✓ {nft.imageFile.name}</p>
                    )}

                    {nft.status === 'minted' && (
                      <span className="status-badge success">Minted</span>
                    )}
                    {nft.status === 'failed' && (
                      <span className="status-badge error" title={nft.error}>Failed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          {status && (
            <div className="status-box">
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

          {/* Mint Button */}
          <button
            className="mint-btn"
            onClick={handleBulkMint}
            disabled={nfts.length === 0 || minting || nfts.some(nft => !nft.imageFile)}
          >
            {minting ? `Minting... (${progress.current}/${progress.total})` : 'Start Bulk Minting'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BulkMint
