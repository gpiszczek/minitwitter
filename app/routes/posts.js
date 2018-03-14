var express = require('express')
var router  = express.Router()

var Post = require('../models/post')

router.get('/', function (req, res, next) {
  Post.find()
  .sort('-date')
  .exec(function (err, posts) {
    if (err) { return next(err) }
    res.json(posts)
  })
})

router.post('/', function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      err: 'Must be authenticated to post new messages'
    });
  }
  if (req.body.body == null) {
    return next()
  }
  var post = new Post({
    username: req.user.username,
    body:     req.body.body,
  })
  post.save(function (err, post) {
    if (err) { return next(err) }
    res.status(201).json(post)
  })
})

module.exports = router
