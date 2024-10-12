# Gladiator

## Category

Pwn

## Description

Will you come out of the arena alive?

<img class="img-fluid" src="https://media.discordapp.net/attachments/814526151061274674/1105180104201617500/ghizmo_Very_realistic_Amazonian_arena_with_a_gladiator_entering_b49c9c2e-4e54-432a-b37a-bfa014a8828c.png">

Format : Hero{flag}<br>
Author : Ghizmo x SoEasY

## Files

- [gladiator](gladiator)
- [gladiator.c](gladiator.c)
- [libc.so.6](libc.so.6)

## Write Up

The challenge is related to heap exploitation, dealing with multithreading. Since each thread has his own arena, the challenge will make us deal with multiple arenas.

**TL;DR**
- UAF using dead chunk in next arena.
- Tcache poisoning to leak next arena's address.
- Tcache poisoning to malloc a chunk at next of next arena's address, use the read primitive to leak which gives the main arena address, so a libc leak. And finally perform a tcache poisoning to overwrite GOT.

### Analysis

First, let's apply the usual pwn routine.
```sh
$ checksec gladiator
[*] '/HeroCTF/Pwn/gladiator'
    Arch:     amd64-64-little
    RELRO:    No RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)

❯ ./libc.so.6 | head -n 1
GNU C Library (Ubuntu GLIBC 2.35-0ubuntu3.1) stable release version 2.35.
```

The binary is'nt compiled as PIE and has no RELRO. The used GLIBC is the version 2.35.
We can already deduce that we will probably have to overwrite the GOT to get a shell since malloc hooks are no longer available in this GLIBC version, and No RELRO means that there is no restrictions about overwriting the GOT.

#### Understanding the program

There are 4 levels, each in a different thread, with a different ennemy each time.

We start at `level_1` with our `gladiator`, and we fight a `npc`.
We have a menu of actions to beat the `npc`.
The `npc` actions are performed in `level_2` which is where the `level_1` thread is created.
So, during the `gladiator` actions, the npc is also performing actions.
If the gladiator's hp or npc's hp fall to zero or below, the npc actions stop and it checks if the gladiator is alive, if so it continues and checks if the npc is alive, if not he is freed, and the gladiator now performs his actions in the`level_2` functions. And so on.

Each level has the same routines, here are the main steps:
- Create enemy.
- Make a thread.
- Wait for a signal (from level_(i-1)) to continue.
- Enemy performs actions.
- Check if gladiator is alive.
- If so, and the enemy has been defeated, then enemy is freed.
- Then the gladiator choose (or not) an object.
- It sends the signal to level_(i+1) to start the fight.
- The gladiator can now perform actions to beat the next opponent.

Gladiator and enemies have hp and a spell. See structures in the source code.

#### Before exploiting

Because the challenge deals with threads, it's important to start with some knowledge in our suitcase.
- Learning Thread programming basics in C can help to understand.
- Heap debugging commands are essential, such as `vis`, `heap` and `bins` in pwndbg. 
- Threads debugging commands are also essential.

##### Thread programming in C

In short, here are the main functions:
```c
// Create a thread, with a routine function
int pthread_create(pthread_t *thread, const pthread_attr_t *attr, void *(*start_routine) (void *), void *arg);

// To wait for a thread to be finished
int pthread_join(pthread_t thread, void **retval);

// Thread exit
void pthread_exit (void * retval);

// Stop a thread
int pthread_cancel (pthread_t thread);

// To lock access to a variable for the other threads, to avoid access problems
int pthread_mutex_lock(pthread_mutex_t *mutex)
int pthread_mutex_unlock(pthread_mutex_t *mutex)

// To make a thread wait until a condition
int pthread_cond_wait (pthread_cond_t * cond, pthread_mutex_t * mutex);

// To signal that the condition is met, which wakes up the thread(s)
int pthread_cond_signal (pthread_cond_t * cond);
```


##### GDB - Threads

When running the program in gdb, we can check the existing threads with : `info threads`
Later, when threads are created, you can switch with on a specific thread with : `thread <thread_id>`
Debugging threads can be very painful, and can be easily out of control.
For that reason, it's important to take your time to control what you do.


### Exploitation

Now, with this in hand, we can start to exploit the program.

#### Level 1 (NPC)

