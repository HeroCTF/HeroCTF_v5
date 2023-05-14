cd /backup
mkdir -p youtrack/data/

scp -o StrictHostKeyChecking=no -r dave@dev:/opt/youtrack/conf youtrack/conf &&\
scp -o StrictHostKeyChecking=no -r dave@dev:/opt/youtrack/data/youtrack youtrack/data/youtrack

if [ $? -eq 0 ]; then
    echo "$(date "+%D|%T") [+] Data copied from dev machine" >> /var/log/backup.log

    name=youtrack-$(date +%s).zip
    zip -r $name youtrack
    if [ $? -eq 0 ]; then
        echo "$(date "+%D|%T") [+] Data from dev zipped (size:$(stat -c %s $name))" >> /var/log/backup.log
    else
        echo "$(date "+%D|%T") [!] Failed to zip data from dev" >> /var/log/backup.log
        exit 1
    fi
else
    echo "$(date "+%D|%T") [!] Failed to fetch data from dev machine" >> /var/log/backup.log
    exit 1
fi

rm -rf youtrack
