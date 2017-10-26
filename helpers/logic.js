// shpoify api calls
// ---


var shopifyAPI = require('shopify-node-api'),
    app = require('../app'),
    render = require("../helpers/render");


// create app file in theme assets
exports.putEmbedFile = function(req, res, cb){
  console.log("CREATE THEME ASSET");
  var Shopify = newShopifyApi(req);

  getShopifyMainTheme(Shopify, function(mainThemeId){
    render.compile("embed", "test", function(compiledEmbedFile){
      var assetData = {
        "asset": {
          "key": "snippets\/test-app.liquid",
          "value": compiledEmbedFile
        }
      }
      Shopify.put('/admin/themes/'+mainThemeId+'/assets.json', assetData, function(err, data, headers){
        if (!err) {
          cb(data);
        }
        else {
          cb(err);
        }
      });
    });
  });
}


// create new basic charge and redirect
// to automatically activate
exports.postTrialCharge = function(req, res){
  console.log("CREATE NEW STARTER CHARGE");
  var Shopify = newShopifyApi(req);
  var postData = {
    "recurring_application_charge": {
      name: "Starter Plan",
      price: 8.00,
      test: true,
      return_url: process.env.RETURNURL,
      trial_days: 14,
    }
  }

  Shopify.post('/admin/recurring_application_charges.json', postData, function(err, data, headers){
    if (!err) {
      res.send({redirect: data.recurring_application_charge.confirmation_url});
    }
    else {
      res.redirect("/error?c=0&m=Failed to create new recurring charge with trial.");
    }
  });
}


// create basic charge and rediect
// to automatically activate
exports.postStarterCharge = function(req, res){
  console.log("CREATE STARTER CHARGE");
  var Shopify = newShopifyApi(req);

  var postData = {
    "recurring_application_charge": {
      name: "Starter Plan",
      price: 8.00,
      test: true,
      return_url: process.env.RETURNURL
    }
  }

  Shopify.post('/admin/recurring_application_charges.json', postData, function(err, data, headers){
    if (!err) {
      res.send({redirect: data.recurring_application_charge.confirmation_url});
    }
    else {
      // TODO error page
      res.redirect("/error?c=0&m=Failed to create starter recurring charge.");
    }
  });
}


// create pro charge and redirect
// to automatically activate
exports.postProCharge = function(req, res){
  console.log("POST PRO CHARGE");
  var Shopify = newShopifyApi(req);

  var postData = {
    "recurring_application_charge": {
      name: "Pro Plan",
      price: 14.00,
      test: true,
      return_url: process.env.RETURNURL
    }
  }

  Shopify.post('/admin/recurring_application_charges.json', postData, function(err, data, headers){
    if (!err) {
      res.send({redirect: data.recurring_application_charge.confirmation_url});
    }
    else {
      res.redirect("/error?c=0&m=Failed to create pro recurring charge.");
    }
  });
}


// return true or false if active charge
// is currently present
exports.getActiveCharge = function(req, res, cb){
  console.log("CHECK CHARGE");
  var Shopify = newShopifyApi(req);

  Shopify.get('/admin/recurring_application_charges.json', function(err, data, headers){
    var active = false;
    if (!err) {
      for (var i = 0; i < data.recurring_application_charges.length; i++) {
        if (data.recurring_application_charges[i].status == "active") {
          active = true;
          req.session.activeplan = data.recurring_application_charges[i].name;
          req.session.trialendson = data.recurring_application_charges[i].trial_ends_on;
        }
      }
      cb(active);
    }
    else {
      cb(active);
    }
  });
}


// activate charge from shopify redirct using
// query parameters
exports.postActivateCharge = function(req, res){
  console.log("ACTIVATE CHARGE");
  var Shopify = newShopifyApi(req);

  var postData = {};

  Shopify.post('/admin/recurring_application_charges/'+req.query.charge_id+'/activate.json', postData, function(err, data, headers){
    if (!err) {
      res.redirect("/app");
    }
    else {
      res.redirect("/error?c=0&m=Failed to activate recurring charge.");
    }
  });
}


// create new shopify api object
function newShopifyApi(req){
  var api_key = process.env.APIKEY;
  var client_secret = process.env.SECRET;
  var shop = req.session.shopUrl.substring(0,req.session.shopUrl.indexOf(".myshopify.com")).substring(8);
  var Shopify = new shopifyAPI({
    shop: shop,
    shopify_api_key: api_key,
    shopify_shared_secret: client_secret,
    access_token: req.session.oauth_access_token,
    verbose: false
  });
  return Shopify;
}


// return main theme id
function getShopifyMainTheme(id, cb){
  id.get('/admin/themes.json', function(err, data, headers){
    if (!err) {
      for (var i = 0; i < data.themes.length; i++) {
        if (data.themes[i].role == "main") {
          cb(data.themes[i].id);
          break;
        }
      }
    }
    else {
      cb(false);
    }
  });
}
