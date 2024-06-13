const { Route } = require('prismajs-core');
const ApiController = require('../app/Http/Controllers/ApiController');

// Define routes
Route.get('/hello', ApiController, 'hello', 'api.hello');

// Export the router
module.exports = Route.getRouter();