Gladiator Action Menu:
```
========= ACTIONS =========
1) Hit
2) Fluuuuurrry of bloooows!
3) Exit
```

Our actions are simple:
- Hit - Calls `hit` function which inflicts 1 damage 
- Flurry of blows - Calls `flurry_of_blows` which calls `hit` up to 20 times
- Exit - Calls `feigning_death` which calls `pthread_exit(NULL)` which ends the program


NPC Actions:
```c
while (gladiator->hp > 0 && npc->hp >= 0)
{
	sleep(1.5);
	npc->spell(&gladiator->hp, 1);
	
	if (!(npc->hp <= 0))
	{
		npc->hp += 10;
	}
}
```

Here is how the npc is created:
```c
npc_t *npc = create_npc(40, flurry_of_blows);
```

```c
npc_t *create_npc(int64_t hp, void (*spell)(int64_t *, int64_t))
{
	npc_t *random_npc = (npc_t *)malloc(sizeof(npc_t));
	random_npc->hp = hp;
	random_npc->spell = spell;
	random_npc->object = uno_reverse_card;
	return random_npc;
}
```

So, we just have to kill him by spamming `flurry_of_blows` with 20 in arguments.
Nothing important here, it's just to understand that "time" is very important with threads:
- Running it localy or remotely can be very different, you can kill the `npc` with 3 calls of `flurry_of_blows()` localy, but you can need more remotely.
- But mainly, threads can take time to start, etc. So you have to be very careful when using threads, and that's why mutex, signals, etc. are very priceless.

To win this level, you should script a spam of the option 2 with 20 in argument, till you receive the message: `[+] The random NPC is dead!`

The full exploit code can be found in [solve.py](solve.py).

#### Level 2 (Witch)

Next, you can choose an object to fight the `witch`.
```
===== Objects =====
1) HP potion
2) Sharp blade
3) Perlimpinpin bags
```

This menu is prompted in `choose_object_level2()`.
We can see that the first two objects are useless. But the third, the Perlimpinpin bags seems very useful, since it performs a malloc for a pointer list `bag_of_bags` and we can malloc up to 10 `perlimpinpin_t bag` of size between 1 and 100.

Here is the structure of `perlimpinpin_t`:
```c
typedef struct
{
	int64_t bags_nb;
	size_t grams;
	void (*magic)(void *);
} perlimpinpin_t;
```

We can see that it stores an index `bags_nb`, a size `grams` and a "magic" function, which can probably be useful.

Gladiator Action Menu:
```
========= ACTIONS =========
1) Hit
2) Fluuuuurrry of bloooows!
3) Use your object
4) Exit
```

So, the actions are quite the same as before, now we have the option to use the chosen object.


WItch Actions (in brief):
```c
fflushed_printf("[!] The witch is preparing a spell!\n");
pthread_create(&casting_thread, NULL, casting_avada_kedavra, witch);

sleep(4);

if (witch->hp > 0)
{
	fflushed_printf("\n[!] (Witch): Avada kedavraaaaa !!!\n");
	witch->spell(&gladiator->hp);
}
```

So the witch is preparing a spell, there is a thread for it:
```c
void *casting_avada_kedavra(void *args)
{
	character_t *witch = (character_t *)args;
	pthread_cond_wait(&witch->cond, &witch->mutex);
	witch->spell(&witch->hp);
}
```

And the spell used by the witch is:
```c
void avada_kedavra(int64_t *hp)
{
	*hp = (-1337);
}
```

In short, if the witch stills has hp after the preparation, it kills the gladiator.
But if we find a way to send a signal with witch condition, it will pass `pthread_cond_wait(&witch->cond, &witch->mutex)` and call `witch->spell(&witch->hp)` which will call the witch. So here is our goal in this level. 

We have 4 seconds before killing us and the witch has 400 hp, which is far too much to be killed with `flurry_of_blows()`. So we will have to find how to send a signal before 4 seconds.

We will have to use the Perlimpinpin bags for that. But, how can we kill with simple mallocs?
We just saw that perlimpinpin bags have a magic function, but never initialized.

If we remember, the enemy is freed when we kill it.
We just killed the npc who had `uno_reverse_card` as a spell.
And this function is doing a `pthread_cond_signal` ! Exactly what we want
```c
void uno_reverse_card(void *reverse_card)
{
	fflushed_printf("\n[+] UNO Reverse !\n");
	pthread_cond_signal(reverse_card);
}
```

