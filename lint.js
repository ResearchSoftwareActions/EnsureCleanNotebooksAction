const fs = require('fs');

function lint(filename, options = {}) {
    let n = JSON.parse(fs.readFileSync(filename));
    for (var i in n.cells) {
        if (options.output && n.cells[i].hasOwnProperty('output')) {
            return false;
        }
        if (options.execution_count && n.cells[i].execution_count != null) {
            return false;
        }
    }
    return true;
}
