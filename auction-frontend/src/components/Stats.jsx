import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import NFTAuction from '../abis/NFTAuction.json';
import Auction from '../abis/Auction.json';
import './styles/Stats.css';

const Stats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState({
    totalAuctions: 0,
    activeAuctions: 0,
    completedAuctions: 0,
    totalVolume: 0,
    averagePrice: 0,
    priceHistory: [],
    auctionPriceData: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Connect to contracts
      const nftContract = new ethers.Contract(
        NFTAuction.networks[5777].address,
        NFTAuction.abi,
        signer
      );

      const auctionContract = new ethers.Contract(
        Auction.networks[5777].address,
        Auction.abi,
        signer
      );

      // Fetch all auctions
      const activeAuctions = await auctionContract.getActiveAuctions();
      const completedAuctions = await auctionContract.getCompletedAuctions();

      // Process active auctions
      const activeData = await Promise.all(
        activeAuctions.map(async (auction) => {
          try {
            const status = await auctionContract.getAuctionStatus(auction.tokenId);
            const bidders = await auctionContract.getBidders(auction.tokenId);
            
            // Create price history from bidders
            const priceHistory = bidders
              .filter(bid => !bid.refunded) // Only include non-refunded bids
              .map((bid, index) => ({
                price: parseFloat(ethers.formatEther(bid.bidAmount)),
                timestamp: bid.timestamp ? new Date(parseInt(bid.timestamp.toString()) * 1000) : new Date(),
                bidder: bid.bidder
              }))
              .sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp

            return {
              tokenId: auction.tokenId.toString(),
              currentPrice: parseFloat(ethers.formatEther(status.currentPrice)),
              startingPrice: parseFloat(ethers.formatEther(auction.price)),
              priceHistory: priceHistory,
              totalBids: status.totalBids,
              timeRemaining: parseInt(status.timeRemaining)
            };
          } catch (err) {
            console.error(`Error processing auction ${auction.tokenId}:`, err);
            return null;
          }
        })
      );

      // Filter out null values
      const validActiveData = activeData.filter(data => data !== null);

      // Process completed auctions
      const completedData = completedAuctions.map(auction => ({
        tokenId: auction.tokenId.toString(),
        finalPrice: parseFloat(ethers.formatEther(auction.price)),
        startingPrice: parseFloat(ethers.formatEther(auction.price))
      }));

      // Calculate statistics
      const allPrices = [
        ...validActiveData.map(a => a.currentPrice),
        ...completedData.map(a => a.finalPrice)
      ];

      const totalVolume = allPrices.reduce((sum, price) => sum + price, 0);
      const averagePrice = allPrices.length > 0 ? totalVolume / allPrices.length : 0;

      // Create combined price history for chart
      const combinedPriceHistory = validActiveData
        .flatMap(auction => auction.priceHistory || [])
        .sort((a, b) => a.timestamp - b.timestamp);

      setStatsData({
        totalAuctions: activeAuctions.length + completedAuctions.length,
        activeAuctions: activeAuctions.length,
        completedAuctions: completedAuctions.length,
        totalVolume: totalVolume,
        averagePrice: averagePrice,
        priceHistory: combinedPriceHistory,
        auctionPriceData: validActiveData
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load statistics. Please try again.");
      setLoading(false);
    }
  };

  const PriceChart = ({ data, title }) => {
    if (!data || data.length === 0) {
      return (
        <div className="chart-container">
          <h3>{title}</h3>
          <div className="no-data">No price data available</div>
        </div>
      );
    }

    const prices = data.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const chartWidth = 800;
    const chartHeight = 300;
    const padding = 40;
    const innerWidth = chartWidth - 2 * padding;
    const innerHeight = chartHeight - 2 * padding;

    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * innerWidth;
      const y = padding + innerHeight - ((point.price - minPrice) / priceRange) * innerHeight;
      return { x, y, price: point.price, timestamp: point.timestamp };
    });

    const pathData = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    const areaPath = `${pathData} L ${points[points.length - 1].x} ${padding + innerHeight} L ${padding} ${padding + innerHeight} Z`;

    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <svg width={chartWidth} height={chartHeight} className="price-chart">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => {
            const y = padding + (i / 4) * innerHeight;
            const price = maxPrice - (i / 4) * priceRange;
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  fill="rgba(255, 255, 255, 0.6)"
                  fontSize="12"
                  textAnchor="end"
                >
                  {price.toFixed(4)} ETH
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#gradient)"
            opacity="0.3"
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#667eea"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#667eea"
                className="chart-point"
              />
              <title>
                Price: {point.price.toFixed(4)} ETH
                {point.timestamp && `\nTime: ${point.timestamp.toLocaleTimeString()}`}
              </title>
            </g>
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#667eea" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#764ba2" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  const AuctionPriceChart = ({ auctionData }) => {
    if (!auctionData || auctionData.length === 0) {
      return (
        <div className="chart-container">
          <h3>Active Auction Prices</h3>
          <div className="no-data">No active auctions</div>
        </div>
      );
    }

    const chartWidth = 800;
    const chartHeight = 400;
    const padding = 60;
    const barWidth = (chartWidth - 2 * padding) / auctionData.length - 10;
    const maxPrice = Math.max(...auctionData.map(a => a.currentPrice), 1);
    const innerHeight = chartHeight - 2 * padding;

    return (
      <div className="chart-container">
        <h3>Active Auction Prices</h3>
        <svg width={chartWidth} height={chartHeight} className="bar-chart">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => {
            const y = padding + (i / 4) * innerHeight;
            const price = maxPrice - (i / 4) * maxPrice;
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  fill="rgba(255, 255, 255, 0.6)"
                  fontSize="12"
                  textAnchor="end"
                >
                  {price.toFixed(4)} ETH
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {auctionData.map((auction, index) => {
            const x = padding + index * (barWidth + 10);
            const barHeight = (auction.currentPrice / maxPrice) * innerHeight;
            const y = padding + innerHeight - barHeight;

            return (
              <g key={auction.tokenId}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#barGradient)"
                  className="chart-bar"
                  rx="4"
                />
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding + 20}
                  fill="rgba(255, 255, 255, 0.7)"
                  fontSize="11"
                  textAnchor="middle"
                >
                  #{auction.tokenId}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  fill="#fff"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {auction.currentPrice.toFixed(3)} ETH
                </text>
                <title>
                  Token ID: #{auction.tokenId}
                  {"\n"}Current Price: {auction.currentPrice.toFixed(4)} ETH
                  {"\n"}Starting Price: {auction.startingPrice.toFixed(4)} ETH
                  {"\n"}Total Bids: {auction.totalBids}
                </title>
              </g>
            );
          })}

          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="stats-container">
        <div className="loading">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <h1 className="stats-title">Auction Statistics</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{statsData.totalAuctions}</div>
          <div className="stat-label">Total Auctions</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">{statsData.activeAuctions}</div>
          <div className="stat-label">Active Auctions</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{statsData.completedAuctions}</div>
          <div className="stat-label">Completed</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{statsData.totalVolume.toFixed(4)}</div>
          <div className="stat-label">Total Volume (ETH)</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-value">{statsData.averagePrice.toFixed(4)}</div>
          <div className="stat-label">Average Price (ETH)</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <PriceChart
          data={statsData.priceHistory}
          title="Price History Over Time"
        />

        <AuctionPriceChart auctionData={statsData.auctionPriceData} />
      </div>
    </div>
  );
};

export default Stats;

