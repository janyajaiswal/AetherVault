# AetherVault🌟 AetherVault 🌟



NFT Auction DApp - A decentralized marketplace for minting, buying, and auctioning NFTs on the blockchain.## 🔥An NFT Marketplace and Auction platform (DApp)🔥



## OverviewNFT Auction DApp - A decentralized marketplace for minting, buying, and auctioning NFTs on the blockchain.- This project is a full-featured NFT Auction platform DApp, designed and built from scratch.



AetherVault is a full-stack decentralized application built with Solidity smart contracts and React. It enables users to create and trade NFTs through direct sales or time-based auctions with real-time bidding.### 🎊 It enables users to:



## Features## Overview- ✅ Mint/Create NFTs (Deeds Page)



### NFT Management     - Users can create their own NFTs by uploading metadata and minting them directly on blockchain.

- Mint new NFTs directly on-chain with metadata

- View NFT collection in personal dashboardAetherVault is a full-stack decentralized application built with Solidity smart contracts and React. It enables users to create and trade NFTs through direct sales or time-based auctions with real-time bidding. - Minted NFTs instantly appear in the user's Profile dashboard.

- Transfer ownership of NFTs

## Features- ✅ View all NFTs (Marketplace Page)

### Marketplace

- Browse all available NFTs     - All listed NFTs are displayed in the Marketplace for easy browsing.

- Purchase NFTs at fixed prices

- View NFT details, ownership history, and pricing**NFT Management** - Users can view details like name, description, owner, and price.



### Auction System- Mint new NFTs directly on-chain with metadata

- Create timed auctions for NFTs

- Participate in live bidding- View NFT collection in personal dashboard- ✅ Buy NFTs Directly (Marketplace Page — Fixed Price Buy)

- Automatic winner determination based on highest bid

- Claim won NFTs after auction ends- Transfer ownership of NFTs - Users can purchase listed NFTs instantly by paying the fixed price.

- Reclaim unsold NFTs

  - Once bought, NFTs are transferred directly to the buyer’s wallet.

### User Features

- MetaMask wallet integration**Marketplace**

- Real-time transaction updates

- User profile with transaction history- Browse all available NFTs- ✅ Start Auctions for NFTs (Auction Page)

- NFT storage via Pinata IPFS

- Purchase NFTs at fixed prices - NFT owners can start timed auctions for their NFTs.

## Tech Stack

- View NFT details, ownership history, and pricing - They can set starting price and duration to attract bids.

### Blockchain & Smart Contracts

- Solidity for contract development**Auction System**- ✅ Participate in Auctions (Auction Page — Live Bidding)

- OpenZeppelin contract libraries

- Truffle for contract compilation and deployment- Create timed auctions for NFTs - Anyone can place live bids on ongoing NFT auctions.

- Ganache for local testing

- Sepolia testnet support- Participate in live bidding - The highest bidder at auction end wins the NFT.



### Frontend- Automatic winner determination based on highest bid

- React 19 with Vite

- ethers.js for blockchain interaction- Claim won NFTs after auction ends- ✅ Claim Won NFTs from Auctions (Auction Page — After Winning Bid)

- Web3.js for additional Web3 utilities

- Tailwind CSS for styling- Reclaim unsold NFTs - Auction winners can claim their NFTs after the auction ends.

- Material-UI components

  - NFTs are directly transferred to the winner’s wallet upon claim.

### Storage & Services

- Pinata for IPFS NFT storage**User Features**

- nft.storage integration

- MetaMask wallet integration- ✅ Reclaim NFTs from Unsold Auctions (Auction Page)

## Installation

- Real-time transaction updates - Sellers can reclaim NFTs from auctions that received no bids.

1. Clone the repository:

```bash- User profile with transaction history - This ensures unsold NFTs are returned to their original owners.

git clone https://github.com/janyajaiswal/AetherVault.git

cd AetherVault- NFT storage via Pinata IPFS

```

- ✅ View Owned NFTs & Mint New Ones (Profile Page — NFT Dashboard)

2. Install root dependencies:

```bash## Tech Stack - Users can view all NFTs they own in their profile dashboard.

npm install

```     - They can also mint brand new NFTs from the same page.



3. Set up Ganache locally or configure network settings in `truffle-config.js`**Blockchain & Smart Contracts**



