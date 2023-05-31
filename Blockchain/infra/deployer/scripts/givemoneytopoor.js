const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");

to_address = process.argv[0]

const tx = 
{
  
    to: to_address,
  
    value: ethers.utils.parseEther("10"),
  
    nonce: ethers.provider.getTransactionCount(send_account, "latest"),

  
}

signer = ethers.getSigner();

signer.sendTransaction(tx).then((transaction) => 
{

    console.dir(transaction)
  
    alert("Send finished!")
  
  })
  
  
  
  
  