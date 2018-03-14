﻿var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var routes = require('./routes/index');

// passport config
var User = require('./models/user');
passport.use(new Strategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// mongoose config
var mongoUri = 'mongodb://mongo/minitwitter';
var mongoOpts = { useMongoClient: true };
mongoose.Promise = global.Promise;
mongoose.connect(mongoUri, mongoOpts, function (err) {
  console.log('First connect to mongodb failed');
  setTimeout(function () {
    console.log('Retrying connect to mongodb...');
    mongoose.connect(mongoUri, mongoOpts)
  }, 5 * 1000)
});

// create new express application
var app = express();

// setup common application middleware (logging, parsing, sessions)
app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  store: new RedisStore({ host: 'redis', port: 6379 }),
  secret: '9eL;{22FK>NQnd',
  resave: false,
  saveUninitialized: false
}));

//store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl :  260}),

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// health check endpoint
app.get('/health', function(req, res) {
    res.send('Healthy\n');
});

app.use('/api', routes);

var server = app.listen(3000, function () {
  console.log('server listening on %d', server.address().port)
})

// catch signals and handle shutdown gracefully
process.on('SIGINT', function () {
  console.info('Got SIGINT. Graceful shutdown ', new Date().toISOString());
  shutdown();
})

process.on('SIGTERM', function () {
  console.info('Got SIGTERM. Graceful shutdown ', new Date().toISOString());
  shutdown();
})

function shutdown() {
  server.close(function (err) {
    if (err) {
      console.error(err);
      process.exitCode = 1;
    }
    process.exit();
  })
}
