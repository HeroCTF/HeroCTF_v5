# My Poor Webserver

### Category

Forensic

### Description

Last night, I left my webserver open during the night. When I connect to it this morning, I've found some suspicious logs, but one minute later they we're gone... what is going on with my server?

Format : **Hero{}**<br>
Author : **Worty**

### Write Up

strace to see that file is loaded with LD_PRELOAD
use direct syscall to get the malicious lib
reverse the lib to see that some hidden things have to be set in order to unhide a file
flag :)

### Flag

Hero{y0u_just_f1nd_4_r00tk1t_!!}