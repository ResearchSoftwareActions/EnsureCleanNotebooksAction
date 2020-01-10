const fs = require('fs');

function lint(filename, disabled = []) {

    const json = JSON.parse(fs.readFileSync(filename, 'utf8'));

    let fail_outputs = false;
    let fail_execution_count = false;

    for (let i = 0; i < json.cells.length; ++i) {

        const cell = json.cells[i];

        if (!fail_outputs && !disabled.includes('outputs') && has_key(cell, 'outputs')) {
            if (Array.from(cell['outputs']).length > 0) {
                fail_outputs = true;
            }
        }

        if (!fail_execution_count && !disabled.includes('execution_count') && has_key(cell, 'execution_count')) {
            if (cell['execution_count'] != null) {
                fail_execution_count = true;
            }
        }
    }

    // Warn users about which failures are present in this file
    if (fail_outputs) {
        console.log(`${filename}: nonempty outputs found`);
    }
    if (fail_execution_count) {
        console.log(`${filename}: non-null execution count found`);
    }

    return !(fail_outputs || fail_execution_count);
}

function has_key(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key)
}

module.exports = lint;
