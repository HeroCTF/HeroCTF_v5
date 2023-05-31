/*
 *  Ok so, you don't want to read that file because it's insanely dirty and I basically spent 99% of my time debugging weird shit.
 *  I ran through solidity error unknown to man and still to this day !
 *  Also JS sux you cant clone an object what the fuck ?
 *  No seriously, don't bother reading this ... ^^
 */


const { ethers } = require("hardhat");
const fs = require('fs');

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-ethers");

// Signers
let owner = 0;
let bronance_wallet = 0;
let osint_bronance_wallet = 0;
// Accounts
let accounts = []


let wmel_contract = 0;
let wmel_balance_contract = 0;
let kwike_factory_contract = 0;
let kwike_router_contract = 0;
let token_contract = 0;

let ADDR_NUM = 25;

let deployed_contracts = {};
let ready_to_swap = [];


async function checkAddressFromFile(contractName) {
  const filePath = `./addresses/${contractName}.txt`;

  if (fs.existsSync(filePath)) {
    const address = fs.readFileSync(filePath, 'utf8');
    console.info(`[+] ${contractName} found @ ${address}`);
    return address;
  }

  return null;
}

async function deployOrAttach(contractName, args = []) 
{
  const contractFactory = await ethers.getContractFactory(contractName);
  const address = await checkAddressFromFile(contractName);

  if (address) {
    return contractFactory.attach(address);
  }

  const contract = await contractFactory.deploy(...args);
  await contract.deployed();

  fs.writeFileSync(`./addresses/${contractName}.txt`, contract.address, 'utf8');
  console.info(`[+] ${contractName} deployed @ ${contract.address}`);

  return contract;
}

async function deployAll() {
  console.log("[+] Deploying contracts !");

  wmel_contract = await deployOrAttach("WMEL");
  kwike_factory_contract = await deployOrAttach("KwikEFactory", [owner.address]);
  kwike_router_contract = await deployOrAttach("KwikERouter", [kwike_factory_contract.address, wmel_contract.address]);
  token_contract = await deployOrAttach("ERC20");

  // return [wmel_contract, wmel_balance_contract, kwike_factory_contract, kwike_router_contract, token_contract];
}

/*
 * Get the "identities" of multiple people.
 * We can act as owner and non owner
 */
const setAccounts = async () => 
{
    [owner] = await ethers.getSigners();

    console.log("[+] Owner address : ", owner.address);
    let b_bronance_wallet = ethers.Wallet.createRandom();
    bronance_wallet = b_bronance_wallet.connect(ethers.provider)

    let b_osint_bronance_wallet = ethers.Wallet.createRandom();
    osint_bronance_wallet = b_osint_bronance_wallet.connect(ethers.provider)


    fs.writeFileSync(`./addresses/bronance.address`, bronance_wallet.address, 'utf8');
    fs.writeFileSync(`./addresses/bronance.key`, bronance_wallet.privateKey, 'utf8')

    fs.writeFileSync(`./addresses/bronance_osint.address`, osint_bronance_wallet.address, 'utf8');
    fs.writeFileSync(`./addresses/bronance_osint.key`, osint_bronance_wallet.privateKey, 'utf8')


    console.log("Wrote bronance info to file !");
    // console.log("Got owner :", owner);
}

/******************************************************************************************************************************
 *  Smart contract deployment
 ******************************************************************************************************************************/

const deployAsPromise = async (contract_name, as, parameters = []) => {
    let contractFactory = await ethers.getContractFactory(contract_name);
    let contractDeployPromise = await contractFactory.connect(as).deploy(...parameters);

    await contractDeployPromise.deployed();
    
    return contractDeployPromise
}

const deployAs = async (contract_name, as, parameters = []) => {
    let contractFactory = await ethers.getContractFactory(contract_name);
    let contract = await contractFactory.connect(as).deploy(...parameters);

    await contract.deployed()
    return contract;
}

/*
 * Simple deploy function. Takes a contract name, and a kwarg* like as param
 * (it's really a list of the constructor args) 
 */
const deploy = async (contract_name, parameters = []) => {
    let contractFactory = await ethers.getContractFactory(contract_name);
    // elegant way to pass [arg1, arg2, ...] as x(arg1, arg2, ...)

    let contract = await contractFactory.deploy(...parameters);

    await contract.deployed();
    return contract;
}

// /*
//  * Deploys all the contracts. 
//  */
// async function deployAll() {
//     // console.log(owner.address)
//     console.log("Deploying contracts !");
//     /*
//      * Deploy WBNB
//      */
//     wmel_contract = await deploy("WMEL");
//     console.info("[+] WMEL deployed @" + wmel_contract.address);

