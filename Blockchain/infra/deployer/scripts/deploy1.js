const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");

async function deploy(contractName, args = []) {
  const contractFactory = await ethers.getContractFactory(contractName);

  const contract = await contractFactory.deploy(...args);
  await contract.deployed();

  return contract;
}

async function deployAll() 
{

  wmel_contract = await deploy("WMEL");
  kwike_factory_contract = await deploy("KwikEFactory", ["0x9FcF309dC7c97343328d03c1D834d0147076076c"]);
  kwike_router_contract = await deploy("KwikERouter", [kwike_factory_contract.address, wmel_contract.address]);

}

async function depositAs(as, val) {

  let overrides = {
      value: val
  };

  let res = await wmel_contract.deposit(overrides);

  return res;
}

async function main()
{
  await deployAll();
  const challenge03 = await ethers.getContractFactory("hero2303");
  const challenge03_contract = await challenge03.deploy();
  await challenge03_contract.deployed();

  console.log(challenge03_contract.address);


//   let overrides = {
//     value : ethers.utils.parseEther("2.0")
//   }
  
//   let tx0 = await challenge03_contract.buy(2, overrides=overrides)

//   await tx0.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
