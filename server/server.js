const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000; // this can be very useful if you deploy to Heroku!

//middlewares
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

//lets get started
app.listen(port, () => {
  console.log('listening on port ', port);
});
