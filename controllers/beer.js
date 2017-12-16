const Beer = require('../models/beer');

exports.postBeer = function(req, res){
 var beer = new Beer();
 beer.name = req.body.name;
 beer.type = req.body.type;
 beer.quantity = req.body.quantity;
 beer.userId = req.user._id;
 beer.save(function(err){
   if(err){
     res.send(err);
   } else {
     res.json({message: 'Beer added to the locker!', data: beer})
   }
 });
};

exports.getBeers = function(req, res){
  Beer.find({userId: req.user._id }, function(err, beers){
    if (err){
      res.send(err);
    } else {
      res.json(beers);
    }
  });
};

exports.getBeer = function(req, res){
  Beer.find({userId: req.user._id, _id: req.params.beer_id}, function(err, beer){
    if (err){
      res.send(err);
    } else {
      res.json(beer);
    }
  });
};

exports.putBeer = function(req, res){
  Beer.findOneAndUpdate({userId: req.user._id, _id: req.params.beer_id}, {quantity: req.body.quantity}, {new: true}, function(err, beer){
    if(err){
      res.send(err);
    } else {
      res.json(beer);
    }
  });
}

exports.deleteBeer = function(req, res){
  Beer.remove({userId: req.user._id, _id: req.params.beer_id}, function(err, beer){
    if(beer){
      res.json({message: 'Beer removed from locker successfully', data: beer});
    } else {
      res.json({message: 'Beer not found'});
    }
  });
};
