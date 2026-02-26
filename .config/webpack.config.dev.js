const { blocks } = require('./scripts/blocks');
// const { frontend } = require('./scripts/frontend');
const { form } = require('./scripts/form');
const { dashboard } = require('./scripts/dashboard');
const { integration } = require('./scripts/integration');
const { frontendModular } = require('./scripts/frontend-modular');
const { emailTemplate } = require('./scripts/email-template');

module.exports = [
    blocks,
    // frontend,
    form,
    dashboard,
    frontendModular,
    emailTemplate,
    integration,
];
