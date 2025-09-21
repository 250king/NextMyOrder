#!/bin/sh

set -e
APP=$1

if [ -z "$APP" ]; then
  echo "No application specified. Please provide the application directory as an argument."
  exit 1
fi

if [ ! -d "$APP" ]; then
  echo "Application directory $APP does not exist."
  exit 1
fi

echo "Starting application in $APP"
node "$APP/server.js"
