import React, {useEffect, useState} from 'react';
import './styles/AuctionWindow.css';
import BidForm from './BidForm';
import {ethers} from 'ethers';

const AuctionWindow = ({ open, OnClose, deedData, contract }) => {
  if (!open || !deedData) return null;

  const { name, image, price, auctionId, remainingTime: initialRemainingTime } = deedData;

  const [highestBid, setHighestBid] = useState(price);
  const [bidAmount, setBidAmount] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(initialRemainingTime || 3600);
  const [bidHistory, setBidHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch auction details including bid history
  useEffect(() => {
    if (auctionId && contract) {
      fetchAuctionDetails();
    }
  }, [auctionId, contract]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const fetchAuctionDetails = async () => {
    try {
      // Get auction data
      const auctionData = await contract.getAuction(auctionId);
      setHighestBid(ethers.formatEther(auctionData.highestBid));
      
      // Get bid history
      const [bidders, bidAmounts] = await contract.getAuctionBids(auctionId);
      
      // Format bid history
      const history = bidders.map((bidder, index) => ({
        bidder: bidder.substring(0, 6) + '...' + bidder.substring(bidder.length - 4),
        amount: ethers.formatEther(bidAmounts[index]),
        timestamp: Date.now() - (index * 60000) // Mock timestamp for display purposes
      }));
      
      setBidHistory(history.reverse()); // Show most recent bids first
    } catch (err) {
      console.error("Error fetching auction details:", err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  async function placeBid() {
    if (!bidAmount || parseFloat(bidAmount) <= parseFloat(highestBid)) {
      alert("Bid must be higher than current highest bid");
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert bid amount from ETH to Wei
      const bidAmountWei = ethers.parseEther(bidAmount);
      
      // Create bid transaction
      const tx = await contract.placeBid(auctionId, { value: bidAmountWei });
      
      // Wait for transaction to be mined
      await tx.wait();
      console.log("Bid placed successfully");
      
      // Update UI
      setHighestBid(bidAmount);
      setBidAmount("");
      
      // Refresh bid history
      await fetchAuctionDetails();
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Failed to place bid: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="auction-window">
        <button className="close-button" onClick={OnClose}>✕</button>

        <h1 className="auction-title">Live Auction</h1>

        <div className="auction-info-bar">
          <p><strong>Starting Bid:</strong> {price} ETH</p>
          <p><strong>Current Bid:</strong> {highestBid} ETH</p>
          <p><strong>Time Remaining:</strong> {formatTime(timeRemaining)}</p>
        </div>

        <h2 className="item-title">{name}</h2>
        <img src={image} alt={name} className="auction-image" />

        <div className="auction-price-list">
          <h3>Bid History</h3>
          {bidHistory.length === 0 ? (
            <p>No bids yet. Be the first to bid!</p>
          ) : (
            <ul className="bid-history-list">
              {bidHistory.map((bid, index) => (
                <li key={index} className="bid-history-item">
                  <span className="bidder-address">{bid.bidder}</span>
                  <span className="bid-amount">{bid.amount} ETH</span>
                  <span className="bid-time">{formatTimestamp(bid.timestamp)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bid-form-wrapper">
          <div className="bid-form">
            <input
              type="number"
              placeholder={`Bid more than ${highestBid} ETH`}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="bid-input"
              disabled={loading}
            />
            <button 
              onClick={placeBid} 
              className="bid-button"
              disabled={loading}
            >
              {loading ? "Processing..." : "Place Bid"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionWindow;