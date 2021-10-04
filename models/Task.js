var mongoose = require('mongoose');
var User = mongoose.model('User');

var TagSchema = new mongoose.Schema({
  name: String,
  icon: String
});

var TaskSchema = new mongoose.Schema({
  title: String,
  body: String,
  dueDate: Date,
  tags: [TagSchema],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {timestamps: true});

TaskSchema.methods.toJSONFor = function(user){
  return {
    id: this._id,
    title: this.title,
    body: this.body,
    dueDate: this.dueDate,
    tags: this.tags,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    author: this.author.toProfileJSONFor(user)
  };
};

module.exports = mongoose.model('Task', TaskSchema);



