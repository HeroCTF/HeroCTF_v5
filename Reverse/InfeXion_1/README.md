# InfeXion 1/4 

### Category

Reverse

### Description

On `2023-04-29 10:10:07`, we received the following order from a C2 server located on the domain `ofi.dyn.ydns.io`:

```
down-n-exec|https://files.catbox.moe/qk7kvg.VBS|qk7kvg.VBS
```

**Warning : This series of challenges contains real world malware. Do not execute it on your host, use a VM !!**

The flag corresponds to malware family that sends this order, e.g. Hero{QAKBOT}.

Format : Hero{malware\_family}<br>
Author : xanhacks

### Hints

- If some files are unavailable at download, check on [archive.org](https://archive.org)

### Write Up

After a quick research on `down-n-exec`, you can find a few blog posts like [securitynews.sonicwall.com](https://securitynews.sonicwall.com/xmlpost/obfuscated-javascript-being-used-by-wshrat-v2-0/). We can learn that:

> After analysis, we found that these files belong to WSHRAT malware family.
> `down-n-exec`: Downloads and executes the specified executable file from the specified URL.

### Flag

**Hero{WSHRAT}**
**Hero{WSHRATv2}**
**Hero{HOUDINI}**
