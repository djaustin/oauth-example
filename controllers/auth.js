const passport = require('passport');
const passportHttp = require('passport-http');
const BasicStrategy = passportHttp.BasicStrategy;
const User = require('../models/user');

passport.use(new BasicStrategy(
  function(username, password, callback){
    User.findOne({username: username}, function(err, user){
      if(err) return callback(err);
      if(!user) return callback(null, false);

      user.verifyPassword(password, function(err, match){
        if(err) return callback(err);
        if(match){
          return callback(null, user);
        } else {
          return callback(null, false);
        }
      })
    })
  }
))

exports.isAuthenticated = passport.authenticate('basic', {session: false});
