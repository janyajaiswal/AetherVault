const NFTAuction = artifacts.require("NFTAuction");
const Auction = artifacts.require("Auction");

module.exports = async function(deployer) {
  await deployer.deploy(NFTAuction);
  const nftAuction = await NFTAuction.deployed();
  await deployer.deploy(Auction, nftAuction.address);

};