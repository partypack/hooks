const { run, silent } = require('./index');

run('pnpm tsc -p tsconfig.json --emitDeclarationOnly');
silent('pnpm tscpaths -p tsconfig.json -s lib -o dist');
run('pnpm rollup -c');
