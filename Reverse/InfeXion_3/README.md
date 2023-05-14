# InfeXion 3/4

### Category

Reverse

### Description

A powershell script named `vidyud.jpg` appears to have been executed on the victim's machine. Find the next step in the infection chain!

**Warning : This series of challenges contains real world malware. Do not execute it on your host, use a VM !!**

The flag corresponds to the name of technique and the method name for hiding the malicious process, e.g. `Hero{DLL Injection|mainMethod}`.

Format : Hero{Technique|Method name}<br>
Author : xanhacks

### Write Up

From the previous step, we know that the powershell file at `https://files.catbox.moe/vidyud.jpg` will be executed.

Here is the content of the file:

```powershell
[Byte[]]$uiououououououououoououo=[System.Convert]::FromBase64String('TVqQAAMAA...AAAAAA==');
[Byte[]]$cbbzqwqwqqwqwwqw=(77,90,144,...,0,0,0,0,0);
[Reflection.Assembly]::Load($uiououououououououoououo).GetType('Hhd95inlxpu7aiKwB3.Erc4ahc0TZJlqBWO9w').GetMethod('rdgUsOpw7').Invoke($null,[object[]] ('C:\Windows\Microsoft.NET\Framework\v2.0.50727\RegAsm.exe',$cbbzqwqwqqwqwwqw))
```

The two variables contains:

- `$uiououououououououoououo`: A .NET PE in base64.
- `$cbbzqwqwqqwqwwqw`: A .NET PE in decimal.

The first PE will run the second one using a technique called Process Hollowing under the legitimate process `RegAsm`. It is used to hide the malicious process behind a legit one.

We can use CyberChef to extract the two PE from the powershell and [de4dot](https://github.com/de4dot/de4dot) to do some .NET deobfuscation. To decompile .NET PE, we can use ILSpy or dnSpy.

We can start doing static anlysis on the first method `rdgUsOpw7` which is called by the powershell script. Then, we quickly see the method `g8tOGbvTY` which takes the *RegAsm.exe* PATH as first parameter and the second binary as second parameter. Then, we can see a basic pattern of [Process Hollowing](https://attack.mitre.org/techniques/T1055/012/).

### Flag

**Hero{Process Hollowing|g8tOGbvTY}**
