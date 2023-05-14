#!/bin/bash

if ! test -f ".ctf/config"; then
    ctf init
fi

for i in $(find . -name 'challenge.y*ml' -type f 2>/dev/null)
do
    echo "--------[ INSTALL $i ]--------"
    ctf challenge install "$i"
done

for i in $(find . -name 'challenge.y*ml' -type f 2>/dev/null)
do
    echo "--------[ SYNC $i ]--------"
    ctf challenge sync "$i"
done


