class PostController {
  index(req, res) {
    res.render('posts/index', { title: 'All Posts' });
  }

  create(req, res) {
    res.render('posts/create', { title: 'Create Post' });
  }

  store(req, res) {
    // Store post logic
    res.redirect('/posts');
  }

  show(req, res) {
    res.render('posts/show', { title: 'Show Post', postId: req.params.id });
  }

  edit(req, res) {
    res.render('posts/edit', { title: 'Edit Post', postId: req.params.id });
  }

  update(req, res) {
    // Update post logic
    res.redirect(`/posts/${req.params.id}`);
  }

  destroy(req, res) {
    // Destroy post logic
    res.redirect('/posts');
  }
}

module.exports = PostController;
