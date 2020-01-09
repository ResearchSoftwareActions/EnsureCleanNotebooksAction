const fs = require('fs');

function lint(filename) {
    let n = JSON.parse(fs.readFileSync(filename));
    for (var i in n.cells) {
        if (n.cells[i].hasOwnProperty('output')) {
            return false;
        }
        if (n.cells[i].execution_count != null) {
            return false;
        }
    }
    return true;
}
