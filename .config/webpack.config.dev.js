const { blocks } = require('./scripts/blocks');
const { frontend } = require('./scripts/frontend');
const { form } = require('./scripts/form');
const { dashboard } = require('./scripts/dashboard');

module.exports = [
    blocks,
    frontend,
    form,
    dashboard
];
