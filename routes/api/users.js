var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

router.get('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

router.get('/tags', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user) {
    if (!user) {return res.sendStatus(401); }
    
    return res.json({tags: user.getTags()});
  }).catch(next);
});

router.post('/tag', auth.required, function(req, res, next) {
    if(!req.body.tagName){
      return res.status(422).json({errors: {tagName: "can't be blank"}});
    }
    
    if(!req.body.tagIcon){
      return res.status(422).json({errors: {tagIcon: "can't be blank"}});
    }
    console.log("SDXFCSAFWESF", req);
    User.findOneAndUpdate(
      { _id: req.payload.id }, 
      { $push: {tags: {name: req.body.tagName, icon: req.body.tagIcon} } },
      function (err, success) {
        if (err) {console.log(err); }
        else {console.log(success); }
      }
    );

});

router.put('/user', function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    // only update fields that were actually passed...
    if(typeof req.body.user.username !== 'undefined'){
      user.username = req.body.user.username;
    }
    if(typeof req.body.user.password !== 'undefined'){
      user.setPassword(req.body.user.password);
    }

    return user.save().then(function(){
      return res.json({user: user.toAuthJSON()});
    });
  }).catch(next);
});

router.post('/login', function(req, res, next){
  console.log(req);
  if(!req.body.username){
    return res.status(422).json({errors: {username: "can't be blank"}});
  }

  if(!req.body.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }
  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      console.log('Logging in');
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.post('/register', function(req, res, next){
  console.log(req.body);
  var user = new User();

  user.username = req.body.username;
  user.setPassword(req.body.password);

  user.save().then(function(){
    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

module.exports = router;
