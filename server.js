var express = require("express");
var app = express();

app.use(express.static("./client"));
app.use(express.static("./node_modules"));

app.use(require("body-parser").json());

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/survey-test-app8");
mongoose.Promise = global.Promise;


var userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
}, {
    timestamps: true
});

mongoose.model("User", userSchema);
var User = mongoose.model("User");

var optionSchema = new mongoose.Schema ({
  option: {type: String, minlength: 1, required: true },
  votes: {type: Number, default: 0},
});

var surveySchema = new mongoose.Schema ({
  _user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required:true},
  question: {type: String, minlength: 5, required: true},
  options: [optionSchema],
}, {timestamps:true});

mongoose.model("Survey", surveySchema);
var Survey = mongoose.model("Survey");


app.get("/users/:username", function(req, res) {
  console.log("This is user get req.params on server side");
  console.log(req.params);
  User.findOne({ username : req.params.username}, function(error, user) {
    if(error) {
      res.json({ error : error});
    } else {
      res.json({user:user});
    };
  });
});

app.post("/users", function(req, res) {
    console.log("This is 'users' post request body");
    console.log(req.body);

    var newUser = new User({
        username: req.body.username,
    });

    newUser.save(function(error) {
        if (error) {
            res.json({
                error: error
            });
        } else {
            res.json({
                user: newUser
            });
        };
    });
});

app.get("/surveys", function(req, res) {
  Survey.find({}).populate("_user").exec(function(error, surveys) {
    res.json({surveys : surveys});
  });
});


app.post("/surveys", function(req, res){
  console.log("This is survey post req body");
  console.log(req.body);

  var newSurvey = new Survey ({
    _user: req.body._user,
    question: req.body.question,
    options: req.body.options,
  });

  newSurvey.save(function(error) {
    if(error) {
      res.json({
          error: error
      });
    } else {
      res.json ({
          survey: newSurvey
      });
    };
  });

});

app.put("/votes", function(req, res) {
  console.log(req.body);
  Survey.findOne({_id : req.body.surveyId}, function(err, survey) {
    survey.options[req.body.optionIndex].votes += 1;

    survey.save(function(error) {
      if (error){
        console.log(error);
        res.json({error: error});
      } else {
        res.json ({survey: survey});
      };
    });
  });
});

app.delete("/surveys/:id", function(req, res) {
  console.log("This is req.params of survey delete request");
  console.log(req.params);
  Survey.remove({_id: req.params.id}, function(error) {
    if(error) {
      res.json({ error: error});
    } else {
      res.json({ removed: true});
    };
  });

});



app.listen(8000, function() {
    console.log("Listening on 8000");
});
