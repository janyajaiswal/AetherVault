import Web3 from "web3";
import Auction from "../static/Auction.json";

class Web3Service {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.account = null;
        this.contract = null;
    }

    async init() {
        if (typeof window.ethereum !== 'undefined') {
            this.provider = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.account = window.ethereum.selectedAddress;
            const networkId = await this.provider.eth.net.getId();
            this.contract = new this.provider.eth.Contract(
                Auction.abi,
                Auction.networks[networkId].address
            );
        } else {
            throw new Error('MetaMask is not installed');
        }
        
    }

    async getAccounts() {
        return await this.provider.eth.getAccounts();
    }

    async getBalance(account) {
        return await this.provider.eth.getBalance(account);
    }

    async getContract() {
        return this.contract;
    }

    async getContractAddress() {
        return this.contract.options.address;
    }

    isInitialized() {
        return !!this.provider && !!this.signer && !!this.account;
    }

    _checkInitialized() {
        if (!this.isInitialized()) {
          throw new Error('Web3Service is not initialized. Call initialize() first');
        }
    }

    async createDeeds(name, description, price) {
        this._checkInitialized();
        if (!this.contract) {
            throw new Error('Contract is not initialized');
        }
        return await this.contract.methods.createDeeds(name, description, price).send({from: window.ethereum.selectedAddress, value: Web3.utils.toWei(price, 'ether')});
    }



}

const web3Service = new Web3Service();
export default web3Service;