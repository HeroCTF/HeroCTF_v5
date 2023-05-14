# Best_Schools

### Category

Web

### Description

An anonymous company has decided to publish a ranking of the best schools, and it is based on the number of clicks on a button! Make sure you get the 'Flag CyberSecurity School' in first place and you'll get your reward!
<br><br>
Format : **Hero{flag}**<br>
Author : **Worty**

### Write Up

This challenge is about graphql and how it works.

In fact, we can't submit more than one request per minute to vote for a school, so it is basically impossible to reach 1337 votes for the school in one hour.

Here players have to use graphql batching to send more than one graphql request in one HTTP request :

```
[
    {
        "query":"..."
    },{
        "query":"..."
    }
    ,{
        "query":"..."
    }
    ,{
        "query":"..."
    }
    ...
]
```

We can send approximately 900 graphql requests in one http request (else we reach the HTTP payload max size), so we repeat this two times and we get the flag !

### Flag

Hero{gr4phql_b4tch1ng_t0_byp4ss_r4t3_l1m1t_!!}