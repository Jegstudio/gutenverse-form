const { blocks } = require('./scripts/blocks');
// const { frontend } = require('./scripts/frontend');
const { form } = require('./scripts/form');
const { dashboard } = require('./scripts/dashboard');
const { frontendModular } = require('./scripts/frontend-modular');

module.exports = [
    blocks,
    // frontend,
    form,
    dashboard,
    frontendModular
];
