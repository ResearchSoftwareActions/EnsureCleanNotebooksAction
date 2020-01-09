const fs = require('fs');

function lint(filename, options = []) {
    let n = JSON.parse(fs.readFileSync(filename));
    for (var i in n.cells) {
        if (!options.includes('--disable-cells') && n.cells[i].output) {
            return false;
        }
        if (!options.includes('--disable-counts') && n.cells[i].execution_count != null) {
            return false;
        }
    }
    return true;
}

module.exports = lint;
