const lint = require('../lint');

test('unclean file', async() => {
    await expect(lint('./test/notebooks/fib.ipynb')).toBe(false);
});

test('clean file', async() => {
    await expect(lint('./test/notebooks/fib_clean.ipynb')).toBe(true);
});

