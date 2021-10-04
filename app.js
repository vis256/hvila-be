var http = require('http'),
    path = require('path'),
    methods = require('methods'),
    express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    cors = require('cors'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    errorhandler = require('errorhandler'),
    mongoose = require('mongoose');
    
var isProduction = process.env.NODE_ENV === 'production';

var app = express();
app.use(cors());

app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));


app.use(session({ secret: 'hvila', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));


if (!isProduction) {
  app.use(errorhandler());
}

if(isProduction){
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect('mongodb://localhost/hvila');
  mongoose.set('debug', true);
}

require('./models/User');
require('./models/Task');

var User = mongoose.model('User');

app.use(require('./routes'));

app.use(passport.initialize());
app.use(passport.session());

// passport.use('local', new LocalStrategy(
// function(username, password, done) {
//   console.log('credentials passed to passport ' + username + ' ' + password);
//   User.findOne({username: username}).then(function(err, user){
//     console.log("found");
//     if(!user.validPassword(password)){
//       return done(null, false, {errors: {'username or password': 'is invalid'}});
//     }
//     return done(null, user);
//   }).catch(done);
// }));
passport.use('local', new LocalStrategy(
function(username, password, done) {
  console.log('credentials passed to passport ' + username + ' ' + password);
  User.findOne({username: username}, function(err, user){
    if (err) {
      console.log('error! = ', err);
      return done(err);
    }
    if (!user) { 
      console.log('Incorrect username');
      return done(null, false, {message: 'Incorrect username.'}); 
    }
    if(!user.validPassword(password)){
      console.log('Incorrect password');
      return done(null, false, {message: 'Incorrect password.'});
    }
    return done(null, user);
  });
}
));


app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});app

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});


var server = app.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});
