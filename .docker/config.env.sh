#!/bin/bash

if ! lsof -n -i:80 | grep LISTEN
then
    export APP_PORT=80
else
    export APP_PORT=5080
fi

export APP_PORT_SSL=443

if [ -z "${APP_PATH}" ]
then
    export APP_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/../" && pwd)/"
fi

if [ -z "${APP_DATA_PATH}" ]
then
    export APP_DATA_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/data/"
fi