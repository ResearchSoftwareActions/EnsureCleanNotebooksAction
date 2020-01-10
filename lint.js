const fs = require('fs');

function lint(filename, disabled= []) {
    let n = JSON.parse(fs.readFileSync(filename));

    for (let i in n.cells) {
        const cell = n.cells[i];

        if (!disabled.includes('outputs') && Array.from(cell.outputs).length > 0) {
            console.log(`${filename}: nonempty outputs found`);
            return false;
        }
        if (!disabled.includes('execution-counts') && cell.execution_count != null) {
            console.log(`${filename}: execution count found`);
            return false;
        }
    }
    return true;
}

module.exports = lint;
