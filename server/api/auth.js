const router = require('express').Router();
const { User } = require('../db');

// /api/auth
router.get('/', (req, res, next) => {
  res.send('hola bird');
});

// /api/auth/login
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

router.get('/me', (req, res, next) => {
  if (req.user) res.json(req.user);
  else res.status(404).send('no me');
});

module.exports = router;
