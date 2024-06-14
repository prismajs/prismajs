class HomeController {
  // index(req, res) {
  //   res.render('home', { title: 'PrismaJS Framework' });
  // }
  async index(req, res) {
    await res.inertia('HomePage', { message: 'Hello from Inertia.js' });
  }

  async home(req, res) {
    await res.inertia('TestPage', { message: 'Hello from Test Page' });
  }

  user(req, res) {
    res.render('user', { title: 'User Profile', userId: req.params.id });
  }
}

module.exports = HomeController;
