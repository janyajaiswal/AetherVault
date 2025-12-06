import React, { useState, useEffect } from 'react';
import './styles/AuctionCard.css';

const AuctionCard = ({
  startAuction,
  name,
  description,
  image,
  price,
  currentBid,
  tokenId,
  auctionId,
  buttonType,
  onButtonClick,
  onClaimClick,
  onReclaimClick,
  remainingTime,
  totalBids,
  winner,
  seller,
  userAddress,
  isAuctionCreator
}) => {
  const [bidAmount, setBidAmount] = useState('');
  const [startingPrice, setStartingPrice] = useState('0.1');
  const [duration, setDuration] = useState('60'); // Default: 1 minute in seconds
  const [displayDuration, setDisplayDuration] = useState('1 minute');
  const [timeLeft, setTimeLeft] = useState(remainingTime || 0);
  const [isWinner, setIsWinner] = useState(false);
  const [currentUserAddress, setCurrentUserAddress] = useState('');

  // Duration options in seconds and their display values
  const durationOptions = [
    { value: '60', label: '1 minute' },
    { value: '120', label: '2 minutes' },
    { value: '180', label: '3 minutes' }
  ];

  // Format remaining time as minutes and seconds
  const formatTime = (seconds) => {
    if (seconds <= 0) return 'Auction ended';

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${minutes}m ${secs}s`;
  };

  // Convert duration input to human-readable format
  const handleDurationChange = (value) => {
    setDuration(value);
    // Find the matching option and set display text
    const selectedOption = durationOptions.find(opt => opt.value === value);
    setDisplayDuration(selectedOption ? selectedOption.label : '');
  };

  // Check if current user is the winner
  useEffect(() => {
    const checkUserAddress = async () => {
      if (userAddress) {
        try {
          const address = await Promise.resolve(userAddress);
          setCurrentUserAddress(address);
          setIsWinner(winner && address && winner.toLowerCase() === address.toLowerCase());
        } catch (error) {
          console.error("Error resolving user address:", error);
        }
      }
    };

    checkUserAddress();
  }, [userAddress, winner]);

  // Timer countdown effect
  useEffect(() => {
    setTimeLeft(remainingTime || 0);

    if (!remainingTime || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime]);

  // Handle bid submission
  const handleBid = (e) => {
    e.preventDefault();
    const bidAmountNum = parseFloat(bidAmount);
    const currentBidNum = parseFloat(currentBid || price);

    if (isNaN(bidAmountNum) || bidAmountNum <= currentBidNum) {
      alert(`Bid must be higher than current price (${currentBidNum} ETH)`);
      return;
    }

    onButtonClick(bidAmount);
    setBidAmount('');
  };

  // Handle auction creation
  const handleCreateAuction = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(startingPrice);
    const durationNum = parseInt(duration, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (isNaN(durationNum) || durationNum <= 0) {
      alert('Please enter a valid duration');
      return;
    }

    onButtonClick(startingPrice, durationNum);
  };

  // Render different card content based on auction type
  const renderCardContent = () => {
    if (startAuction) {
      return (
        <div className="auction-card__form">
          <p><strong>Price:</strong> {price} ETH</p>
          <p><strong>Token ID:</strong> {tokenId}</p>
          <p><strong>Description:</strong> {description}</p>
          <div className="form-group">
            <label>Starting Price (ETH):</label>
            <input
              type="number"
              min="0.001"
              step="0.001"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Duration:</label>
            <select
              value={duration}
              onChange={(e) => handleDurationChange(e.target.value)}
              required
            >
              {durationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="duration-display">Selected: {displayDuration}</div>
          </div>
          <button className="auction-card__button" onClick={handleCreateAuction}>
            Start Auction
          </button>
        </div>
      );
    } else if (buttonType === 'participate') {
      return (
        <div className="auction-card__details">
          <div className="auction-info">
            <p className="auction-timer">
              <strong>Time remaining:</strong> {formatTime(timeLeft)}
            </p>
            <p><strong>Seller:</strong> {seller.slice(0, 6)}...{seller.slice(-6)} </p>
            <p><strong>Current bid:</strong> {currentBid || price} ETH</p>
            <p><strong>Highest bidder:</strong> {winner ? `${winner.slice(0, 6)}...${winner.slice(-4)}` : 'No bids yet'}</p>
            <p><strong>Total bids:</strong> {totalBids || 0}</p>
          </div>

          {timeLeft > 0 ? (
            <form className="bid-form" onSubmit={handleBid}>
              <div className="form-group">
                <label>Your bid (ETH):</label>
                <input
                  type="number"
                  min={(parseFloat(currentBid || price) + 0.001).toString()}
                  step="0.001"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  required
                />
              </div>
              {isAuctionCreator ? (
                <p className="auction-card__creator">You are the auction creator</p>
              ) : (
                <button className="auction-card__button" type="submit">
                  Place Bid
                </button>
              )}

            </form>
          ) : (
            isWinner && (
              <button className="auction-card__button claim" onClick={onClaimClick}>
                Claim NFT
              </button>
            )
          )}

          {timeLeft <= 0 && !isWinner && (winner == "0x0000000000000000000000000000000000000000") &&
            isAuctionCreator && (
              <button
                className="auction-card__button claim"
                onClick={() => onReclaimClick(auctionId)}
              >
                Reclaim NFT
              </button>
            )
          }

        </div>
      );
    } else if (buttonType === 'view') {
      return (
        <div className="auction-card__details">
          <p><strong>Final price:</strong> {price} ETH</p>
          <p><strong>Seller:</strong> {seller ? `${seller.slice(0, 6)}...${seller.slice(-4)}` : 'Unknown'}</p>
          <p><strong>Winner:</strong> {winner ? `${winner.slice(0, 6)}...${winner.slice(-4)}` : 'None'}</p>
          <div className="auction-status completed">Auction Completed</div>
        </div>
      );
    }
  };

  return (
    <div className={`auction-card ${buttonType}`}>
      <div className="auction-card__image">
        <img src={image} alt={name} onError={(e) => { e.target.src = "/placeholder.png" }} />
      </div>
      <div className="auction-card__content">
        <h3 className="auction-card__title">{name}</h3>
        <p className="auction-card__description">{description}</p>
        <p className="auction-card__token-id">Token ID: {tokenId}</p>

        {renderCardContent()}
      </div>
    </div>
  );
};

export default AuctionCard;