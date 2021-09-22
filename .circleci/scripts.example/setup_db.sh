#!/bin/bash
# shellcheck disable=SC1090

echo "Setting up database"

# Install mysql client
sudo apt-get update && sudo apt-get install -y mysql-client

set -e
mysql=( mysql -uroot -h127.0.0.1 )

# Wait for mysql to respond
for _ in {30..0}; do
    if echo 'SELECT 1' | "${mysql[@]}" &> /dev/null; then
        break
    fi
    echo 'MySQL init process in progress...'
    sleep 1
done

# Execute files in .docker/mysql/schema
# Executes .sh, .sql, and .sql.gz files in ASCII order
for f in .docker/mysql/schema/*; do
    echo "$f"
    case "$f" in
        *.sh)     echo "$0: running $f"; . "$f" ;;
        *.sql)    echo "$0: running $f"; "${mysql[@]}" < "$f"; echo ;;
        *.sql.gz) echo "$0: running $f"; gunzip -c "$f" | "${mysql[@]}"; echo ;;
        *)        echo "$0: ignoring $f" ;;
    esac
    echo
done
