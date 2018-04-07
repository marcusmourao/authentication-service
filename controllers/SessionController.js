const log4js = require('log4js');
const config = require('./../generated_files/config');

const logger = log4js.getLogger();

const SessionService = require('./../services/SessionService');

const SessionController = {};

SessionController.validateRequest = (req, res) => {
  logger.debug('Session Controller - Validate Request', req.headers);
  const tokenAPI = config.token_api;
  if (req.headers.token_api !== tokenAPI) {
    logger.debug('Session Controller - Validate Request - Token Not Valid - token_api::', tokenAPI);
    res.status(401).json({message: 'Not authorized'});
    return false;
  }
  logger.debug('Session Controller - Validate Request - Token API is Valid');
  return true;
};

SessionController.createSession = (req, res) => {
  logger.debug('Session Controller - Create Session', req.body);
  if (SessionController.validateRequest(req, res)) {
    const userId = req.body.user_id;
    if (!userId) {
      logger.debug('Session Controller - Create Session - Required Parameter is Missing - user_id', req.body);
      res.status(500).json({message: 'Missing required parameter user_id'});
    } else {
      SessionService.createSession(req, res);
    }
  }
};

SessionController.getSession = (req, res) => {
  if (SessionController.validateRequest(req, res)) {
    const accessToken = req.headers.access_token;
    const refreshToken = req.headers.refresh_token;
    if (accessToken || refreshToken) {
      logger.debug('Session Controller - Get Session - Access Token or Refresh Token defined');
      SessionService.getSession(req, res);
    } else {
      logger.debug('Session Controller - Get Session - Missing required parameters (access_token or refresh_token)');
      res.status(500).json({message: 'Missing required parameters'});
    }
  }
};

module.exports = SessionController;
