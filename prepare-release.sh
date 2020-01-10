#!/bin/sh
npm run package
git commit dist/index.js -m rebuild
git push
git checkout master
git merge dev
