// routes to control app
// ---


// import stuff
var url = require("url"),
    querystring = require('querystring'),
    app = require('../app'),
    render = require("../helpers/render"),
    logic = require("../helpers/logic");


// index route
// ---
// redirect to app when access token available
// parse query for shopurl
// if no shopurl redirect to /signup
// if no token redirect to /auth-app
exports.index = function(req, res){
  console.log("INDEX");
  if (req.query.d) {
    req.session.installDiscount = req.query.d;
  }
  if (!req.session.oauth_access_token) {
    if (!req.session.shopUrl) {
      var parsedUrl = url.parse(req.originalUrl, true);
      if (parsedUrl.query && parsedUrl.query.shop) {
        req.session.shopUrl = 'https://' + parsedUrl.query.shop;
      }
    }
    if (!req.session.shopUrl) {
      res.redirect("/signup");
    }
    else {
      res.redirect("/auth-app");
    }
  }
  else {
    res.redirect("/app");
  }
};


// main app route
// ---
// same check for token and shopurl as index route
// display settings from fees-app-settings.json
exports.renderApp = function(req, res){
  console.log("APP");
  if (req.query.d) {
    req.session.installDiscount = req.query.d;
  }
  if (!req.session.oauth_access_token) {
    if (!req.session.shopUrl) {
      var parsedUrl = url.parse(req.originalUrl, true);
      if (parsedUrl.query && parsedUrl.query.shop) {
        req.session.shopUrl = 'https://' + parsedUrl.query.shop;
      }
    }
    if (!req.session.shopUrl) {
      res.redirect("/signup");
    } else {
      res.redirect("/auth-app");
    }
  }
  else {
    logic.getActiveCharge(req, res, function(active) {

      // create snippets/test-app.liquid file
      logic.putEmbedFile(req, res, function(data) {
        console.log(data);
      });

      if (active) {
        render.view("header", {
          title: "Settings",
          shopHeader: "ShopifyApp.init({apiKey: '"+process.env.APIKEY+"',shopOrigin:'"+req.session.shopUrl+"'});"
        }, res);
        render.view("app", {
          activeplan: req.session.activeplan,
          trial: req.session.trialendson
        }, res);
        render.view("footer", {
          title: "Settings"
        }, res);
        res.end();
      }
      else {
        res.redirect("/start-trial");
      }
    });
  }
};


// signup route
// ---
// render signup form to collect shopurl
exports.renderSignup = function(req, res){
  console.log("SIGNUP");
  req.session.oauth_access_token = null;
  req.session.shopUrl = null;
  render.view("header", {
    title: "Sign Up"
  }, res);
  render.view("signup", {}, res);
  render.view("footer", {
    title: "Sign Up"
  }, res);
  res.end();
};


// trial route
// ---
// automatically create trial charge
exports.renderStartTrial = function(req, res){
  console.log("START TRIAL");
  render.view("start-trial", {}, res);
  res.end();
};


// activate route
// ---
// automatically activate charge
exports.activateCharge = function(req, res){
  console.log("ACTIVATE");
  logic.postActivateCharge(req, res);
};


// error pages
// ---
// render error page
// use url parameters to render error message
// send shopurl when available
exports.renderError = function(req, res){
  var shopUrl;
  var shopHeader;
  var err = new Error('Not Found');
  err.status = 404;
  if (req.query.c) {
    err.status = req.query.c
  }
  if (req.query.m) {
    err.message = req.query.m
  }
  if (req.session.shopUrl) {
    shopHeader = "ShopifyApp.init({apiKey: '"+process.env.APIKEY+"',shopOrigin:'"+req.session.shopUrl+"'})";
    shopUrl = req.session.shopUrl.substring(0,req.session.shopUrl.indexOf(".myshopify.com")).substring(8);
  }

  render.view("header", {
    title: "Error",
    shopHeader: shopHeader
  }, res);
  render.view("error", {
    errorStatus: err.status,
    errorMessage: err.message
  }, res);
  render.view("footer", {
    title: "Settings"
  }, res);
  res.end();
};
