#!/bin/bash

set -e

cd /app

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