In addition, we can see that when we use perlimpinpin bags, we are prompted for which one we want to use, and it calls the magic function of it with `witch->spell(&witch->hp)` in argument.
So this is clearly our goal !

If we can perform an Use-After-Free, so the `((perlimpinpin_t *)bag_perlimpinpin_powder[bag_nb])->magic(&witch->cond)` calls `uno_reverse_card(&witch->cond)`, we win !

Let's see the heap state of this arena !
To easily debug, it's better to change the sleep seconds and compile the program with the same protections.
```sh
gcc -no-pie -Wl,-z,norelro -o gladiator gladiator.c -lpthread
```

```shell
pwndbg> start                  # to break at main function
pwndbg> b choose_object_level2 # to break and look at heap state
pwndbg> c                      # to continue

# after killing the npc, it breaks at choose_object_level2
# now we can check the threads, to target the one where we are

pwndbg> info threads
# we can see that we are in the good thread, but this is not always the case

pwndbg> vis                    # to check heap
# There is a lot of things in the heap
# But we can see right after the tcache, that we have our npc's chunk freed

# ...
# 0x7fffec000b60	0x0000000000000000	0x0000000000000025	........%.......
# 0x7fffec000b70	0x00007ff813fed3e0	0x262eca5c297de2eb	..........})\..&	 <-- tcachebins[0x20][0/2]
# 0x7fffec000b80	0x000055555555557c	0x0000000000000125	|UUUUU..%.......
# ...
```

So, if we malloc one perlimpinpin bag of the same size, it will take this chunk, since its the first in the tcachebins.
But be careful, if we choose to take less than 4 bags, the list of bags pointers will take this chunk !

Here are the steps to kill the witch:
- Select option 3 when choosing object, to take perlimpinpin bags
- Take 4 bags, one of them must have a size between 1 and 24 to perform UAF
- Finally, use the perlimpinpin bags which index trigger the UAF

This level may seem a bit confusing when you read this, but it's just code comprehension, the goal here is to deals with thread debugging, and that arenas can leaves important data in the heap.

The hardest part comes now :)


#### Level 3 (Night king)

Again, we can choose an object to fight the `night_king`.
```
======= Objects =======
1) Magic wand
2) Book of spells
3) Potion of invisibility
```

This menu is prompted in `choose_object_level3()`.
Nothing important with theses objects, except that we malloc a different size.
Option 1 will malloc a size of 100, the second a size of 200, and the third a size of 60.
Ok, well.

Gladiation Action Menu:
```
========= ENCHANT YOUR OBJECT =========
1) Add an enchantment
2) Remove an enchantment
3) Check enchantments
4) End of enchantments
```

This menu is prompted in `level3_actions()`.
Now, the actions are totally different, but it's typical heap menu: malloc / free / show
- Option 1: Malloc by index a size between 0 and 2000, up to `(object_size / 8)` objects
- Option 2: Free the desired object by his index
- Option 3: Read content of an enchant by his index

The option 3 read the total content of an enchant, so by freeing an unsortedbin, we directly get a leak !
But the thing is that this leak is not a main_arena address :)
So we will see what it is, and how to deal with it.

Night King Actions:
```c
thread_army_t thread_army = invocation_army_of_the_dead(night_king);
if (thread_army.zombified_gladiator_nb == 10)
{
	fflushed_printf("\n[!] Zombie gladiators are coming for you!\n");
	gladiator->hp = 0;
	check_death(gladiator);
}
else
{
	for (int i = 1; i < thread_army.zombified_gladiator_nb; i++)
	{
		free(thread_army.army[i]);
	}
	fflushed_printf("[!] The army disapeared !\n");
	pthread_cancel(third_thread);
}
```

The `invocation_army_of_the_dead()` function allocate an army, and makes threads to create zombified gladiators.
If the night king hps are bellow 0, it stops and the army is freed.

But this time, the night king is "already dead" (freed), before he performs actions:
```c
free(night_king);

# night king actions
# ...
```