//     /*
//      * Deploy KwikEFactory
//      * Args : feeToSetter
//      */
//     kwike_factory_contract = await deploy("KwikEFactory", ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8"]);
//     console.info("[+] Kwik-E Factory deployed @" + kwike_factory_contract.address);
//     /*
//      * Deploy KwikERouter
//      * Args : obvious
//      */
//     kwike_router_contract = await deploy("KwikERouter", [kwike_factory_contract.address, wmel_contract.address]);
//     console.info("[+] Kwik-E Router deployed @" + kwike_router_contract.address);

//     token_contract = await deploy("ERC20");
//     console.info("[+] PureERC20 deployed @" + token_contract.address);

//     return [wmel_contract, wmel_balance_contract, kwike_factory_contract, kwike_router_contract, token_contract];
// }

/******************************************************************************************************************************
 *  ERC20 deployment
 ******************************************************************************************************************************/



async function createPairAndLiquidity() {
    /*
     * Create pair on KwikESwap and get the pair address
     */
    // console.log('[+] Creating pair on KwikESwap')
    try {
        res = await kwike_factory_contract.createPair(wmel_contract.address, token_contract.address);
    }
    catch (error) {
        // the pair might exist bc it creates itself in constructor ?
        ;
    }

    pair_addr = await kwike_factory_contract.getaPair(wmel_contract.address, token_contract.address)

    /*
     * Attach to pair
     */
    const KwikEPair = await ethers.getContractFactory("KwikEPair");
    KwikEPairContract = KwikEPair.attach(pair_addr);

    console.log(wmel_contract.address,
        token_contract.address,
        ethers.utils.parseUnits("2.0", 18), ethers.utils.parseUnits("1000000", 18), ethers.utils.parseUnits("2", 18), ethers.utils.parseUnits("1000000", 18),
        on.address,
        Math.floor(Date.now() / 1000) + 60 * 10);

    let liq_add = await kwike_router_contract.addLiquidity(
        wmel_contract.address,
        token_contract.address,
        ethers.utils.parseUnits("2.0", 18), ethers.utils.parseUnits("1000000", 18), ethers.utils.parseUnits("2", 18), ethers.utils.parseUnits("1000000", 18),
        on.address,
        Math.floor(Date.now() / 1000) + 60 * 10);


}

function weiToEther(gwei) 
{
    const gweiAsBigNumber = ethers.utils.parseUnits(gwei.toString(), 'wei'); // Converts gwei to wei
    const ether = ethers.utils.formatUnits(gweiAsBigNumber, 'ether'); // Converts wei to ether
  
    return ether;
}

async function approveRouterWrapped(as)
{

    let res = await wmel_contract.connect(as).approve(kwike_router_contract.address, ethers.utils.parseEther("20.0"));


    return res;

}

async function approveRouterERC(as, on)
{

    // let contractFactory = await ethers.getContractFactory("ERC20");

    // contractFactory = contractFactory.connect(as);

    // let user_ctx = contractFactory.attach(on);

    // console.log("OK attach")

    // console.log("kwike_router_contract.address", kwike_router_contract.address)

    // let res = await user_ctx.approve(kwike_router_contract.address, ethers.utils.parseEther("10000"));
    // console.log("OK res")
    // console.log("Trying to connect to", on, 'as', as)
    let user_ctx = await ethers.getContractAt("ERC20", on, as);

    let res = await user_ctx.connect(as).approve(kwike_router_contract.address, ethers.utils.parseEther("10000"));
    return res;
}

async function do_a_swap(as, amount_in, slipp, path)
{
    //         IPancakeRouter02(PANCAKESWAP_ROUTER).swapExactTokensForTokensSupportingFeeOnTransferTokens(_amountIn, minAmountWithSlippage, path, address(this), block.timestamp);

    let min_tokens = await kwike_router_contract.getAmountsOut(amount_in, path);

    let slippage = ethers.BigNumber.from(slipp).mul(100);
    let val1 = min_tokens[1];
    let min_slippage = val1.mul(slippage).div(ethers.BigNumber.from(10000))

    try {
            let res = await kwike_router_contract.connect(as).swapExactTokensForTokensSupportingFeeOnTransferTokens(amount_in, min_slippage, [path[0], path[1]], as.address, Math.floor(Date.now() / 1000) + 60 * 10);
    } catch (error) {
        return;
    }

    return res;
}

