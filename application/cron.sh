#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
cd $DIR;
ENVFILE="/etc/environment";
if [ -f $ENVFILE ]; then
    echo "Loading environment";
    source $ENVFILE;
fi
echo "Running task"
timeout -s KILL 5m yarn run testcafe chromium:headless src/top.ts
