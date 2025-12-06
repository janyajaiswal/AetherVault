# 🌟 Meta Mart 🌟
## 🔥An NFT Marketplace and Auction platform (DApp)🔥
- This project is a full-featured NFT Auction platform DApp, designed and built from scratch.
### 🎊 It enables users to:
- ✅ Mint/Create NFTs (Deeds Page)
     - Users can create their own NFTs by uploading metadata and minting them directly on blockchain.
     - Minted NFTs instantly appear in the user's Profile dashboard.

- ✅ View all NFTs (Marketplace Page)
     - All listed NFTs are displayed in the Marketplace for easy browsing.
     - Users can view details like name, description, owner, and price.

- ✅ Buy NFTs Directly (Marketplace Page — Fixed Price Buy)
     - Users can purchase listed NFTs instantly by paying the fixed price.
     - Once bought, NFTs are transferred directly to the buyer’s wallet.

- ✅ Start Auctions for NFTs (Auction Page)
     - NFT owners can start timed auctions for their NFTs.
     - They can set starting price and duration to attract bids.

- ✅ Participate in Auctions (Auction Page — Live Bidding)
     - Anyone can place live bids on ongoing NFT auctions.
     - The highest bidder at auction end wins the NFT.

- ✅ Claim Won NFTs from Auctions (Auction Page — After Winning Bid)
     - Auction winners can claim their NFTs after the auction ends.
     - NFTs are directly transferred to the winner’s wallet upon claim.

- ✅ Reclaim NFTs from Unsold Auctions (Auction Page)
     - Sellers can reclaim NFTs from auctions that received no bids.
     - This ensures unsold NFTs are returned to their original owners.

- ✅ View Owned NFTs & Mint New Ones (Profile Page — NFT Dashboard)
     - Users can view all NFTs they own in their profile dashboard.
     - They can also mint brand new NFTs from the same page.

## 💻 CPSC 559 Advanced Blockchain Technologies 💻

## ⌨️ Authors ⌨️
```
Kiran Sukumar, kiransukumar@csu.fullerton.edu, 814198594
Padmapriya, padmavijay26@csu.fullerton.edu, 829070978 
```

## ⚙️ Installation and Setup ⚙️
- Clone the repository to local
- Setup Ganache
- Update truffle-config.js with your port and network id from Ganache
- In terminal, execute "truffle compile"
- In terminal, execute "truffle migrate"
- The smart contracts will be compiled, built and deployed in your local Ganache
- Copy "Auction.json" and "NFTAuction.json" from build folder and,
- Navigate to "auction-frontend -> src -> abis" and paste both the files here
- In "auction-frontend -> src -> pinata.js" update your secret and key for the IPFS storage (alternatively, can be stored in .env and retrieved)
- Open new terminal and navigate to "auction-frontend" and execute "npm install"
- Execute "npm run dev" to start the react application

## ⚓ Sepolia Network Deployment ⚓
![image](https://github.com/user-attachments/assets/90b5d40c-6f28-4409-be07-0a3c8cdda51d)
![image](https://github.com/user-attachments/assets/728b271a-a10c-4bf0-8252-9dd72826e4d3)
![image](https://github.com/user-attachments/assets/3b0f4bd6-e42a-4881-b546-0b9e250f122f)

