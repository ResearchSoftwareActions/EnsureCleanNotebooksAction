#!/bin/sh
npm run package
git add dist/index.js
git commit dist/index.js -m rebuild
git push
git checkout master
git merge dev
git push
