const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const webRoutes = require('./routes/web');
const apiRoutes = require('./routes/api');
const route = require('prismajs-core').route;
const exampleMiddleware = require('./app/Http/Middlewares/exampleMiddleware');
const Route = require('prismajs-core').Route;
const inertiaAdapter = require('./app/Http/Middlewares/inertiaAdapter');
const { webpack } = require('./plugins/helpers/webpackHelper');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'resources/views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.route = route;
  res.locals.webpack = webpack;
  next();
});

app.use(exampleMiddleware);
app.use(inertiaAdapter);

app.use('/', webRoutes);
app.use('/api', apiRoutes);


app.listen(port, () => {
  console.log(`Server running at ${process.env.APP_URL} on port ${port}`);
});
