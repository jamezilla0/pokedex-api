#!/usr/bin/env bash
set -e

echo "Starting node application in ${NODE_PATH}..."
cd ${NODE_PATH}

if [ ! -d "node_modules" ]
then
    npm install
    if [ "install" = "${1}" ]
    then
        exit 0
    fi
fi

case "$1" in
   "install") npm install
   ;;
   "start") npm start
   ;;
   "") npm start
   ;;
   *) exec $@
   ;;
esac
