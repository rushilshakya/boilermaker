const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/auth/google', require('./oAuthGoogle'));
router.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

module.exports = router;
