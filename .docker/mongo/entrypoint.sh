#!/bin/sh
set -e

# If the first argument is start or empty, execute the default script
if [ "$1" = 'start' ] || [ -z "$1" ]; then
    exec /usr/bin/mongod --config /etc/mongo.conf
else
    # Otherwise pass the arguments to sh
    exec $@
fi
