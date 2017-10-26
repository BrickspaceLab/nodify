// app starting point
// ---


// import stuff
var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session'),
    express = require('express'),
    path = require('path'),
    nconf = require('nconf'),
    morgan = require('morgan'),
    routes = require('./routes/routes'),
    actions = require('./routes/actions'),
    shopifyAuth = require('./routes/shopify-auth'),
    render = require("./helpers/render"),
    logic = require("./helpers/logic");
    require('dotenv').config();


// app setup
nconf.argv().env().file({file: (process.env.NODE_ENV || 'dev') + '-settings.json'});
exports.nconf = nconf;
var app = express();
app.use(morgan('combined'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({secret: "--express-session-encryption-key--"}));
app.set('view engine', 'mustache');
app.set('port', process.env.PORT || 3000);


// setup shopify auth
var appAuth = new shopifyAuth.AppAuth();


// configure routes
app.get('/signup', routes.renderSignup);
app.get('/auth-app', appAuth.initAuth);
app.get('/auth-token', appAuth.getAccessToken);
app.get('/', routes.index);
app.get('/app', routes.renderApp);
app.get('/activate-charge', routes.activateCharge);
app.get('/start-trial', routes.renderStartTrial);


// configure actions
app.post('/signup', actions.signupTheme);
app.post('/pro', actions.proPlan);
app.post('/starter', actions.starterPlan);
app.post('/trial', actions.trialPlan);


// 404 catch routes
app.use(routes.renderError);


// listen
app.listen(app.get('port'), function() {
    console.log('Listening on port ' + app.get('port'));
});
