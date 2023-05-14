#!/bin/bash

nasm -f ELF64 -o unknown.o unknown.asm
ld -o unknown unknown.o
rm unknown.o