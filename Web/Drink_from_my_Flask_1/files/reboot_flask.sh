if [ `ps -aux | grep -E ".*/usr/bin/python3 /var/www/dev/app.py" | wc -l` != "2" ]
then
    pkill python3 -U 1000
    /usr/bin/python3 /var/www/dev/app.py # This dev app is not exposed, it's ok to run it as myself  
fi
