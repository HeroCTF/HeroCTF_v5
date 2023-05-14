#!/usr/bin/env python
import random
import os

# TODO: xanhacks told me that this was "too unoriginal" and
#       that I should change it, lets see how he likes this...

# guess = lambda: random.getrandbits(32)
guess = lambda: random.uniform(0, 2**32-1)

for _ in range(624):
    print(guess())

secret = str(guess())

if input('> ').strip() == secret:
    with open('flag.txt', 'rb') as f:
        print(f.read().strip())
else:
    print('Nope! It was:', secret)
