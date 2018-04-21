const log4js = require('log4js');
const cryptojs = require('crypto');
const config = require('./../generated_files/config');
const SessionRepository = require('./../repositories/SessionRepository');

const SessionService = {};
const logger = log4js.getLogger();

SessionService.createSession = (req, res) => {
  logger.debug('Session Service - Create Session');
  const userId = req.body.user_id;
  const accessToken = SessionService.generateAccessToken();
  const refreshToken = SessionService.generateRefreshToken();
  const now = Date.now();
  const sessionParameters = {
    user_id: userId,
    access_token: accessToken,
    expiration_date: new Date(now + (config.access_token_ttl)).toISOString(), // 30 minutes
    refresh_token: refreshToken,
    refresh_token_expiration: new Date(now + (config.refresh_token_ttl)).toISOString(), // 1 week
  };
  logger.debug('Session Service - Mount Session Object with success');
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
    logger.debug('Session Service - Get Session - Processing request with access token');
    SessionRepository.findOne({access_token: accessToken})
      .then((sessionDocument) => {
        SessionService.processRequestByAccessToken(sessionDocument, res);
      })
      .catch((error) => {
        logger.fatal('Session Service - Get Session - Error on recover session from db', error);
        res.status(500).json({message: 'Interval server error'});
      });
  } else {
    logger.debug('Session Service - Get Session - Processing request with refresh token');
    SessionRepository.findOne({refresh_token: refreshToken})
      .then((sessionDocument) => {
        SessionService.processRequestByRefreshToken(sessionDocument, res);
      })
      .catch((error) => {
        logger.fatal('Session Service - Get Session - Error on recover session from db', error);
        res.status(500).json({message: 'Interval server error'});
      });
  }
};
SessionService.generateAccessToken = () => {
  logger.debug('Session Service - Generate Access Token');
  const randomString = Math.random().toString();
  const currentDate = new Date();
  const accessToken =
    cryptojs.createHmac('sha512', config.access_token_secret)
      .update(`${currentDate.toISOString()}${randomString}`)
      .digest('hex');
  return accessToken;
};
SessionService.generateRefreshToken = () => {
  logger.debug('Session Service - Generate Refresh Token');
  const randomString = Math.random().toString();
  const currentDate = new Date();
  const refreshToken =
    cryptojs.createHmac('sha512', config.refresh_token_secret)
      .update(`${currentDate.toISOString()}${randomString}`)
      .digest('hex');
  return refreshToken;
};
SessionService.isTokenValid = (dateExpiration) => {
  const currentDate = new Date();
  const isoDate = currentDate.toISOString();
  return isoDate <= dateExpiration;
};
SessionService.processRequestByAccessToken = (sessionDocument, res) => {
  if (sessionDocument) {
    logger.debug('Session Controller - Get Session - Find Session document by access_token');
    logger.debug('Document', sessionDocument);
    if (SessionService.isTokenValid(sessionDocument.expiration_date)) {
      res.status(200).json({message: 'Get session with success', session: sessionDocument});
    } else {
      SessionRepository.remove({access_token: sessionDocument.access_token});
      res.status(401)
        .json({message: 'Unauthorized'});
    }
  } else {
    res.status(404)
      .json({message: 'Session not found by access_token'});
  }
};
SessionService.processRequestByRefreshToken = (sessionDocument, res) => {
  if (sessionDocument) {
    logger.debug('Session Service - Get Session - Find Session document by refresh token');
    logger.debug('Document', sessionDocument);
    if (SessionService.isTokenValid(sessionDocument.refresh_token_expiration)) {
      SessionService.generateAccessTokenByRefreshToken(sessionDocument)
        .then((session) => {
          logger.debug('Session Service - Get Session - Generate new session by refresh token');
          res.status(200).json({message: 'Get new session with success', session});
        })
        .catch((error) => {
          logger.fatal('Session Service - Get Session - Failed to create new session by refresh token');
          res.status(500).json({message: 'Internal server error', error});
        });
    } else {
      SessionRepository.remove({refresh_token: sessionDocument.refresh_token});
      res.status(401)
        .json({message: 'Unauthorized'});
    }
  } else {
    res.status(404)
      .json({message: 'Session not found by access_token'});
  }
};
SessionService.generateAccessTokenByRefreshToken = (oldSession) => {
  return SessionRepository.remove({refresh_token: oldSession.refresh_token})
    .then(() => {
      const now = Date.now();
      const sessionParameters = {
        user_id: oldSession.user_id,
        access_token: SessionService.generateAccessToken(),
        expiration_date: new Date(now + (config.access_token_ttl)).toISOString(),
        refresh_token: oldSession.refresh_token,
        refresh_token_expiration: new Date(now + (config.refresh_token_ttl)).toISOString(),
      };
      return SessionRepository.createSession(sessionParameters);
    });
};

module.exports = SessionService;
