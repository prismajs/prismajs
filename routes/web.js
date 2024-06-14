const { Route } = require('prismajs-core');
const HomeController = require('../app/Http/Controllers/HomeController');
const AboutController = require('../app/Http/Controllers/AboutController');
const exampleMiddleware = require('../app/Http/Middlewares/exampleMiddleware');

// Define routes
Route.get('/', HomeController, 'index', 'home.index');
Route.get('/home', HomeController, 'home', 'home');

Route.group((route) => {
  route.middleware(exampleMiddleware)
    .get('/about', AboutController, 'index', 'about.index')
    .get('/user/:id', HomeController, 'user', 'user.show');
});

Route.resource('posts', require('../app/Http/Controllers/PostController'));

// Cache the routes
Route.cacheRoutes();

// Export the router
module.exports = Route.getRouter();