async function depositAs(as)
{


    let user_balance = await ethers.provider.getBalance(as.address)

    let user_percent = 5 + Math.floor(Math.random() * 45) // 5 - 50%

    let val = getPercentageOfBigNumber(user_balance, user_percent);

    console.log("[ERC20] User", as.address, "depositing", user_percent, "% of wallet (", weiToEther(val) ,") in WMEL")


    let overrides = {
        value: val
    };

    // Deposit BNB to have WBNB
    res = await wmel_contract.connect(as).deposit(overrides);

    return res;
}

async function get_swaps(num_swaps, buy_chance)
{
    let erc_to_deploy = [];
    // selected = [];

    for (let i = 0; i <= num_swaps; ++i)
    {
        let buy = false;
        let randomed = Math.random() * 100;

        if (randomed <= (buy_chance * 100))
            buy = true

        // console.log('Buy ?', buy);

        randomed = Math.floor(Math.random() * (accounts.length - 1));
        sender = accounts[randomed];

        let tries = 0;
        let current_sender_balance = 0;

        let condition = 0;



        try {
            current_sender_balance = await ethers.provider.getBalance(sender.wallet.address); // WMEL balance to swap
            //current_sender_balance = await ethers.provider.getBalance(sender.wallet.address);

        } catch (error) {
            console.log("Error on balance ", error);
            current_sender_balance = ethers.BigNumber.from(0);
        }

        if (buy)
            condition = (current_sender_balance.lt(ethers.utils.parseEther("0.1")) || sender.swapping != 0)  || selected.includes(sender.wallet.address)// If has not at least .1 ETH and has never swapped, or has been selected, not good.
        else
            condition = (sender.bought_coins.length == 0)

        while (condition) // Gotta have money for liquidity
        {
            let randomed = Math.floor(Math.random() * (accounts.length - 1));

            sender = accounts[randomed];
            try {
                current_sender_balance = await ethers.provider.getBalance(sender.wallet.address);
                if (buy)
                    condition = (current_sender_balance.lt(ethers.utils.parseEther("0.1")) && sender.swapping == 0)  || selected.includes(sender.wallet.address)
                else
                    condition = (sender.bought_coins.length == 0)
            } catch (error) {
                console.log("Error checking balance", error);
                continue
            }
            
            if (tries > 250)
            {
                console.log("ERC Stopping at iteration", tries, "condition looking for ", buy)
                break;
            }

            ++tries;

        }

        if (tries > 250)
            continue;

        selected.push(sender.wallet.address);
        
        let promise = 0;
        let intr = false;
        switch (sender.swapping) 
        {
            // Deposit / approve / approve / swap
            case 0:
                // console.log("[SWAP] User", sender.wallet.address, " pair")
                promise = depositAs(sender.wallet);
                erc_to_deploy.push(promise);
                sender.swapping ++;
                break;
            case 1:
                console.log("[SWAP] User", sender.wallet.address," approving router on WMEL")
                promise = approveRouterWrapped(sender.wallet)
                erc_to_deploy.push(promise);
                sender.swapping ++;
                break;
            case 2:

                let selected_erc = Math.floor(Math.random() * (ready_to_swap.length - 1));
                if (selected_erc < 0)
                {
                    intr = true;
                    break;
                }
                sender.token_swapping = selected_erc;
                console.log("[SWAP] User", sender.wallet.address," approving router on ERC", selected_erc)
                let ctx = ready_to_swap[selected_erc];
                promise = approveRouterERC(sender.wallet, ctx.address);
                erc_to_deploy.push(promise);
                sender.swapping ++;
                break;

            case 3:
                let amount_percent = 0;
                let user_w_bal = 0;


                let pair_addr = await kwike_factory_contract.getaPair(wmel_contract.address, ready_to_swap[sender.token_swapping].address)
                /*
                * Attach to pair
                */
                const KwikEPair = await ethers.getContractFactory("KwikEPair");
                let KwikEPairContract = KwikEPair.attach(pair_addr);
                
                let reserves = await KwikEPairContract.sync();
                reserves = await KwikEPairContract.getReserves();


                if (buy)
                {
                    amount_percent = 3 + Math.floor(Math.random() * 50); // 3 - 53%
                    user_w_bal = await wmel_contract.balanceOf(sender.wallet.address);
                    
                }  
                else
                {

                    amount_percent = 40 + Math.floor(Math.random() * 60); //40 - 100%
                    let selected_selling = Math.floor(Math.random() * (sender.bought_coins.length - 1)) // 0 is impossible
                    let ctx_addr = ready_to_swap[sender.bought_coins[selected_selling]].address
                    let user_ctx = await ethers.getContractAt("ERC20", ctx_addr, sender.wallet);

                    // console.log("Selling and got ctx", ctx, sender.bought_coins, selected_selling)

                    user_w_bal = await user_ctx.getBalanceOf(sender.wallet.address);
                }

                let value = getPercentageOfBigNumber(reserves[1], amount_percent);
                value = value.div(10);



                // let routerApprovalWrapped = await wmel_contract.getAllowance(kwike_router_contract.address);
                // // let routerApprovalContract = await ready_to_swap[sender.token_swapping];
                // // let routerApprovalERC = await routerApprovalContract.getAllowance(kwike_router_contract.address);

                // if (routerApprovalWrapped.lt(value)) 
                // {
                //     sender.swapping = 1;
                //     continue;
                // }
                // } else if (routerApprovalERC.lt(value)) 
                // {
                //     sender.swapping = 2;
                //     continue;
                // } else 
                // else
                // {
                    let slippage = 3 + Math.floor(Math.random() * 97); // 3 - 99%
                    let path = 0;
                    
                    if (buy)
                    {
                        path = [wmel_contract.address, ready_to_swap[sender.token_swapping].address];
                        if (!sender.bought_coins.includes(sender.token_swapping))
                        {
                            sender.bought_coins.push(sender.token_swapping);
                        }
                        console.log("[SWAP] User buying token (", amount_percent, "%) -> ", weiToEther(value), "MEL");
                    }
                    else
                    {
                        console.log("[SWAP] User selling token (", amount_percent, "%) -> ", weiToEther(value), " tokens");
                        if (amount_percent > 90)
                        {
                            sender.bought_coins = sender.bought_coins.filter(function (bought_coin) {
                                return bought_coin !== sender.token_swapping;
                            });
                        }

                        path = [ready_to_swap[sender.token_swapping].address, wmel_contract.address];

                    }

                    // console.log("Sending for swap with values :", sender.wallet, value, slippage, path);
                    promise = do_a_swap(sender.wallet, value, slippage, path);

                    sender.swapping = 3;
                //}

                erc_to_deploy.push(promise);

                break;
            default:
                break;
        }

        if (intr)
        {
            continue;
        }
    }
    return erc_to_deploy;
}


