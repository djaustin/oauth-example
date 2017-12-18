// Import
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const pug = require('pug');
const session = require('express-session');
const beerController = require('./controllers/beer');
const userController = require('./controllers/user');
const authController = require('./controllers/auth');
const clientController = require('./controllers/client');
const oauth2Controller = require('./controllers/oauth2');

mongoose.connect('mongodb://localhost:27017/beerlocker', {useMongoClient: true});

const app = express();
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
// NOTE: Research the options provided for this session middleware. This only stores session data in memory and is not suitable for production
app.use(session({
  secret: 'secretsessionkey', //NOTE: Find a better way to do this
  resave: true,
  saveUninitialized: true
}))
// Get port from the environment variables or use 3000 as default
let port = process.env.PORT || 3000;

const router = express.Router();
const beersRoute = router.route('/beers');
const beerRoute = router.route('/beers/:beer_id');
const usersRoute = router.route('/users');
const clientsRoute = router.route('/clients');
const oauthAuthRoute = router.route('/oauth2/authorize');
const oauthTokenRoute = router.route('/oauth2/token');

router.get('/', function(req, res){
  res.json({message: 'Welcome to the beer locker'});
});

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

app.use('/api', router);
app.listen(port);
console.log(`Listening on port: ${port}`);
