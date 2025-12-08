// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./NFTAuction.sol";

contract Auction is ReentrancyGuard {
    address payable public owner;
    address public companyAcc;
    uint public royaltyFee;

    NFTAuction public nftContract;

    uint private ids;

    mapping(uint => AuctionStruct) public auctionedItem;
    mapping(uint => bool) public auctionedItemExists;
    mapping(string => uint) public existingURIs;
    mapping(uint => BidderStruct[]) public biddersOf;
    
    // Track all tokens that have active auctions
    uint[] private activeAuctionIds;
    // Track all tokens that have been auctioned
    uint[] private auctionedTokenIds;

    constructor(address _nftContract) {
        nftContract = NFTAuction(_nftContract);
        owner = payable(msg.sender);
        // We will dynamically track auctions instead of relying on ids variable
    }

    struct BidderStruct {
        address bidder;
        uint bidAmount;
        uint timestamp;
        bool refunded;
        bool won;
    }

    struct AuctionStruct {
        uint tokenId;
        address payable owner;
        address payable seller;
        address winner;
        uint price;
        bool sold;
        bool live;
        bool biddable;
        uint bids;
        uint duration;
        uint endTime;  // Added endTime field to track when the auction ends
        uint auctionId; // Unique identifier for the auction
    }

    event AuctionItemCreated(
        uint indexed tokenId,
        address seller,
        address owner,
        uint price,
        bool sold
    );

    function createAuction(
        uint tokenId,
        uint price,
        uint duration
    ) public nonReentrant {
        // get token info from NFTAuction contract
        NFTAuction.ListedToken memory tokenInfo = nftContract.getListedTokenForId(tokenId);

        // Check if caller is the seller
        require(
            tokenInfo.seller == msg.sender,
            "Not authorized to auction this token"
        );
        
        require(price > 0 ether, "Price must not be negative");
        require(duration > 0, "Auction duration must be greater than 0");
        
        // Check if this token already has an active auction
        require(!auctionedItemExists[tokenId] || !auctionedItem[tokenId].live, 
                "Token already has an active auction");

        AuctionStruct memory item;
        item.tokenId = tokenId;
        item.seller = payable(tokenInfo.seller);
        item.owner = payable(address(nftContract));
        item.price = price;
        item.duration = duration;
        item.endTime = block.timestamp + duration;
        item.auctionId = tokenId;  // Using tokenId as the auctionId for simplicity

        auctionedItem[tokenId] = item;
        auctionedItemExists[tokenId] = true;

        // Check if the auction is not already live
        if(!auctionedItem[tokenId].live) {
            // Determine where the NFT currently is and transfer accordingly
            address currentOwner = IERC721(address(nftContract)).ownerOf(tokenId);
            
            // If owned by user, transfer from user to this contract
            // If owned by nftContract, transfer from nftContract to this contract
            IERC721(address(nftContract)).transferFrom(
                currentOwner,
                address(this),
                tokenId
            );
            
            auctionedItem[tokenId].bids = 0;
            auctionedItem[tokenId].live = true;
            auctionedItem[tokenId].biddable = true;
            
            // Add to active auctions list
            activeAuctionIds.push(tokenId);
        }

        emit AuctionItemCreated(
            tokenId,
            tokenInfo.seller,
            address(nftContract),
            price,
            false
        );
    }

    function placeBid(uint tokenId) public payable nonReentrant {
        require(auctionedItemExists[tokenId], "Auction does not exist");
        require(auctionedItem[tokenId].live, "Auction is not live");
        require(auctionedItem[tokenId].biddable, "Bidding is not allowed for this auction");
        require(block.timestamp < auctionedItem[tokenId].endTime, "Auction has ended");
        require(msg.sender != auctionedItem[tokenId].seller, "Seller cannot bid on their own auction");
        require(msg.value > auctionedItem[tokenId].price, "Bid must be higher than current price");

        // Store the previous highest bidder to refund them
        address previousBidder = auctionedItem[tokenId].winner;
        uint previousBid = auctionedItem[tokenId].price;

        // Create and store the new bid
        BidderStruct memory bidder;
        bidder.bidder = msg.sender;
        bidder.bidAmount = msg.value;
        bidder.timestamp = block.timestamp;
        bidder.refunded = false;
        bidder.won = false;

        biddersOf[tokenId].push(bidder);
        
        // Update auction details
        auctionedItem[tokenId].bids += 1;
        auctionedItem[tokenId].price = msg.value;
        auctionedItem[tokenId].winner = msg.sender;
        
        // If there was a previous bidder, refund them
        if (previousBidder != address(0) && previousBid > 0) {
            // Find the previous bidder in the array and mark as refunded
            for (uint i = 0; i < biddersOf[tokenId].length - 1; i++) {
                if (biddersOf[tokenId][i].bidder == previousBidder && 
                    biddersOf[tokenId][i].bidAmount == previousBid &&
                    !biddersOf[tokenId][i].refunded) {
                    biddersOf[tokenId][i].refunded = true;
                    break;
                }
            }
            
            // Refund the previous bidder
            (bool success, ) = payable(previousBidder).call{value: previousBid}("");
            require(success, "Failed to refund previous bidder");
        }
        
        // Extend auction time if bid is placed in the last 5 minutes (anti-sniping)
        // if (auctionedItem[tokenId].endTime - block.timestamp < 5 minutes) {
        //     auctionedItem[tokenId].endTime += 5 minutes;
        // }
        
        emit NewBid(tokenId, msg.sender, msg.value);
    }

    // claimPrize function to finalize the auction and transfer the NFT to the winner
    function claimPrize(uint tokenId) public nonReentrant {
        require(auctionedItemExists[tokenId], "Auction does not exist");
        // require(block.timestamp > auctionedItem[tokenId].endTime, "Auction is still live");
        require(auctionedItem[tokenId].live, "Auction is not active or already claimed");
        require(auctionedItem[tokenId].winner == msg.sender, "You are not the winner of this auction");
        require(auctionedItem[tokenId].winner != address(0), "No winner for this auction");

        // Get auction details before updating state
        uint price = auctionedItem[tokenId].price;
        address payable seller = auctionedItem[tokenId].seller;
        address payable originalOwner = auctionedItem[tokenId].owner;
        
        // Update state before external calls to prevent reentrancy
        auctionedItem[tokenId].live = false;
        auctionedItem[tokenId].sold = true;
        auctionedItem[tokenId].biddable = false;
        
        // Remove from active auctions list
        removeFromActiveAuctions(tokenId);
        // Add to auctioned token IDs list
        // This is to keep track of all auctioned tokens, even if they are not live anymore
        auctionedTokenIds.push(tokenId);
        
        // Mark the winning bid
        for (uint i = 0; i < biddersOf[tokenId].length; i++) {
            if (biddersOf[tokenId][i].bidder == msg.sender && 
                biddersOf[tokenId][i].bidAmount == price) {
                biddersOf[tokenId][i].won = true;
                break;
            }
        }
        
        // Calculate royalties
        uint royalty = (price * royaltyFee) / 100;
        uint sellerAmount = price - royalty;

        // Verify NFT ownership and approval
        try IERC721(address(nftContract)).ownerOf(tokenId) returns (address currentOwner) {
            require(currentOwner == address(this), "Auction contract doesn't own the NFT");
        } catch {
            revert("NFT ownership verification failed");
        }

        // Transfer the NFT to the winner
        try IERC721(address(nftContract)).transferFrom(address(this), msg.sender, tokenId) {
            // Update auction owner to winner
            auctionedItem[tokenId].owner = payable(msg.sender);
            // Update the NFTAuction contract with the new owner
            nftContract.updateOwner(tokenId, msg.sender);
            // Update the NFTAuction contract with the new price
            nftContract.updatePrice(tokenId, price);
            
            // Send payments
            (bool successSeller, ) = seller.call{value: sellerAmount}("");
            require(successSeller, "Failed to pay seller");
            
            if (royalty > 0 && originalOwner != address(0)) {
                (bool successRoyalty, ) = originalOwner.call{value: royalty}("");
                require(successRoyalty, "Failed to pay royalties");
            }
            
            emit AuctionEnded(tokenId, msg.sender, price);
        } catch {
            // Revert the state changes if the transfer fails
            auctionedItem[tokenId].live = true;
            auctionedItem[tokenId].sold = false;
            auctionedItem[tokenId].biddable = true;
            
            // Add back to active auctions if needed
            bool found = false;
            for (uint i = 0; i < activeAuctionIds.length; i++) {
                if (activeAuctionIds[i] == tokenId) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                activeAuctionIds.push(tokenId);
            }
            
            revert("NFT transfer failed");
        }
    }

    // Helper function to get the current timestamp
    function getAuctionStatus(uint tokenId) public view returns (
        bool isLive,
        bool isSold,
        uint currentPrice,
        address currentWinner,
        uint timeRemaining,
        uint totalBids
    ) {
        require(auctionedItemExists[tokenId], "Auction does not exist");
        
        AuctionStruct storage auction = auctionedItem[tokenId];
        
        isLive = auction.live;
        isSold = auction.sold;
        currentPrice = auction.price;
        currentWinner = auction.winner;
        timeRemaining = block.timestamp >= auction.endTime ? 0 : auction.endTime - block.timestamp;
        totalBids = auction.bids;
    }

    // Events for tracking auction activity
    event NewBid(uint tokenId, address bidder, uint amount);
    event AuctionEnded(uint tokenId, address winner, uint finalPrice);

    // Helper function to remove an auction from active auctions array
    function removeFromActiveAuctions(uint tokenId) internal {
        for (uint i = 0; i < activeAuctionIds.length; i++) {
            if (activeAuctionIds[i] == tokenId) {
                // Move the last element to this position and pop the last element
                activeAuctionIds[i] = activeAuctionIds[activeAuctionIds.length - 1];
                activeAuctionIds.pop();
                break;
            }
        }
    }

    // Update getActiveAuctions to use the activeAuctionIds array
    function getActiveAuctions() public view returns (AuctionStruct[] memory) {
        uint count = 0;
        
        // Count actual live auctions (some might have expired but not yet claimed)
        for (uint i = 0; i < activeAuctionIds.length; i++) {
            uint tokenId = activeAuctionIds[i];
            if (auctionedItemExists[tokenId] && auctionedItem[tokenId].live) {
                count++;
            }
        }
        
        AuctionStruct[] memory ret = new AuctionStruct[](count);
        uint j = 0;
        
        // Populate the array with active auctions
        for (uint i = 0; i < activeAuctionIds.length && j < count; i++) {
            uint tokenId = activeAuctionIds[i];
            if (auctionedItemExists[tokenId] && auctionedItem[tokenId].live) {
                ret[j] = auctionedItem[tokenId];
                j++;
            }
        }
        
        return ret;
    }

    // get specific auction details
    function getAuctionDetails(uint tokenId) public view returns (AuctionStruct memory) {
        require(auctionedItemExists[tokenId], "Auction does not exist");
        return auctionedItem[tokenId];
    }

    // get all bidders for a specific auction
    function getBidders(uint tokenId) public view returns (BidderStruct[] memory) {
        require(auctionedItemExists[tokenId], "Auction does not exist");
        return biddersOf[tokenId];
    }

    // get all completed auctions
    function getCompletedAuctions() public view returns (AuctionStruct[] memory) {
        uint count = 0;
        
        // First, count completed auctions
        for (uint i = 0; i < auctionedTokenIds.length; i++) {
            uint tokenId = auctionedTokenIds[i];
            if (auctionedItemExists[tokenId] && auctionedItem[tokenId].sold) {
                count++;
            }
        }
        
        AuctionStruct[] memory ret = new AuctionStruct[](count);
        uint j = 0;
        
        // Populate array with completed auctions
        for (uint i = 0; i < auctionedTokenIds.length && j < count; i++) {
            uint tokenId = auctionedTokenIds[i];
            if (auctionedItemExists[tokenId] && auctionedItem[tokenId].sold) {
                ret[j] = auctionedItem[tokenId];
                j++;
            }
        }
        
        return ret;
    }

    //Reclaim auction if it has ended and not claimed
    function reclaimAuction(uint tokenId) public nonReentrant {
        require(auctionedItemExists[tokenId], "Auction does not exist");
        require(auctionedItem[tokenId].live, "Auction is not active or already claimed");
        
        // Check if caller is the seller
        // require(msg.sender == auctionedItem[tokenId].seller, "Only the seller can reclaim an auction");
        
        // Check if auction has ended (time-wise)
        // require(block.timestamp > auctionedItem[tokenId].endTime, "Auction has not ended yet");
        
        // Check if there were no bids (winner will be address(0))
        require(auctionedItem[tokenId].winner == address(0), "Auction has bids and cannot be reclaimed");
        
        // Update state before transfers to prevent reentrancy
        auctionedItem[tokenId].live = false;
        auctionedItem[tokenId].sold = false;
        auctionedItem[tokenId].biddable = false;
        
        // Remove from active auctions list
        removeFromActiveAuctions(tokenId);
        
        // Add to auctioned token IDs list if it's not already there
        bool found = false;
        for (uint i = 0; i < auctionedTokenIds.length; i++) {
            if (auctionedTokenIds[i] == tokenId) {
                found = true;
                break;
            }
        }
        if (!found) {
            auctionedTokenIds.push(tokenId);
        }
        
        // Transfer the NFT back to the seller
        try IERC721(address(nftContract)).transferFrom(address(this), msg.sender, tokenId) {
            // Update owner in the NFT contract
            nftContract.updateOwner(tokenId, msg.sender);
            
            // Reclaimed NFTs should be unlisted, not listed
            nftContract.setTokenListed(tokenId, false);
            
        } catch {
            // Revert state changes if transfer fails
            auctionedItem[tokenId].live = true;
            auctionedItem[tokenId].sold = false;
            auctionedItem[tokenId].biddable = true;
            
            // Add back to active auctions if needed
            bool isActive = false;
            for (uint i = 0; i < activeAuctionIds.length; i++) {
                if (activeAuctionIds[i] == tokenId) {
                    isActive = true;
                    break;
                }
            }
            if (!isActive) {
                activeAuctionIds.push(tokenId);
            }
            
            revert("NFT transfer failed");
        }
    }
}

