const router = require('express').Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const { User } = require('../db');
// /api/auth/google
// person wants to authenticate with oAuth google
// redirect to google with callback function
// Passport's authenticate method will handle the heavy-lifting.
router.get('/', passport.authenticate('google', { scope: 'email' }));

// /api/auth/google/callback
// person has authenticated with oAuth google
// this callback function is getting called with temp id
// use google strategy to handle it
router.get(
  '/callback',
  passport.authenticate('google', {
    //respond with user data
    successRedirect: '/home',
    failureRedirect: '/login',
  })
);

//google strategy
// collect our google configuration into an object
const googleConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
};

//call google with with id, secret, and temp id that is passed to callback by google
//google will return profile which includes googleid, and session id
//configure the strategy with our config object, and write the function that passport will invoke after google sends
//us the user's profile and access token
const strategy = new GoogleStrategy(googleConfig, function(
  token,
  refreshToken,
  profile,
  done
) {
  const googleUser = profile._json;
  googleUser.name = profile.displayName;
  if (googleUser.email_verified) {
    User.findOne({ where: { email: googleUser.email } })
      .then(function(user) {
        //if email does not exist, then create with email and googleId
        if (!user) {
          return User.create({
            email: googleUser.email,
            googleId: googleUser.sub,
          }).then(function(newUser) {
            //login to passport session.  passport already has methods to serialize / deserialize
            //calling done i think will trigger login to passport session internally by passport
            done(null, newUser);
          });
          //if email exists, then if googleId is null, update googleId
        } else if (!user.googleId) {
          user.update({ googleId: googleUser.sub }).then(updatedUser => {
            done(null, updatedUser);
          });
        } else {
          done(null, user);
        }
      })
      //call done with error when internal issue
      .catch(done);
  } else {
    //call done with null, false when verification error
    done(null, false);
  }
});

// register our strategy with passport
passport.use(strategy);

module.exports = router;
