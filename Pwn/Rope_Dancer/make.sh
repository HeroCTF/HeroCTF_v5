#!/bin/bash

nasm -f ELF64 -o ropedancer.o ropedancer.asm
ld -o ropedancer ropedancer.o
rm ropedancer.o
