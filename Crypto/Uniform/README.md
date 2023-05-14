# Uniform

### category

Crypto

### Description

A Mersenne Twister with a twist
Format : **Hero{flag}**<br>
Author : **yarienkiva**

### Files

- [chall.zip](chall.zip)

### Write up

TL;DR:
- `uniform(0, 2**32 - 1)` calls `0 + (2**32 - 1 - 0) * random.random()` -> recover `random.random()` by multiplying the result with `2**32 - 1`
- from `random.random()` recover `a>>5` and `b>>6` by multiplying by `2**53` and taking quotient and remainder from result divided by `2**26`
- submit both `a>>5` and `b>>6` to symbolic mersenne untwister
- recover the internal state, send the next value and get the flag

//TODO(alol): étoffer le WU

```py
from pwn import *
from z3 import *
from tqdm import tqdm
from random import Random
from itertools import count

SYMBOLIC_COUNTER = count()

class Untwister:
    def __init__(self):
        name = next(SYMBOLIC_COUNTER)
        self.MT = [BitVec(f'MT_{i}_{name}', 32) for i in range(624)]
        self.index = 0
        self.solver = Solver()

    #This particular method was adapted from https://www.schutzwerk.com/en/43/posts/attacking_a_random_number_generator/
    def symbolic_untamper(self, solver, y):
        name = next(SYMBOLIC_COUNTER)

        y1 = BitVec(f'y1_{name}', 32)
        y2 = BitVec(f'y2_{name}' , 32)
        y3 = BitVec(f'y3_{name}', 32)
        y4 = BitVec(f'y4_{name}', 32)

        equations = [
            y2 == y1 ^ (LShR(y1, 11)),
            y3 == y2 ^ ((y2 << 7)  & 0x9D2C5680),
            y4 == y3 ^ ((y3 << 15) & 0xEFC60000),
            y  == y4 ^ (LShR(y4, 18))
        ]

        solver.add(equations)
        return y1

    def symbolic_twist(self, MT, n=624, upper_mask=0x80000000, lower_mask=0x7FFFFFFF, a=0x9908B0DF, m=397):
        '''
            This method models MT19937 function as a Z3 program
        '''
        MT = [i for i in MT] #Just a shallow copy of the state

        for i in range(n):
            x = (MT[i] & upper_mask) + (MT[(i+1) % n] & lower_mask)
            xA = LShR(x, 1)
            xB = If(x & 1 == 0, xA, xA ^ a) #Possible Z3 optimization here by declaring auxiliary symbolic variables
            MT[i] = MT[(i + m) % n] ^ xB

        return MT

    def get_symbolic(self, guess):
        name = next(SYMBOLIC_COUNTER)
        ERROR = 'Must pass a string like "?1100???1001000??0?100?10??10010" where ? represents an unknown bit'

        assert type(guess) == str, ERROR
        assert all(map(lambda x: x in '01?', guess)), ERROR
        assert len(guess) <= 32, "One 32-bit number at a time please"
        guess = guess.zfill(32)

        self.symbolic_guess = BitVec(f'symbolic_guess_{name}', 32)
        guess = guess[::-1]

        for i, bit in enumerate(guess):
            if bit != '?':
                self.solver.add(Extract(i, i, self.symbolic_guess) == bit)

        return self.symbolic_guess


    def submit(self, guess):
        '''
            You need 624 numbers to completely clone the state.
                You can input less than that though and this will give you the best guess for the state
        '''
        if self.index >= 624:
            name = next(SYMBOLIC_COUNTER)
            next_mt = self.symbolic_twist(self.MT)
            self.MT = [BitVec(f'MT_{i}_{name}', 32) for i in range(624)]
            for i in range(624):
                self.solver.add(self.MT[i] == next_mt[i])
            self.index = 0

        symbolic_guess = self.get_symbolic(guess)
        symbolic_guess = self.symbolic_untamper(self.solver, symbolic_guess)
        self.solver.add(self.MT[self.index] == symbolic_guess)
        self.index += 1

    def get_random(self):
        '''
            This will give you a random.Random() instance with the cloned state.
        '''
        print('Solving...')
        self.solver.check()
        model = self.solver.model()
        print(f'Solved!')

        #Compute best guess for state
        state = list(map(lambda x: model[x].as_long(), self.MT))
        result_state = (3, tuple(state+[self.index]), None)
        r = Random()
        r.setstate(result_state)
        return r

r = process(['python3', 'main.py'])

ut = Untwister()

for l in tqdm(range(624)):
    guess = float(r.recvline())
    guess = guess / (2**32 - 1)
    guess = guess * 9007199254740992 # 2**53
    assert guess.is_integer(), f"Failed for guess ({guess})"

    a, b  = divmod(guess, 67108864)  # 2**26
    assert a.is_integer(), f"Failed for a ({a})"
    assert b.is_integer(), f"Failed for b ({b})"

    a, b = int(a), int(b)

    ut.submit((format(a, 'b') + '?' * 5).zfill(32))
    ut.submit((format(b, 'b') + '?' * 6).zfill(32))

rand  = ut.get_random()
guess = rand.uniform(0, 2**32 - 1)
r.sendline(str(guess).encode())
print(r.recvlineS())
```

### Flag

```Hero{R4nd0m_gu3ssing_is_h4rd_or_is_it_h4rdly_r4nd0m_?}```
