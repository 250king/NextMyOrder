#!/bin/sh

set -e
APP=$1

if [ -z "$APP" ]; then
  echo "No application specified. Usage: ./start.sh <application>"
  exit 1
fi

if [ ! -d "$APP" ]; then
  echo "Application directory $APP does not exist."
  exit 1
fi

echo "Starting application in $APP"
node "$APP/server.js"
