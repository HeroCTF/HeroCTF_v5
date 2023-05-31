require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const { PRIVATE_KEY } = process.env;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs) => {
    const account = web3.utils.toChecksumAddress(taskArgs.account);
    const balance = await web3.eth.getBalance(account);

    console.log(web3.utils.fromWei(balance, "ether"), "ETH");
  });

task("give_money", "Gives a user money")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs) =>
  {
    [owner, nonOwner] = await hre.ethers.getSigners();

    const account = web3.utils.toChecksumAddress(taskArgs.account);
    const oldbalance = await web3.eth.getBalance(account);
    if ((await web3.utils.fromWei(oldbalance, "ether")) < 1.1)
    {
      let tx2 = 
      {
        to: taskArgs.account,
        value: ethers.utils.parseEther("5")
      };

      console.log('sending tx');
      let txObject2 = await owner.sendTransaction(tx2);
      console.log('Tx hash :', txObject2.hash);
      await txObject2.wait();

      const newbalance = await web3.eth.getBalance(account);
      if (newbalance > oldbalance)
        console.log("OK");
    }
    else
    {
      console.log("NOK");
      return 1;
    }
  });


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.13",
      },
      {
        version: "0.4.16",
      },
      {
        version: "0.7.6",
      },
      {
        version: "0.5.16",
        settings: { optimizer: { enabled: true, runs: 200 } }
      },
      {
        version: "0.6.6",
        settings: { optimizer: { enabled: true, runs: 1 } }
      },
      {
        version: "0.4.18"        
      },
      {
        version: "0.8.17"
      }
               ]
    },
  networks: 
  {
    melchain: 
    {
      url: `http://127.0.0.1:8502`,
      accounts : [`${PRIVATE_KEY}`],
      chainId: 1337,
      allowUnlimitedContractSize: true,
      gasPrice: 30,
      gas : 8000000
    },
    hardhat:
    {
      accounts:
      {
        accountsBalance: "1000000000000000000000000000000000"
      },
      allowUnlimitedContractSize: true,
      gasPrice: 875000000,
      gas : 8000000, gasMultiplier : 50
    }
  },

};