/******************************************************************************************************************************
 *  Traffic Simulation
 ******************************************************************************************************************************/


// Step 3 : create the pair on the DEX
async function promiseCreatePairAs(as, id)
{
    // console.log("All contracts :", deployed_contracts);
    // console.log("Accessing id", id);

    let token_contract_obj = deployed_contracts[id].contract;

    // console.log("Create pair :", kwike_factory_contract.address, "args :",wmel_contract.address,  token_contract_obj.address)

    create_pair_promise = await kwike_factory_contract.connect(as).createPair(wmel_contract.address, token_contract_obj.address);

    return create_pair_promise;
}

// Step 4 : Add liquidity
async function promiseAddLiquidityAs(as, id)
{

    let token_contract_obj = deployed_contracts[id].contract;


    // console.log("Adding liquidity to contract :", token_contract_obj);


    pair_addr = await kwike_factory_contract.getaPair(wmel_contract.address, token_contract_obj.address);

    let bal_percent = 20 + Math.floor(Math.random() * 30)

    // let sender_bal = await ethers.provider.getBalance(as.address);

    let sender_bal = await wmel_contract.balanceOf(as.address);

    let liq_to_add = getPercentageOfBigNumber(sender_bal, bal_percent);

    console.log("[ERC20] User", as.address, "adding liquidity : ", weiToEther(liq_to_add), " WMEL (", bal_percent," %)")


    let promise = await kwike_router_contract.connect(as).addLiquidity(
        wmel_contract.address,
        token_contract_obj.address,
        liq_to_add, ethers.utils.parseUnits("1000000", 18), liq_to_add, ethers.utils.parseUnits("1000000", 18),
        as.address,
        Math.floor(Date.now() / 1000) + 60 * 10);

    return promise;
}


