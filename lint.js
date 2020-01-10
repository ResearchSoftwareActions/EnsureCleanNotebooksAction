const fs = require('fs');

function lint(filename, options = []) {
    let n = JSON.parse(fs.readFileSync(filename));
    for (var i in n.cells) {
        if (!options.includes('outputs') && n.cells[i].output) {
            console.log(`${filename}: output found`);
            return false;
        }
        if (!options.includes('execution-counts') && n.cells[i].execution_count != null) {
            console.log(`${filename}: execution count found`);
            return false;
        }
    }
    return true;
}

module.exports = lint;
