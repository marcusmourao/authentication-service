const cryptojs = require('crypto');
const config = require('./../generated_files/config');

const Session = require('./../schemas/sessions');

const SessionController = {};

SessionController.validateRequest = (req, res) => {
  const tokenAPI = config.token_api;
  if (req.headers.token_api !== tokenAPI) {
    res.status(401).json({message: 'Not authorized'});
  } else {
    return true;
  }
};

SessionController.createSession = (req, res) => {
  if (SessionController.validateRequest(req, res)) {
    const userId = req.body.user_id;
    if (!userId) {
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
      sessionDocument.save((e) => {
        if (e) {
          console.log(e);
          res.status(500).json({message: 'Internal Server Error', error: e});
        }
        res.status(201).json({message: 'Session Created', session});
      });
    }
  }
};

module.exports = SessionController;
