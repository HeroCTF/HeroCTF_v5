#!/usr/bin/expect

spawn /bin/zsh
send "cd /usr/src/app/data/\r"
expect "\r"
send "folders=\$(ls)\r"
expect "\r"
send "while read -r line; do cd \$line; done <<< \$folders\r"
expect eof