from hashlib import sha512
from Crypto.Cipher import AES
from time import time

FILENAME = "flag.txt"

# Read the encrypted file
encrytped = open(FILENAME, "rb").read()

# Get the hash of the filename that is used as seed
filehash = sha512(FILENAME.encode())
print(f"[*] filehash: {filehash.hexdigest()}")
seed = filehash.digest()

# Compute the iv
iv = b""
for i in range(16):
    iv += bytes([seed[i+32] ^ seed[i+48]])

print(f"[*] Brute forceing the key...")

# From malware compilation time to CTF start time
for t in range(1683486104, 1683918000):
    # Compute possible key
    key = b""
    for i in range(32):
        bt = t >> (i % 4 * 8) & 0xff
        key += bytes([seed[i] ^ bt])

    # Decrypt with AES-CBC
    decrypted = AES.new(key, AES.MODE_CBC, iv).decrypt(encrytped)

    # Try to decode the flag
    try:
        flag = decrypted.decode()
        if "Hero" in flag:
            print(f"[*] iv: {iv.hex()}")
            print(f"[*] key: {key.hex()}")
            print(f"[+] flag: {decrypted.decode().strip()}")
            break
    except:
        pass
