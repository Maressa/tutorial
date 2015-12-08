var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'), //mongo connection
  bodyParser = require('body-parser'), //parses information from POST
  methodOverrride = require('method-override'); //used to manipulate POST

router.use(bodyParser.urlencoded({
  extended: true
}))
router.use(methodOverrride(function(req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    //look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

/* GET users listing. */
router.get('/', function(req, res, next) {
  mongoose.model('User').find({}, function(err, users) {
    if (err) {
      return console.error(err);
    } else {
      //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the request header
      res.format({
        //HTML response will render the index.jade file in the vie ws/blobs folder. We are also setting "blobs" to be an accessible variable in our jade view
        html: function() {
          res.render('users/index', {
            title: 'All my Users',
            "users": users
          });
        },
        //JSON response will shjow all blobs in JSON format
        json: function() {
          res.json(user);
        }
      });
    }
  });
})

//POST a new user
.post(function(req, res){
  var name = req.body.name;
  var created = req.body.created;

  mongoose.model('User').created({
    name: name,
    created: created
  }, function(err, user){
    if(err){
      res.send("There was a problem adding the information to the database");
    } else {
      //User has been created
      console.log('POST creating new user: ' + user);
      res.format({
        html: function(){
          res.location("users");
          res.redirect("/users");
        },
        json: function(){
          res.json(user);
        }
      });
    }
  })
});

//GET new message page
router.get('/new', function(req, res){
  res.render('users/new', {title: 'Add new Users'});
});

//route middleware to validate :id
router.param('id', function(req, res, next, id) {
  mongoose.model('User').findById(id, function(err, message){
    if(err){
      console.log(id+' was not found');
      res.status(404)
      var err = new Error('Not Found');
      err.status = 404;
      res.format({
        html: function(){
          next(err);
        },
        json: function(){
          res.json({
            message: err.status + ' ' + err
          });
        }
      });

    } else {
      req.id = id;
      next();
    }
  });
});

router.route('/:id').get(function(req, res){
  mongoose.model('User').findById(req.id, function(err, user){
    if(err){
      console.log('GET Error: There was a problem retrieving: '+err);
    } else {
      console.log('GET Retrieving ID: ' + user._id);
      var ucreated = user.created.toISOString();
      ucreated = ucreated.substring(0, ucreated.indexOf('T'))
      res.format({
        html: function() {
          res.render('users/show', {"ucreated": ucreated, "user": user});
        },
        json: function(){
          res.json(user);
        }
      });
    }
  });
});


//GET the individual user by Mongo ID
router.get('/:id/edit', function(req, res){
  mongoose.model('User').findById(req.id, function(err, user){
    console.log(user);
    if(err){
      console.log("GET Error: There was a problem retrieving: "+ err);
    } else {
      console.log('GET Retrieving ID: ' + user._id);
      var ucreated = user.created.toISOString();
      ucreated = ucreated.substring(0, ucreated.indexOf('T'))
      res.format({
        html: function(){
          res.render('users/edit', {title: 'Users' + user._id, "ucreated": ucreated, "user":user});
        },
        json: function(){
          res.json(user);
        }
      });
    }
  });
});

//PUT to update a user by ID
router.put('/:id/edit', function(req, res){
  var name = req.body.name;
  var created = req.body.created;

  mongoose.model('User').findById(req.id, function(err, user){
    user.update({
      name: name,
      created: created
    }, function(err, userID){
      if (err){
        res.send("There was a problem updating the information to the database: " + err);
      } else {
        res.format({
          html: function(){
            res.redirect("/users");
          },
          json: function(){
            res.json(user);
          }
        });
      }
    })
  });
});


//Delete a User by ID
router.delete('/:id/edit', function(req, res){
  mongoose.model('User').findById(req.id, function(err, user){
    if(err){
      return console.error(err);
    } else {
      message.remove(function(err, message){
        if(err){
          return console.error(err);
        } else {
          console.log('DELETE removing ID: ' + user._id);
          res.format({
            html: function(){
              res.redirect("/users")
            },
            json: function(){
              res.json({
                message: 'deleted', item: user
              });
            }
          });

        }
      });
    }
  });
});

module.exports = router;
