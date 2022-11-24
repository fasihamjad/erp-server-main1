#!/bin/bash
set -e
chown -R ec2-user:ec2-user /usr/src/app/
runuser -l ec2-user -c 'cd /usr/src/app && npm ci'
runuser -l ec2-user -c 'pm2 restart all'
