const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");

let wmel_contract = 0;
let kwike_factory_contract = 0;
let kwike_router_contract = 0;


async function deploy(contractName, args = []) {
  const contractFactory = await ethers.getContractFactory(contractName);

  const contract = await contractFactory.deploy(...args);
  await contract.deployed();

  return contract;
}

async function deployAll() {
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
  const challenge02 = await ethers.getContractFactory("hero2302");
  const challenge02_contract = await challenge02.deploy();
  await challenge02_contract.deployed();

  console.log(challenge02_contract.address);
  console.log(" WMEL :", wmel_contract.address);
  console.log(" DEX router  :", kwike_router_contract.address);
  console.log(" DEX factory :", kwike_factory_contract.address)


  let tx0 = await depositAs(0x0, ethers.utils.parseEther("25.0"))

  await tx0.wait();

  let pair_create = await kwike_factory_contract.createPair(wmel_contract.address, challenge02_contract.address);
  await pair_create.wait();


  let liq_add = await kwike_router_contract.addLiquidity(
    wmel_contract.address,
    challenge02_contract.address,
    ethers.utils.parseUnits("20.0", 18), ethers.utils.parseUnits("10000", 18), ethers.utils.parseUnits("20", 18), ethers.utils.parseUnits("10000", 18),
    challenge02_contract.address,
    Math.floor(Date.now() / 1000) + 60 * 10);

  await liq_add.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
