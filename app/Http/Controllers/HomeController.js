class HomeController {
  index(req, res) {
    res.render('home', { title: 'PrismaJS Framework' });
  }

  user(req, res) {
    res.render('user', { title: 'User Profile', userId: req.params.id });
  }
}

module.exports = HomeController;
