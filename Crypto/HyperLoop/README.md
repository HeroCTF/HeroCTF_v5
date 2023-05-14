# Hyper Loop 

### Category

Crypto

### Description

The author is aware that XOR alone is not sufficiently secure, but they have implemented a solution to address this issue. Use the provided Python script to recover the original flag.

Format : Hero{flag}<br>
Author : xanhacks

### Files

- [hyper\_loop.py](hyper_loop.py)

### Write Up (Xanhacks)

The key is a random value repeated three times, example:

```python
>> from os import urandom
>>> urandom(6) * 3
b'\xec\xab\xf6\x02s\x87\xec\xab\xf6\x02s\x87\xec\xab\xf6\x02s\x87'
# b'\xec\xab\xf6\x02s\x87  \xec\xab\xf6\x02s\x87  \xec\xab\xf6\x02s\x87'
>>> urandom(6) * 3
b'cW\xc4\xbe\x13\xf5cW\xc4\xbe\x13\xf5cW\xc4\xbe\x13\xf5'
# b'cW\xc4\xbe\x13\xf5  cW\xc4\xbe\x13\xf5  cW\xc4\xbe\x13\xf5'
```

The flag is XORed 32 times:

```
output[0] = flag[0] ^ key[0] ^ key[1] ^ ... ^ key[31]
output[1] = flag[1] ^ key[0] ^ key[1] ^ ... ^ key[31]
...
output[17] = flag[17] ^ key[0] ^ key[1] ^ ... ^ key[31]
```

However, its like the flag has been XORed only one time:

```
output[0] = flag[0] ^ X
with X = key[0] ^ key[1] ^ ... ^ key[31] 
output[1] = flag[1] ^ Y
with Y = key[0] ^ key[1] ^ ... ^ key[31] 
```

You can find the 5 first chars of the key using `Hero{` and the last char using the last char of the flag `}`.

```python
#!/usr/bin/env python3

flag = bytearray(b"Hero{????????????}")
output = bytearray(b'\x05p\x07MS\xfd4eFPw\xf9}%\x05\x03\x19\xe8')


flag[5] = output[5] ^ flag[17] ^ output[17]

for i in range(6):
	flag[6 + i] = output[6 + i] ^ flag[i] ^ output[i]

for i in range(5):
	flag[12 + i] = output[12 + i] ^ flag[i] ^ output[i]

print(flag)
```

Execution:

```bash
$ python3 solve.py     
bytearray(b'Hero{hyp3r_l00p!1}')
```

### Write Up (Alol)

This challenge is a classical flag XOR key challenge with a little twist.

The flag is xored with not 1 but 32 keys. The keys are composed of 6 random bytes repeated 3 times. Thus we have something that looks like this, where we know `enc` and `flag` but not the values of `k` :

```math
\begin{align*} 
  enc_0 &= flag_0 \oplus k_{0,0} \oplus k_{0,1} \oplus ... \oplus k_{0,32} \\
  enc_1 &= flag_1 \oplus k_{1,0} \oplus k_{1,1} \oplus ... \oplus k_{1,32} \\
... \\
   enc_{17} &= flag_{17} \oplus k_{17,0} \oplus k_{17,1} \oplus ... \oplus k_{17,32} \\
\end{align*}
```

Notice that we can simplify the equations as :

```math
\begin{align*} 
  enc_0 &= flag_0 \oplus K_{0} \\
  enc_1 &= flag_1 \oplus K_{1} \\
... \\
   enc_{17} &= flag_{17} \oplus K_{17} \\
\end{align*}
```
Where :
```math
K_{i} = k_{i,0} \oplus k_{i,1} \oplus ... \oplus k_{i,32}
```

We don't need to know the values of all the keys, we only need to find the values of K_i. Since we know 6 bytes of plaintext (`Hero{` and `}`) we can find K and decrypt the flag.

```py
xor = lambda a,b: bytes(x^y for x,y in zip(a,b))
enc = b'\x05p\x07MS\xfd4eFPw\xf9}%\x05\x03\x19\xe8'
K   = xor(b'Hero{', enc) + xor(b'}', enc[-1::])
print(xor(enc, K*3))
```

### Flag

**Hero{hyp3r_l00p!1}**
