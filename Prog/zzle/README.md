# zzle

### Category

Prog

### Description

It's the same type of puzzle as before, but much larger. The pieces are in the `puzzle.pickle` file in the following format:

```python
pieces = [(up, right, front, down, left, back, payload), (up, right, front, down, left, back, payload), ...]
```

The small difference with the previous puzzle is that the flag is only composed of every third piece's payload on the diagonal. For example, if the concatenated payloads of the diagonal form the string `'abcdef'`, then the flag is `Hero{ace}`

The input file being quite large, I would advise to test your optimisations on the previous puzzle file.

The file is available here : https://mega.nz/file/6Fo1iSSC#ZNiCrbrleGI_3sWyUaLVM3fVWHDgP49vxkDvbM3WfYA (password: `SEEzPfP3ssb$d9QC`)
And here : https://drive.google.com/file/d/1v2vsAf8PbcjySHRqRJV6r24D5tv9XPDt/view?usp=sharing (same password)
```
$ sha256sum puzzle.zip            
60b60633fe7e88bedcc98af1a5fb28ecef795b894425d2ae65f45939b796bf22  puzzle.zip
```

Format : **Hero{flag}**<br>
Author : **Log_s**

### Write up

With a puzzle this big, you have to apply some optimisation methods.

First question: what needs optimizing ? In other words: what is so slow that it makes this challenge impossible to solve using the previous methods ?

Well two things, that are linked.

First is finding the upper-front-left corner. The nested loop as shown before is bound to fail. This puzzle is made of 2 097 152 pieces. The nested loop loops 4 398 046 511 104 times in the worst case. It goes without saying that our computer can't handle that (I estimated the completion time to 70 hours approximatively, which exceeds the CTFs duration).

The second problem is finding the neighbour pieces in the main loop. Due to the great amount of pieces, looping through all the pieces each time is very time consuming.

Now the second problem is not as bad as the first one. Indeed, when knowing the corner piece, the previous techniques would allow almost any computer to complete the task in a few hours. But let's do this right shall we ?

The solution I'm presenting is tackling both problems at once, and is using the famous hashmaps, that are so loved during google interviews.

The trick here is to make some easy precomputations, and copy the pieces into 6 python dictionnaries (those are implemented as hashtables). We create one dict for each direction. Let's take the left direction as example. We copy each piece in here, and using the `left` id as key.

```python
lefts = {}
for piece in puzzle_pieces:
    lefts[piece[LEFT]] = piece
```

This allows us to easily access the neighbouring pieces like this.

```python
# We want to find the neighbor directly to the right of the piece p
neighbour = lefts[p[RIGHT]]
```

As two neighbouring pieces have corresponding edge IDs, this allows really fast access to a neighbour, without having to loop through every pieces once more.

In the matter if finding the first corner, wa also can use the hashmaps.

If we take the example of the X axis, we should have a lot of common keys in `lefts` and `rights` dicts. The ones that only appear in `lefts` referece a piece that is on the far left side of the completed puzzle, and only has one neighbour on the X axis. We can do the same difference with the two other axis, and end up with all the `up` IDs of the upper face, all the `left` IDs of the left face and all the `front` IDs of the front face.

```python
uniq_ups = list(set(ups.keys()) - set(downs.keys()))
```

We now only need to iterate through all the pieces once, and find the one that has IDs from each list. It's the upper-left-front corner piece. This operation might take some time on a list. In python, the `in` operator is O(n) on a list. It's faster on a sorted list, but sorting takes some time. However, we know that there are no duplicates in the lists, so we can use a set instead. This allows us to use the `in` operator in O(1) time. This is quite an intersting subject, and I encourage you to read more about python's implementation of sets, lists, and the `in` operator.

```python
uniq_ups = set(ups.keys()) - set(downs.keys())
```

The following script would for example solve the previous puzzle in around 0.062 seconds for me, and the current puzzle in approximatively 7 seconds (5 minutes if you are using lists instead of sets).

PS : All the times and puzzle sizes above are valid, but the actual puzzle size is 192x192x192 (7 077 888 pieces), and not 128x128x128. The actual solve time is 28s. It was updated to limit the chance of very fast computers to be able to solve it without to much optimisation (but I was to lazy to recalcalculate all the computation times for the 100th time :) ).


```python
import time
import pickle


start_time = time.time()


INPUT_FILE = "puzzle.pickle"
UP = 0
RIGHT = 1
FRONT = 2
DOWN = 3
LEFT = 4
BACK = 5
PAYLOAD = 6


# Parse input
puzzle_pieces = pickle.loads(open(INPUT_FILE, "rb").read())
SIZE = round(len(puzzle_pieces) ** (1./3.))
print(f"[+] Puzzle size: {SIZE}x{SIZE} ({len(puzzle_pieces)} pieces)")


# Precompute pieces in 6 dictionaries, to speed up the search
ups = {}
rights = {}
fronts = {}
downs = {}
lefts = {}
backs = {}
for piece in puzzle_pieces:
    ups[piece[UP]] = piece
    rights[piece[RIGHT]] = piece
    fronts[piece[FRONT]] = piece
    downs[piece[DOWN]] = piece
    lefts[piece[LEFT]] = piece
    backs[piece[BACK]] = piece
print(f"[+] Precomputation done")


# Find upper left corner
upper_left_front = None

uniq_ups = set(ups.keys()) - set(downs.keys()) # all pieces on the upper face of the completed puzzle (65536 pieces)
del downs # free memory
uniq_lefts = set(lefts.keys()) - set(rights.keys()) # same for left
del rights # free memory
uniq_fronts = set(fronts.keys()) - set(backs.keys()) # same for front
del backs # free memory

for piece in puzzle_pieces:
    if piece[UP] in uniq_ups and piece[LEFT] in uniq_lefts and piece[FRONT] in uniq_fronts:
        upper_left_front = piece
        break

del puzzle_pieces # free memory

print(f"[+] Found upper left front corner")


# Reconstruct puzzle
puzzle = [[[None for _ in range(SIZE)] for __ in range(SIZE)] for ___ in range(SIZE)]
puzzle[0][0][0] = upper_left_front
x, y, z = 1, 0, 0
operations = 0
while x < SIZE:
    if operations%3 == 0:
        puzzle[z][y][x] = lefts[puzzle[z][y][x-1][RIGHT]]
        y += 1
    elif operations%3 == 1:
        puzzle[z][y][x] = ups[puzzle[z][y-1][x][DOWN]]
        z += 1
    else:
        puzzle[z][y][x] = fronts[puzzle[z-1][y][x][BACK]]
        x += 1
    
    operations += 1


# Read flag
flag = ""
for i in range(0, SIZE, 3):
    flag += puzzle[i][i][i][PAYLOAD]
print(f"[+] Flag : Hero{{{flag}}}")

print(f"\n--- {time.time() - start_time} seconds ---")
```

Of course, the different solutions presented in these write-ups weren't the only possibilities (and far from it), and it's the beauty of it. We could have solved the puzzle without knowing the first corner from the start, thus allowing us to reduce from a lot the number of time we have to go through the pieces.

But I wanted to present a solution from a begginner friendly point of view, by making only small changes from one puzzle to another.

### Flag

```Hero{26c8b1c64aa07afa6ea4bf653bdaef6a7d71f6199a0a812b995a9e613e542ad1}```