async function prep_some_ercdeployment(num_erc)
{
    let erc_to_deploy = [];
    let addr_to_resolve = [];
    // let selected = [];
    let sender = 0;

    for (let i = 0; i <= num_erc; ++i)
    {
        let randomed = Math.floor(Math.random() * (accounts.length - 1));
        sender = accounts[randomed];

        let tries = 0;
        let current_sender_balance = 0;

        try {
            current_sender_balance = await sender.wallet.getBalance();
            //current_sender_balance = await ethers.provider.getBalance(sender.wallet.address);

        } catch (error) {
            console.log("Error on balance ", error);
            current_sender_balance = ethers.BigNumber.from(0);
        }

        while (current_sender_balance.lt(ethers.utils.parseEther("0.4")) || selected.includes(sender.wallet.address)) // Gotta have money for liquidity
        {
            let randomed = Math.floor(Math.random() * (accounts.length - 1));

            sender = accounts[randomed];
            try {
                current_sender_balance = await ethers.provider.getBalance(sender.wallet.address);
            } catch (error) {
                console.log("Error checking balance", error);
                continue
            }
            
            if (tries > 150)
            {
                console.log("ERC Stopping at iteration", i)
                return [erc_to_deploy, addr_to_resolve];
            }

            ++tries;

        }
        selected.push(sender.wallet.address);
        
        let promise = 0;
        switch (sender.deploying) 
        {
            case 0:
                promise = depositAs(sender.wallet);
                erc_to_deploy.push(promise)
                sender.deploying ++;
                break;
            case 1:
                console.log("[ERC20] User", sender.wallet.address, "deploying")
                promise = deployAs("ERC20", sender.wallet);
                let dc_len = Object.keys(deployed_contracts).length;
                erc_to_deploy.push(promise);
                addr_to_resolve.push([dc_len , erc_to_deploy.length]);
                sender.deploy_ids.push(dc_len);
                deployed_contracts[dc_len] = {address : 0x0, contract : 0};
                sender.deploying ++;
                break;
            case 2:
                console.log("[ERC20] User", sender.wallet.address, "creating pair")
                promise = promiseCreatePairAs(sender.wallet, sender.deploy_ids.slice(-1));
                erc_to_deploy.push(promise);
                sender.deploying ++;
                break;
            case 3:
                promise =  promiseAddLiquidityAs(sender.wallet, sender.deploy_ids.slice(-1));
                erc_to_deploy.push(promise);
                sender.deploying = 0;
                
                ready_to_swap.push(JSON.parse(JSON.stringify(deployed_contracts[sender.deploy_ids.slice(-1)].contract)))
            default:
                break;
        }            
    }

    return [erc_to_deploy, addr_to_resolve];
}


async function get_some_transfers(num_transfers, bronance=false)
{

    const transactions = []
    if (bronance)
    {
        selected = [];
    }
    let sender = 0;
    // console.log("Accounts : ", accounts)

    let bn_txnonce = 0;
    let counter = 0;

    for (let i = 0; i < num_transfers; ++i)
    {
        if (bronance)
        {
            sender = bronance_wallet
        }
        else
        {
            // Select random sender
            sender = accounts[Math.floor(Math.random() * ADDR_NUM)].wallet;
            let sender_balance = await ethers.provider.getBalance(sender.address);
            let tries = 0;
            while (sender_balance.lt(ethers.utils.parseEther('0.1')))
            {
                if (tries > 150)
                {
                    return transactions;
                }

                sender = accounts[Math.floor(Math.random() * ADDR_NUM)].wallet;
                sender_balance = await ethers.provider.getBalance(sender.address);
            }
        }


        bn_txnonce = (await ethers.provider.getTransactionCount(sender.address)) + counter;
        receiver = accounts[Math.floor(Math.random() * ADDR_NUM)];

        // console.log("Receiver addr :", receiver.wallet.address);

        if (selected.includes(receiver.wallet.address))
        {
            continue;
        }

        selected.push(receiver.wallet.address)


        const amountMultipliers = {
            "x-rich": [0.5, 1],
            "rich": [0.1, 1],
            "abitrich": [0.05, 0.5],
            "normal+": [0.02, 0.3],
            "normal": [0.01, 0.2],
          };
        
        const multiplierRange = amountMultipliers[receiver.type];
    
        // Generate a random amount based on sender's account type
        const randomMultiplier = Math.random() * (multiplierRange[1] - multiplierRange[0]) + multiplierRange[0];
        const senderBalance = await ethers.provider.getBalance(sender.address);
        
        let oneeth = ethers.utils.parseEther('100.0');


        let amountToSend = getPercentageOfBigNumber(oneeth, randomMultiplier * 100);

        
        if (amountToSend > senderBalance)
        {
            amountToSend = amountToSend.div(5000);
        }

        // console.log('Got sender : ', "balance", senderBalance);
        // console.log("Amount to send : ", amountToSend);

        console.log("[TOKEN] User", sender.address, '->', receiver.wallet.address, " : ", weiToEther(amountToSend), "MEL");
        let promise = sender.sendTransaction({
            to: receiver.wallet.address,
            value: amountToSend,
            gasPrice: 40 + Math.floor(Math.random() * 10), // 20 - 30
            nonce: bn_txnonce
    })

        transactions.push(promise)
        counter += 1;
    }

    return transactions
}

