# Melchain environment

## Run tests

```bash
npx hardhat test
```
Don't forget to specify the network you want to test on. If you don't specify, hardhat will run it in the hre.  
If you want to run it on the Melchain, provided you're running the endpoint :

```bash
npx hardhat test --network melchain
```

## Tasks

Give an address 10 $MEL if it has less than 1.1

```bash
npx hardhat give_money --account [address] --network melchain
```

Check an address balance

```bash
npx hardhat give_money --account [address] --network melchain
```

## Run scripts

Deploy challenge by #

```
npx hardhat run scripts/deployx.js --network melchain
```
