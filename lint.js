const fs = require('fs');

function lint(filename, disabled = []) {

    const json = JSON.parse(fs.readFileSync(filename, 'utf8'));

    for (let i = 0; i < json.cells.length; ++i) {

        const cell = json.cells[i];
        let fail_this_notebook = false;

        if (!disabled.includes('outputs') && has_key(cell, 'outputs')) {
            if (Array.from(cell['outputs']).length > 0) {
                console.log(`${filename}: nonempty outputs found`);
                fail_this_notebook = true;
            }
        }

        if (!disabled.includes('execution_count') && has_key(cell, 'execution_count')) {
            if (cell['execution_count'] != null) {
                console.log(`${filename}: non-null execution count found`);
                fail_this_notebook = true;
            }
        }

        if (fail_this_notebook) {
            return false;
        }
    }
    return true;
}

function has_key(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key)
}

module.exports = lint;
