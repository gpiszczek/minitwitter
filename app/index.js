var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var routes = require('./routes/index');

// configure passport
var User = require('./models/user');
passport.use(new Strategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// connect to mongodb
var mongoUri = 'mongodb://mongo/minitwitter';
var mongoOpts = { useMongoClient: true };
mongoose.Promise = global.Promise;
mongoose.connect(mongoUri, mongoOpts, function (err) {
  if (err) {
    console.log(new Date().toISOString(), 'Connection to mongodb failed, retrying...');
    setTimeout(function () {
      mongoose.connect(mongoUri, mongoOpts, function (err) {
        if (err) {
          console.log(new Date().toISOString(), 'Connection to mongodb failed');
          process.exit(1);
        } else {
          console.log(new Date().toISOString(), 'Connection to mongodb established');
        }
      })
    }, 10 * 1000)
  } else {
    console.log(new Date().toISOString(), 'Connection to mongodb established');
  }  
}).catch(() => {});

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

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// health check endpoint
app.get('/health', function(req, res) {
    res.send('Healthy\n');
});

// setup api endpoints
app.use('/api', routes);

// start serving requests
var server = app.listen(3000, function () {
  console.log(new Date().toISOString(), 'Server listening on port ', server.address().port)
})

// catch signals and handle shutdown gracefully
process.on('SIGINT', function () {
  console.info(new Date().toISOString(), 'Got SIGINT. Graceful shutdown');
  shutdown();
})
process.on('SIGTERM', function () {
  console.info(new Date().toISOString(), 'Got SIGTERM. Graceful shutdown');
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
