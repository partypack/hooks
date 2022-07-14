const { run, silent } = require('./index');

run('yarn run tsc -p tsconfig.json --emitDeclarationOnly');
silent('yarn run tscpaths -p tsconfig.json -s lib -o dist');
run('yarn run rollup -c');
