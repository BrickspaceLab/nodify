// shopify auth process
// ---


var OAuth = require('oauth').OAuth2,
    url = require("url"),
    app = require('../app');


exports.AppAuth = function() {
  var self = this;

  // /auth-app
  // initiate the shpoify app auth and
  // render app unless access_token is available
  this.initAuth = function(req, res){
    console.log("AUTH APP");
    if (!req.session.oauth_access_token) {
      var myredirect_uri = process.env.REDIRECTURL;
      var myscope = process.env.SCOPE;
      var redirectUrl = self.OAuth(req.session.shopUrl).getAuthorizeUrl({
        redirect_uri : myredirect_uri,
        scope: myscope
      });
      res.redirect(redirectUrl);
    } else {
      res.redirect("/app");
    }
  };


  // /auth_code
  // gets the temporary token which we can exchange
  // for a permanent token. User may be prompted to accept
  // the scope being requested
  this.getCode = function(req, res) {
    var myredirect_uri = process.env.REDIRECTURL;
    var myscope = process.env.SCOPE;
    var redirectUrl = self.OAuth(req.session.shopUrl).getAuthorizeUrl({
      redirect_uri : myredirect_uri,
      scope: myscope
    });
    res.redirect(redirectUrl);
  };


   // /auth-token
   // get the permanent access token which is valid
   // for the lifetime of the app install, it does
   // not expire
  this.getAccessToken = function(req, res) {
    var parsedUrl= url.parse(req.originalUrl, true);
    self.OAuth(req.session.shopUrl).getOAuthAccessToken(
      parsedUrl.query.code, {},
      function(error, access_token, refresh_token) {
        if (error) {
          res.send(500);
          return;
        } else {
          req.session.oauth_access_token = access_token;
          res.redirect("/app");
        }
      }
    );
  };


  this.OAuth = function(shopUrl) {
    var api_key = process.env.APIKEY;
    var client_secret = process.env.SECRET;
    return new OAuth(
      api_key,
      client_secret,
      shopUrl,
      "/admin/oauth/authorize",
      "/admin/oauth/access_token");
  }
}
