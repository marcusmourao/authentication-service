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

app.use('/', routes);

module.exports = app;
