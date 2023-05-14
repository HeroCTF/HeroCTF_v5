# Windows Stands for Loser

> file : memdump.mem
>
> md5 : f23658120053084c6bc33b15653225e3 
>
> sha256 : b9a1407f2040e205ec1cf3d8d88861ba063c0fd8f48267bb8bda75c785f67cbe
>
> scenario : This time, no realistic context, we just need you to find the commands that were executed and the time.
>
> Flag format: Hero{secret:dd/mm/YYYY-hh:mm:ss}
>
> flag: Hero{w5l_0n3:10/05/2023-19:59:30}
>

## Writeup

### Get context : Listing process

```bash
p2 volatility/vol.py -f memdump.mem --profile=Win10x64_19045 pslist > pslist.txt
```

```bash
p2 volatility/vol.py -f memdump.mem --profile=Win10x64_19045 pstree > pstree.txt
```

```bash
Name                                                  Pid   PPid   Thds   Hnds Time
-------------------------------------------------- ------ ------ ------ ------ ----
 0xffffa38f09ca4040:System                              4      0    105      0 2023-05-10 17:44:07 UTC+0000
. 0xffffa38f111d4040:MemCompression                  1552      4     58      0 2023-05-10 17:44:12 UTC+0000
. 0xffffa38f0bdde040:smss.exe                         328      4      3      0 2023-05-10 17:44:07 UTC+0000
. 0xffffa38f09d02080:Registry                          72      4      4      0 2023-05-10 17:44:06 UTC+0000
...
 0xffffa38f10f1b2c0:svchost.exe                      1464    584      5      0 2023-05-10 17:45:20 UTC+0000
. 0xffffa38f11cd3080:ubuntu2204.exe                  5768   1464      4      0 2023-05-10 17:50:34 UTC+0000
.. 0xffffa38f129de080:wsl.exe                         872   5768      3      0 2023-05-10 17:53:19 UTC+0000
... 0xffffa38f1245f080:wslhost.exe                   8236    872      3      0 2023-05-10 17:53:19 UTC+0000
.... 0xffffa38f123c7080:conhost.exe                  6492   8236      4      0 2023-05-10 17:53:19 UTC+0000
.. 0xffffa38f11c1d080:conhost.exe                    4856   5768      6      0 2023-05-10 17:50:34 UTC+0000
...
 0xffffa38f11b8a080:bash                             8888   5128      1      0 2023-05-10 17:53:19 UTC+0000

```

### Get a Strat : linux_bash ?

