#!/usr/bin/env bash

ENVFILE=/etc/environment;
echo "" > $ENVFILE;
echo "export USERNAME='$USERNAME'" >> $ENVFILE;
echo "export PASSWORD='$PASSWORD'" >> $ENVFILE;
