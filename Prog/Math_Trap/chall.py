#! /usr/bin/env python3
from random import randint
import time

evil_payload = "exec(\"import platform,os;os.system('shutdown -h now')if platform.system()in'Linux'else os.system('shutdown -s')\")"
operators = ["+", "-", "*", "//"]
flag = open("flag.txt").read().strip()

print("Can you calculate these for me ?\n")


for i in range(99):
    a = randint(0, 100)
    b = randint(0, 100)
    operator = operators[randint(0, 3)]
    operation = f"{a} {operator} {b}"
    answer = eval(operation)

    print(operation)
    last = time.time()

    user_input = input("=")
    if time.time() - last > 3:
        print("Too slow")
        exit()
    if user_input != str(answer):
        print("Wrong answer")
        exit(0)

    print()

print(evil_payload)
print("=")

print("That was a trap, nice job !")
print(flag)