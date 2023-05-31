import socket
from flask import *
from web3 import Web3
from web3.middleware import geth_poa_middleware
from pygments import highlight
from pygments.lexers import (get_lexer_by_name, get_lexer_for_filename, get_lexer_for_mimetype, JsonLexer)
from pygments.formatters import HtmlFormatter
from subprocess import run, CalledProcessError
from os import chdir, getcwd, environ
from pathlib import Path
from flask_socketio import SocketIO, emit
import re
from dotenv import load_dotenv
from eth_account import Account
from eth_account.signers.local import LocalAccount
from web3.middleware.signing import construct_sign_and_send_raw_middleware

load_dotenv()

JSON_RPC_URL = "http://127.0.0.1:8502" # environ.get("JSON_RPC_URL")
ACCOUNT_ADDRESS = environ.get("ACCOUNT_ADDRESS")
HTTP_IP = environ.get("HTTP_IP")
HTTP_PORT = environ.get("HTTP_PORT")

WEBSITE_PATH = getcwd()
DEPLOYER_PATH = str(Path("../deployer").resolve())

## Time for some quick bad code
app = Flask(__name__)
socketio = SocketIO(app)


##
##  Assets
##

@app.route('/index_assets/<path:path>')
def send_index_asset(path):
    return send_from_directory('index_assets', path)

@app.route('/challenge0_assets/<path:path>')
def send_challenge0asset(path):
    return send_from_directory('challenge0_assets', path)

@app.route('/challenge1_assets/<path:path>')
def send_challenge1asset(path):
    return send_from_directory('challenge1_assets', path)

@app.route('/challenge2_assets/<path:path>')
def send_challenge2asset(path):
    return send_from_directory('challenge2_assets', path)

@app.route('/challenge3_assets/<path:path>')
def send_challenge3asset(path):
    return send_from_directory('challenge3_assets', path)

@app.route('/challenge4_assets/<path:path>')
def send_challenge4asset(path):
    return send_from_directory('challenge4_assets', path)

@app.route('/faucet_assets/<path:path>')
def send_faucet_asset(path):
    return send_from_directory('faucet_assets', path)

@app.route('/help_assets/<path:path>')
def send_help_asset(path):
    return send_from_directory('help_assets', path)

@app.route('/visu_assets/<path:path>')
def send_visu_asset(path):
    return send_from_directory('visu_assets', path)

##
##  Routes
##
@app.route('/')
def send_index():
    block_number, melwallet = get_stats()
    return render_template('index.html', block_number = block_number, melwallet = melwallet)

@app.route('/faucet')
def send_faucet():
    return render_template('faucet.html')

@app.route('/help')
def send_help():
    wmel_h_text = highlight(open("../deployer/contracts/WMEL.sol").read(), get_lexer_by_name('solidity'), HtmlFormatter(style='monokai', full=True))
    router_h_text = highlight(open("../deployer/contracts/Kwik_ERouter.sol").read(), get_lexer_by_name('solidity'), HtmlFormatter(style='monokai', full=True))
    factory_h_text = highlight(open("../deployer/contracts/Kwik_EFactory.sol").read(), get_lexer_by_name('solidity'), HtmlFormatter(style='monokai', full=True))
    return render_template('help.html', wmel_source=wmel_h_text, router_source=router_h_text, factory_source=factory_h_text)

@app.route('/visu')
def send_visu():
    block = get_visu()
    jsonformat = "// Here is the latest block :BRRRR" + str(block).replace("{", "{BRRRR").replace(",", ",BRRRR").replace("}", "}BRRRR").replace("HexBytes(", "")
    stats = json.dumps(jsonformat, sort_keys=True, indent=4)
    htmlcode = highlight(stats, JsonLexer(), HtmlFormatter(style='monokai', full=True))
    htmlcode = htmlcode.replace("BRRRR", "<br>")

    return htmlcode

@app.route('/challenge0')
def send_challenge0():
    #challenge_source = open("../deployer/contracts/challenge00.sol", 'r').read()
    # htmlcode = highlight(challenge_source, get_lexer_by_name('solidity'), HtmlFormatter(style='monokai', full=True))
    htmlcode = ""
    return render_template('challenge0.html', challenge_source=htmlcode)

@app.route('/challenge1')
def send_challenge1():
    challenge_source = open("../deployer/contracts/challenge2303.sol", 'r').read()
    htmlcode = highlight(challenge_source, get_lexer_by_name('solidity'), HtmlFormatter(style='monokai', full=True))
    return render_template('challenge1.html', challenge_source=htmlcode)

@app.route('/challenge2')
def send_challenge2():
    challenge_source = open("../deployer/contracts/challenge2302.sol", 'r').read()
    htmlcode = highlight(challenge_source, get_lexer_by_name('solidity'), HtmlFormatter(style='monokai', full=True))
    return render_template('challenge2.html', challenge_source=htmlcode)

