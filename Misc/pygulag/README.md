# PyGulag

### Category

Misc

### Description

You've escaped from jail. But you're not the smartest guy out there, and got caught again. This time, you were sent to the gulag. Good luck escaping that one...

If you're stuck, look in the past, it might hold some ideas.

NB: The pyjail is running on python3

> Deploy on [deploy.heroctf.fr](https://deploy.heroctf.fr/)

Format : **Hero{flag}**<br>
Author : **Log_s**

### Write up

#### **Table of contents**

1. [Introduction](#introduction)
2. [Finding the flag function](#finding-the-flag-function)
3. [Decompiler](#decompiler)
4. Flag
    1. [Part1](#part-1)
    2. [Part2](#part-2)
    3. [Part3](#part-3)
    4. [Part4](#part-4)


#### **Introduction**

This challenge is the second part of last year's pyjail: https://github.com/HeroCTF/HeroCTF_v4/tree/main/Misc/pyjAil_iS_Mad

The idea is to use lower level data embedded in a python function object. The `__code__` attribute of a function contains everything that one needs to reverse a python function, without the original code.

The attributes as a few properties, here is a quick description of the usefull ones:
- `co_code`: the bytecode of the function
- `co_consts`: the constants used in the function
- `co_names`: the names used in the function
- `co_varnames`: the variables used in the function

I won't dive to much into how this works. I'll only cover the basics to solve this challenge. A good article I could recommend is this one : https://www.bravegnu.org/blog/python-byte-code-hacks.html. It intruduces the subject with python2, but the differences with python3 are minimal.

Also, we will be using the `dis` module to disassemble the bytecode. The documentation of the module holds the description of each opcodes: https://docs.python.org/3/library/dis.html.

Another good ressource, that has example is: https://unpyc.sourceforge.net/Opcodes.html.

#### **Finding the flag function**

After some experimentations, we determine that we can use print, and that's about it. There is no indications on how the jail is structured. A fairly solid guess is that there is a main function.

```python
>> print(main.__code__)
<code object main at 0x7f1f97e917c0, file "/jail/pyjail.py", line 36>
```

This didn't trigger any error. Let's now see what this function calls upon.

```python
>> print(main.__code__.co_names)
('jail', 'KeyboardInterrupt', 'print')
```

`KeyboardInterrupt` and `print` are classic python functions. `jail` however, is not. Let's repeat this step to see what it calls upon.

```python
>> print(jail.__code__.co_names)
('input', 'print', 'ord', 'exec', 'ImTheFlagFunction9876543210', 'main', 'jail')
```

Once more, pretty standard functions, except for the one called `ImTheFlagFunction9876543210`. If we repeat the process one last time, we'll notice that there is no call on any fancy function. We found the flag function, that we have to reverse more in depth.

```python
>> print(ImTheFlagFunction9876543210.__code__.co_names)
('chr', 'ord')
```

Let's dump every import piece of data I enumerated earlier.

```python
>> print(ImTheFlagFunction9876543210.__code__.co_code)
b'd\x01}\x01d\x02d\x00d\x00d\x03\x85\x03\x19\x00}\x02d\x04}\x03d\x05}\x04d\x06D\x00]\x0e}\x05|\x03t\x00|\x05|\x04A\x00\x83\x017\x00}\x03|\x04d\x077\x00}\x04q\x0f|\x00d\x07\x19\x00}\x00t\x00t\x01|\x00\x83\x01t\x01|\x00\x83\x01\x1a\x00d\x08\x14\x00\x83\x01}\x06d\t}\x07|\x01|\x02\x17\x00|\x03\x17\x00|\x06\x17\x00|\x07\x17\x00}\x08d\nS\x00'
>>
>> print(ImTheFlagFunction9876543210.__code__.co_consts)
(None, 'Hero{4', '33e8e40da5bec09', -1, '', 12, b'?;9ms!w$ -.. ++', 1, 48, '}', 'Hero{F4ke_Fl4g}')
>>
>> print(ImTheFlagFunction9876543210.__code__.co_varnames)
('key', 'p1', 'p2', 'p3', 'x', 'c', 'p4', 'p5', 'flag')
>>
>> print(ImTheFlagFunction9876543210.__code__.co_names)
('chr', 'ord')
```

It's now time to write a dissector for this bytecode. It's here that the main difference between python2 and python3 occurs. Some opcodes come alone (ex: `0x19 BINARY_SUBSCR`), while others have parameters (ex: `0x64 LOAD_CONST`). In python2, if an opcode comes with parameters, it's always a 3 byte sequence. The first is the function opcode, and the two others are parameters, with the 3rd byte being 0x00 (in each case I encountered). In python3, the parameter is only one byte. When non parameter is required, a null byte is present, to keep everything aligned.

#### **Decompiler**

After some tests and by reading some documentation, you can build a basic decompiler. Here is one example.
```python
import dis


code = b'd\x01}\x01d\x02d\x00d\x00d\x03\x85\x03\x19\x00}\x02d\x04}\x03d\x05}\x04d\x06D\x00]\x0e}\x05|\x03t\x00|\x05|\x04A\x00\x83\x017\x00}\x03|\x04d\x077\x00}\x04q\x0f|\x00d\x07\x19\x00}\x00t\x00t\x01|\x00\x83\x01t\x01|\x00\x83\x01\x1a\x00d\x08\x14\x00\x83\x01}\x06d\t}\x07|\x01|\x02\x17\x00|\x03\x17\x00|\x06\x17\x00|\x07\x17\x00}\x08d\nS\x00'
consts = [None, 'Hero{4', '33e8e40da5bec09', -1, '', 12, b'?;9ms!w$ -.. ++', 1, 48, '}', 'Hero{F4ke_Fl4g}']
varnames = ['key', 'p1', 'p2', 'p3', 'x', 'c', 'p4', 'p5', 'flag']
names = ['chr', 'ord']


def dissect(code, consts, varnames, names):

    state = "opcode"
    
    for index, op in enumerate(code):
        op = op

        if state == "opcode":
            print()
            end = "\n"
            if op > dis.HAVE_ARGUMENT:
                state = "arg1"
                end = "\n\t "
            print(f"{index}.\t[{hex(op)}]{dis.opname[op]}", end=end)

        elif state == "arg1":
            arg = None
            
            if last.startswith("STORE"):
                if last.endswith("FAST"):
                    arg = "Saving in "+varnames[op]

            elif last.startswith("LOAD"):
                if last.endswith("FAST"):
                    arg = "Loading from "+varnames[op]
                elif last.endswith("CONST"):
                    arg = consts[op]
                elif last.endswith("METHOD") or last.endswith("GLOBAL"):
                    arg = names[op]
            print(f"[{hex(op)}]{arg}")
            state = "opcode"

        last = dis.opname[op]


dissect(code, consts, varnames, names)
```

I'm going to go over each part to reconstruct the function from scratch, but here is the complete output : [assembly.txt](assembly.txt)

#### **Part 1**

Let's start with the end. The last instructions are these ones:

```plain
96.	[0x7c]LOAD_FAST
	 [0x1]Loading from p1

98.	[0x7c]LOAD_FAST
	 [0x2]Loading from p2

100.	[0x17]BINARY_ADD

101.	[0x0]<0>

102.	[0x7c]LOAD_FAST
		 [0x3]Loading from p3

104.	[0x17]BINARY_ADD

105.	[0x0]<0>

106.	[0x7c]LOAD_FAST
		 [0x6]Loading from p4

108.	[0x17]BINARY_ADD

109.	[0x0]<0>

110.	[0x7c]LOAD_FAST
		 [0x7]Loading from p5

112.	[0x17]BINARY_ADD

113.	[0x0]<0>

114.	[0x7d]STORE_FAST
		 [0x8]Saving in flag
```

The function is loading five variables, p1 to p5, adding them together, and storing the result in the flag variable. So we can deduce that each px variable is one part.

```plain
0.		[0x64]LOAD_CONST
		 [0x1]Hero{4

2.		[0x7d]STORE_FAST
		 [0x1]Saving in p1
```

Here, we are simply loading the constant "Hero{4", and storing it in p1.

#### **Part 2**

```plain
4.		[0x64]LOAD_CONST
		 [0x2]33e8e40da5bec09

6.		[0x64]LOAD_CONST
		 [0x0]None

8.		[0x64]LOAD_CONST
		 [0x0]None

10.		[0x64]LOAD_CONST
		 [0x3]-1

12.		[0x85]BUILD_SLICE
		 [0x3]None

14.		[0x19]BINARY_SUBSCR

15.		[0x0]<0>

16.		[0x7d]STORE_FAST
		 [0x2]Saving in p2
```

To understand this part better, I'm going to model what the stack looks like after instruction 10.

```plain
0x3 <var>	-1
0x2 <var>	None
0x1 <var>	None
0x0	<var>	33e8e40da5bec09
```

The documentation tells us the following about the BUILD_SLICE instruction:

```plain
BUILD_SLICE(argc)
	Pushes a slice object on the stack. argc must be 2 or 3. If it is 2, slice(TOS1, TOS) is pushed; if it is 3, slice(TOS2, TOS1, TOS) is pushed. See the slice() built-in function for more information.
```

Note that `TOS` means `Top Of Stack`.

So after instruction 12, the stack looks like this.

```plain
0x1 <slice>	[None, None, -1]
0x0 <var>	33e8e40da5bec09
```

Finally, BINARY_SUBSCR implements `TOS = TOS1[TOS]`. The python line probably looked like this:

```python
p2 = "33e8e40da5bec09"[::-1] # [::-1] is the same as [None:None:-1]
```

#### **Part 3**

```plain
18.		[0x64]LOAD_CONST
	 	 [0x4]

20.		[0x7d]STORE_FAST
	 	 [0x3]Saving in p3

22.		[0x64]LOAD_CONST
		 [0x5]12

24.		[0x7d]STORE_FAST
	 	 [0x4]Saving in x

26.		[0x64]LOAD_CONST
	 	 [0x6]b'?;9ms!w$ -.. ++'

28.		[0x44]GET_ITER

29.		[0x0]<0>

30.		[0x5d]FOR_ITER
		 [0xe]None

32.		[0x7d]STORE_FAST
		 [0x5]Saving in c

34.		[0x7c]LOAD_FAST
		 [0x3]Loading from p3

36.		[0x74]LOAD_GLOBAL
	 	 [0x0]chr

38.		[0x7c]LOAD_FAST
	 	 [0x5]Loading from c

40.		[0x7c]LOAD_FAST
	 	 [0x4]Loading from x

42.		[0x41]BINARY_XOR

43.		[0x0]<0>

44.		[0x83]CALL_FUNCTION
	 	 [0x1]None

46.		[0x37]INPLACE_ADD

47.		[0x0]<0>

48.		[0x7d]STORE_FAST
	 	 [0x3]Saving in p3

50.		[0x7c]LOAD_FAST
	 	 [0x4]Loading from x

52.		[0x64]LOAD_CONST
	 	 [0x7]1

54.		[0x37]INPLACE_ADD

55.		[0x0]<0>

56.		[0x7d]STORE_FAST
	 	 [0x4]Saving in x

58.		[0x71]JUMP_ABSOLUTE
	 	 [0xf]None
```

This part is quite long, so I won't go over each instruction individually. Instead, I'll explain the main logic. Part 4 of the flag will be explained in more depth, and will help you understand this part yourself if you need to.

Instructions 18 to 24 setup the variables.
```python
p3 = ""
x = 12
```

Instructions 26 to 32 setup the iterator.
```python
for c in b'?;9ms!w$ -.. ++':
	...
```

Instructions 34 to 48 are doing the main logic (inside the loop setup earlier).
```python
p3 += chr(c ^ x)
```

Finally, instructions 50 to 56 are incrementing x.
```
x += 1
```

All put together:
```python
p3 = ""
x = 12
for c in b'?;9ms!w$ -.. ++':
	p3 += chr(c ^ x)
	x += 1
```

#### **Part 4**

```plain
60.		[0x7c]LOAD_FAST
		 [0x0]Loading from key

62.		[0x64]LOAD_CONST
	 	 [0x7]1

64.		[0x19]BINARY_SUBSCR

65.		[0x0]<0>

66.		[0x7d]STORE_FAST
	 	 [0x0]Saving in key

68.		[0x74]LOAD_GLOBAL
	 	 [0x0]chr

70.		[0x74]LOAD_GLOBAL
	 	 [0x1]ord

72.		[0x7c]LOAD_FAST
	 	 [0x0]Loading from key

74.		[0x83]CALL_FUNCTION
	 	 [0x1]None

76.		[0x74]LOAD_GLOBAL
	 	 [0x1]ord

78.		[0x7c]LOAD_FAST
	 	 [0x0]Loading from key

80.		[0x83]CALL_FUNCTION
	 	 [0x1]None

82.		[0x1a]BINARY_FLOOR_DIVIDE

83.		[0x0]<0>

84.		[0x64]LOAD_CONST
	 	 [0x8]48

86.		[0x14]BINARY_MULTIPLY

87.		[0x0]<0>

88.		[0x83]CALL_FUNCTION
	 	 [0x1]None

90.		[0x7d]STORE_FAST
	 	 [0x6]Saving in p4
```

The instructions from 60 to 66 are the equivalent to:

```python
key = key[1]
```

The explanation is the same as for [part 2](#part-2).

Let's take a look at the stack before the first call to CALL_FUNCTION.

CALL_FUNCTION's argument indicates how many arguments should be poped from the stack before reaching the function.

```plain
0x2 <var>  key
0x1 <func> ord
0x0 <func> chr
```

CALL_FUNCTION 74. takes 1 argument. So it pops 1 value from the stack (key), and uses it as the argument for the function (ord).

```plain
0x1 <var>  ord(key)
0x0 <func> chr
```

Here is the stack after each step until the save in p4.

```plain
74.
0x1 <var>  ord(key)
0x0 <func> chr
```

```plain
76.
0x2 <func> ord
0x1 <var>  ord(key)
0x0 <func> chr
```

```plain
78.
0x3 <var>  key
0x2 <func> ord
0x1 <var>  ord(key)
0x0 <func> chr
```

```plain
80.
0x2 <var>  ord(key)
0x1 <var>  ord(key)
0x0 <func> chr
```

```plain
82.
0x1 <var> ord(key)//ord(key) // BINARY_FLOOR_DIVIDE -> TOS = TOS1 // TOS
0x0 <func> chr
```

```plain
84.
0x2 <var>  48
0x1 <var> ord(key)//ord(key)
0x0 <func> chr
```

```plain
86.
0x1 <var> (ord(key)//ord(key)) * 48 // BINARY_MULTIPLY -> TOS = TOS1 * TOS
0x0 <func> chr
```

```plain
88.
0x0 chr((ord(key)//ord(key)) * 48)
```

This easily translates to:

```python
p4 = chr((ord(key)//ord(key)) * 48) # or chr(48) since ord(key)//ord(key) == 1
```

So part 4 of the flag is "0" (no matter what key is passed).

#### **Part 5**

```plain
92.		[0x64]LOAD_CONST
	 	 [0x9]}

94.		[0x7d]STORE_FAST
	 	 [0x7]Saving in p5
```

Exactly like for the first part, we are simply loading the constant "}" and storing it in p5.


### Flag

```Hero{490ceb5ad04e8e33367bc0e748898210}```
