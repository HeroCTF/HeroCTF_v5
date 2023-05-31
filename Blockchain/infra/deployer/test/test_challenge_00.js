const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");



describe("Challenge 00 : ABI cursed", function () {
  it("Should deploy the contract, make a transaction, and query the flag", async function ()
  {


    
    const challenge00 = await ethers.getContractFactory("hero2300");
    const challenge00_contract = await challenge00.deploy();
    await challenge00_contract.deployed();

    console.log("Contract deployed to ", challenge00_contract.address);


    const challenge00pwn = await ethers.getContractFactory("hero2300_pwn");
    const challenge00pwn_contract = await challenge00pwn.deploy();
    await challenge00pwn_contract.deployed();
    console.log("Contract deployed to ", challenge00pwn_contract.address);


    const acceptRulesTx = await challenge00pwn_contract.exploit(challenge00_contract.address);
    // wait until the transaction is mined
    await acceptRulesTx.wait();

    let res = await challenge00_contract.win();

    // let n_owner = await challenge00_contract.owner();

    // console.log('Flag ->', await flag);
    expect(res).to.equal(true);
  });
});
