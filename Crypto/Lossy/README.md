# Lossy

### category

Crypto

### Description

There are two types of people in the world :
1) Those who can cope with missing data
Format : **Hero{flag}**<br>
Author : **yarienkiva**"

### Files

- [chall.py](chall.py)

### Write up

As the comment hinted at, `to_hex` was, in fact, not equivalent to `.tohex`.
The bug stems from the fact that `hex(n)` doesn't pad the hex byte with an additional 0 if its value is between 0x0 and 0xF, thus `len(hex(0x10 to 0xFF)) = 4` but `len(hex(0x00 to 0x0F)) == 3`.
Because we know the size of the inputs we can know how many 0s are missing but we can't know where.
The following code can be used to recover the flag, it tests all possible combinations of indexes until the decrypted message contains a crib.

```
from cryptography.hazmat.primitives.ciphers.algorithms import AES
from cryptography.hazmat.primitives.ciphers import Cipher, modes
from itertools import combinations
from tqdm import tqdm

def decrypt(ct, key):
        aes = Cipher(AES(key), modes.ECB())
        dec = aes.decryptor()
        pt  = dec.update(ct)
        pt += dec.finalize()
        return pt

def add_zeros(ct, p):
	test_ct = list(ct)
	for i in p:
		test_ct.insert(i, '0')
	return ''.join(test_ct)

ct  = '17c69a812e76d90e455a346c49e22fb6487d9245b3a90af42e67c7b7c3f2823'
key = 'b5295cd71d2f7cedb377c2ab6cb93'

missing_ct  = -len(ct)  % 32 
missing_key = -len(key) % 16

for mc in tqdm([*combinations(range(len(ct)), missing_ct)]):
	for mk in combinations(range(len(key)), missing_key):
		
		test_ct  = bytes.fromhex(add_zeros(ct,  mc))
		test_key = bytes.fromhex(add_zeros(key, mk))

		flag = decrypt(test_ct, test_key)

		if flag.startswith(b'Hero{'):
			print('Found!', flag)
```

### Flag

```
Hero{R41ders_0f_th3_l0st_byt3s!}
```
