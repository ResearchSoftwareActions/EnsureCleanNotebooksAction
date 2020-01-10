//const core = require('@actions/core');
//const github = require('@actions/github');
const walk = require('walk');
const path = require('path');
const lint = require('./lint');

var walker = walk.walk(".", {followLinks: false, filters: ["node_modules"]});
var results = [];
walker.on("file", function (root, fileStats, next) {
  if (path.extname(fileStats.name) == '.ipynb') {
      results.push(lint(path.join(root, fileStats.name)));
  }
  next();
});
walker.on("end", function() {
    console.log(results);
    if(!results.every(i => i)) {
        process.exit(1);
    }
});

