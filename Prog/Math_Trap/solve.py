from pwn import *

#p = process("./chall.py")
p = remote("localhost", 7070)

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