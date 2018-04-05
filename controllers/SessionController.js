const log4js = require('log4js');
const cryptojs = require('crypto');
const config = require('./../generated_files/config');

const logger = log4js.getLogger();

const Session = require('./../schemas/sessions');

const SessionController = {};

SessionController.validateRequest = (req, res) => {
  logger.debug('Session Controller - Validate Request', req.headers);
  const tokenAPI = config.token_api;
  if (req.headers.token_api !== tokenAPI) {
    logger.debug('Session Controller - Validate Request - Token Not Valid - token_api::', tokenAPI);
    res.status(401).json({message: 'Not authorized'});
  } else {
    logger.debug('Session Controller - Validate Request - Token API is Valid');
    return true;
  }
};

SessionController.createSession = (req, res) => {
  logger.debug('Session Controller - Create Session', req.body);
  if (SessionController.validateRequest(req, res)) {
    const userId = req.body.user_id;
    if (!userId) {
      logger.debug('Session Controller - Create Session - Required Parameter is Missing - user_id', req.body);
      res.status(500).json({message: 'Missing required parameter user_id'});
    } else {
      const randomStringAccessToken = Math.random().toString();
      const currentDate = new Date();
      const accessToken = cryptojs.createHmac('sha512', config.access_token_secret)
        .update(`${currentDate.toISOString()}${randomStringAccessToken}`)
        .digest('hex');
      const randomStringRefreshToken = Math.random().toString();
      const refreshToken = cryptojs.createHmac('sha512', config.refresh_token_secret)
        .update(`${currentDate.toISOString()}${randomStringRefreshToken}`)
        .digest('hex');
      const now = Date.now();
      const session = {
        user_id: userId,
        access_token: accessToken,
        expiration_date: new Date(now + (1000 * 60 * 30)).toISOString(),
        refresh_token: refreshToken,
        refresh_token_expiration: new Date(now + (1000 * 60 * 60 * 24 * 7)).toISOString(),
      };
      const sessionDocument = new Session(session);
      logger.debug('Session Controller - Create Session - Mount new Session Document');
      sessionDocument.save((e) => {
        if (e) {
          logger.fatal('Session Controller - Create Session - Failed to save session', e);
          res.status(500).json({message: 'Internal Server Error', error: e});
        }
        logger.debug('Session Controller - Create Session - Create and Save Session with Success');
        res.status(201).json({message: 'Session Created', session});
      });
    }
  }
};

SessionController.getSession =  (req, res) => {
  if (SessionController.validateRequest(req, res)) {
    const accessToken = req.headers.access_token;
    const refreshToken = req.headers.refresh_token;
    if (accessToken || refreshToken) {
      logger.debug('Session Controller - Get Session - Access Token or Refresh Token defined');
      if (accessToken) {
        logger.debug('Session Controller - Get Session - Processing request with access token');
        Session.findOne({access_token: accessToken}, 'access_token expiration_date user_id', (error, sessionDocument) => {
          if (error) {
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
              res.status(401).json({message: 'Access token expired'});
            }
          }
          res.status(404).json({message: 'Session not found by access_token'});
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
              res.status(401).json({message: 'Access token expired'});
            }
          }
          res.status(404).json({message: 'Session not found by access_token'});
        });

      }
    } else {
      logger.debug('Session Controller - Get Session - Missing required parameters (access_token or refresh_token)');
      res.status(500).json({message: 'Missing required parameters'});
    }
    // logger.debug('Session Controller - Get Session - Session Retrieved with Success');
    // res.status(200).json({message: 'Session Retrieved', session: null});
  }
};

module.exports = SessionController;
