var path = require('path');

require('babel-core/register')({
    stage: 0,
    only: [
        path.resolve(process.cwd(), 'index.js'),
        path.resolve(process.cwd(), 'test'),
        path.resolve(process.cwd(), 'example')
    ]
});
require('./transformer.spec');