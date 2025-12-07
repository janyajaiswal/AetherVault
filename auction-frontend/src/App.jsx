import React, { use } from 'react';
import './App.css';
import NavBar from './components/NavBar';
import Auctions from './components/Auctions';
import Deeds from './components/Deeds';
import Profile from './components/Profile';
import Stats from './components/Stats';
import { Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { requestAccount } from './services/blockchainService';
import { Marketplace } from './components/Marketplace';
import BlockchainBackground from './components/BlockchainBackground';

const App = () => {
  const [account, setAccount] = useState(null);
  const [currAddress, setCurrAddress] = useState(null);
  
  useEffect(() => {
    const fetchCurrAccount = async () => {
      const account = await requestAccount();
      setCurrAddress(account);
    };
    fetchCurrAccount();
  }, []);

  useEffect(() => {
    const handleAccountChanged = (newAccounts) => setAccount(newAccounts.length > 0 ? newAccounts[0] : null);
    if(window.ethereum){
      window.ethereum.on("accountsChanged", handleAccountChanged);
    }
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountChanged);
    };
  });

  async function connectWallet() {
    try{
      const account = await requestAccount();
      setAccount(account);
    } catch(error) {
      console.error("Error connecting wallet:", error);
    }
  }


  return (
    <div className="app-container">
      <BlockchainBackground />
      <NavBar account={currAddress}/>
      <main className="main-content">
        <Routes> 
          <Route path="/" element={<Marketplace />} />
          <Route path="/auction" element={<Auctions />} />
          <Route path="/deed" element={<Deeds />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      
      { !currAddress ? (
      <button className="connectBtn"
        onClick={connectWallet} >
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512" fill="white"><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"></path></svg>
        Connect
        </button>
        ) : (null )
        }
    </div>
  )
}

export default App