"""
     UP
LEFT    RIGHT
    DOWN

UP RIGHT DOWN LEFT PAYLOAD
"""
import random, pickle

MAX_ID = 100_000
CHARSET = "0123456789abcdef"

def create_uniq_id(existing_ids, max_id):
    random_id = -1
    while random_id in existing_ids:
        random_id = random.randint(0, max_id)
    existing_ids.append(random_id)
    return random_id

# Create puzzle
puzzle = []
ids = [-1]
key = "d98e58021ab8454de195cc2eeb5ed3865dfec6bae3bebf3e0ec2f8b32621c1aa"
SIZE = len(key)

i = 0
for y in range(SIZE):

    puzzle.append([])

    for x in range(SIZE):

        random_id = create_uniq_id(ids, MAX_ID)

        payload = ""
        if x == y:
            payload = key[x]
        else:
            payload = random.choice(CHARSET)

        up = puzzle[y-1][x][2] if y > 0 else create_uniq_id(ids, MAX_ID)
        right = create_uniq_id(ids, MAX_ID)
        down = create_uniq_id(ids, MAX_ID)
        left = puzzle[y][x-1][1] if x > 0 else create_uniq_id(ids, MAX_ID)
        puzzle[y].append((up, right, down, left, payload))

        i += 1

        if i % 1000 == 0:
            print(f"{i}/{SIZE**2} pieces created")

# Flatten to one dimensional list
puzzle_1d = []
for line in puzzle:
    puzzle_1d.extend(line)

print(f"Upper left corner: {puzzle_1d[0]}")

# Scrammble the list
random.shuffle(puzzle_1d)

# Format output
pickle.dump(puzzle_1d, open("puzzle.pickle", "wb"))