// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
// var mongoose = require('mongoose');
// var User = mongoose.model('User');

// passport.use('local', new LocalStrategy( function(email, password, done) {
//   User.findOne({email: email}).then(function(user){
//     if(!user || !user.validPassword(password)){
//       return done(null, false, {errors: {'email or password': 'is invalid'}});
//     }

//     return done(null, user);
//   }).catch(done);
// }));


