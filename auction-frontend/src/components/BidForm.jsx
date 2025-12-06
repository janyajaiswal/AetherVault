import React from 'react'
import './styles/BidForm.css'
// import web3Service from '../services/blockchainService';


// var myContract = web3Service.myContract;

const BidForm = ({onClick}) => {

  const [bidAmount, setBidAmount] = React.useState(0);

  // async function placeBid() {
  //   const accounts = await myContract.methods;
  //   console.log("Accounts: ", accounts);
  //   console.log("Bid Amount: ", bidAmount);
  //   const result = await myContract.methods.placeBid().send({from: accounts[0], value: bidAmount});
  //   console.log("Result: ", result);
  // }

  return (
    <div>
        <div class="subscribe">
            <p>Place your bid</p>
            <input placeholder="ETH" class="subscribe-input" name="eth" type="number"  onChange={(e) => {setBidAmount(e.target.value)}}/>
            <br/>
            <div class="submit-btn" >SUBMIT</div>
        </div>
    </div>
  )
}

export default BidForm