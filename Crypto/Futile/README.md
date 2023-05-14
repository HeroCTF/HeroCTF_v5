# Futile

### category

Crypto

### Description

Linear Futile Shift Register
Format : **Hero{flag}**<br>
Author : **yarienkiva**

### Files

- [chall.zip](chall.zip)

### Write up

The LFSR has a degree of 8 and is used to generate 8bit integers. Since the internal state of an LFSR can't be all 0s (otherwhise it would only generate 0s)
we know that the only integers that can be generated are in the range \[0b00000001, 0b11111111\] (\[1, 255]).
Thus the xored values for each character c of the flag are in [c ^ 1, c ^ 255], and c ^ 0 is never generated.
We can then, for each index, create a list of all possible characters and discard from it all characters received until there's only one possibility left.

```py
from pwn import *
import string
import sys

CHARSET = string.printable

r = process(['python3', 'chall.py'])

def get_flag():
    l = r.recvlineS()
    r.sendline()
    return l.strip()

def print_flag(*a, **k):
    print('Hero{' + ''.join('_' if len(c)>1 else chr(c[0]) for c in flag) + '}', sum(map(len, flag)), *a, **k)

flag_len = (len(get_flag()) - len('Hero{}')) // 2
flag = [[*map(ord, CHARSET)] for _ in range(flag_len)]

while any(len(c)>1 for c in flag):

    dat = bytes.fromhex(get_flag()[5:-1])

    for i in range(len(flag)):
        if dat[i] in flag[i]:
            flag[i].remove(dat[i])

    print_flag(end="\n\033[F")
print_flag()
```

### Flag

```Hero{Int3rn4l_st4t3s_c4nt_b3_nu77}```
