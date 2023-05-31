# Hero Chain !

## What's in all that ?  

The `deployer/` folder contains all the environment that allows to automatically deploy smart contracts.
The `website/`folder contains the entire Melcoin website.

You will find all the solves (in JS) under `deployer/test_challenge_*.js`

## How to start that ?

```bash

# start infrastructures and setup various environment files
# A special thanks to my bro @shinji for this, you're a beast man. <3

./start_infra.sh
```

Install `deployer/` packages
```
cd deployer
npm install
```

Just start the website in another terminal if you want to
```
cd website
pip install -r requirements.txt
python App.py
```
