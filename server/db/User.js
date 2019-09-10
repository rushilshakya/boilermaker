const Sequelize = require('sequelize');
const db = require('./database');

const User = db.define('users', {
  email: Sequelize.STRING,
});

module.exports = User;
