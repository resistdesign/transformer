var path = require('path');

require('babel-core/register')({
    stage: 0,
    only: [
        path.resolve(process.cwd(), 'src'),
        path.resolve(process.cwd(), 'test'),
        path.resolve(process.cwd(), 'example')
    ]
});
module.exports = require('./src/object-transformer');