// Import
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const pug = require('pug');
const beerController = require('./controllers/beer');
const userController = require('./controllers/user');
const authController = require('./controllers/auth');
const clientController = require('./controllers/client');

mongoose.connect('mongodb://localhost:27017/beerlocker', {useMongoClient: true});

const app = express();
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
// Get port from the environment variables or use 3000 as default
let port = process.env.PORT || 3000;

let router = express.Router();
let beersRoute = router.route('/beers');
let beerRoute = router.route('/beers/:beer_id');
let usersRoute = router.route('/users');
let clientsRoute = router.route('/clients')

router.get('/', function(req, res){
  res.json({message: 'Welcome to the server.'})
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

app.use('/api', router);
app.listen(port);
console.log(`Listening on port: ${port}`);
