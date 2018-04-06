const log4js = require('log4js');
const logger = log4js.getLogger();
const Session = require('./../schemas/sessions');

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

module.exports = SessionRepository;
