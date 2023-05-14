from pwn import *

r = process("./optimus_prime")

solution = [
    0b01100110, 0b01001011,
    0b10011011, 0b01001001,
    0b11010100, 0b10110100,
    0b00100110, 0b11001011,
    0b11011001, 0b01001001,
    0b11011001, 0b00110100,
    0b00100110, 0b10110110,
    0b10010011, 0b01001011,
    0b11001001, 0b10011001,
    0b01100100, 0b10110110,
    0b00110110, 0b01101010,
    0b10011001, 0b10010101,
    0b01101010, 0b01100110,
    0b10010100, 0b10011011,
    0b00101101, 0b10110100,
    0b01101011, 0b01100100
]

solution_string = b''

for byte in solution:
    solution_string += byte.to_bytes(1, 'big')

log.warn(f"Testing solution: {solution_string}")

r.sendline(solution_string)
print(r.recvall().decode(), end="")