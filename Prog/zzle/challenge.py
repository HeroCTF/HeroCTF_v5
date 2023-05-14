"""
     UP
LEFT    RIGHT
    DOWN

UP RIGHT FRONT DOWN LEFT BACK ID PAYLOAD
"""
import random
import uuid
import pickle

CHARSET = "0123456789abcdef"
UP = 0
RIGHT = 1
FRONT = 2
DOWN = 3
LEFT = 4
BACK = 5

# Create puzzle
puzzle = []
ids = [-1]
key = "26c8b1c64aa07afa6ea4bf653bdaef6a7d71f6199a0a812b995a9e613e542ad1"
SIZE = len(key) * 3

i = 0
for z in range(SIZE):

    puzzle.append([])

    for y in range(SIZE):

        puzzle[z].append([])

        for x in range(SIZE):
            
            random_id = uuid.uuid4().int


            payload = ""
            if x == y == z and x%3==0:
                payload = key[x//3]
            else:
                payload = random.choice(CHARSET)

            up = puzzle[z][y-1][x][DOWN] if y > 0 else uuid.uuid4().int
            right = uuid.uuid4().int
            front = puzzle[z-1][y][x][BACK] if z > 0 else uuid.uuid4().int
            down = uuid.uuid4().int
            left = puzzle[z][y][x-1][RIGHT] if x > 0 else uuid.uuid4().int
            back = uuid.uuid4().int
            puzzle[z][y].append((up, right, front, down, left, back, payload))

            i += 1

            if i % 100000 == 0:
                print(f"{i}/{SIZE**3} pieces created")

# Flatten to one dimensional list
puzzle_1d = []
for layer in puzzle:
    for line in layer:
        puzzle_1d.extend(line)

print(f"Upper left corner: {puzzle_1d[0]}")

# Scrammble the list
random.shuffle(puzzle_1d)

# Format output
pickle.dump(puzzle_1d, open("puzzle.pickle", "wb"))



