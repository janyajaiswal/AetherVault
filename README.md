# AetherVault — NFT Auction & Marketplace DApp

AetherVault is a decentralized NFT auction marketplace built on Ethereum.
Users can mint, buy, sell, and auction NFTs with real-time bidding and secure ownership transfers.

---

## 🔥 Overview

AetherVault is a full-stack decentralized application built using Solidity, React, and IPFS.
It enables users to:

- Mint custom NFTs on-chain
- Browse marketplace listings
- Buy NFTs at fixed prices
- Create and participate in live NFT auctions
- Claim NFTs after winning auctions
- Manage owned NFTs in a personal dashboard

---

## ✨ Features

### NFT Management

- Mint new NFTs with metadata stored on IPFS
- View and manage owned NFTs
- Transfer ownership
- Real-time transaction updates through MetaMask

### Marketplace

- Browse all NFTs listed for sale
- Buy NFTs instantly at fixed prices
- View detailed NFT metadata, ownership history, and pricing

### Auction System

- Start timed auctions for NFTs
- Participate in real-time bidding
- Automatic winner selection
- Claim NFTs after winning auctions
- Reclaim NFTs from unsold auctions

### User Experience

- MetaMask wallet integration
- Smooth blockchain interaction using ethers.js
- NFT storage using Pinata (IPFS)
- Responsive UI built with Tailwind CSS

---

## 🧱 Tech Stack

### Blockchain & Smart Contracts

- Solidity
- OpenZeppelin ERC721
- Truffle
- Ganache
- Sepolia testnet support
- Pinata IPFS for file storage

### Frontend

- React 19 + Vite
- ethers.js
- Tailwind CSS
- Material UI
- Web3.js utilities

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/janyajaiswal/AetherVault
cd AetherVault
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Configure Local Blockchain (Ganache)

- Start Ganache
- Copy RPC URL and Network ID
- Update `truffle-config.js`

### 4. Compile & Deploy Contracts

```bash
truffle compile
truffle migrate
```

### 5. Copy ABIs to Frontend

```bash
cp build/contracts/Auction.json auction-frontend/src/abis/
cp build/contracts/NFTAuction.json auction-frontend/src/abis/
```

### 6. Configure Pinata Credentials

Edit:

```
auction-frontend/src/pinata.js
```

### 7. Install Frontend Dependencies & Run App

```bash
cd auction-frontend
npm install
npm run dev
```

App will run at:

```
http://localhost:5173
```

---

## 📁 Project Structure

```
AetherVault/
├── contracts/
│   ├── Auction.sol
│   └── NFTAuction.sol
├── migrations/
├── auction-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── abis/
│   └── vite.config.js
└── truffle-config.js
```

---

## 🛠️ Development Commands

### Start Dev Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Lint Code

```bash
npm run lint
```

### Preview Production Build

```bash
npm run preview
```

---

## 📜 Smart Contracts

### Auction.sol

Handles bid placement, auction creation, winner selection, and NFT transfer.

### NFTAuction.sol

ERC721 NFT contract enabling NFT minting and auction participation.

---