// Thanks chat GPT
async function send_to_bronance(num_transfers)
{
    const transactions = [];
    let sender = 0;

    let counter = 0;

    for (let i = 0; i < num_transfers; ++i)
    {
        // Select random sender
        sender = accounts[Math.floor(Math.random() * ADDR_NUM)].wallet;

        let sender_balance = await wmel_contract.balanceOf(sender.address);
        let tries = 0;
        while (sender_balance.lt(ethers.utils.parseEther('0.1')))
        {
            if (tries > 150)
            {
                return transactions;
            }

            sender = accounts[Math.floor(Math.random() * ADDR_NUM)].wallet;
            sender_balance = await wmel_contract.balanceOf(sender.address);
            tries++;
        }

        if (selected.includes(sender.address))
        {
            continue;
        }

        selected.push(sender.address);

        const bn_txnonce = (await ethers.provider.getTransactionCount(sender.address));
        const receiver = bronance_wallet.address;
    
        // Generate a random amount based on sender's account type
        const randomMultiplier = 10 + Math.floor(Math.random() * 50); // 10-60
        const senderBalance = await wmel_contract.balanceOf(sender.address);
        

        let amountToSend = getPercentageOfBigNumber(sender_balance, randomMultiplier);


        console.log("[TOKEN] User", sender.address, '->', receiver, " : ", weiToEther(amountToSend), "MEL");

        let promise0 = await wmel_contract.connect(sender).withdraw(amountToSend);

        try {
            let promise = await sender.sendTransaction({
            to: receiver,
            value: amountToSend.div(2),
            gasPrice: 40 + Math.floor(Math.random() * 10), // 40 - 50
            nonce: bn_txnonce + 1
            })
            transactions.push(promise);

        } catch (error) {
            ; // lol again
        }


        transactions.push(promise0);

        counter += 1;
    }

    return transactions;
}


async function createAddressesWithTypes(numAddresses) 
{

    if (ADDR_NUM != numAddresses)
    {
        ADDR_NUM += numAddresses;
    }
    console.log("Creating ", numAddresses, " addresses");

    if (accounts.length > 15000)
    {
        return;
    }

    const accountTypes = [
        { type: "x-rich", probability: 0.001 },
        { type: "rich", probability: 0.01 },
        { type: "abitrich", probability: 0.2 },
        { type: "normal+", probability: 0.3 },
        { type: "normal", probability: 0.489 }, // Remaining probability
    ];

    for (let i = 0; i < numAddresses; i++) {
        // Create a new random wallet
        let wallet = ethers.Wallet.createRandom();
        let connected_wallet = wallet.connect(ethers.provider)
        // Generate a random number to determine account type
        const randomNum = Math.random();

        // Determine the account type
        let accountType = "";
        let currentProbability = 0;
        for (const typeObj of accountTypes) {
            currentProbability += typeObj.probability;
            if (randomNum < currentProbability) {
                accountType = typeObj.type;
                break;
            }
        }

        // Create a JSON object with account details and type
        const account = {
            wallet: connected_wallet,
            type: accountType,
            bought_coins : [],
            deploying : 0,
            deploy_ids : [],
            swapping : 0,
        };

        // Add the account to the array
        accounts.push(account);
    }
    
    console.log("# accounts :", accounts.length);


}

