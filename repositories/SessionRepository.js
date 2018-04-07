const log4js = require('log4js');
const Session = require('./../schemas/sessions');

const logger = log4js.getLogger();

const SessionRepository = {};
SessionRepository.sessionLabels = 'user_id access_token expiration_date refresh_token refresh_token_expiration';

SessionRepository.createSession = (session) => {
  logger.debug('Entered Session Repository - Create Session');
  const sessionDocument = new Session(session);
  logger.debug('Entered Session Repository - Create Session - Mount new Session Document');
  return new Promise((resolve, reject) => sessionDocument.save((e) => {
    if (e) {
      logger.fatal('Session Repository - Create Session - Failed to save session', e);
      return reject(e);
    }
    logger.debug('Session Repository - Create Session - Create and Save Session with Success');
    return resolve(session);
  }));
};

SessionRepository.findOne = (query) => {
  logger.debug('Session Repository - findOne - query: ', query);
  return new Promise((resolve, reject) => {
    Session.findOne(query, SessionRepository.sessionLabels, (error, document) => {
      if (error) {
        logger.fatal('Session Repository - An error occurred trying to recover session from database', error);
        return reject(error);
      }
      if (document) {
        logger.debug('Session Repository - Recover session from database with success');
        return resolve(document);
      }
      logger.debug('Session Repository - Session not found');
      return resolve(null);
    });
  });
};

SessionRepository.remove = (query) => {
  logger.debug('Session Repository - remove - query: ', query);
  return new Promise((resolve, reject) => {
    return Session.remove(query, (error) => {
      if (error) {
        logger.fatal('Session Repository - An error occurred trying to remove session from database', error);
        return reject(error);
      }
      logger.debug('Session Repository - Session was removed with success');
      return resolve(true);
    });
  });
};
module.exports = SessionRepository;
