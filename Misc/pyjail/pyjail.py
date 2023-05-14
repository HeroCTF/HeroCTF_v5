#! /usr/bin/python3

# FLAG : Hero{nooooo_y0u_3sc4p3d!!}

def jail():
    user_input = input(">> ")

    filtered = ["eval", "exec"]
    
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
            exec(user_input, {'__builtins__':{'print': print, 'globals': globals}}, {})
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