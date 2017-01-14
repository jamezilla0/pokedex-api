#!/bin/sh
set -e

# If the first argument is start or empty, execute the default script
if [ "$1" = 'start' ] || [ -z "$1" ]; then
    exec /usr/sbin/nginx -c /etc/nginx/nginx.conf
else
    # Otherwise pass the arguments to sh
    exec $@
fi