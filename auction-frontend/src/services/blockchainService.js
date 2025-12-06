import NFTAuction from "../abis/NFTAuction.json";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
//import { CONTRACT_ADDRESS } from "../utils/constants.js";

let provider;
let signer;
let auctionContract;

const initialize = async() => {
  if(typeof window.ethereum !== 'undefined'){
    provider = new BrowserProvider(window.ethereum);
    console.log("Provider: ", provider);
    signer = await provider.getSigner();
    console.log("Signer: ", signer);
    const accounts = await provider.send("eth_requestAccounts", []);
    console.log("Accounts: ", accounts);
    auctionContract = new Contract(NFTAuction.networks[5777].address, NFTAuction.abi, signer);
  }else {
    console.log("Please install MetaMask");
  }
}

initialize();


// function to request single account
export const requestAccount = async() => {
  try{
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0];
  } catch(error) {
    console.error("Error requesting account:", error);
    return null;
  }
}

// function to get current balance in ETH
export const getCurrentBalanceInETH = async() => {
  const balanceWei = await provider.getBalance(CONTRACT_ADDRESS);
  const balanceEth = formatEther(balanceWei);
  return balanceEth;
}

// function to get provider
export const getProvider = () => {
  return provider;
}

// function to get signer
export const getSigner = () => {
  return signer;
}

// function to get auction contract
export const getAuctionContract = () => {
  return auctionContract;
}





