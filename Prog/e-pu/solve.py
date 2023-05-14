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


# Find upper left corner
upper_left_front = None
for piece1 in puzzle_pieces:
    found = True
    for piece2 in puzzle_pieces:
        if piece1[UP] == piece2[DOWN] or piece1[LEFT] == piece2[RIGHT] or piece1[FRONT] == piece2[BACK]:
            found = False
            break
    if found:
        upper_left_front = piece1
        break
puzzle_pieces.remove(upper_left_front)
print(f"[+] Found upper left front corner: {upper_left_front}")


# Reconstruct puzzle
puzzle = [[[None for _ in range(SIZE)] for __ in range(SIZE)] for ___ in range(SIZE)]
puzzle[0][0][0] = upper_left_front
x, y, z = 1, 0, 0
operations = 0
while x < SIZE:
    if operations%3 == 0:
        for piece in puzzle_pieces:
            if piece[LEFT] == puzzle[z][y][x-1][RIGHT]:
                puzzle[z][y][x] = piece
                puzzle_pieces.remove(piece)
                break
        y += 1
    elif operations%3 == 1:
        for piece in puzzle_pieces:
            if piece[UP] == puzzle[z][y-1][x][DOWN]:
                puzzle[z][y][x] = piece
                puzzle_pieces.remove(piece)
                break
        z += 1
    else:
        for piece in puzzle_pieces:
            if piece[FRONT] == puzzle[z-1][y][x][BACK]:
                puzzle[z][y][x] = piece
                puzzle_pieces.remove(piece)
                break
        x += 1
    
    operations += 1


# Read flag
flag = ""
for i in range(SIZE):
    flag += puzzle[i][i][i][PAYLOAD]
print(f"[+] Flag : Hero{{{flag}}}")

print(f"\n--- {time.time() - start_time} seconds ---")