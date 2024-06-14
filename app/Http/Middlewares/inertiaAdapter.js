require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react'],
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  ignore: [/node_modules/]
});

const React = require('react');
const { renderToString } = require('react-dom/server');
const { createInertiaApp } = require('@inertiajs/inertia-react');
const path = require('path');

const inertiaAdapter = (req, res, next) => {
  console.log("Inertia middleware executed"); // Debugging line

  res.inertia = async (component, props = {}) => {
    const page = {
      component,
      props,
      url: req.originalUrl,
      version: null,
    };

    console.log("Inertia Page Object:", page); // Debugging line

    try {
      const appHtml = await createInertiaApp({
        page,
        render: renderToString,
        resolve: (name) => {
          console.log("Resolving component on server:", name); // Debugging line
          const componentPath = path.resolve(__dirname, `../../../resources/js/pages/${name}`);
          return require(componentPath).default;
        },
        setup: ({ App, props }) => {
          return React.createElement(App, props);
        },
      });

      res.render('index', {
        title: 'PrismaJS Framework',
        appHtml,
        page: JSON.stringify(page),
      });
    } catch (err) {
      console.error("Error during Inertia rendering:", err); // Debugging line
      res.status(500).send("Internal Server Error");
    }
  };

  next();
};

module.exports = inertiaAdapter;
