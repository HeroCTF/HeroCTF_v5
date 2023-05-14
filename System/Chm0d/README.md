# Chm0d

### Category

System

### Description

Catch-22: a problematic situation for which the only solution is denied by a circumstance inherent in the problem.

Credentials: `user:password123`

Format : **Hero{flag}**<br>
Author : **Alol**

### Write up

This situation looks like it should be impossible to resolve, thankfully it isn't. We can't change the file permissions on `/bin/chmod` because it's owned by `root` so we'll have to change them on `/flag.txt`.

```bash
user@88265204b262:~$ ls -l /flag.txt /bin/chmod
---------- 1 root root 64448 Sep 24  2020 /bin/chmod
---------- 1 user user    40 May 10 19:36 /flag.txt
```

**The easy way:**

```bash
perl -e "chmod 0755,'/flag.txt'"
```

**Another way:**

```bash
# get a copy of the "chmod" binary from a debian:11 docker image
# (version info found in /etc/os-release)
docker run --rm -it -v $PWD:/app debian:11 cp /bin/chmod /app

# upload it to the server and use it to change the perms
scp -P XXXX chmod user@AAA.BBB.CCC.DDD:
```

**The harder way:**

```c
// you can't execute /bin/chmod but you can still call the `chmod` function
// gcc chm0d.c
#include <sys/stat.h>

void main(int argc, char* argv) {
	chmod("/flag.txt", 777);
}
```

**The "why" way:**

```assembly
; same goes for the chmod syscall
; nasm -felf64 chm0d.asm && ld chm0d.o
    global _start
    section .text
_start:
    push 0x74
    mov rax, 0x78742e67616c662f
    push rax
    mov rdi, rsp
    xor esi, esi
    mov si, 0x1ff
    push 0x5a
    pop rax
    syscall
    mov rax, 60
    xor rdi, rdi
    syscall
```

### Flag

```plain
Hero{chmod_1337_would_have_been_easier}
```
