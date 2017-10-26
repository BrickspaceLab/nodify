// routes to control app
// ---


// import stuff
var url = require("url"),
    querystring = require('querystring'),
    app = require('../app'),
    render = require("../helpers/render"),
    logic = require("../helpers/logic");


// signup with store url
exports.signupTheme = function(req, res){
  console.log("SIGNUP");
  req.session.shopUrl = 'https://' + req.body.shopUrl + ".myshopify.com";
  res.redirect("/");
};


// create pro plan charge
exports.proPlan = function(req, res){
  console.log("PRO");
  logic.postProCharge(req, res);
};


// create starter plan charge
exports.starterPlan = function(req, res){
  console.log("STARTER");
  logic.postStarterCharge(req, res);
};


// create new starter plan charge
exports.trialPlan = function(req, res){
  console.log("TRIAL PLAN");
  logic.postTrialCharge(req, res);
};
