const oauth2orize = require('oauth2orize');
const User = require('../models/user');
const Client = require('../models/client');
const Token = require('../models/token');
const Code = require('../models/code');
const uid = require('uid2');
const server = oauth2orize.createServer();

server.serializeClient(function(client, callback){
  return callback(null, client._id);
});

server.deserializeClient(function(id, callback){
  Client.findOne({_id: id}, function(err, client){
    if(err){
      return callback(err);
    } else {
      return callback(null, client);
    }

  });
});

// NOTE: oauth2orize.grant.code specifies that we are granting an authorization code as opposed to implicit, exchange, or username/password
server.grant(oauth2orize.grant.code(function(client, redirectUri, user, ares, callback){
  // Create a new Code object from mongoose model
  const code = new Code({
    value: uid(16),
    clientId: client._id,
    redirectUri: redirectUri,
    userId: user._id
  });

  // Save the code object and return the code to the callback
  code.save(function(err){
    if(err){
      return callback(err);
    } else {
      callback(null, code.value);
    }
  });
}));

server.exchange(oauth2orize.exchange.code(function(client, code, redirectUri, callback){
  Code.findOne({value: code}, function(err, authCode){
    // Return error if error occurred while trying to find the code
    if(err) return callback(err);
    // If no code matching that value is found.
    if(authCode === undefined) return callback(null, false);
    // If the code is for a different client then return false in callback to represent invalid auth code
    if(client._id.toString() !== authCode.clientId) return callback(null, false);
    // If redirect URI is different, report invalid auth code
    if(redirectUri !== authCode.redirectUri) return callback(null, false);

    // Remove authCode now that it is used
    authCode.remove(function(err){
      if(err){
        return callback(err);
      } else {
        // Create a new access token
        const token = new Token({
          value: uid(256),
          clientId: authCode.clientId,
          userId: authCode.userId
        });

        // Save token to database. Return access token to the callback
        token.save(function(err){
          if(err) {
            return callback(err);
          } else {
            callback(null, token);
          }
        });
      }
    });
  });
}));

// Endpoint to initialise new authorization transactions
exports.authorization = [
  // The function argument here is used to get a client instance for the clientid making the request
  server.authorization(function(clientId, redirectUri, callback){
    Client.findOne({id: clientId}, function(err, client){
      if(err) return callback(err);
      return callback(null, client, redirectUri);
    });
  }),
  function(req, res){
    res.render('dialog', {transactionId: req.oauth2.transactionID, user: req.user, client: req.oauth2.client});
  }
];

// Endpoint to handle when the user grants or denies access to their account to the requesting application client
exports.decision = [
  // This handles data submitted in the POST request sent after the user accepts or denies access to their account.
  // If the user grants access, this calls the server.grant function created above if the user grants access
  server.decision()
];

// Endpoint to handle the request made by the application client after they have been granted an authorization code by the user.
exports.token = [
  // Will initiate a call to server.exchange()
  server.token(),
  server.errorHandler()
];
