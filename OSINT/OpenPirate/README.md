# OpenPirate 

### Category

OSINT

### Description

A pirate runs a website that sells counterfeit goods, it is available under the name `heroctf.pirate`. However, we can't get our hands on it, can you help us? Your goal is to find a way to access this website.

Format : **Hero{flag}**<br>
Author : **xanhacks**

### Write up

There are two ways of solving this challenge.

#### Using nslookup

You can resolve the `heroctf.pirate` IP address using one of OpenNIC's DNS servers. You can find the list on their website.

```
$ nslookup
> server 51.158.108.203 # ns1.fr
Default server: 51.158.108.203
Address: 51.158.108.203#53
> heroctf.pirate
;; communications error to 51.158.108.203#53: timed out
Server:         51.158.108.203
Address:        51.158.108.203#53

Name:   heroctf.pirate
Address: 13.38.112.148
```

Then, you can visit `http://13.38.112.148` to obtain the flag. 

#### OpenNIC proxy

You can use the [OpenNIC proxy](http://proxy.opennicproject.org) to visit the website `heroctf.pirate` with your web browser only (no DNS installation required).

### Flag

Hero{OpenNIC\_is\_free!!!3586105739}
