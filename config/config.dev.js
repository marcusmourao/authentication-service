const config = {
  database_url: 'mongodb://authentication-database/authentication',
  token_api: '0cf9f670f8d8fdced571d0ade40a29c1',
  access_token_secret: 'firstHash123',
  refresh_token_secret: 'refreshHash456',
  access_token_ttl: 1000 * 60 * 30, // 30 minutes
  refresh_token_ttl: 1000 * 60 * 60 * 24 * 7, // 1 week
};

module.exports = config;
