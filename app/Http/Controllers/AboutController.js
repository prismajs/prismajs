class AboutController {
  index(req, res) {
    res.render('about', { title: 'About PrismaJS Framework' });
  }
}

module.exports = AboutController;
