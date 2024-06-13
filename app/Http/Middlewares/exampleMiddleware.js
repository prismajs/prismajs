const exampleMiddleware = (req, res, next) => {
  console.log('Middleware executed');
  next();
};

module.exports = exampleMiddleware;