The thing is that the night king is on a different thread, which means a different arena !
Each thread has an arena, and arenas are linked by a singly-linked list :
```c
struct malloc_state
{
	// ...
	
	/* Linked list */
	struct malloc_state *next;
	
	/* Linked list for free arenas.  Access to this field is serialized
	 by free_list_lock in arena.c.  */
	struct malloc_state *next_free;
	
	/* Number of threads attached to this arena.  0 if the arena is on
	 the free list.  Access to this field is serialized by
	 free_list_lock in arena.c.  */
	INTERNAL_SIZE_T attached_threads;
	
	// ...
};
```

We said that by freeing an unsortedbin we get a leak, this leak is not a main_arena address as usual when dealing with one thread. Let's check in gdb. It's good idead to make a pwntools script to automate debugging.
```sh
pwndbg> b menu3         #so we break at the while loop of level3_actions
pwndbg> c

# kill npc and witch ...
# Choose object 2
# free a large chunk so it goes into unsorted bin

# imagine we leak 0x00007f9624000000 from the unsortedbin
# so the current heap arena is at 0x7f9624000030
# we can check the next of it, to get the address of next arena
pwndbg> p ((struct malloc_state*) 0x00007f9624000030).next
$1 = (struct malloc_state *) 0x7f962c000030

# We can see its just 0x8000000 from our current arena
# And if we check the arena of the night king
pwndbg> thread <thread_nb_night_king_arena>
pwndbg> vis

# Here is the night king chunks
# 0x7f962c000b60	0x0000000000000000	0x0000000000000075	........u.......
# 0x7f962c000b70	0x00000007f962c000	0x34cc950f56820c40	..b.....@..V...4	 <-- tcachebins[0x70][0/1]
# 0x7f962c000b80	0x0000000000000000	0x0000000000000000	................
# 0x7f962c000b90	0x0000000000000000	0x0000000000000000	................
# 0x7f962c000ba0	0x0000000000000000	0x0000000000000000	................
# 0x7f962c000bb0	0x0000000000000000	0x0000000000000000	................
# 0x7f962c000bc0	0x0000000000000000	0x0000000000000000	................
# 0x7f962c000bd0	0x00000000004015c4	0x0000000000000125	..@.....%.......
```

With that in hand, we can just malloc a chunk there by doing a tcache poisoning. We will not detail here how [tcache poisoning](https://github.com/shellphish/how2heap/blob/master/glibc_2.35/tcache_poisoning.c) works, there is a lot of documentation about it.
In short and to popularize, if by any means we can change the fd of a freed chunk in tcache, when we will malloc it, it will "redirect" where the fd points, so the next malloc will be there.

To summarize:
- Leak current heap addresse of our arena
- Tcache poisoning to malloc the night king chunk with null bytes

There are many ways to do this, and you don't necessarily have to use an unsortedbin here, but here is one way.
We can also get a shell in this level, but levels are there to guide us.

#### Level 4 (God)

This time we can't choose object to fight the `god`.
We directly have an action menu.
```
========= COMMANDMENTS =========
1) Take a page for a commandment
2) Rewrite a commandment
3) Delete what I wrote
4) Check what I wrote before
```

Looking at the source code, we can see in `level4_actions()` that it's more restricted, we have less actions and probably more to do, since we want a shell.
We have up to 10 mallocs, of size between 0 and 0x68, and we can't fill them with data directly, we now have an edit action to do so. It's still possible to free and read. And we can make a large malloc to leak by sending it in unsortedbin.

The god actions are simple, he kills us after 100 seconds, and there is no check for his hp. There is now way to kill him. Here, the only way is to get a shell.

The idea is simple now that we did the level 3.
We will leak the current heap base address, so we know where is the next arena.
Next, we do a tcache poisoning to have a chunk at the next of the next arena, in order to leak the pointer there.
And this pointer will be the main arena since it's the last one, and with this in hand we have leak libc.
Finally, we perform a last tcache poisoning to overwrite the got.

Check [solve.py](solve.py) for better understanding :)

### Conclusion

This challenge is not that hard regarding heap exploitation, since the primitives are more or less given. The goal was to research what to do with theses primitives since we are not in the main arena as usual.
In addition, heap related multithreading is an interesting subject, we hope you liked to discover it (or not).

## Flag

```
Hero{Sp4rt4cus_w0uld_b3_pr0ud_0f_y0u!!!}
```
