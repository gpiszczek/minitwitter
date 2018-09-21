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

// external services configuration
// mongodb
const mongoHost = process.env.MINITWITTER_MONGO_HOST || 'mongo';
const mongoPort = process.env.MINITWITTER_MONGO_PORT || 27017;
const mongoDb = process.env.MINITWITTER_MONGO_DB || 'minitwitter';
const mongoUser = process.env.MINITWITTER_MONGO_USER;
const mongoPass = process.env.MINITWITTER_MONGO_PASS;
// redis
const redisHost = process.env.MINITWITTER_REDIS_HOST || 'redis';
const redisPort = process.env.MINITWITTER_REDIS_PORT || 6379;
const redisPass = process.env.MINITWITTER_REDIS_PASS;

// session secret
const sessSecret = process.env.MINITWITTER_SESSION_SECRET;

console.log(new Date().toISOString(), 'MiniTwitter v0.003');

// configure passport
var User = require('./models/user');
passport.use(new Strategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// connect to mongodb
var mongoUri = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + mongoDb;
var mongoOpts = { useMongoClient: true };
if (mongoPass) {
    mongoOpts.user = mongoUser;
    mongoOpts.pass = mongoPass;
}
mongoose.Promise = global.Promise;
console.log(new Date().toISOString(), 'Connecting to mongodb at', mongoUri);
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
var redisUri = 'redis://' + redisHost + ':' + redisPort + '/' + 0;
var redisOpts = { host: redisHost, port: redisPort, logErrors: true };
if (redisPass) {
    redisOpts.pass = redisPass;
}
console.log(new Date().toISOString(), 'Connecting to redis at', redisUri);
redisStore = new RedisStore(redisOpts);
app.use(session({
  store: redisStore,
  secret: sessSecret,
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
  console.log(new Date().toISOString(), 'Server listening on port', server.address().port)
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
