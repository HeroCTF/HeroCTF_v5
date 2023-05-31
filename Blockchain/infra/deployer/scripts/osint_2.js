// Difficulty : easy / medium+

// You found the boss, now time to find where the money comes from. 
// All accounts addr and pk are saved in addresses/osint2/




const fs = require('fs');
const { ethers } = require('hardhat');

const OSINT3_TRANSCRIPTS_PATH = 'transcripts/osint3/';
const OSINT3_ADDRESSES_PATH = 'addresses/osint3/';
const OSINT2_TRANSCRIPTS_PATH = 'transcripts/osint2/';
const OSINT2_ADDRESSES_PATH = 'addresses/osint2/';

const NUM_RUGPULLS = 5;

let wmel_contract = 0;
let wmel_balance_contract = 0;
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

async function depositAs(as, percent) {
    let user_balance = await ethers.provider.getBalance(as.address)


    let val = getPercentageOfBigNumber(user_balance, percent);

    console.log("[ERC20] User", as.address, "depositing", percent, "% of wallet (", weiToEther(val), ") in WMEL")


    let overrides = {
        value: val
    };

    // Deposit BNB to have WBNB
    res = await wmel_contract.connect(as).deposit(overrides);

    return res;
}


async function createPairAndLiquidity(as, on) {
    /*
     * Create pair on KwikESwap and get the pair address
     */
    // console.log('[+] Creating pair on KwikESwap')
    try {
        res = await kwike_factory_contract.connect(as).createPair(wmel_contract.address, on.address);
    }
    catch (error) {
        // the pair might exist bc it creates itself in constructor ?
        ;
    }

    pair_addr = await kwike_factory_contract.getaPair(wmel_contract.address, on.address)

    /*
     * Attach to pair
     */
    const KwikEPair = await ethers.getContractFactory("KwikEPair");
    KwikEPairContract = KwikEPair.attach(pair_addr);

    console.log(wmel_contract.address,
        on.address,
        ethers.utils.parseUnits("5.0", 18), ethers.utils.parseUnits("1000000", 18), ethers.utils.parseUnits("2", 18), ethers.utils.parseUnits("1000000", 18),
        on.address,
        Math.floor(Date.now() / 1000) + 60 * 10);

    let liq_add = await kwike_router_contract.connect(as).addLiquidity(
        wmel_contract.address,
        on.address,
        ethers.utils.parseUnits("20.0", 18), ethers.utils.parseUnits("10000", 18), ethers.utils.parseUnits("20", 18), ethers.utils.parseUnits("10000", 18),
        on.address,
        Math.floor(Date.now() / 1000) + 60 * 10);

    await liq_add.wait();

}

const deployAs = async (contract_name, as, parameters = []) => {

    let contractFactory = await ethers.getContractFactory(contract_name);
    console.log("factoryok")
    let contract = await contractFactory.connect(as).deploy(...parameters);
    console.log("connectas ok ")
    await contract.deployed()

    console.log("DEploy ok");
    return contract;
}

function weiToEther(gwei) {
    const gweiAsBigNumber = ethers.utils.parseUnits(gwei.toString(), 'wei'); // Converts gwei to wei
    const ether = ethers.utils.formatUnits(gweiAsBigNumber, 'ether'); // Converts wei to ether

    return ether;
}

async function approveRouterWrapped(as) {

    let res = await wmel_contract.connect(as).approve(kwike_router_contract.address, ethers.utils.parseEther("20.0"));


    return res;

}

