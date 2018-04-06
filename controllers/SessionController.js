const log4js = require('log4js');
const config = require('./../generated_files/config');

const logger = log4js.getLogger();

const Session = require('./../schemas/sessions');
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
      if (accessToken) {
        logger.debug('Session Controller - Get Session - Processing request with access token');
        Session.findOne({access_token: accessToken}, 'access_token expiration_date user_id', (error, sessionDocument) => {
          if (error) {
            logger.fatal('Session Controller - Get Session - Error on recover session from db', error);
            res.status(500).json({message: 'Interval server error'});
          }
          if (sessionDocument) {
            logger.debug('Session Controller - Get Session - Find Session document by access_token');
            logger.debug('Document', sessionDocument);
            const currentDate = new Date();
            const isoDate = currentDate.toISOString();
            if (isoDate < sessionDocument.expiration_date) {
              res.status(200).json({message: 'Session Found', session: sessionDocument});
            } else {
              Session.remove({access_token: sessionDocument.access_token}, (errorDelete) => {
                if (errorDelete) {
                  logger.warn('Session Controller - Get Session - Failed to remove session document');
                }
              });
              res.status(401).json({message: 'Access token expired'});
            }
          } else {
            res.status(404)
              .json({message: 'Session not found by access_token'});
          }
        });
      } else {
        logger.debug('Session Controller - Get Session - Processing request with refresh token');
        Session.findOne({refresh_token: refreshToken}, 'access_token refresh_token_expiration user_id', (error, sessionDocument) => {
          if (error) {
            res.status(500).json({message: 'Interval server error'});
          }
          if (sessionDocument) {
            logger.debug('Session Controller - Get Session - Find Session document by access_token');
            logger.debug('Document', sessionDocument);
            const currentDate = new Date();
            const isoDate = currentDate.toISOString();
            if (isoDate < sessionDocument.refresh_token_expiration) {
              res.status(200).json({message: 'Session Found', session: sessionDocument});
            } else {
              Session.remove({refresh_token: sessionDocument.refresh_token}, (errorDelete) => {
                if (errorDelete) {
                  logger.warn('Session Controller - Get Session - Failed to remove session document');
                }
              });
              res.status(401).json({message: 'Refresh token expired'});
            }
          } else {
            res.status(404).json({message: 'Session not found by access_token'});
          }
        });
      }
    } else {
      logger.debug('Session Controller - Get Session - Missing required parameters (access_token or refresh_token)');
      res.status(500).json({message: 'Missing required parameters'});
    }
  }
};

module.exports = SessionController;
