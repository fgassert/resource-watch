require('dotenv').load();

const express = require('express');
const next = require('next');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const basicAuth = require('basic-auth');
const sass = require('node-sass');
const postcssMiddleware = require('postcss-middleware');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const { parse } = require('url');
const routes = require('./routes');
const postcssConfig = require('./postcss.config');
const auth = require('./auth');

const port = process.env.PORT || 3000;
const prod = process.env.NODE_ENV === 'production';

// Next app creation
const app = next({ dev: !prod });
const handle = routes.getRequestHandler(app, ({ req, res, route, query }) => {
  // Server rendering for AddSearch and Explore detail page
  const newRoute = Object.assign({}, route);
  if (route.name === 'explore_detail' && /AddSearchBot/.test(req.headers['user-agent'])) {
    newRoute.pattern = `${route.pattern}/beta`;
    newRoute.name = 'explore_detail_beta';
    newRoute.page = '/app/ExploreDetailBeta';
  }
  app.render(req, res, newRoute.page, query);
});

// Express app creation
const server = express();

function checkBasicAuth(users) {
  return function authMiddleware(req, res, nextAction) {
    if (!/AddSearchBot/.test(req.headers['user-agent'])) {
      const user = basicAuth(req);
      let authorized = false;
      if (user && ( (user.name === users[0].name && user.pass === users[0].pass) ||
        (user.name === users[1].name && user.pass === users[1].pass) ) ) {
        authorized = true;
      }

      if (!authorized) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
      }
    }
    return nextAction();
  };
}

function isAuthenticated(req, res, nextAction) {
  // Saving referrer of user
  req.session.referrer = req.url;
  if (req.isAuthenticated()) return nextAction();
  // if they aren't redirect them to the home page
  return res.redirect('/login');
}

function isAdmin(req, res, nextAction) {
  if (req.user.role === 'ADMIN') return nextAction();
  // if they aren't redirect them to the home page
  return res.redirect('/myrw');
}

// Configuring session and cookie options
const sessionOptions = {
  secret: process.env.SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: true
};

if (prod) {
  const redisClient = redis.createClient(process.env.REDIS_URL);
  sessionOptions.store = new RedisStore({
    client: redisClient,
    logErrors: true,
    prefix: 'resourcewatch_sess_'
  });
}

// Using basic auth in prod mode
if (prod) {
  server.use(checkBasicAuth([{
    name: process.env.USERNAME,
    pass: process.env.PASSWORD
  }, {
    name: process.env.RW_USERNAME,
    pass: process.env.RW_PASSWORD
  }]));
}

// configure Express
server.use(cookieParser());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(session(sessionOptions));

// Authentication
auth.initialize(server);

// Initializing next app before express server
app.prepare()
  .then(() => {
    // Add route to serve compiled SCSS from /assets/{build id}/main.css
    // Note: This is is only used in production, in development it is inlined
    if (prod) {
      const sassResult = sass.renderSync({
        file: './css/index.scss',
        outputStyle: 'compressed',
        includePaths: ['node_modules']
      });
      server.get('/styles/:id/main.css', postcssMiddleware(postcssConfig), (req, res) => {
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Cache-Control', 'public, max-age=2592000');
        res.setHeader('Expires', new Date(Date.now() + 2592000000).toUTCString());
        res.send(sassResult.css);
      });
    }

    // Configuring next routes with express
    const handleUrl = (req, res) => {
      const parsedUrl = parse(req.url, true);
      return handle(req, res, parsedUrl);
    };

    // Redirecting data to data/explore
    // TODO: create data page
    server.get('/data', (req, res) => res.redirect('/data/explore'));

    // Authentication
    server.get('/auth', auth.authenticate({ failureRedirect: '/login' }), (req, res) => {
      if (req.user.role === 'ADMIN' && /admin/.test(req.session.referrer)) return res.redirect('/admin');
      return res.redirect('/myrw');
    });
    server.get('/login', auth.login);
    server.get('/logout', (req, res) => {
      req.logout();
      res.redirect('/');
    });

    // Routes with required authentication
    server.get('/auth/user', (req, res) => res.json(req.user || {}));
    server.get('/myrw-detail*?', isAuthenticated, handleUrl); // TODO: review these routes
    server.get('/myrw*?', isAuthenticated, handleUrl);
    server.get('/admin*?', isAuthenticated, isAdmin, handleUrl);

    server.use(handle);

    server.listen(port, (err) => {
      if (err) throw err;
      console.info(`> Ready on http://localhost:${port} [${process.env.NODE_ENV || 'development'}]`);
    });
  });
