// Import
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const beerController = require('./controllers/beer');
const userController = require('./controllers/user');
const authController = require('./controllers/auth');
mongoose.connect('mongodb://localhost:27017/beerlocker', {useMongoClient: true});

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
// Get port from the environment variables or use 3000 as default
let port = process.env.PORT || 3000;

let router = express.Router();
let beersRoute = router.route('/beers');
let beerRoute = router.route('/beers/:beer_id');


router.get('/', function(req, res){
  res.json({message: 'Welcome to the server.'})
});



beersRoute.post(authController.isAuthenticated, beerController.postBeer);

beersRoute.get(authController.isAuthenticated, beerController.getBeers);

beerRoute.get(authController.isAuthenticated, beerController.getBeer);

beerRoute.put(authController.isAuthenticated, beerController.putBeer);

beerRoute.delete(authController.isAuthenticated, beerController.deleteBeer);


router.route('/users')
  .post(userController.postUser)
  .get(authController.isAuthenticated, userController.getUsers);
app.use('/api', router);

app.listen(port);
console.log(`Listening on port: ${port}`);