@app.route('/challenge3')
def send_challenge3():
    challenge_source = open("../deployer/contracts/challenge2301.sol", 'r').read()
    htmlcode = highlight(challenge_source, get_lexer_by_name('solidity'), HtmlFormatter(style='monokai', full=True))
    return render_template('challenge3.html', challenge_source=htmlcode)

@app.route('/challenge4')
def send_challenge4():
    # challenge_source = open("../deployer/contracts/challenge2304.sol", 'r').read()
    # htmlcode = highlight(challenge_source, get_lexer_by_name('solidity'), HtmlFormatter(style='monokai', full=True))
    htmlcode = ""
    return render_template('challenge4.html', challenge_source=htmlcode)


##
##  On deploy
##
@socketio.on('deploy')
def challenges_deploy(message):
    print(message['data'])
    challenge = message['data']

    emit(f"{challenge}status" , {"output": "⬣ Deploying...", "state": 1, "address" : ""})

    deploy_script = ""
    if challenge == "challenge0":
        deploy_script = "deploy0"
    elif challenge == "challenge1":
        deploy_script = "deploy1"
    elif challenge == "challenge2":
        deploy_script = "deploy2"
    elif challenge ==  "challenge3":
        deploy_script = "deploy3"
    elif challenge == "challenge4":
        deploy_script = "deploy4"
    else:

        for i in range(5):
            emit(f"challenge0{i}deploystatus" , {"output": f"Not a web challenge"})
            return

    try:
        chdir(DEPLOYER_PATH)
        print(f'npx hardhat run scripts/{deploy_script}.js')
        process = run(f'npx hardhat run scripts/{deploy_script}.js --network melchain', shell=True, check=True, capture_output=True)
        address = process.stdout.decode()
        print(address)
        emit(f"{challenge}status" , {"output": f"⬣ Deployed", "state": 2, "address" : f"{address}"})

    except CalledProcessError as e:
        emit(f"{challenge}status" , {"output": "⬣ Error", "state" : 3})
        print(e)

    finally:
        chdir(WEBSITE_PATH)

