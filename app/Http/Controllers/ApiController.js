class ApiController {
  hello(req, res) {
    res.json({ message: 'Hello from the API' });
  }
}

module.exports = ApiController;
