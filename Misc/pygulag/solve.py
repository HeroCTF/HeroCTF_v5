import dis


code = b'd\x01}\x01d\x02d\x00d\x00d\x03\x85\x03\x19\x00}\x02d\x04}\x03d\x05}\x04d\x06D\x00]\x0e}\x05|\x03t\x00|\x05|\x04A\x00\x83\x017\x00}\x03|\x04d\x077\x00}\x04q\x0f|\x00d\x07\x19\x00}\x00t\x00t\x01|\x00\x83\x01t\x01|\x00\x83\x01\x1a\x00d\x08\x14\x00\x83\x01}\x06d\t}\x07|\x01|\x02\x17\x00|\x03\x17\x00|\x06\x17\x00|\x07\x17\x00}\x08d\nS\x00'
consts = [None, 'Hero{4', '33e8e40da5bec09', -1, '', 12, b'?;9ms!w$ -.. ++', 1, 48, '}', 'Hero{F4ke_Fl4g}']
varnames = ['key', 'p1', 'p2', 'p3', 'x', 'c', 'p4', 'p5', 'flag']
names = ['chr', 'ord']


def dissect(code, consts, varnames, names):

    state = "opcode"
    
    for index, op in enumerate(code):
        op = op

        if state == "opcode":
            print()
            end = "\n"
            if op > dis.HAVE_ARGUMENT:
                state = "arg1"
                end = "\n\t "
            print(f"{index}.\t[{hex(op)}]{dis.opname[op]}", end=end)

        elif state == "arg1":
            arg = None
            
            if last.startswith("STORE"):
                if last.endswith("FAST"):
                    arg = "Saving in "+varnames[op]

            elif last.startswith("LOAD"):
                if last.endswith("FAST"):
                    arg = "Loading from "+varnames[op]
                elif last.endswith("CONST"):
                    arg = consts[op]
                elif last.endswith("METHOD") or last.endswith("GLOBAL"):
                    arg = names[op]
            print(f"[{hex(op)}]{arg}")
            state = "opcode"

        last = dis.opname[op]


dissect(code, consts, varnames, names)