function getPercentageOfBigNumber(bigNumber, floatPercentage) {
    if (!(bigNumber instanceof ethers.BigNumber) || typeof floatPercentage !== 'number') 
    {
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

async function wait_for_all(promise_array)
{
    let count = 0;

    let results = [];


    for (item of promise_array)
    {
        // console.log("waiting tx #", ++count)
        tx = await item;
        // await tx.wait(timeout=2);
        results.push(tx);
    }

    return results
}


async function web3_loic()
{
    let batches = 0;

    // We have to send bronance some money
    const tx = {

        from: owner.account,
      
        to: bronance_wallet.address,
      
        //  value: ethers.utils.parseEther("180000000"),
        value: ethers.utils.parseEther("1800000000000"),

        nonce: owner.getTransactionCount(),
      
        // gasLimit: ethers.utils.hexlify(21000), // 100000
      
        // gasPrice: 50,
      
      }

    await owner.sendTransaction(tx).then(async (transaction) => 
    {
        await transaction.wait();
    })

    // We have to send bronance some money
    const tx2 = {

        from: owner.account,
        
        to: osint_bronance_wallet.address,
        
        //  value: ethers.utils.parseEther("180000000"),
        value: ethers.utils.parseEther("1800000000000"),

        nonce: owner.getTransactionCount(),
        
        // gasLimit: ethers.utils.hexlify(21000), // 100000
        
        // gasPrice: 50,
        
        }

    await owner.sendTransaction(tx2).then(async (transaction) => 
    {
        await transaction.wait();
    })

    let balance = await bronance_wallet.getBalance();

    console.log('Balance', balance);


    //    $$\      $$\           $$\        $$$$$$\  $$\       $$$$$$\  $$$$$$\  $$$$$$\  
    //    $$ | $\  $$ |          $$ |      $$ ___$$\ $$ |     $$  __$$\ \_$$  _|$$  __$$\ 
    //    $$ |$$$\ $$ | $$$$$$\  $$$$$$$\  \_/   $$ |$$ |     $$ /  $$ |  $$ |  $$ /  \__|
    //    $$ $$ $$\$$ |$$  __$$\ $$  __$$\   $$$$$ / $$ |     $$ |  $$ |  $$ |  $$ |      
    //    $$$$  _$$$$ |$$$$$$$$ |$$ |  $$ |  \___$$\ $$ |     $$ |  $$ |  $$ |  $$ |      
    //    $$$  / \$$$ |$$   ____|$$ |  $$ |$$\   $$ |$$ |     $$ |  $$ |  $$ |  $$ |  $$\ 
    //    $$  /   \$$ |\$$$$$$$\ $$$$$$$  |\$$$$$$  |$$$$$$$$\ $$$$$$  |$$$$$$\ \$$$$$$  |
    //    \__/     \__| \_______|\_______/  \______/ \________|\______/ \______| \______/ 
                                                                                    
                                                                                    
    let f4000Prob = 0.5;
    let mtProb = 0.2;
    let ciProb = 0.02;
    let tdProb = 0.1;
    let buy_chance = 0.95;
    const evolveFrequency = 1000; // Adjust this value to set how often the percentages should change
  

    while (true)
    {
        // Select 20-30 transactions
        let num_txes = 20 + Math.floor(Math.random() * 10)
        // 1-10 new users
        let new_users = 1 + Math.floor(Math.random() * 10); 
        let batch = []
        
        console.log("\n\nBatch #", batches);

        await createAddressesWithTypes(new_users);

        /*
         * Batch 0 - 10 : we need to send money from bronance to people
         */ 
        if (batches <= 1)
        {
            batch = await get_some_transfers(num_txes, true);
            // console.log(batch)
            let results = await wait_for_all(batch);

            for (let i = 0; i < results.length; ++i)
            {
                let item = results[i];
                await item.wait();
            }
        }
        /*
         * Batch 0 - 4000 : ERC20 deployment on the way
         */ 
        else if (batches > 1 && batches < 15)
        {
            let br_tx_num = 0;
            let tx_num = 0;
            let ci_num = 0;
            let td_num = 0;

            for (let i = 0; i < num_txes; ++i)
            {
                let rand = Math.random();

                if (rand < f4000Prob) 
                {
                    ++br_tx_num;
                } else if (rand < f4000Prob + mtProb) 
                {
                    // ++tx_num;
                } else if (rand < f4000Prob + mtProb + ciProb) 
                {
                    ++ci_num;
                } else {
                    ++td_num;
                }
            }

            let nr_txes = []

            let slice = await get_some_transfers(br_tx_num, true);
            nr_txes += slice.length;
            batch.push(...slice);

            // slice = await get_some_transfers(tx_num, false)
            // nr_txes += slice.length;
            // if (slice.length != 0)
            // {
            //     batch.push(...slice);
            // }

            let [erc, ids] = await prep_some_ercdeployment(td_num);

            if (erc.length != 0)
            {
                batch.push(...erc);
            }

            console.log("#####\nBronance -> users #", br_tx_num, "\nUsers -> Users #", tx_num, "\nERC Txes #", erc.length)

            let results = await wait_for_all(batch);
            let ctx_added = 0;

            for (items of results)
            {
                let cursor = await items;
                // console.log("Got item !", cursor);

                if (cursor instanceof ethers.Contract)
                {
                    // console.log("IS CTX !")
                    deployed_contracts[Number(ids[ctx_added][0])].contract = JSON.parse(JSON.stringify(cursor));
                    ctx_added++;
                }
                else
                {
                    try {
                        await cursor.wait();
                    } catch (error) {
                        console.log("EROR !", error)
                        ; // lol
                    }
                    
                }
            }


            // if (ids.length != 0)
            // {

            //     let contracts = [];
            //     for (items of ids)
            //     {
            //         let idx = Number(nr_txes) + Number(items[1]);
            //         // console.log("Should be at idx", idx, idx - 1, results[idx - 1]);
            //         contracts.push(results[idx - 1]);
            //     }

            //     for (let i = 0; i < ids.length; ++i)
            //     {
            //         deployed_contracts[Number(ids[i][0])].contract = contracts[i];
            //     }
    
            // }

            // for (let i = 0; i < nr_txes; ++i)
            // {
            //     let item = results[i];
            //     // console.log("Waiting item", i, item);
            //     await item.wait();
            // }

        }
        /*
         * Batch 80 - INF : ERC20 swapping + binance withdrawal
         */ 
        else if (batches > 14)
        {
            let br_tx_num = 0;
            let tx_num = 0;
            let ci_num = 0;
            let td_num = 0;

            if ((batches % 100) == 0)
            {
                f4000Prob -= 0.02;
                mtProb += 0.02;
                ciProb += 0.08
            }


            for (let i = 0; i < num_txes; ++i)
            {
                let rand = Math.random();

                if (rand < f4000Prob) 
                {
                    ++br_tx_num;
                } else if (rand < f4000Prob + mtProb) 
                {
                    ++tx_num;
                } else if (rand < f4000Prob + mtProb + ciProb) 
                {
                    ++ci_num;
                } else {
                    ++td_num;
                }
            }

            let nr_txes = []

            let slice = await get_some_transfers(br_tx_num, true);
            nr_txes += slice.length;
            batch.push(...slice);

            slice = [];

            slice = await send_to_bronance(ci_num);

            nr_txes += slice.length;
            batch.push(...slice);

            slice = [];

            slice = await get_swaps(tx_num, buy_chance);

            let randomed = Math.floor(Math.random() * 100);

            if ((randomed / 100) >= buy_chance)
            {
                buy_chance += 0.003
            }
            else
            {
                buy_chance -= 0.003
            }

            if (slice.length != 0)
            {
                batch.push(...slice);
                nr_txes += slice.length;
            }

            let [erc, ids] = await prep_some_ercdeployment(td_num);

            if (erc.length != 0)
            {
                batch.push(...erc);
            }

            console.log("#####\nBronance -> users #", br_tx_num, "\nUsers -> Users #", tx_num, "\nERC Txes #", erc.length, "Swap Buy % chance :", buy_chance*100);

            let results = await wait_for_all(batch);
            let ctx_added = 0;

            for (items of results)
            {
                let cursor = await items;
                if (cursor instanceof ethers.Contract)
                {
                    await cursor.deployed();
                    deployed_contracts[Number(ids[ctx_added][0])].contract = JSON.parse(JSON.stringify(cursor));
                    ctx_added++;
                }
                else
                {
                    try {
                        await cursor.wait();
                    } catch (error) {
                        ; // lol
                    }
                }
            }


            // if (ids.length != 0)
            // {

            //     let contracts = [];
            //     for (items of ids)
            //     {
            //         let idx = Number(nr_txes) + Number(items[1]);
            //         // console.log("Should be at idx", idx, idx - 1, results[idx - 1]);
            //         contracts.push(results[idx - 1]);
            //     }

            //     for (let i = 0; i < ids.length; ++i)
            //     {
            //         deployed_contracts[Number(ids[i][0])].contract = contracts[i];
            //     }
    
            // }

            // for (let i = 0; i < nr_txes; ++i)
            // {
            //     let item = results[i];
            //     // console.log("Waiting item", i, item);
            //     try {
            //         if (item instanceof ethers.Contract)

            //         await item.wait();
            //     } catch (error) {
            //         console.log('Wait error :', error, item);
            //     }
                
            // }

        }



    ++batches;
    }
}

/******************************************************************************************************************************
 *  Main
 ******************************************************************************************************************************/
async function main() 
{
    // await network.provider.send("evm_setAutomine", [false]);
    // await network.provider.send("evm_setIntervalMining", [1000]);


    await createAddressesWithTypes(ADDR_NUM);
    await setAccounts();

    await deployAll();
    await web3_loic();
    // await approveAndTransfer();

    // let balance = await wmel_contract.getBalance(owner.address);
    // console.log('Owner has balance WMEL : ', balance);

    // await createPairAndLiquidity();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
