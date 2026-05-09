const app = require('../dist/main.js');

// Vercel expects a default export handler. We export the compiled NestJS handler.
module.exports = app.default || app;
