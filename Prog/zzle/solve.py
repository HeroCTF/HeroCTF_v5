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