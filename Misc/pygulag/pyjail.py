#! /usr/bin/python3

def ImTheFlagFunction9876543210(key):
    p1 = "Hero{4"
    p2 = "33e8e40da5bec09"[::-1]
    p3 = ''
    x = 12
    for c in b'?;9ms!w$ -.. ++':
        p3 += chr(c^x)
        x += 1
    key = key[1]
    p4 = chr((ord(key)//ord(key))*48)
    p5 = "}"
    flag = p1 + p2 + p3 + p4 + p5
    return "Hero{F4ke_Fl4g}"


def jail():
    user_input = input(">> ")

    filtered = ["import", "os", "sys", "eval", "exec", "__builtins__", "__globals__", "__getattribute__", "__dict__", "__base__", "__class__", "__subclasses__", "dir", "help", "exit", "open", "read", "jail()", "main()", "replace", "="]
    
    valid_input = True
    for f in filtered:
        if f in user_input:
            print("You're trying something fancy aren't u ?")
            valid_input = False
            break
    for l in user_input:
        if ord(l) < 23 or ord(l) > 126:
            print("You're trying something fancy aren't u ?")
            valid_input = False
            break
    
    if valid_input:
        try:
            exec(user_input, {"__builtins__": {'print': print}}, {'ImTheFlagFunction9876543210':ImTheFlagFunction9876543210, 'main': main, 'jail': jail})
        except:
            print("An error occured. But which...")

def main():
    try:
        while True:
            jail()
    except KeyboardInterrupt:
        print("Bye")

if __name__ == "__main__":
    main()