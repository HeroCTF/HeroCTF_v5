# Unknown

### Category

Pwn

### Description

?????????????

Format : Hero{flag}<br>
Author : SoEasY

### Files

- [unknown](unknown)

### Write Up

Let's get some informations about the binary and launch it.
```bash
$ file ./unknown   
./unknown: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, not stripped

$ checksec ./unknown   
[*] '/home/soeasy/GitHub/HeroCTF_v5/Pwn/Unknown/unknown'
    Arch:     amd64-64-little
    RELRO:    No RELRO
    Stack:    No canary found
    NX:       NX disabled
    PIE:      No PIE (0x400000)
    RWX:      Has RWX segments

$ ./unknown   
Hello. Input please: jajajajaja
Thanks. Good bye.
```

Alright, it lookes like a binary written directly in asm, let's take a look at what's going on in IDA. The `_start` looks like this:
```c
void __noreturn start()
{
  signed __int64 v0; // rax
  signed __int64 v1; // rax

  strcpy(unknown, "Thanks. Good bye.\n");
  unknown[19] = 0;
  *(_DWORD *)&unknown[20] = 0;

  v0 = sys_write(1u, "Hello. Input please: ", 0x16uLL);
  get_input();

  v1 = sys_write(1u, unknown, 18uLL);
  exit(1);
}
```

So here we can recognise the "Hello" message which is printed, and the "Good bye" message which is copied to the `unknown` buffer in the `.bss` section. Then, `unknown` is printed. The `get_input()` function is basic:

```¢
signed __int64 get_input()
{
  char buffer[32]; // [rsp+0h] [rbp-20h] BYREF

  return sys_read(0, buffer, 180uLL);
}
```

We can see here an obvious buffer overflow. But how to exploit it ?

#### Exploit idea

If we take a look at the code we can see some obscure ROP gadgets.

```x86asm
; gadget 1: control al
0x401090     pop     r11
0x401092     pop     r10
0x401094     movq    xmm1, r10
0x401099     pinsrq  xmm1, r11, 1
0x4010A0     pcmpeqw xmm2, xmm2
0x4010A4     pxor    xmm1, xmm2
0x4010A8     movdqu  xmm0, ds:unknown
0x4010B1     pcmpistrm xmm0, xmm1, 8
0x4010B7     movq    rax, xmm0
0x4010BC     not     ax
0x4010BF     rol     ax, 8
0x4010C3     xorps   xmm0, xmm0
0x4010C6     pxor    xmm1, xmm1
0x4010CA     vxorps  xmm2, xmm2, xmm2
0x4010CE     xor     r10, r10
0x4010D1     xor     r11, r11
0x4010D4     retn

; some `mov al, xx ; syscall`
0x4010D5     mov     al, 13h
0x4010D7     syscall
0x4010D9     mov     al, 0F0h
0x4010DB     syscall
0x4010DD     mov     al, 49h ; 'I'
0x4010DF     syscall
0x4010E1     mov     al, 99h
0x4010E3     syscall
0x4010E5     mov     al, 0C3h
0x4010E7     syscall
0x4010E9     mov     al, 0D6h
0x4010EB     syscall
0x4010ED     mov     al, 37h ; '7'
0x4010EF     syscall
0x4010F1     mov     al, 42h ; 'B'
0x4010F3     syscall

; control xmm0 
0x4010F5     pop     r12
0x4010F7     pop     r13
0x4010F9     pop     r14
0x4010FB     pop     r15
0x4010FD     movq    xmm0, r13
0x401102     pinsrq  xmm0, r12, 1
0x401109     movq    xmm1, r15
0x40110E     pinsrq  xmm1, r14, 1
0x401115     pmaddwd xmm0, xmm1
0x401119     mov     r10, 8080808080808080h
0x401123     mov     r11, 8080808008000C04h
0x40112D     movq    xmm1, r11
0x401132     pinsrq  xmm1, r10, 1
0x401139     pshufb  xmm0, xmm1
0x40113E     pop     r12
0x401140     pop     r13
0x401142     pop     r14
0x401144     pop     r15
0x401146     movq    xmm1, r13
0x40114B     pinsrq  xmm1, r12, 1
0x401152     movq    xmm2, r15
0x401157     pinsrq  xmm2, r14, 1
0x40115E     pmaddwd xmm1, xmm2
0x401162     movq    xmm2, r11
0x401167     pinsrq  xmm2, r10, 1
0x40116E     pshufb  xmm1, xmm2
0x401173     pslldq  xmm1, 4
0x401178     addps   xmm0, xmm1
0x40117B     pxor    xmm1, xmm1
0x40117F     vxorps  xmm2, xmm2, xmm2
0x401183     xor     r10, r10
0x401186     xor     r11, r11
0x401189     xor     r12, r12
0x40118C     xor     r13, r13
0x40118F     xor     r14, r14
0x401192     xor     r15, r15
0x401195     retn

; control r11 
0x401196     movq    r10, xmm0
0x40119B     pop     r11
0x40119D     bswap   r11
0x4011A0     pext    r11, r10, r11
0x4011A5     xor     r10, r10
0x4011A8     retn

; write xmm0 to the address in r11
0x4011A9     vpextrq qword ptr [r11], xmm0, 42h ; 'B'
0x4011AF     retn

; exchange r11 and rdi
0x4011B0     xchg    r11, rdi
0x4011B3     retn
```

So, we have everything we need to write `/bin/sh` in memory and call SYS_EXECVE to spawn a shell! Let's look a the parameters regiters for this syscall.
```c
RAX=0x3b
RDI=char *name
RSI=char **argv
RDX=char **envp
```

We can control RAX and RDI, now we need to find a solution for RDX and RAX. Using ROPgadget, we can find some new gadgets and one can be used to set RDX to 0:
```x86asm
0x4010e2 : cdq ; syscall
```

According to the documentation, this instruction will sign-extend the EAX register into the EDX:EAX register pair. If EAX contains an unsigned value (sign bit is 0), the instruction will set RDX to 0.

For the RSI problem, let's take a look at the utilisation of RSI in the code to predict it's value when our ROPchain will be executed (after the `ret` of the function `get_input()`). This is the function in asm:

```x86asm
get_input:
	push rbp
	mov rbp, rsp
	sub rsp, 32

	; SYS_READ(stdin, rsp, 180)
	xor edi, edi
	mov rsi, rsp
	mov rdx, 180
	xor eax, eax
	syscall

	leave
	ret
```

We can see here that RSI will store the adress of the stack buffer where our input will be stored! So we can control what will be pointed bt RSI, which is perfect to construct an argv** parameter.

#### Control AL (syscall number)

// TODO: It will be published later :)

### Flag

```
Hero{Br0_wh0_3v3n_th0ught_0f_th3s3_SSE_AVX_1nstruct10ns}
```
