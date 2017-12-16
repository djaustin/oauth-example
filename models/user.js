const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

UserSchema.pre('save', function(callback){
  const user = this;

  if(!user.isModified('password')) return callback();

  bcrypt.genSalt(5, function(err, salt){
    if(err) return callback(err);

    bcrypt.hash(user.password, salt, function(err, hash){
      if (err) return callback(err);
      user.password = hash;
      callback();
    });

  });
});

UserSchema.methods.verifyPassword = function(password, callback){
  bcrypt.compare(password, this.password, function(err, match){
    if(err) return callback(err);
    callback(null, match);
  });
}

module.exports = mongoose.model('User', UserSchema);
