import time
import pickle
import math


start_time = time.time()


INPUT_FILE = "puzzle.pickle"
UP = 0
RIGHT = 1
DOWN = 2
LEFT = 3
PAYLOAD = 4


# Parse input
puzzle_pieces = pickle.loads(open(INPUT_FILE, "rb").read())
SIZE = int(math.sqrt(len(puzzle_pieces)))
print(f"[+] Puzzle size: {SIZE}x{SIZE} ({len(puzzle_pieces)} pieces)")


# Find upper left corner
upper_left = None
for piece1 in puzzle_pieces:
    found = True
    for piece2 in puzzle_pieces:
        if piece1[UP] == piece2[DOWN] or piece1[LEFT] == piece2[RIGHT]:
            found = False
            break
    if found:
        upper_left = piece1
        break
puzzle_pieces.remove(upper_left)
print(f"[+] Found upper left corner: {upper_left}")


# Reconstruct puzzle
puzzle = [[None for _ in range(SIZE)] for __ in range(SIZE)]
puzzle[0][0] = upper_left
x, y = 1, 0
while len(puzzle_pieces) > 0:
    if x == 0:
        for piece in puzzle_pieces:
            if piece[UP] == puzzle[y-1][0][DOWN]:
                puzzle[y][x] = piece
                puzzle_pieces.remove(piece)
                break
    else:
        for piece in puzzle_pieces:
            if piece[LEFT] == puzzle[y][x-1][RIGHT]:
                puzzle[y][x] = piece
                puzzle_pieces.remove(piece)
                break
    x += 1
    if x == SIZE:
        x = 0
        y += 1


# Read flag
flag = ""
for i in range(SIZE):
    flag += puzzle[i][i][4]
print(f"[+] Flag : Hero{{{flag}}}")

print(f"\n--- {time.time() - start_time} seconds ---")