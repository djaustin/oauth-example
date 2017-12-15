// Import
const express = require('express');

const app = express();

// Get port from the environment variables or use 3000 as default
let port = process.env.PORT || 3000;

let router = express.Router();

router.get('/', function(req, res){
  res.json({message: 'Welcome to the server.'})
});

app.use('/api', router);

app.listen(port);
console.log(`Listening on port: ${port}`);
