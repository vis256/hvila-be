var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Task = mongoose.model('Task');
var auth = require('../auth');


router.get('/list', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    Promise.all([
      Task.find({ author: user })
        .populate('author')
        .sort({dueDate: 1})
        .exec(),
      Task.count({ author: user})
    ]).then(function(results){
      var tasks = results[0];
      var tasksCount = results[1];

      return res.json({
        tasks: tasks.map(function(task){
          return task.toJSONFor(user);
        }),
        tasksCount: tasksCount
      });
    }).catch(next);
  });
});

router.get('/:tag', auth.required, function(req, res, next) {
  console.log("REQUESTTTTTT ", req);
  User.findById(req.payload.id).then(function(user) {
    if (!user) { return res.sendStatus(401); }
    
    Promise.all([
      Task.find({author: user, "tags.name": req.params.tag})
        .populate('author')
        .sort({dueDate: 1})
        .exec()
      ]).then(function(results) {
        var tasks = results[0];
        // console.log("TAGS: ", tasks);
        return res.json({
          tasks: tasks
        });
      });
    }).catch(next);
});

// new task
router.post('/new', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }
    // Room.find({}).sort('-date').exec((err, docs) => { ... });

    var task = new Task();

    task.author = user;
    
    task.title = req.body.title;
    task.body = req.body.body;
    task.dueDate = req.body.date;
    task.tags = req.body.tags;

    return task.save().then(function(){
      return res.json({task: task.toJSONFor(user)});
    });
  }).catch(next);
});

// update
router.put('/:task', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(req.task.author._id.toString() === req.payload.id.toString()){
      if(typeof req.body.article.title !== 'undefined'){
        req.task.title = req.body.task.title;
      }

      if(typeof req.body.task.description !== 'undefined'){
        req.task.description = req.body.task.description;
      }

      if(typeof req.body.task.body !== 'undefined'){
        req.task.body = req.body.task.body;
      }

      if(typeof req.body.task.tagList !== 'undefined'){
        req.task.tagList = req.body.task.tagList
      }

      req.task.save().then(function(article){
        return res.json({task: task.toJSONFor(user)});
      }).catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});


router.delete('/:task', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }
    console.log(req.params);
    Task.remove({
      author: user, _id: req.params.task
    }, function(err, success) {
      if (err) {console.log(err); }
      else {console.log(success); }
    })
    // if(req.task.toString() === req.payload.id.toString()){
    //   return req.task.remove().then(function(){
    //     return res.sendStatus(204);
    //   });
    // } else {
    //   return res.sendStatus(403);
    // }
    return res.sendStatus(204);
  }).catch(next);
});

module.exports = router;

