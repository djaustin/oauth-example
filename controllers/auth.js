const passport = require('passport');
const passportHttp = require('passport-http');
const passportBearer = require('passport-http-bearer');
const BearerStrategy = passportBearer.Strategy;
const BasicStrategy = passportHttp.BasicStrategy;
const User = require('../models/user');
const Client = require('../models/client');
const Token = require('../models/token');

// Locks down user endpoints
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
      });
    });
  }
));

// Locks down token exchange endpoints
passport.use('client-basic', new BasicStrategy(
  function(id, secret, callback){
    Client.findOne({id: id}, function(err, client){
      if(err) return callback(err);

      if(!client || (client.secret !== secret)){
        return callback(null, false);
      } else {
        return callback(null, client);
      }
    });
  }
));

// Allow authentication of requests made by applications on behalf of users
passport.use(new BearerStrategy(
  function(accessToken, callback){
    Token.findOne({value: accessToken}, function(err, token){
      if(err) return callback(err);
      if(!token){
        return callback(null, false);
      } else {
        User.findOne({_id: token.userId}, function(err, user){
          if(err) return callback(err);

          if(!user){
            return callback(null, false);
          } else {
            // Simple example. No Scope.
            return callback(null, user, {scope: '*'});
          }
        });
      }
    });
  }
));

exports.isAuthenticated = passport.authenticate(['basic', 'bearer'], {session: false});
exports.isClientAuthenticated = passport.authenticate('client-basic', {session: false});
exports.isBearerAuthenticated = passport.authenticate('bearer', {session: false});
