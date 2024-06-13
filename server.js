const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const webRoutes = require('./routes/web');
const apiRoutes = require('./routes/api');
const route  = require('prismajs-core').route;
const exampleMiddleware = require('./app/Http/Middlewares/exampleMiddleware');
const Route = require('prismajs-core').Route;

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'resources/views'));

// Make the route function available in EJS templates
app.use((req, res, next) => {
  res.locals.route = route;
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Use example middleware
app.use(exampleMiddleware);

// Load cached routes if available
Route.loadCachedRoutes();

app.use('/', webRoutes);
app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Server running at ${process.env.APP_URL} on port ${port}`);
});
