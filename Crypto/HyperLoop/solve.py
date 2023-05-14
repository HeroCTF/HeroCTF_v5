#!/usr/bin/env python3

flag = bytearray(b"Hero{????????????}")
output = bytearray(b'\x05p\x07MS\xfd4eFPw\xf9}%\x05\x03\x19\xe8')


flag[5] = output[5] ^ flag[17] ^ output[17]

for i in range(6):
	flag[6 + i] = output[6 + i] ^ flag[i] ^ output[i]

for i in range(5):
	flag[12 + i] = output[12 + i] ^ flag[i] ^ output[i]

print(flag)

