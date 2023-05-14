# Math Trap

### Category

Prog

### Description

In this challenge, you have to make a few simple calculations for me, but pretty quickely. Maybe the pwntools python library will help you ?

PS: control your inputs.

**Host** : static-01.heroctf.fr 8000<br>
**Port** : 8000

Format : **Hero{flag}**<br>
Author : **Log_s**

### Write up

It's a basic challenge, were you have to loop and send back the result of the calculation.

But there is a catch. The easisest way to do it is to use the `eval()` function, wich is fine in this context. But there is a trap: the last "calculation" is not a calculation, but a code snippet that shuts down you computer. This happens sometimes in CTFs, so my recommendation would be to cut the input your evaluating to reduce it to a certain amount of characters that you know is safe.

```python
from pwn import *

p = process("./chall.py")

p.recvuntil(b"?\n")

while True:
    op = p.recvuntil(b"=").decode().replace("=", "").strip()[:15] # Here we cut out everything after the 15th character
    # Add a try/execpt block to catch any errors (in case a calculation is not one)
    try:
        solution = eval(op)
        p.sendline(str(solution).encode())
    except:
        print(p.recvall().decode().strip().split("\n")[-1]) # Only keep the line with flag
        break
```

### Flag

```Hero{E4sy_ch4ll3ng3_bu7_tr4pp3d}```