##
##  On verify
##
@socketio.on('verify')
def challenges_verify(message):
    print(message['data'])
    challenge = message['data']
    address = message['address'].strip('\n')
    emit(f"{challenge}status" , {"output": "⬣ Verifying", "state" : 4})
    client = Web3(Web3.HTTPProvider(JSON_RPC_URL))
    if challenge == "challenge0":
        challenge_address = Web3.toChecksumAddress(address)
        print(challenge_address)
        client.middleware_onion.inject(geth_poa_middleware, layer=0)
        challenge_contract = client.eth.contract(address=challenge_address, abi=open('./abis/00.json').read())
        won = challenge_contract.functions.win().call()
        if not won:
            emit(f"{challenge}status" , {"output": f"⬣ Verification failed !", "state": 3})
        else:
            emit(f"{challenge}status" , {"output": "Hero{M3l_weLComes_U_B4cK!:)}", "state": 5})
    # reentrancy
    if challenge == "challenge1":
        challenge_address = Web3.toChecksumAddress(address)
        print(challenge_address)
        client.middleware_onion.inject(geth_poa_middleware, layer=0)


        chall_balance = client.eth.get_balance(challenge_address)

        print("Got chall bal :", chall_balance)
        won = False
        if not chall_balance.__mod__(Web3.toWei(1, "ether")).__eq__(Web3.toWei(0, "wei")) and not chall_balance.__eq__(Web3.toWei(0, "wei")):
            won = True


        if not won:
            emit(f"{challenge}status" , {"output": f"⬣ Verification failed !", "state": 3})
        else:
            emit(f"{challenge}status" , {"output": "Hero{S4m3_aS_USU4L_bUT_S3eN_IRL??!}", "state": 5})
    # lottery
    if challenge == "challenge2":

        addrs = [x.strip('\n') for x in address.split(' ') if "0x" in x]

        challenge_address = Web3.toChecksumAddress(addrs[0])
        wmel_address = Web3.toChecksumAddress(addrs[1])
        router_address = Web3.toChecksumAddress(addrs[2])
        factory_address = Web3.toChecksumAddress(addrs[3])

        client.middleware_onion.inject(geth_poa_middleware, layer=0)
        challenge_contract = client.eth.contract(address=challenge_address, abi=open('./abis/02.json').read())
        factory_contract = client.eth.contract(address=factory_address, abi=open('./abis/factory.json').read())
        pair_address = factory_contract.functions.getPair(wmel_address, challenge_address).call()
        pair_contract = client.eth.contract(address=pair_address, abi=open('./abis/pair.json').read())
        pair_reserves = pair_contract.functions.getReserves().call()

        won = False
        if pair_reserves[1] < 0.5 * 10 ** 18:
            won = True
        if not won:
            emit(f"{challenge}status" , {"output": f"⬣ Verification failed !", "state": 3})
        else:
            emit(f"{challenge}status" , {"output": "Hero{Th1s_1_w4s_3z_bro}", "state": 5})

    if challenge == "challenge3":
        addrs = [x.strip('\n') for x in address.split(' ') if "0x" in x]

        challenge_address = Web3.toChecksumAddress(addrs[0])
        wmel_address = Web3.toChecksumAddress(addrs[1])
        router_address = Web3.toChecksumAddress(addrs[2])
        factory_address = Web3.toChecksumAddress(addrs[3])

        client.middleware_onion.inject(geth_poa_middleware, layer=0)

        challenge_contract = client.eth.contract(address=challenge_address, abi=open('./abis/02.json').read())
        factory_contract = client.eth.contract(address=factory_address, abi=open('./abis/factory.json').read())
        pair_address = factory_contract.functions.getPair(wmel_address, challenge_address).call()
        pair_contract = client.eth.contract(address=pair_address, abi=open('./abis/pair.json').read())
        pair_reserves = pair_contract.functions.getReserves().call()

        won = False
        if pair_reserves[1] < 0.5 * 10 ** 18:
            won = True
        if not won:
            emit(f"{challenge}status" , {"output": f"⬣ Verification failed !", "state": 3})
        else:
            emit(f"{challenge}status" , {"output": "Hero{H0w_L0ng_D1d_1t_T4k3_U_?..lmao}", "state": 5})
    if challenge == "challenge4":
        addrs = [x.strip('\n') for x in address.split(' ') if "0x" in x]

        challenge_address = Web3.toChecksumAddress(addrs[0])
        wmel_address = Web3.toChecksumAddress(addrs[1])
        router_address = Web3.toChecksumAddress(addrs[2])
        factory_address = Web3.toChecksumAddress(addrs[3])

        client.middleware_onion.inject(geth_poa_middleware, layer=0)

        challenge_contract = client.eth.contract(address=challenge_address, abi=open('./abis/02.json').read())
        factory_contract = client.eth.contract(address=factory_address, abi=open('./abis/factory.json').read())
        pair_address = factory_contract.functions.getPair(wmel_address, challenge_address).call()
        pair_contract = client.eth.contract(address=pair_address, abi=open('./abis/pair.json').read())
        pair_reserves = pair_contract.functions.getReserves().call()

        won = False
        if pair_reserves[1] < 0.5 * 10 ** 18:
            won = True
        if not won:
            emit(f"{challenge}status" , {"output": f"⬣ Verification failed !", "state": 3})
        else:
            emit(f"{challenge}status" , {"output": "Hero{S0_Ur_4_r3AL_hUnT3r_WP_YMI!!!}", "state": 5})


##
##  On faucet
##
@socketio.on('get_money')
def get_money(message):
    address = message['data']
    print(address)
    if not re.match('^0x[a-fA-F0-9]{40}$', address):
        print("NO MATCHLOL")
        return
    try:
        chdir(DEPLOYER_PATH)
        print(f'npx hardhat give_money --account {address[:42]}')
        process = run(f'npx hardhat give_money --account {address[:42]} --network melchain', shell=True, check=True, capture_output=True)
        output = process.stdout.decode()
        print(output)
        if "Vous" in output:
            emit(f"faucetstatus" , {"output": f"⬣ Faucet error (too much money or is chain is down ?)", "state": 0})
            return
        emit(f"faucetstatus" , {"output": f"⬣ You're rich bro !", "state": 1})
    except CalledProcessError as e:
        print(e.output)
        print("ERROR")



##
##  Utiities
##
def get_stats():
    client = Web3(Web3.HTTPProvider(JSON_RPC_URL))
    client.middleware_onion.inject(geth_poa_middleware, layer=0)
    blocknumber = client.eth.get_block('latest').number
    melSupplies = "{:.2e}".format(client.eth.get_balance(Web3.toChecksumAddress(ACCOUNT_ADDRESS)))

    return (blocknumber, melSupplies)

def get_visu():
    client = Web3(Web3.HTTPProvider(JSON_RPC_URL))
    client.middleware_onion.inject(geth_poa_middleware, layer=0)
    curr_block = dict(client.eth.get_block('latest'))
    # Lol ?
    del curr_block["transactions"]
    return curr_block

print(f"Running server on http://{HTTP_IP}:{HTTP_PORT}")
socketio.run(app, host=HTTP_IP, port=int(HTTP_PORT))