4. Compile and deploy contracts:- Solidity for contract development## 💻 CPSC 559 Advanced Blockchain Technologies 💻

```bash

truffle compile- OpenZeppelin contract libraries

truffle migrate

```- Truffle for contract compilation and deployment## ⌨️ Authors ⌨️



5. Copy ABIs to frontend:- Ganache for local testing```

```bash

cp build/contracts/Auction.json auction-frontend/src/abis/- Sepolia testnet supportKiran Sukumar, kiransukumar@csu.fullerton.edu, 814198594

cp build/contracts/NFTAuction.json auction-frontend/src/abis/

```Padmapriya, padmavijay26@csu.fullerton.edu, 829070978



6. Configure Pinata credentials in `auction-frontend/src/pinata.js`**Frontend**```



7. Install frontend dependencies and run:- React 19 with Vite

```bash

cd auction-frontend- ethers.js for blockchain interaction## ⚙️ Installation and Setup ⚙️

npm install

npm run dev- Web3.js for additional Web3 utilities- Clone the repository to local

```

- Tailwind CSS for styling- Setup Ganache

The application will be available at `http://localhost:5173`

- Material-UI components- Update truffle-config.js with your port and network id from Ganache

## Project Structure

- In terminal, execute "truffle compile"

```

AetherVault/**Storage & Services**- In terminal, execute "truffle migrate"

├── contracts/              # Smart contracts

│   ├── Auction.sol- Pinata for IPFS NFT storage- The smart contracts will be compiled, built and deployed in your local Ganache

│   └── NFTAuction.sol

├── migrations/             # Deployment scripts- nft.storage integration- Copy "Auction.json" and "NFTAuction.json" from build folder and,

├── auction-frontend/       # React frontend

│   ├── src/- Navigate to "auction-frontend -> src -> abis" and paste both the files here

│   │   ├── components/     # React components

│   │   ├── services/       # Web3 services## Installation- In "auction-frontend -> src -> pinata.js" update your secret and key for the IPFS storage (alternatively, can be stored in .env and retrieved)

│   │   └── abis/           # Contract ABIs

│   └── vite.config.js- Open new terminal and navigate to "auction-frontend" and execute "npm install"

└── truffle-config.js       # Truffle configuration

```1. Clone the repository:- Execute "npm run dev" to start the react application



## Development````bash



Start the frontend dev server with hot reload:git clone https://github.com/janyajaiswal/AetherVault.git## ⚓ Sepolia Network Deployment ⚓

```bash

cd auction-frontendcd AetherVault![image](https://github.com/user-attachments/assets/90b5d40c-6f28-4409-be07-0a3c8cdda51d)

npm run dev

``````![image](https://github.com/user-attachments/assets/728b271a-a10c-4bf0-8252-9dd72826e4d3)



Build for production:![image](https://github.com/user-attachments/assets/3b0f4bd6-e42a-4881-b546-0b9e250f122f)

```bash

npm run build2. Install root dependencies:

```

```bash

Lint the code:npm install

```bash````

npm run lint

```3. Set up Ganache locally or configure network settings in `truffle-config.js`



Preview the production build:4. Compile and deploy contracts:

```bash

npm run preview```bash

```truffle compile

truffle migrate

## Smart Contracts```



- **Auction.sol** - Main auction contract handling bidding and NFT transfers5. Copy ABIs to frontend:

- **NFTAuction.sol** - ERC721 NFT implementation with auction functionality

```bash

## Licensecp build/contracts/Auction.json auction-frontend/src/abis/

cp build/contracts/NFTAuction.json auction-frontend/src/abis/

This project is open source and available for educational and commercial use.```


6. Configure Pinata credentials in `auction-frontend/src/pinata.js`

7. Install frontend dependencies and run:

```bash
cd auction-frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
AetherVault/
├── contracts/           # Smart contracts
│   ├── Auction.sol
│   └── NFTAuction.sol
├── migrations/          # Deployment scripts
├── auction-frontend/    # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # Web3 services
│   │   └── abis/        # Contract ABIs
│   └── vite.config.js
└── truffle-config.js    # Truffle configuration
```

## Development

Start the frontend dev server with hot reload:

```bash
cd auction-frontend
npm run dev
```

Build for production:

```bash
npm run build
```

## License

This project is open source and available for educational and commercial use.
