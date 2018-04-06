const log4js = require('log4js');
const Session = require('./../schemas/sessions');

const logger = log4js.getLogger();

const SessionRepository = {};

SessionRepository.createSession = (session) => {
  const sessionDocument = new Session(session);
  logger.debug('Session Controller - Create Session - Mount new Session Document');
  return new Promise((resolve, reject) => sessionDocument.save((e) => {
    if (e) {
      logger.fatal('Session Controller - Create Session - Failed to save session', e);
      return reject(e);
    }
    logger.debug('Session Controller - Create Session - Create and Save Session with Success');
    return resolve(session);
  }));
};

SessionRepository.findOne = query =>
  new Promise((resolve, reject) =>
    Session.findOne(query, 'user_id access_token expiration_date refresh_token refresh_token_expiration', (error, sessionDocument) => {
      if (error) {
        return reject(error);
      }
      return resolve(sessionDocument);
    }));

SessionRepository.remove = (query) => {
  return new Promise((resolve, reject) => {
    return Session.remove(query, (error) => {
      if (error) {
        return reject(error);
      }
      return resolve(true);
    });
  });
};
module.exports = SessionRepository;
