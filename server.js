// Web framework
const express = require('express');

// mongodb interface
const mongoose = require('mongoose');

// Allows body of HTTP request to be parsed and added to req.params
const bodyParser = require('body-parser');

// Authentication framework that provides user and client basic authentication as well as client bearer authentication
const passport = require('passport');

// HTML templating system
const pug = require('pug');

// Provides sessions for use in OAuth2 exchange where multiple requests are requried to get the access token
const session = require('express-session');

// Import controllers that contain functions called to deal with requests made to these resources
const beerController = require('./controllers/beer');
const userController = require('./controllers/user');
const authController = require('./controllers/auth');
const clientController = require('./controllers/client');
const oauth2Controller = require('./controllers/oauth2');

// Connect to the mongodb instance storing the data for our app
// NOTE: Make sure that database uses authentication and use that here
mongoose.connect('mongodb://db:27017/beerlocker', {useMongoClient: true});

const app = express();

// View engine is used to render template files. Here we use puh.
app.set('view engine', 'pug');

// Extract any urlencoded body parameters from all requests and put them in req.params
app.use(bodyParser.urlencoded({extended: true}));

// passport.initialize returns the middleware used for all requests
app.use(passport.initialize());

// NOTE: Research the options provided for this session middleware. This only stores session data in memory and is not suitable for production
app.use(session({
  secret: 'secretsessionkey', //NOTE: Find a better way to do this
  resave: true,
  saveUninitialized: true
}));

// Get port from the environment variables or use 3000 as default
let port = process.env.PORT || 3000;

// Router provides a subtree of routes that can be added on to an endpoint.
// These will all be added to <hostname>/api/ (eg. <hostname>/api/beers)
const router = express.Router();
const beersRoute = router.route('/beers');
const beerRoute = router.route('/beers/:beer_id');
const usersRoute = router.route('/users');
const clientsRoute = router.route('/clients');
const oauthAuthRoute = router.route('/oauth2/authorize');
const oauthTokenRoute = router.route('/oauth2/token');

// Generic response on /api/
router.get('/', function(req, res){
  res.json({message: 'Welcome to the beer locker'});
});

// These routes require authentication before control is passed to the controllers
beersRoute
  .post(authController.isAuthenticated, beerController.postBeer)
  .get(authController.isAuthenticated, beerController.getBeers);

beerRoute
  .get(authController.isAuthenticated, beerController.getBeer)
  .put(authController.isAuthenticated, beerController.putBeer)
  .delete(authController.isAuthenticated, beerController.deleteBeer);

usersRoute
  .post(userController.postUser)
  .get(authController.isAuthenticated, userController.getUsers);

clientsRoute
  .post(authController.isAuthenticated, clientController.postClient)
  .get(authController.isAuthenticated, clientController.getClients);

oauthAuthRoute
  .get(authController.isAuthenticated, oauth2Controller.authorization)
  .post(authController.isAuthenticated, oauth2Controller.decision);

oauthTokenRoute
  .post(authController.isClientAuthenticated, oauth2Controller.token);

// Mount the router on the /api/ endpoint
app.use('/api', router);

app.listen(port);
console.log(`Listening on port: ${port}`);
