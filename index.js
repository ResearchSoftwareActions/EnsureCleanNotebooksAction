const core = require('@actions/core');
//const github = require('@actions/github');
const walk = require('walk');
const path = require('path');
const lint = require('./lint');

const disableChecks = core.getInput('disable-checks', { required: false });
var lintOptions = [];
if (disableChecks) {
    lintOptions = disableChecks.split(',');
}

var walker = walk.walk(".", {followLinks: false, filters: ["node_modules"]});
var results = [];
walker.on("file", function (root, fileStats, next) {
  if (path.extname(fileStats.name) == '.ipynb') {
      results.push(lint(path.join(root, fileStats.name), lintOptions));
  }
  next();
});
walker.on("end", function() {
    console.log(results);
    if(!results.every(i => i)) {
          core.setFailed('Lint failed');
    }
});

