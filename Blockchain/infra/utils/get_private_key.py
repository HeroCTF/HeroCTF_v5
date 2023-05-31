#!/usr/bin/python

import web3, sys, binascii

with open(sys.argv[1]) as keyfile:
    with open('./node1/password') as passwd:
        encrypted_key = keyfile.read()
        private_key = web3.Account.decrypt(encrypted_key, passwd.read().rstrip('\n'))

print(binascii.b2a_hex(private_key).decode())
