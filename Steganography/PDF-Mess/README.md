# PDF-Mess

### Category 

Steganography

### Description

This file seems to be a simple copy and paste from wikipedia. It would be necessary to dig a little deeper...<br>

Good luck!<br>

Format : **Hero{}**<br> 
Author : **Thibz**

### Files

[PDF-Mess.pdf](strange.pdf)

### Write up

This challenge is an introduction to object-based steganography PDF. A PDF (Portable Document Format) document is composed of various objects that are stored in a tree structure. These objects include text, images, fonts, annotations, and other page elements.

Each object in the PDF document is identified and stored as a separate entity. The objects are categorized into two main types: PDF objects and PDF streams. PDF objects are used to store text, fonts, and page descriptions. PDF streams are used to store images, compressed data, and other types of data.

The PDF document is composed of a sequence of objects. Each object is identified by an object number. The object number is an integer that uniquely identifies the object within the document. 

This is very useful for steganography because it is possible to insert images, text or scripts directly into a PDF as an object.

To list all the objects in a PDF, many tools exist, but for my part, I strongly advise the use of [peepdf](https://github.com/jesparza/peepdf).

```bash
$ peepdf -i PDF-Mess.pdf
```

In addition to giving us the list of objects, they contain a system of detection of suspicious elements.

```
Suspicious elements:
                /Names (2): [1, 36]
                /EmbeddedFiles: [1]
                /EmbeddedFile: [110]
```

We realize that object 1 and 110 contain an embedded file.

```bash
PPDF> object 1

<< /Metadata 107 0 R
/ViewerPreferences 108 0 R
/MarkInfo << /Marked true >>
/StructTreeRoot 33 0 R
/Pages 2 0 R
/Type /Catalog
/Lang en
/Names << /EmbeddedFiles << /Names [ script.js 111 0 R ] >> >> >>
```

We see that there is a reference to the object 111 with the name "script.js".

```
PPDF> object 111

<< /F script.js
/Type /Filespec
/EF << /F 110 0 R >> >>
```

*Note the /EF entry, which means the referenced file is embedded (the actual file data are in a separate stream object).*


```
PPDF> object 110

<< /Length 179
/Type /EmbeddedFile
/Filter /FlateDecode
/Params << /Size 199
/Checksum

/Subtype /application/js >>
stream
const CryptoJS=require('crypto-js'),key='3d3067e197cf4d0a',ciphertext=CryptoJS['AES']['encrypt'](message,key)['toString'](),cipher='U2FsdGVkX1+2k+cHVHn/CMkXGGDmb0DpmShxtTfwNnMr9dU1I6/GQI/iYWEexsod';
endstream
```

Finally we find the hidden file!

```js
//script.js
const CryptoJS=require('crypto-js')
key='3d3067e197cf4d0a'
ciphertext=CryptoJS['AES']['encrypt'](message,key)['toString']()
cipher='U2FsdGVkX1+2k+cHVHn/CMkXGGDmb0DpmShxtTfwNnMr9dU1I6/GQI/iYWEexsod';
```

Simply apply the reverse operation :
```js
const CryptoJS = require("crypto-js");
const ciphertext = "U2FsdGVkX1+2k+cHVHn/CMkXGGDmb0DpmShxtTfwNnMr9dU1I6/GQI/iYWEexsod";
const key = "3d3067e197cf4d0a";
const bytes = CryptoJS.AES.decrypt(ciphertext, key);
const plaintext = bytes.toString(CryptoJS.enc.Utf8);

console.log(plaintext);
```

### Flag

```Hero{M4L1C10U5_C0D3_1N_PDF}```