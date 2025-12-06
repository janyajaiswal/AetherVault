import React, { useState, useEffect, useRef } from 'react'
import AuctionCard from './AuctionCard'
import { ethers } from 'ethers';
import NFTAuction from '../abis/NFTAuction.json'
import Auction from '../abis/Auction.json'
import ReactCanvasConfetti from 'react-canvas-confetti';

const Auctions = () => {
  const [deeds, setDeeds] = useState([]);
  const [ongoingAuctions, setOngoingAuctions] = useState([]);
  const [pastAuctions, setPastAuctions] = useState([]);
  const [nftContract, setNFTContract] = useState(null);
  const [auctionContract, setAuctionContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [notification, setNotification] = useState('');
  const [isAuctionCreator, setIsAuctionCreator] = useState(false);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [claimPopupMessage, setClaimPopupMessage] = useState('');
  const confettiInstance = useRef(null);


  // Setup blockchain connection
  useEffect(() => {
    const setupBlockchain = async () => {
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signerInstance = await provider.getSigner();
        setSigner(signerInstance);

        // Store user address for comparisons
        const address = await signerInstance.getAddress();
        setUserAddress(address);

        // Connect to NFT contract
        const nftContractAddress = NFTAuction.networks["5777"].address;
        const nftContractInstance = new ethers.Contract(
          nftContractAddress,
          NFTAuction.abi,
          signerInstance
        );
        setNFTContract(nftContractInstance);

        // Connect to Auction contract
        const auctionContractAddress = Auction.networks["5777"].address;
        const auctionContractInstance = new ethers.Contract(
          auctionContractAddress,
          Auction.abi,
          signerInstance
        );
        setAuctionContract(auctionContractInstance);

        // Fetch initial data
        await fetchDeeds(nftContractInstance);
        await fetchActiveAuctions(auctionContractInstance, nftContractInstance);
        await fetchCompletedAuctions(auctionContractInstance, nftContractInstance);

        setLoading(false);
      } catch (err) {
        console.error("Error setting up blockchain connection:", err);
        setError("Failed to connect to blockchain. Please check your wallet connection.");
        setLoading(false);
      }
    };

    setupBlockchain();
  }, []);

  const fetchDeeds = async (contractInstance) => {
    try {
      console.log("Fetching my NFTs...");
      const rawDeeds = await contractInstance.getMyNFTs(false);
      console.log("Raw deeds:", rawDeeds);

      // Filter out any tokens with ID 0
      const filteredRawDeeds = rawDeeds.filter(deed => deed.tokenId.toString() !== '0');

      const deedsData = await Promise.all(
        filteredRawDeeds.map(async (deed) => {
          try {
            const uri = await contractInstance.tokenURI(deed.tokenId);
            console.log(`Token URI for ${deed.tokenId}:`, uri);

            // Handle both IPFS and HTTP URIs
            let metadataUrl = uri;
            if (uri.startsWith('ipfs://')) {
              // metadataUrl = `https://ipfs.io/ipfs/${uri.split('ipfs://').pop()}`;
              metadataUrl = `https://cloudflare-ipfs.com/ipfs/${uri.split('ipfs://').pop()}`;
              // IPFSUrl = "https://gateway.pinata.cloud/ipfs/" + IPFSUrl[lastIndex - 1];
            } else if (uri.includes('/ipfs/')) {
              metadataUrl = `https://gateway.pinata.cloud/ipfs/${uri.split('/ipfs/').pop()}`;
            }

            const response = await fetch(metadataUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch metadata: ${response.statusText}`);
            }
            const metadata = await response.json();
            console.log(`Metadata for ${deed.tokenId}:`, metadata);

            // Handle IPFS image paths
            let imageUrl = metadata.image;
            if (imageUrl.startsWith('ipfs://')) {
              // imageUrl = `https://ipfs.io/ipfs/${imageUrl.split('ipfs://').pop()}`;
              imageUrl = `https://cloudflare-ipfs.com/ipfs/${imageUrl.split('ipfs://').pop()}`;
            } else if (imageUrl.includes('/ipfs/')) {
              imageUrl = `https://gateway.pinata.cloud/ipfs/${imageUrl.split('/ipfs/').pop()}`;
            }

            return {
              tokenId: deed.tokenId.toString(),
              name: metadata.name || `Property #${deed.tokenId}`,
              description: metadata.description || "No description available",
              image: imageUrl,
              price: ethers.formatEther(deed.price),
              auctionStatus: "upcoming"
            };
          } catch (err) {
            console.error(`Error processing deed ${deed.tokenId}:`, err);
            return {
              tokenId: deed.tokenId.toString(),
              name: `Property #${deed.tokenId}`,
              description: "Metadata unavailable",
              image: "/placeholder.png",
              price: ethers.formatEther(deed.price),
              auctionStatus: "upcoming"
            };
          }
        })
      );

      console.log("Processed deeds:", deedsData);
      setDeeds(deedsData);
    } catch (err) {
      console.error("Error loading deeds:", err);
      setError("Failed to load your NFTs. Please try again later.");
    }
  };

  const fetchActiveAuctions = async (auctionContractInstance, nftContractInstance) => {
    try {
      console.log("Fetching active auctions...");
      const activeAuctions = await auctionContractInstance.getActiveAuctions();
      console.log("Active Auctions raw data:", activeAuctions);

      if (!activeAuctions || activeAuctions.length === 0) {
        console.log("No active auctions found");
        setOngoingAuctions([]);
        return;
      }

      const auctionsData = await Promise.all(
        activeAuctions.map(async (auction) => {
          try {
            // Skip any auctions with tokenId 0
            if (auction.tokenId.toString() === '0') {
              console.log(`Token ID is 0, skipping this auction`);
              return null;
            }

            const tokenId = auction.tokenId.toString();
            console.log(`Processing auction for token ${tokenId}`);

            // Get more detailed auction status
            const status = await auctionContractInstance.getAuctionStatus(tokenId);
            console.log(`Auction status for token ${tokenId}:`, status);

            // Verify this auction is actually live
            if (!status.isLive) {
              console.log(`Auction for token ${tokenId} is not live, skipping`);
              return null;
            }

            // Get token URI from NFT contract
            let metadata = { name: `Property #${tokenId}`, description: "No description available", image: "/placeholder.png" };
            try {
              const uri = await nftContractInstance.tokenURI(tokenId);
              console.log(`Token URI for ${tokenId}:`, uri);

              // Handle both IPFS and HTTP URIs
              let metadataUrl = uri;
              if (uri.startsWith('ipfs://')) {
                metadataUrl = `https://ipfs.io/ipfs/${uri.split('ipfs://').pop()}`;
              } else if (uri.includes('/ipfs/')) {
                // metadataUrl = `https://ipfs.io/ipfs/${uri.split('/ipfs/').pop()}`;
                metadataUrl = `https://gateway.pinata.cloud/ipfs/${uri.split('/ipfs/').pop()}`;
              }

              const response = await fetch(metadataUrl);
              if (response.ok) {
                metadata = await response.json();
                console.log(`Metadata for ${tokenId}:`, metadata);

                // Handle IPFS image paths
                if (metadata.image && metadata.image.startsWith('ipfs://')) {
                  metadata.image = `https://ipfs.io/ipfs/${metadata.image.split('ipfs://').pop()}`;
                } else if (metadata.image && metadata.image.includes('/ipfs/')) {
                  // metadata.image = `https://ipfs.io/ipfs/${metadata.image.split('/ipfs/').pop()}`;
                  imageUrl = `https://gateway.pinata.cloud/ipfs/${imageUrl.split('/ipfs/').pop()}`;
                }
              } else {
                console.warn(`Failed to fetch metadata for token ${tokenId}: ${response.statusText}`);
              }
            } catch (err) {
              console.error(`Error fetching metadata for token ${tokenId}:`, err);
            }

            // Get current timestamp for remaining time calculation
            const currentTime = Math.floor(Date.now() / 1000);
            const endTime = parseInt(auction.endTime);
            const remainingTime = endTime > currentTime ? endTime - currentTime : 0;

            return {
              auctionId: tokenId, // Using tokenId as auctionId since they're mapped 1:1
              tokenId: tokenId,
              name: metadata.name || `Property #${tokenId}`,
              description: metadata.description || "No description available",
              image: metadata.image || "/placeholder.png",
              startingPrice: ethers.formatEther(auction.price),
              currentBid: ethers.formatEther(status.currentPrice),
              remainingTime: remainingTime,
              seller: auction.seller,
              winner: status.currentWinner,
              totalBids: status.totalBids.toString(),
              endTime: endTime,
              isLive: status.isLive,
              auctionEnded: (endTime <= currentTime)
            };
          } catch (err) {
            console.error(`Error processing auction for token:`, err);
            return null;
          }
        })
      );

      // Filter out any null results from errors
      const validAuctions = auctionsData.filter(auction => auction !== null);
      console.log("Processed active auctions:", validAuctions);
      setOngoingAuctions(validAuctions);
    } catch (err) {
      console.error("Error loading active auctions:", err);
      setError("Failed to load active auctions. Please try again later.");
    }
  };

  // const fetchCompletedAuctions = async (auctionContractInstance, nftContractInstance) => {
  //   try {
  //     console.log("Fetching completed auctions...");
  //     const completedAuctions = await auctionContractInstance.getCompletedAuctions();
  //     console.log("Completed Auctions raw data:", completedAuctions);

  //     if (!completedAuctions || completedAuctions.length === 0) {
  //       console.log("No completed auctions found");
  //       setPastAuctions([]);
  //       return;
  //     }

  //     const auctionsData = await Promise.all(
  //       completedAuctions.map(async (auction) => {
  //         try {
  //           // Skip any auctions with tokenId 0
  //           if(auction.tokenId.toString() === '0') {
  //             console.log(`Token ID is 0, skipping this auction`);
  //             return null;
  //           }

  //           const tokenId = auction.tokenId.toString();

  //           // Get token URI from NFT contract
  //           let metadata = { name: `Property #${tokenId}`, description: "No description available", image: "/placeholder.png" };
  //           try {
  //             const uri = await nftContractInstance.tokenURI(tokenId);

  //             // Handle both IPFS and HTTP URIs
  //             let metadataUrl = uri;
  //             if (uri.startsWith('ipfs://')) {
  //               metadataUrl = `https://ipfs.io/ipfs/${uri.split('ipfs://').pop()}`;
  //             } else if (uri.includes('/ipfs/')) {
  //               metadataUrl = `https://ipfs.io/ipfs/${uri.split('/ipfs/').pop()}`;
  //             }

  //             const response = await fetch(metadataUrl);
  //             if (response.ok) {
  //               metadata = await response.json();

  //               // Handle IPFS image paths
  //               if (metadata.image && metadata.image.startsWith('ipfs://')) {
  //                 metadata.image = `https://ipfs.io/ipfs/${metadata.image.split('ipfs://').pop()}`;
  //               } else if (metadata.image && metadata.image.includes('/ipfs/')) {
  //                 metadata.image = `https://ipfs.io/ipfs/${metadata.image.split('/ipfs/').pop()}`;
  //               }
  //             }
  //           } catch (err) {
  //             console.error(`Error fetching metadata for token ${tokenId}:`, err);
  //           }

  //           return {
  //             auctionId: tokenId,
  //             tokenId: tokenId,
  //             name: metadata.name || `Property #${tokenId}`,
  //             description: metadata.description || "No description available",
  //             image: metadata.image || "/placeholder.png",
  //             finalPrice: ethers.formatEther(auction.price),
  //             seller: auction.seller,
  //             winner: auction.winner
  //           };
  //         } catch (err) {
  //           console.error(`Error processing completed auction:`, err);
  //           return null;
  //         }
  //       })
  //     );

  //     // Filter out any null results from errors
  //     const validAuctions = auctionsData.filter(auction => auction !== null);
  //     console.log("Processed completed auctions:", validAuctions);
  //     setPastAuctions(validAuctions);
  //   } catch (err) {
  //     console.error("Error loading completed auctions:", err);
  //   }
  // };

  const fetchCompletedAuctions = async (auctionContractInstance, nftContractInstance) => {
    try {
      console.log("Fetching completed auctions...");
      const completedAuctions = await auctionContractInstance.getCompletedAuctions();
      console.log("Completed Auctions raw data:", completedAuctions);

      if (!completedAuctions || completedAuctions.length === 0) {
        console.log("No completed auctions found");
        setPastAuctions([]);
        return;
      }

      const auctionsData = await Promise.all(
        completedAuctions.map(async (auction) => {
          try {
            // Skip any auctions with tokenId 0
            if (auction.tokenId.toString() === '0') {
              console.log(`Token ID is 0, skipping this auction`);
              return null;
            }

            const tokenId = auction.tokenId.toString();
            console.log(`Processing completed auction for token ${tokenId}`);

            // Get token URI from NFT contract
            let metadata = { name: `Property #${tokenId}`, description: "No description available", image: "/placeholder.png" };
            try {
              // Check if token exists in NFT contract
              try {
                await nftContractInstance.ownerOf(tokenId);
              } catch (error) {
                console.log(`Token ${tokenId} doesn't exist or was transferred outside the platform`);
                // Continue with default metadata
              }

              const uri = await nftContractInstance.tokenURI(tokenId);
              console.log(`Token URI for completed auction ${tokenId}:`, uri);

              // Handle both IPFS and HTTP URIs
              let metadataUrl = uri;
              if (uri.startsWith('ipfs://')) {
                metadataUrl = `https://ipfs.io/ipfs/${uri.split('ipfs://').pop()}`;
              } else if (uri.includes('/ipfs/')) {
                // metadataUrl = `https://ipfs.io/ipfs/${uri.split('/ipfs/').pop()}`;
                metadataUrl = `https://gateway.pinata.cloud/ipfs/${uri.split('/ipfs/').pop()}`;
              }

              const response = await fetch(metadataUrl);
              if (response.ok) {
                metadata = await response.json();
                console.log(`Metadata for completed auction ${tokenId}:`, metadata);

                // Handle IPFS image paths
                if (metadata.image && metadata.image.startsWith('ipfs://')) {
                  metadata.image = `https://ipfs.io/ipfs/${metadata.image.split('ipfs://').pop()}`;
                } else if (metadata.image && metadata.image.includes('/ipfs/')) {
                  // metadata.image = `https://ipfs.io/ipfs/${metadata.image.split('/ipfs/').pop()}`;
                  imageUrl = `https://gateway.pinata.cloud/ipfs/${imageUrl.split('/ipfs/').pop()}`;
                }
              } else {
                console.warn(`Failed to fetch metadata for completed auction ${tokenId}: ${response.statusText}`);
              }
            } catch (err) {
              console.error(`Error fetching metadata for completed auction ${tokenId}:`, err);
            }

            console.log(`Completed auction data for ${tokenId}:`, {
              seller: auction.seller,
              winner: auction.winner,
              price: ethers.formatEther(auction.price)
            });

            return {
              auctionId: tokenId,
              tokenId: tokenId,
              name: metadata.name || `Property #${tokenId}`,
              description: metadata.description || "No description available",
              image: metadata.image || "/placeholder.png",
              finalPrice: ethers.formatEther(auction.price),
              seller: auction.seller,
              winner: auction.winner
            };
          } catch (err) {
            console.error(`Error processing completed auction:`, err);
            return null;
          }
        })
      );

      // Filter out any null results from errors
      const validAuctions = auctionsData.filter(auction => auction !== null);
      console.log("Processed completed auctions:", validAuctions);

      // const validAuctions = auctionsData.filter(auction => auction !== null);

      // Deduplicate by auctionId
      const seen = new Set();
      const uniqueAuctions = [];
      for (const auc of validAuctions) {
        if (!seen.has(auc.auctionId)) {
          seen.add(auc.auctionId);
          uniqueAuctions.push(auc);
        }
      }

      console.log("Processed (deduped) completed auctions:", uniqueAuctions);
      setPastAuctions(uniqueAuctions);

      // setPastAuctions(validAuctions);
    } catch (err) {
      console.error("Error loading completed auctions:", err);
      setError("Failed to load completed auctions. Please try again later.");
    }
  };

  const startAuction = async (tokenId, price, duration) => {
    if (!nftContract || !auctionContract || !signer) {
      alert("Blockchain connection not established");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Convert price (ETH → Wei) and duration (seconds)
      const priceInWei = ethers.parseEther(price.toString());
      const durationInSeconds = parseInt(duration, 10);
      console.log("Price in Wei:", priceInWei.toString());
      console.log("Duration in seconds:", durationInSeconds);

      // Confirm you're the owner
      const signerAddress = await signer.getAddress();
      const listing = await nftContract.getListedTokenForId(tokenId);
      if (listing.seller.toLowerCase() !== signerAddress.toLowerCase()) {
        alert("You're not the seller of this NFT");
        setLoading(false);
        return;
      }

      // Figure out your Auction contract address
      const auctionContractAddress = await auctionContract.getAddress();
      console.log("Auction contract address:", auctionContractAddress);

      // Approve this token for auctioning
      console.log("Approving token for auction contract…");
      const approvalTx = await nftContract.approveTokenForAuction(
        tokenId,
        auctionContractAddress
      );
      console.log(`⏳ Waiting for approval tx ${approvalTx.hash}`);
      await approvalTx.wait();
      console.log("✅ Token approved for auction contract");

      // Create the auction
      console.log("Creating auction…");
      const auctionTx = await auctionContract.createAuction(
        tokenId,
        priceInWei,
        durationInSeconds
      );
      console.log(`⏳ Waiting for auction tx ${auctionTx.hash}`);
      await auctionTx.wait();
      console.log("🎉 Auction created successfully");

      // Mark the token as Not Listed in the NFT contract
      const tx = await nftContract.setTokenListed(tokenId, false);
      console.log(`⏳ Waiting for mark as not listed tx ${tx.hash}`);
      await tx.wait();
      console.log("✅ Token marked as not listed in NFT contract");

      // Update your UI state - remove this token from deeds list
      setDeeds(prev => prev.filter(deed => deed.tokenId !== tokenId));

      // Refresh all auction data
      await fetchActiveAuctions(auctionContract, nftContract);

      // Show success message
      setNotification('Auction created successfully!');
      setTimeout(() => setNotification(''), 5000);
    } catch (error) {
      console.error("Error starting auction:", error);
      setError(`Failed to start auction: ${error.reason || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const placeBid = async (auctionId, bidAmount) => {
    if (!auctionContract || !signer) {
      alert("Blockchain connection not established");
      return;
    }

    setLoading(true);
    setError(null);
    setIsAuctionCreator(false); // Reset this state before each bid attempt

    try {
      const bidAmountWei = ethers.parseEther(bidAmount.toString());
      console.log(`Placing bid of ${bidAmount} ETH on auction ${auctionId}`);

      // Auction creator cannot bid on their own auction
      const auctionDetails = await auctionContract.getAuctionDetails(auctionId);
      const auctionCreator = auctionDetails.seller;
      const userAddr = await signer.getAddress();

      if (userAddr.toLowerCase() === auctionCreator.toLowerCase()) {
        alert("You cannot bid on your own auction");
        setIsAuctionCreator(true);
        setLoading(false);
        return;
      }

      const tx = await auctionContract.placeBid(auctionId, { value: bidAmountWei });
      console.log(`⏳ Waiting for bid tx ${tx.hash}`);
      await tx.wait();
      console.log("✅ Bid placed successfully");

      // Show success message
      setNotification('Bid placed successfully!');
      setTimeout(() => setNotification(''), 5000);

      // Refresh auction data
      await fetchActiveAuctions(auctionContract, nftContract);
    } catch (error) {
      console.error("Error placing bid:", error);
      setError(`Failed to place bid: ${error.reason || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const claimPrize = async (auctionId) => {
    if (!auctionContract || !signer) {
      alert("Blockchain connection not established");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log(`Checking auction status for ${auctionId} before claiming...`);

      // Get auction status and details first
      const status = await auctionContract.getAuctionStatus(auctionId);
      console.log("Auction status:", status);

      const auctionDetails = await auctionContract.getAuctionDetails(auctionId);
      console.log("Auction details:", auctionDetails);

      const userAddr = await signer.getAddress();
      console.log("User address:", userAddr);
      console.log("Winner address:", status.currentWinner);

      // Manual checks before attempting the blockchain transaction
      if (!status.isLive) {
        throw new Error("Auction is not active (already claimed or cancelled)");
      }

      if (status.currentWinner.toLowerCase() !== userAddr.toLowerCase()) {
        throw new Error("You are not the winner of this auction");
      }

      console.log(`Claiming prize for auction ${auctionId}`);

      // When all checks pass, proceed with the claim
      const tx = await auctionContract.claimPrize(auctionId);
      console.log(`⏳ Waiting for claim tx ${tx.hash}`);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

      console.log("✅ Prize claimed successfully");

      // Show success message
      document.getElementById('claim-success-sound').play();
      fireConfetti();
      setClaimPopupMessage("🎉 Congratulations! You successfully claimed your NFT!");
      setShowClaimPopup(true);

      setTimeout(() => {
        setShowClaimPopup(false);
      }, 5000);


      // Refresh auction data
      await fetchActiveAuctions(auctionContract, nftContract);
      await fetchCompletedAuctions(auctionContract, nftContract);
      await fetchDeeds(nftContract);
    } catch (error) {
      console.error("Error claiming prize:", error);
      setError(`Failed to claim prize: ${error.reason || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to check if the current user is the auction winner
  const isAuctionWinner = (auction) => {
    if (!userAddress || !auction.winner) return false;
    return auction.winner.toLowerCase() === userAddress.toLowerCase();
  };

  // Function to check if auction is ended but not yet claimed
  const isEndedButNotClaimed = (auction) => {
    return auction.auctionEnded && auction.isLive;
  };

  const reclaimAuction = async (auctionId) => {
    if (!auctionContract || !signer) {
      alert("Blockchain connection not established");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log(`Checking auction status for ${auctionId} before reclaiming...`);

      // Get auction status and details first
      const status = await auctionContract.getAuctionStatus(auctionId);
      console.log("Auction status:", status);

      const auctionDetails = await auctionContract.getAuctionDetails(auctionId);
      console.log("Auction details:", auctionDetails);

      const userAddr = await signer.getAddress();
      console.log("User address:", userAddr);
      console.log("Seller address:", auctionDetails.seller);

      // Manual checks before attempting the blockchain transaction
      if (!status.isLive) {
        throw new Error("Auction is not active (already claimed or cancelled)");
      }

      if (auctionDetails.seller.toLowerCase() !== userAddr.toLowerCase()) {
        throw new Error("Only the seller can reclaim this auction");
      }

      if (status.currentWinner !== "0x0000000000000000000000000000000000000000") {
        throw new Error("This auction has bids and cannot be reclaimed");
      }

      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime < parseInt(auctionDetails.endTime)) {
        throw new Error("Auction has not ended yet");
      }

      console.log(`Reclaiming auction ${auctionId}`);

      // When all checks pass, proceed with the reclaim
      // First check if the contract has approval to transfer the token
      const tokenOwner = await nftContract.ownerOf(auctionId);
      console.log("Current token owner:", tokenOwner);

      // print type of auctionContract.address and tokenOwner
      console.log("auctionContract.address:", Auction.networks["5777"].address);

      // If the token is owned by the auction contract, proceed with reclaim
      if (tokenOwner.toLowerCase() === Auction.networks["5777"].address.toLowerCase()) {
        try {
          // 1) Simulate the call
          await auctionContract.reclaimAuction.staticCall(auctionId);
        } catch (simErr) {
          // callStatic will bubble up the actual `require(...)` message
          console.error("callStatic error object:", simErr);

          // ethers v6 puts the human‑readable reason in one of these…
          const reason =
            // this is set when you do `require(..., "Foo")`
            simErr.reason
            // v6 also surfaces a “shortMessage” containing that same text
            ?? simErr.shortMessage
            // some nodes drop both, but leave raw error data here
            ?? simErr.data
            // fallback to the generic JS error message
            ?? simErr.message;

          alert(`Cannot claim NFT: ${reason}`);
          return;
        }

        // Call the actual contract function
        const tx = await auctionContract.reclaimAuction(auctionId);
        console.log(`⏳ Waiting for reclaim tx ${tx.hash}`);

        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log("Transaction receipt:", receipt);

        if (receipt.status !== 1) {
          throw new Error("Transaction failed");
        }

        console.log("✅ Auction reclaimed successfully");

        // Show success message
        setNotification('NFT reclaimed successfully!');
        setTimeout(() => setNotification(''), 5000);

        // Refresh auction data
        await fetchActiveAuctions(auctionContract, nftContract);
        await fetchCompletedAuctions(auctionContract, nftContract);
        await fetchDeeds(nftContract);
      } else {
        throw new Error("NFT is not currently owned by the auction contract");
      }
    } catch (error) {
      console.error("Error reclaiming auction:", error);
      setError(`Failed to reclaim auction: ${error.reason || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // const reclaimAuction = async (auctionId) => {
  //   if (!auctionContract || !signer) {
  //     alert("Blockchain connection not established");
  //     return;
  //   }

  //   setLoading(true);
  //   setError(null);
  //   try {
  //     console.log(`Checking auction status for ${auctionId} before reclaiming...`);

  //     // Get auction status and details first
  //     const status = await auctionContract.getAuctionStatus(auctionId);
  //     console.log("Auction status:", status);

  //     const auctionDetails = await auctionContract.getAuctionDetails(auctionId);
  //     console.log("Auction details:", auctionDetails);

  //     const userAddr = await signer.getAddress();
  //     console.log("User address:", userAddr);

  //     // Manual checks before attempting the blockchain transaction
  //     if (!status.isLive) {
  //       throw new Error("Auction is not active (already claimed or cancelled)");
  //     }

  //     if (auctionDetails.seller.toLowerCase() !== userAddr.toLowerCase()) {
  //       throw new Error("Only the seller can reclaim this auction");
  //     }

  //     if (status.currentWinner !== "0x0000000000000000000000000000000000000000") {
  //       throw new Error("This auction has bids and cannot be reclaimed");
  //     }

  //     const currentTime = Math.floor(Date.now() / 1000);
  //     if (currentTime < parseInt(auctionDetails.endTime)) {
  //       throw new Error("Auction has not ended yet");
  //     }

  //     console.log(`Reclaiming auction ${auctionId}`);

  //     // When all checks pass, proceed with the reclaim
  //     // const tx = await auctionContract.reclaimAuction(auctionId);
  //     // console.log(`⏳ Waiting for reclaim tx ${tx.hash}`);

  //     // // Wait for transaction confirmation
  //     // const receipt = await tx.wait();
  //     // console.log("Transaction receipt:", receipt);

  //     try {
  //         // 1) Simulate the call
  //         await auctionContract.reclaimAuction.staticCall(auctionId);
  //       } catch (simErr) {
  //         // callStatic will bubble up the actual `require(...)` message
  //         console.error("callStatic error object:", simErr);

  //         // ethers v6 puts the human‑readable reason in one of these…
  //         const reason =
  //           // this is set when you do `require(..., "Foo")`
  //           simErr.reason
  //           // v6 also surfaces a “shortMessage” containing that same text
  //           ?? simErr.shortMessage
  //           // some nodes drop both, but leave raw error data here
  //           ?? simErr.data
  //           // fallback to the generic JS error message
  //           ?? simErr.message;

  //         alert(`Cannot claim NFT: ${reason}`);
  //         return;
  //       }

  //     if (receipt.status === 0) {
  //       throw new Error("Transaction failed");
  //     }

  //     console.log("✅ Auction reclaimed successfully");

  //     // Show success message
  //     setNotification('NFT reclaimed successfully!');
  //     setTimeout(() => setNotification(''), 5000);

  //     // Refresh auction data
  //     await fetchActiveAuctions(auctionContract, nftContract);
  //     await fetchCompletedAuctions(auctionContract, nftContract);
  //     await fetchDeeds(nftContract);
  //   } catch (error) {
  //     console.error("Error reclaiming auction:", error);
  //     setError(`Failed to reclaim auction: ${error.reason || error.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fireConfetti = () => {
    if (confettiInstance.current) {
      confettiInstance.current({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      confettiInstance.current({
        particleCount: 50,
        spread: 100,
        origin: { y: 0.3 }
      });
    }
  };

  return (
    <>
      <audio id="claim-success-sound" src="/sounds/success.mp3" preload="auto"></audio>

      {error && <div className="error-message">{error}</div>}
      {notification && <div className="notification">{notification}</div>}

      <div className='auction-container'>
        <h1>Start Auctions</h1>
        <div className='card-container upcoming'>
          {loading && deeds.length === 0 ? (
            <p>Loading upcoming auctions...</p>
          ) : deeds.length === 0 ? (
            <p>You do not have any NFT to start an auction.</p>
          ) : (
            deeds.map((deed) => (
              <AuctionCard
                key={deed.tokenId}
                startAuction={true}
                name={deed.name}
                description={deed.description}
                image={deed.image}
                price={deed.price}
                tokenId={deed.tokenId}
                buttonType="start"
                onButtonClick={(price, duration) => startAuction(deed.tokenId, price, duration)}
              />
            ))
          )}
        </div>
      </div>

      <div className='auction-container'>
        <h1>Ongoing Auctions</h1>
        <div className='card-container ongoing'>
          {loading && ongoingAuctions.length === 0 ? (
            <p>Loading ongoing auctions...</p>
          ) : ongoingAuctions.length === 0 ? (
            <p>No ongoing auctions found.</p>
          ) : (
            ongoingAuctions.map((auction) => (
              <AuctionCard
                key={auction.auctionId}
                startAuction={false}
                name={auction.name}
                description={auction.description}
                image={auction.image}
                price={auction.startingPrice}
                currentBid={auction.currentBid}
                tokenId={auction.tokenId}
                auctionId={auction.auctionId}
                remainingTime={auction.remainingTime}
                totalBids={auction.totalBids}
                buttonType="participate"
                onButtonClick={(bidAmount) => placeBid(auction.auctionId, bidAmount)}
                onClaimClick={() => claimPrize(auction.auctionId)}
                onReclaimClick={() => reclaimAuction(auction.auctionId)}
                seller={auction.seller}
                winner={auction.winner}
                userAddress={userAddress}
                auctionEnded={auction.auctionEnded}
                isLive={auction.isLive}
                isAuctionCreator={auction.seller && userAddress && auction.seller.toLowerCase() === userAddress.toLowerCase()}
              />
            ))
          )}
        </div>
      </div>

      <div className='auction-container'>
        <h1>Past Auctions</h1>
        <div className='card-container past'>
          {loading && pastAuctions.length === 0 ? (
            <p>Loading past auctions...</p>
          ) : pastAuctions.length === 0 ? (
            <p>No past auctions found.</p>
          ) : (
            pastAuctions.map((auction) => (
              <AuctionCard
                key={auction.auctionId}
                startAuction={false}
                name={auction.name}
                description={auction.description}
                image={auction.image}
                price={auction.finalPrice}
                tokenId={auction.tokenId}
                auctionId={auction.auctionId}
                buttonType="view"
                winner={auction.winner}
                seller={auction.seller}
              />
            ))
          )}
        </div>
      </div>

      {loading && <div className="loading-overlay">Processing blockchain transaction...</div>}
      {showClaimPopup && (
        <div className="popup-message">
          <p>{claimPopupMessage}</p>
        </div>
      )}

      <ReactCanvasConfetti
        style={{ position: 'fixed', pointerEvents: 'none', width: '100%', height: '100%', top: 0, left: 0 }}
        onInit={({ confetti }) => {
          confettiInstance.current = confetti;
        }}
      />

    </>
  )
}

export default Auctions