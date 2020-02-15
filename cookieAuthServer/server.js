//npm modules
const express = require('express');
const uuid = require('uuid/v4');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const axios = require('axios');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

// const allowedOrigins = ['https://localhost:4000', 'https://localhost:3000', 'http://localhost:4000'];

// this needs to be set to some property value so when deployed it will continue to work
const dbServer = process.env.DBSERVER || 'http://localhost:5000';
const port = process.env.PORT || 4000;

// configure passport.js to use the local strategy
passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    axios
      .get(`${dbServer}/users?email=${email}`)
      .then(res => {
        const user = res.data[0];
        console.log('user', user);
        if (!user) {
          console.log('invalid credentials');
          return done(null, false, { message: 'Invalid credentials.\n' });
        }
        if (!bcrypt.compareSync(password, user.password)) {
          console.log('invalid credentials');
          return done(null, false, { message: 'Invalid credentials.\n' });
        }
        console.log('logged in');
        return done(null, user);
      })
      .catch(error => done(error));
  })
);

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  axios
    .get(`${dbServer}/users/${id}`)
    .then(res => done(null, res.data))
    .catch(error => done(error, false));
});

// create the server
const app = express();

// add & configure middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    genid: req => {
      console.log('Inside session middleware genid function');
      console.log(`Request object sessionID from client: ${req.sessionID}`);
      return uuid(); // use UUIDs for session IDs
    },
    store: new FileStore(),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      // if (allowedOrigins.indexOf(origin) === -1) {
      //   const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      //   return callback(new Error(msg), false);
      // }

      // return the origin that was given - not very secure, but this is a demo
      return callback(null, true);
    },
    credentials: true
  })
);

// create the homepage route at '/'
app.get('/', (req, res) => {
  res.send(`You got the home page!\n`);
});

// create the login get and post routes
app.get('/login', (req, res) => {
  res.send(`Not logged in, please log in!\n`);
});

app.post('/login', (req, res, next) => {
  console.log('Inside POST /login callback');
  passport.authenticate('local', (err, user, info) => {
    console.log('Inside passport.authenticate() callback');
    console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`);
    console.log(`req.user: ${JSON.stringify(req.user)}`);

    if (info) {
      return res.send(info.message);
    }
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/login');
    }

    req.login(user, err => {
      console.log('Inside req.login() callback');
      console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`);
      console.log(`req.user: ${JSON.stringify(req.user)}`);
      if (err) {
        return next(err);
      }
      return res.redirect('/authrequired');
    });
  })(req, res, next);
});

app.get('/authrequired', (req, res) => {
  console.log('is authenticated', req.isAuthenticated());
  if (req.isAuthenticated()) {
    res.send('you hit the authentication endpoint\n');
  } else {
    res.redirect('/');
  }
});

app.get('/authrequired2', (req, res) => {
  console.log('is authenticated', req.isAuthenticated());
  if (req.isAuthenticated()) {
    res.send(`you hit the 2nd endpoint that requires authentication: ${req.user.email}\n`);
  } else {
    res.redirect('/');
  }
});

// tell the server what port to listen on
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// used when deploying a local secure server
// https.createServer({
//   key: fs.readFileSync('./key.pem'),
//   cert: fs.readFileSync('./cert.pem'),
//   passphrase: 'password'
// }, app)
// .listen(port);
