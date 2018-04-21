const express = require('express');
const cookieParser = require('cookie-parser');
const log4js = require('log4js');

const logger = log4js.getLogger();
logger.level = 'debug';
logger.debug('Log enabled by log4js');
const routes = require('./routes/routes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});


app.use('/', routes);

module.exports = app;