As they explain [here](https://www.sciencedirect.com/science/article/pii/S1742287618301944) : 

> Fortunately, Microsoft seems to have leveraged the same code, or  at least the same data structures, as the familiar Linux bash console.  This allows use of the existing bash history [recovery algorithm](https://www.sciencedirect.com/topics/computer-science/recovery-algorithm) for WSL processes

We found a bash process with pid 8888. 

### Linux_bash

How do volatility deal with bash process with the plugin linux_bash ?

https://volatility-labs.blogspot.com/2013/05/movp-ii-33-automated-linuxandroid-bash.html

Step are listed below:

1. Scan the heap
2. Look for # characters in heap segments.
3. With each potential timestamp, we subtract x bits to find the base address of the _hist_entry
4. parse the _hist_entry structures founded

#### Scan the heap..but first, where is the heap ?

I suggest to use volshell from now on

```bash
p2 volatility/vol.py -f memdump.mem --profile=Win10x64_19045 volshell
```

With regular NT process, we can find the address of process heap in its PEB structure (field : "ProcessHeap"). The address of relative PEB is stored in _EPROCESS structure. (field : "Peb")

> Peb: A pointer to the Process Environment Block (PEB). Although this member
> (_EPROCESS.Peb) exists in kernel mode, it points to an address in user mode. The
> PEB contains pointers to the process’ DLL lists, current working directory, com-
> mand line arguments, environment variables, heaps, and standard handles.

source : [The art of memory forensics - page 153](https://repo.zenk-security.com/Forensic/The%20Art%20of%20Memory%20Forensics%20-%20Detecting%20Malware%20and%20Threats%20in%20Windows,%20Linux,%20and%20Mac%20Memory%20(2014).pdf)

You can run the commands bellow to see the content of a _EPROCESS and PEB structure for windows build you selected.

```bash
>>> dt("_EPROCESS")
>>> dt("_PEB")
```

> There is also great resources to browse here : [Vergilius project](https://www.vergiliusproject.com/kernels/x64/Windows%2010%20|%202016/2110%2021H2%20(November%202021%20Update)/_EPROCESS)

```bash
>>> ps()
#Name             PID    PPID   Offset
#...
#bash             8888   5128   0xffffa38f11b8a080
```

but Is our process a NT Process ?

![image-20230412150202763](https://jsinkers.github.io/notes/notebooks/comp_sys/img/pico-process.png)

If we parse the _EPROCESS structure of our bash process, we need to look for the Peb field :

```bash
>>> dt("_EPROCESS",0xffffa38f11b8a080)
#...
#0x550 : Peb                            -
#...
```

but there is no PEB address..

Indeed, 

![image-20230512034023788](https://cdn.discordapp.com/attachments/881831671471689728/1106552074281431070/image-20230512034023788.png)

```bash
>>> dt("_EPROCESS",0xffffa38f11b8a080)
#...
#0x460 : PicoCreated                    1
#0x87c : Minimal                        1
#0x8c0 : PicoContext                    18446690793371442032
#...
```

8888 process is a pico process, therefore we could find the heap address in the PicoContext object but

![image-20230412151056854](https://cdn.discordapp.com/attachments/881831671471689728/1106552675220332625/image-20230412151056854.png)

source : https://www.sciencedirect.com/science/article/pii/S1742287618301944

Anyway..., let's dump the whole memory space of the process x)

```bash
p2 volatility/vol.py -f memdump.mem --profile=Win10x64_19045 memdump -p 8888 -D .
```

1. ~~Scan the heap~~ => 8888.dmp
2. Look for # characters in heap segments.
3. With each potential timestamp, we subtract x bytes to find the base address of the _hist_entry
4. parse the _hist_entry structures founded

#### Look for # characters

The goal here is to "find the timestamp member of the _hist_entry structure" ([src](https://volatility-labs.blogspot.com/2013/05/movp-ii-33-automated-linuxandroid-bash.html)). Given the fact that timestamp is in Unix  format, instead of looking up for "#" only, I will narrow the search to "#1".. To do so, I made a quick script

```bash
i=0
with open("./8888.dmp", "rb") as f:
    while i < 915070976: #size of the dump
        diese = f.read(1)
        if not diese:
            break
        if diese == b"\x23": # "#"
            one = f.read(1) 
            if one == b"\x31": # "1"
                next_data = f.read(9) 
                with open("./8888_extracted_info.txt", "r") as f2:
                    f2.write(f"offset: {hex(i)} - #1")
                    for byte in next_data:
                        f2.write(f"{chr(byte)}")
                    f2.write(f"\n")
                i+=9
            i+=1
        i += 1
```

This is not the most efficient way because I catch a lot of junk data and this implies having to clean up the file

![image-20230511234709721](https://cdn.discordapp.com/attachments/881831671471689728/1106552073006362734/image-20230511234709721.png)

but here are the values that stands out :

```bash
offset: 0x30a100 - #1683741543
offset: 0x362d30 - #1683741570
offset: 0x376d10 - #1683741539
```

1. ~~Scan the heap~~ => 8888.dmp
2. ~~Look for # characters in heap segments.~~ => 0x30a100, 0x362d30, 0x376d10
3. With each potential timestamp, we subtract x bytes to find the base address of the _hist_entry
4. parse the _hist_entry structures founded

#### find the base address of the _hist_entry

First of all, what does the structure of _hist_entry look like?

![image-20230512014801550](https://cdn.discordapp.com/attachments/881831671471689728/1106552073329320036/image-20230512014801550.png)

The offsets we found are the physical offsets in our process dumped memory file. We need to convert it to a virtual address in the context of the process.

For example, we need to know the offset of  "#1683741543"  in the virtual context.

To match these address, we can use the memmap plugin

```bash
p2 volatility/vol.py -f memdump.mem --profile=Win10x64_19045 memdump -p 8888 -D .
```

This plugins is very convenient because it give us exactly what we need

```bash
Virtual            Physical             Size     DumpFileOffset
```

The resulting mapping:

> 0x00007fffeca66000 0x0000000046eeb000             0x1000           0x30a000
>
> so 0x30a100 = 0x00007fffeca66000+0x000100 = 0x00007fffeca66100

```bash
offset: 0x30a100 => virtual: 0x00007fffeca66100
```

> 0x00007fffecabe000 0x000000008e264000             0x1000           0x362000
>
> so 0x362d30 = 0x00007fffecabe000+0x000d30 =0x00007fffecabed30

```bash
offset: 0x362d30 => virtual: 0x00007fffecabed30
```

> 0x00007fffecad2000 0x0000000122bac000             0x1000           0x376000
>
> so 0x376d10 = 0x00007fffecad2000+0x000d10 = 0x00007fffecad2d10

```bash
offset: 0x376d10 => virtual: 0x00007fffecad2d10
```

Map:

```bash
offset: 0x30a100 => virtual: 0x00007fffeca66100
offset: 0x362d30 => virtual: 0x00007fffecabed30
offset: 0x376d10 => virtual: 0x00007fffecad2d10
```

Now, we need to find, in the dump, if the @ ( virtual offset ) is written somewhere in our dump (as pointer) .  **/!\ Address are written in little endian /!\\**

```bash
0x00007fffeca66100 -> 00.61.a6.ec.ff.7f.00.00
0x00007fffecabed30 -> 30.ed.ab.ec.ff.7f.00.00
0x00007fffecad2d10 -> 10.2d.ad.ec.ff.7f.00.00
```



1. ~~Scan the heap~~ => 8888.dmp
2. ~~Look for # characters in heap segments.~~ => 0x30a100,0x362d30, 0x376d10
3. ~~With each potential timestamp, we subtract x bytes to find the base address of the _hist_entry~~ => 0x00007fffeca66100,0x00007fffecabed30,0x00007fffecad2d10
4. parse the _hist_entry structures founded

Thus, if we find our pointer, the prev 8 bits should be the pointer to our command line string

#### Parse _hist_entry

Let's look up for the pointer reference.

For this purpose, I used a hexadecimal editor (hexedit) and its search feature

![image-20230512014948158](https://cdn.discordapp.com/attachments/881831671471689728/1106552073610342431/image-20230512014948158.png)

- **0x00007fffeca66100 -> 00.61.a6.ec.ff.7f**

found  at : @65B043D8

```bash
65B043D0   B0 02 AD EC  FF 7F 00 00  00 61 A6 EC  FF 7F 00 00  .........a......
65B043E0   00 00 00 00  00 00 00 00  21 00 00 00  00 00 00 00  ........!.......
```

Hence, we can assume that our _hist_ structure should look like this: 

```bash
[_hist_entry] @ 0x65B043D8
0x0   : line           B0 02 AD EC  FF 7F 00 00
0x4   : timestamp      00 61 A6 EC  FF 7F 00 00
0x8   : data           0
```

0x00007fffecad02b0 and 0x00007fffeca66100 are virtual offset, so we can use volshell again, switch in the context of the process and try to read raw byte on our @

```bash
>>> cc(pid=8888)
#Current context: bash @ 0xffffa38f11b8a080, pid=8888, ppid=5128 DTB=0x1abe9002
```

```bash
>>> db(0x00007fffecad02b0)
0x7fffecad02b0  6c 73 20 2d 61 00 00 00 00 00 00 00 00 00 00 00   ls.-a...........

>>> db(0x00007fffeca66100)
0x7fffeca66100  23 31 36 38 33 37 34 31 35 34 33 00 00 00 00 00   #1683741543.....
0x7fffeca66110  00 00 00 00 00 00 00 00 21 00 00 00 00 00 00 00   ........!.......
```

- **0x00007fffecabed30 -> 30.ed.ab.ec.ff.7f**

found at : @65B04A08

```bash
65B04A00   C0 C4 AB EC  FF 7F 00 00  30 ED AB EC  FF 7F 00 00  ........0.......
65B04A10   00 00 00 00  00 00 00 00  21 00 00 00  00 00 00 00  ........!.......
```

```bash
[_hist_entry] @ 0x065B04A08
0x0   : line           C0 C4 AB EC  FF 7F 00 00
0x4   : timestamp      30 ED AB EC  FF 7F 00 00
0x8   : data           0
```

0x00007fffecabc4c0 and 0x00007fffecabed30 are virtual offset, so we can use volshell again, switch in the context of the process and try to read raw bit on our @

```bash
>>> cc(pid=8888)
#Current context: bash @ 0xffffa38f11b8a080, pid=8888, ppid=5128 DTB=0x1abe9002
```

```bash
# >>> db(0x00007fffecabc4c0) /!\ you can ask to display more bits
>>> db(0x00007fffecabc4c0,200)
0x7fffecabc4c0  65 63 68 6f 20 4b 48 42 73 5a 57 46 7a 5a 53 42   echo.KHBsZWFzZSB
0x7fffecabc4d0  6b 62 32 34 6e 64 43 42 6d 61 57 35 6b 49 47 31   kb24ndCBmaW5kIG1
0x7fffecabc4e0  6c 49 48 64 70 64 47 67 67 64 47 68 6c 49 43 4a   lIHdpdGggdGhlICJ
0x7fffecabc4f0  7a 64 48 4a 70 62 6d 64 7a 49 69 42 6a 62 32 31   zdHJpbmdzIiBjb21
0x7fffecabc500  74 59 57 35 6b 4c 43 42 30 61 47 56 79 5a 53 42   tYW5kLCB0aGVyZSB
0x7fffecabc510  70 63 79 42 68 49 47 5a 31 62 6d 35 70 5a 58 49   pcyBhIGZ1bm5pZXI
0x7fffecabc520  67 62 57 56 30 61 47 39 6b 4b 53 35 55 61 47 55   gbWV0aG9kKS5UaGU
0x7fffecabc530  67 63 32 56 6a 63 6d 56 30 49 47 6c 7a 49 44 6f   gc2VjcmV0IGlzIDo
0x7fffecabc540  67 64 7a 56 73 58 7a 42 75 4d 77 3d 3d 20 7c 20   gdzVsXzBuMw==.|.
0x7fffecabc550  62 61 73 65 36 34 20 2d 64 00 ab ec ff 7f 00 00   base64.-d.......

>>> db(0x00007fffecabed30)
0x7fffecabed30  23 31 36 38 33 37 34 31 35 37 30 00 00 00 00 00   #1683741570.....
```

### Get the flag

#### secret

```bash
echo -n "KHBsZWFzZSBkb24ndCBmaW5kIG1lIHdpdGggdGhlICJzdHJpbmdzIiBjb21tYW5kLCB0aGVyZSBpcyBhIGZ1bm5pZXIgbWV0aG9kKS5UaGUgc2VjcmV0IGlzIDogdzVsXzBuMw==" | base64 -d
#(please don't find me with the "strings" command, there is a funnier method).The secret is : w5l_0n3
```

#### timestamp

![image-20230512022431671](https://cdn.discordapp.com/attachments/881831671471689728/1106552073962659840/image-20230512022431671.png)

=> 10/05/2023-19:59:30

#### Flag

And finally, here is our flag :

```bash
Hero{w5l_0n3:10/05/2023-19:59:30}
```



## Ressources

- https://www.sciencedirect.com/science/article/pii/S1742287618301944
- https://volatility-labs.blogspot.com/2013/05/movp-ii-33-automated-linuxandroid-bash.html
- https://www.vergiliusproject.com/

volshell cheat sheet : ![Image](https://pbs.twimg.com/media/FIqxBc2XoAgdNH9?format=jpg&name=4096x4096)