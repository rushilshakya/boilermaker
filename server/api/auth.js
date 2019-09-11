const router = require('express').Router();
const { User } = require('../db');

// /api/auth
router.get('/', (req, res, next) => {
  res.send('hola bird');
});

// /api/auth/me
// to get an in session user
router.get('/me', (req, res, next) => {
  if (req.user) res.json(req.user);
  else res.status(404).send('no me');
});

// /api/auth/login
// user login
router.put('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) res.status(401).send('User not found');
    else if (!user.correctPassword(req.body.password))
      res.status(401).send('incorrect password');
    else {
      req.logIn(user, err => {
        if (err) next(err);
        else res.json(user);
      });
    }
  } catch (error) {
    next(error);
  }
});

// /api/auth/login
// create account
router.post('/signup', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) res.status(409).send('User already exists');
    const newUser = await User.create(req.body);
    if (newUser) {
      req.logIn(newUser, err => {
        if (err) next(err);
        else res.status(201).json(newUser);
      });
    }
  } catch (error) {
    next(error);
  }
});

// /api/auth/logout
router.get('/logout', (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.sendStatus(204);
});

module.exports = router;
