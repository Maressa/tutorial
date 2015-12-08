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

//build the REST operantions at the base for messages
//this willo ve accessible from http://127.0.0.1:3000/messages if the default route for /is left unchanged
router.route('/')
  //GET all blobs
  .get(function(req, res, next) {
    //retrieve all blobs from monogo
    mongoose.model('Message').find({}, function(err, messages) {
      if (err) {
        return console.error(err);
      } else {
        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the request header
        res.format({
          //HTML response will render the index.jade file in the vie ws/blobs folder. We are also setting "blobs" to be an accessible variable in our jade view
          html: function() {
            res.render('messages/index', {
              title: 'All my Messages',
              "messages": messages
            });
          },
          //JSON response will shjow all blobs in JSON format
          json: function() {
            res.json(message);
          }
        });
      }
    });
  })

  //POST a new message
  .post(function(req, res) {
    //Get values from POST request. These can be done through forms or REST calls. These rely in the "name" attributes for forms
    var name = req.body.name;
    var text = req.body.text;
    var date = req.body.date;

    //call the create function for our database
    mongoose.model('Message').create({
      name: name,
      text: text,
      date: date
    }, function(err, message) {
      if (err) {
        res.send("There was a problem adding the infomation to the database.");
      } else {
        //Blob has been create
        console.log('POST creating new message: ' + message);
        res.format({
          //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
          html: function() {
            //if it wirked, set the header so the address bar doesn't still say /adduser
            res.location("messages");
            //And forward to success page
            res.redirect("/messages");
          },
          //JSON response will show the newly created blob
          json: function() {
            res.json(message);
          }
        });
      }
    })
  });

  /*GET New Message page. */
  router.get('/new', function(req, res) {
    res.render('messages/new', {
      title: 'Add New Messages'
    });
  });


  //route middleware to validate :id
  router.param('id', function(req, res, next, id) {
    //console.log('validating'+id+' exists');
    //find the ID in the database
    mongoose.model('Message').findById(id, function(err, message) {
      //if ir isn't found, we are going to repond with 404
      if (err) {
        console.log(id + ' was not found');
        res.status(404)
        var err = new Error('Not Found');
        err.status = 404;
        res.format({
          html: function() {
            next(err);
          },
          json: function() {
            res.json({
              message: err.status + ' ' + err
            });
          }
        });
        //if ir is found we continue on
      } else {
        //uncoment this next line if you want to see every JSON document response for wvery GET/PUT/DELETE call
        //console.leg(blob);
        //once validation is done sabe the new item in the req
        req.id = id;
        //go to the next thing
        next();
      }
    });
  });


  router.route('/:id')
    .get(function(req, res) {
      mongoose.model('Message').findById(req.id, function(err, message) {
        if (err) {
          console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
          console.log('GET Retriving ID: ' + message._id);
          var mdate = message.date.toISOString();
        mdate = mdate.substring(0, mdate.indexOf('T'))
          res.format({
            html: function() {
              res.render('messages/show', {
                "mdate": mdate,
                "message": message
              });
            },
            json: function() {
              res.json(message);
            }
          });
        }
      });
    });

    //GET the individual blob by Mongo ID
    router.get('/:id/edit', function(req, res) {
      //search for the blob within Mongo
      mongoose.model('Message').findById(req.id, function(err, message) {
        console.log(message);
        if (err) {
          console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
          //Return the blob
          console.log('GET Retrieving ID: ' + message._id);
          //format the date properly for the value to show correctly in our edit form
          var mdate = message.date.toISOString();
          mdate = mdate.substring(0, mdate.indexOf('T'))
          res.format({
            //HTML response will render the 'edit.jade' template
            html: function() {
              res.render('messages/edit', {
                title: 'Message' + message._id,
                "mdate": mdate,
                "message": message
              });
            },
            json: function() {
              res.json(message);
            }
          });
        }
      });
    });

    //PUT to update a blob by ID
    router.put('/:id/edit', function(req, res) {
      //Get our REST of form values. These rely on the "name" attributes
      var name = req.body.name;
      var text = req.body.text;
      var date = req.body.date;

      //find the document by ID
      mongoose.model('Message').findById(req.id, function(err, message) {
        //update it
        message.update({
          name: name,
          text: text,
          date: date
        }, function(err, messageID) {
          if (err) {
            res.send("There was a problem updating the information to the database: " + err);
          } else {
            //HTML responds by going back to the page or you can be fancy and create a new viem that shows a success page
            res.format({
              html: function() {
                res.redirect("/messages");
              },
              //JSON responds showing the updated values
              json: function() {
                res.json(message);
              }
            });
          }
        })
      });
    });

    //DELETE a Blob by ID
    router.delete('/:id/edit', function(req, res) {
      //find blob by ID
      mongoose.model('Message').findById(req.id, function(err, message) {
        if (err) {
          return console.error(err);
        } else {
          //remove it from Mongo
          message.remove(function(err, message) {
            if (err) {
              return console.error(err);
            } else {
              //returnin success messagens sayinf ir was deleted
              console.log('DELETE removint ID: ' + message._id);
              res.format({
                //HTML returns us back to the main page, or you can create a success page
                html: function() {
                  res.redirect("/messages")
                },
                json: function() {
                  res.json({
                    message: 'deleted',
                    item: message
                  });
                }
              });
            }
          });
        }
      });
    });

    module.exports = router;
