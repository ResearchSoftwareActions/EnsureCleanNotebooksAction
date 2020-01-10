const lint = require('../lint');

// Testing an unclean file with no tests disabled should return false
test('unclean file', async () => {
    await expect(lint('./test/notebooks/fib_dirty.ipynb')).toBe(false);
});

// Testing a clean file should always return true
test('clean file', async () => {
    await expect(lint('./test/notebooks/fib_clean.ipynb')).toBe(true);
});

// Testing an unclean file with all all tests disabled should return true
test('dirty file with tests disabled', async () => {
    await expect(lint('./test/notebooks/fib_dirty.ipynb', ['outputs', 'execution_count'])).toBe(true);
});

// Testing a file with unclean outputs, with and without `outputs` disabled
test('dirty outputs with tests enabled', async () => {
    await expect(lint('./test/notebooks/fib_dirty_outputs.ipynb')).toBe(false);
});
test('dirty outputs with tests disabled', async () => {
    await expect(lint('./test/notebooks/fib_dirty_outputs.ipynb', ['outputs'])).toBe(true);
});

// Testing a file with unclean execution counts, with and without `execution_count` disabled
test('dirty execution counts with tests enabled', async () => {
    await expect(lint('./test/notebooks/fib_dirty_execution_count.ipynb')).toBe(false);
});
test('dirty execution counts with tests disabled', async () => {
    await expect(lint('./test/notebooks/fib_dirty_execution_count.ipynb', ['execution_count'])).toBe(true);
});
