const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const passport = require('passport');

const { db } = require('./db');
require('../localSecrets'); // mutate the process.env object with your variables

const dbStore = new SequelizeStore({ db: db });
dbStore.sync();

const app = express();
const port = process.env.PORT || 3000; // this can be very useful if you deploy to Heroku!

//middlewares
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'a wildly insecure secret',
    store: dbStore,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//routing
app.use('/api', require('./api'));
app.get('*', (req, res, next) => {
  res.sendfile(path.join(__dirname, '../public/index.html'));
});

//if all fails, 500!
app.use(function(err, req, res, next) {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});

//passport stuff
passport.serializeUser((user, done) => {
  try {
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

//lets get started
db.sync().then(() => {
  app.listen(port, () => {
    console.log('listening on port ', port);
  });
});