async function approveRouterERC(as, on) {

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

async function do_a_swap(as, amount_in, slipp, path) {
    //         IPancakeRouter02(PANCAKESWAP_ROUTER).swapExactTokensForTokensSupportingFeeOnTransferTokens(_amountIn, minAmountWithSlippage, path, address(this), block.timestamp);

    let min_tokens = await kwike_router_contract.getAmountsOut(amount_in, path);


    let slippage = ethers.BigNumber.from(slipp).mul(100);
    let val1 = min_tokens[1];
    let min_slippage = val1.mul(slippage).div(ethers.BigNumber.from(10000))

    try {
        let res = await kwike_router_contract.connect(as).swapExactTokensForTokensSupportingFeeOnTransferTokens(amount_in, min_slippage, [path[0], path[1]], as.address, Math.floor(Date.now() / 1000) + 60 * 10);
        await res.wait();
    } catch (error) {
        console.log("ERROR ON SWAP", error);
        return;
    }

    return res;
}

async function depositAs(as) {


    let user_balance = await ethers.provider.getBalance(as.address)

    let user_percent = 5 + Math.floor(Math.random() * 45) // 5 - 50%

    let val = getPercentageOfBigNumber(user_balance, user_percent);

    console.log("[ERC20] User", as.address, "depositing", user_percent, "% of wallet (", weiToEther(val), ") in WMEL")


    let overrides = {
        value: val
    };

    // Deposit BNB to have WBNB
    res = await wmel_contract.connect(as).deposit(overrides);

    return res;
}

async function deployOrAttach(contractName, args = []) {
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
    kwike_factory_contract = await deployOrAttach("KwikEFactory", [0x0]);
    kwike_router_contract = await deployOrAttach("KwikERouter", [kwike_factory_contract.address, wmel_contract.address]);
    token_contract = await deployOrAttach("ERC20");

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

function get_wallet_from_file(file_path)
{
    const walletpkey = fs.readFileSync(file_path, 'utf-8').trim();
    const wallet = new ethers.Wallet(walletpkey);
    const signer = wallet.connect(ethers.provider);

    return signer
}

async function make_branch_from(wallet)
{
    // create 10 wallets
    // send 50 % of your wallet / 10 to each wallet

    let wallet_array = [];

    let wallet_bal = await ethers.provider.getBalance(wallet.address)
    let to_send = getPercentageOfBigNumber(wallet_bal, 50);

    for (let i = 0; i < 4; ++i)
    {
        let cur_wallet = ethers.Wallet.createRandom();
        let connected_wallet = cur_wallet.connect(ethers.provider)

        console.log("Sending", weiToEther(to_send.div(10)), "total ", wallet_bal)
        
        const tx2 = await wallet.sendTransaction({
            to: connected_wallet.address,
            value: to_send.div(10),
        });

        await tx2.wait();

        wallet_array.push(connected_wallet);
    }
    
    return wallet_array
}

async function printBalsFor(wallet)
{
    let wmel_bal = await wmel_contract.balanceOf(wallet.address);
    let mel_bal = await ethers.provider.getBalance(wallet.address);

    console.log("WMEL : ", weiToEther(wmel_bal), "\nMEL : ", weiToEther(mel_bal));


}

async function withdraw_as(as, percent)
{
    let user_balance = await wmel_contract.getBalance(as.address);

    let val = getPercentageOfBigNumber(user_balance, percent);

    let res = await wmel_contract.connect(as).withdraw(val);

    return res
}


async function main() 
{
    const [deployer] = await ethers.getSigners();

    await deployAll();

    // Read the bronance wallet address and private key
    const bronanceAddress = fs.readFileSync(`addresses/bronance_osint.address`, 'utf-8').trim();
    const bronancePrivateKey = fs.readFileSync(`addresses/bronance_osint.key`, 'utf-8').trim();
    const bronanceWallet = new ethers.Wallet(bronancePrivateKey);
    const bronanceSigner = bronanceWallet.connect(ethers.provider);


    const osint2targetSigner = get_wallet_from_file(`${OSINT3_ADDRESSES_PATH}osint2target.key`)

    let txx = await withdraw_as(osint2targetSigner, 100);

    await txx.wait();


    // Generate "someguy" address (Target for osint 1)
    const osint1targetWallet = ethers.Wallet.createRandom();
    fs.writeFileSync(`${OSINT2_ADDRESSES_PATH}osint1target.address`, osint1targetWallet.address);
    fs.writeFileSync(`${OSINT2_ADDRESSES_PATH}osint1target.key`, osint1targetWallet.privateKey);
    // const osint1targetSigner = osint1targetWallet.connect(ethers.provider);

    //             // Fund "someguy" address with MEL from bronance
    //             const tx2 = await bronanceSigner.sendTransaction({
    //                 to: osint2targetSigner.address,
    //                 value: ethers.utils.parseEther('500'),
    //             });
    // await tx2.wait();
    console.log("Deploy start balances : \n");
    console.log("O2 target :")
    await printBalsFor(osint2targetSigner);
    console.log("O1 target : ")
    await printBalsFor(osint1targetWallet);


    let layer1 = await make_branch_from(osint2targetSigner);
    
    let layer2 = []

    for (pup of layer1)
    {
        console.log("Branching l1")
        let l2_b = await make_branch_from(pup);
        layer2.push(...l2_b);
    }

    console.log("L1 OK");
    for (pup of layer2)
    {
        // 70% chance to send 30-80% of wallet

        let randomed = Math.floor(Math.random() * 100)
        if (randomed < 70)
        {
            randomed = 30 + Math.floor(Math.random() * 50)
            let wallet_bal = await ethers.provider.getBalance(pup.address)
            let to_send = getPercentageOfBigNumber(wallet_bal, randomed);

            console.log("pup2 sending ", weiToEther(to_send))

            const tx2 = await pup.sendTransaction({
                to: osint1targetWallet.address,
                value: to_send,
            });

            await tx2.wait();
        }
    }

    console.log("Deploy start balances : \n");
    console.log("O2 target :")
    await printBalsFor(osint2targetSigner);
    console.log("O1 target : ")
    await printBalsFor(osint1targetWallet);

    console.log('Challenge setup complete');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

