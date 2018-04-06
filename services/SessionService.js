const log4js = require('log4js');
const cryptojs = require('crypto');
const config = require('./../generated_files/config');
const SessionRepository = require('./../repositories/SessionRepository');

const SessionService = {};
const logger = log4js.getLogger();

SessionService.createSession = (req, res) => {
  const userId = req.body.user_id;
  const randomStringAccessToken = Math.random().toString();
  const currentDate = new Date();
  const accessToken =
    cryptojs.createHmac('sha512', config.access_token_secret)
      .update(`${currentDate.toISOString()}${randomStringAccessToken}`)
      .digest('hex');
  const randomStringRefreshToken = Math.random().toString();
  const refreshToken =
    cryptojs.createHmac('sha512', config.refresh_token_secret)
      .update(`${currentDate.toISOString()}${randomStringRefreshToken}`)
      .digest('hex');
  const now = Date.now();
  const sessionParameters = {
    user_id: userId,
    access_token: accessToken,
    expiration_date: new Date(now + (1000 * 60 * 30)).toISOString(), // 30 minutes
    refresh_token: refreshToken,
    refresh_token_expiration: new Date(now + (1000 * 60 * 60 * 24 * 7)).toISOString(), // 1 week
  };
  SessionRepository.createSession(sessionParameters)
    .then((session) => {
      res.status(201).json({message: 'New Session Created', session});
    })
    .catch((error) => {
      res.status(500).json({message: 'An error has occurred', error});
    });
};
SessionService.getSession = (req, res) => {
  const accessToken = req.headers.access_token;
  const refreshToken = req.headers.refresh_token;
  if (accessToken) {
    logger.debug('Session Controller - Get Session - Processing request with access token');
    SessionRepository.findOne({access_token: accessToken})
      .then((sessionDocument) => {
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
      })
      .catch((error) => {
        logger.fatal('Session Controller - Get Session - Error on recover session from db', error);
        res.status(500).json({message: 'Interval server error'});
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
};

module.exports = SessionService;
