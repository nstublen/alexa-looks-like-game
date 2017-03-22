#!/bin/bash

nvm use v4.3.2
node data/datagen.js
node-lambda package -p build -n looks-like -e production -f deploy.env -x "alexa data spec test .gitignore build-package.sh"
