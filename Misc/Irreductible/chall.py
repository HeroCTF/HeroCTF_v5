#!/usr/bin/env python3
import pickle
import pickletools

# Due to the REDUCE's dangerous nature using it isn't permitted
def hacking_attempt(m):
    for opcode, arg, pos in pickletools.genops(m):
        if opcode.code == pickle.REDUCE.decode():
            return True
    return False

m = bytes.fromhex(input('🥒 : '))

if not hacking_attempt(m):
    pickle.loads(m)