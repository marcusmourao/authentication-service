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
  const accessToken = cryptojs.createHmac('sha512', config.access_token_secret)
    .update(`${currentDate.toISOString()}${randomStringAccessToken}`)
    .digest('hex');
  const randomStringRefreshToken = Math.random().toString();
  const refreshToken = cryptojs.createHmac('sha512', config.refresh_token_secret)
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

module.exports = SessionService;
