# dev.corp 1/4

### Category

Forensic

### Description

The famous company dev.corp was hack last week.. 

They don't understand because they have followed the security standards to avoid this kind of situation. You are mandated to help them understand the attack.<br><br>

For this first step, you're given the logs of the webserver of the company.<br><br>

Could you find :<br>
  - The CVE used by the attacker ?<br>
  - What is the absolute path of the most sensitive file recovered by the attacker ?<br><br>

Format : **Hero{CVE-XXXX-XXXX:/etc/passwd}**<br>
Author : **Worty**<br><br>

Here is a diagram representing the company's infrastructure:

<img class='img-fluid' src='https://ctf.heroctf.fr/files/1a304ea841284b40ef20c758c2c196ba/infra.png'>

### Files

![Logs](access.log)

### Write up

When we dig through the logs, we see that we cant sort by ip because they're not logged.

But if we look closer, we see that a path traversal has been exploited, the first one is :

`/wp-admin/admin-ajax.php?action=duplicator_download&file=../../../../../../../../../etc/passwd`

If we google the "duplicator_download", we see that this path traversal has been assigned the CVE `CVE-2020-11738`.

Moreover, the attacker exfiltrate various files, but the most sensitive one is `../../../../../../../../../home/webuser/.ssh/id_rsa_backup` (we can see that because the `id_rsa` one answer with a 500 code (maybe permission denied))

### Flag

```Hero{CVE-2020-11738:/home/webuser/.ssh/id_rsa_backup}```