# PNG-G

### Category 

Steganography

### Description

Don't let appearances fool you.<br>

Good luck!<br>

Format : **Hero{}**<br> 
Author : **Thibz**

### Files

[pngg.png](pngg.png)

### Write up

The challenge is about a PNG file. The first thing to do is to check the file with ```file``` command.

```bash
$ file pngg.png
pngg.png: PNG image data, 500 x 500, 8-bit/color RGB, non-interlaced
```

The description of the challenge says "Don't let appearances fool you". So we can assume that the file is not a PNG file. Let's check its metadata with ```exiftool``` command.

```bash
$ exiftool pngg.png
ExifTool Version Number         : 12.40
File Name                       : pngg.png
Directory                       : .
File Size                       : 500 KiB
File Modification Date/Time     : 2023:05:11 12:36:24+02:00
File Access Date/Time           : 2023:05:11 12:38:26+02:00
File Inode Change Date/Time     : 2023:05:11 12:38:25+02:00
File Permissions                : -rw-rw-r--
File Type                       : APNG
File Type Extension             : png
MIME Type                       : image/apng
Image Width                     : 500
Image Height                    : 500
Bit Depth                       : 8
Color Type                      : RGB
Compression                     : Deflate/Inflate
Filter                          : Adaptive
Interlace                       : Noninterlaced
Animation Frames                : 2
Animation Plays                 : 30
Transparency                    : 0 0 16
Image Size                      : 500x500
Megapixels                      : 0.250
```

Indeed, the file is not a PNG file but an APNG file. We can use ```apng2gif``` command to extract the frames of the APNG file.

```bash
$ apng2gif pngg.png
APNG Disassembler 2.9

Reading 'pngg.png'...
extracting frame 1 of 2
extracting frame 2 of 2
all done
```

```bash
$ ls
-rw-rw-r-- 1 apngframe1.png
-rw-rw-r-- 1 apngframe1.txt
-rw-rw-r-- 1 apngframe2.png
-rw-rw-r-- 1 apngframe2.txt
-rw-rw-r-- 1 pngg.png

$ cat apngframe1.txt
delay=10000/1

$ cat apngframe2.txt
delay=1/100
```

This steganography technique is based on the fact that it takes 1000 seconds to go from the first frame to the second where the flag is hidden and this frame only lasts 1/100 seconds.

![Flag](apngframe2.png)

### Flag

```Hero{Not_Just_A_PNG}```