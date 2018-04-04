const mongoose = require('mongoose');

mongoose.connect('mongodb://auth-database/authentication');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('mongo connect');
  // we're connected!
});

const sessionSchema = mongoose.Schema({
  user_id: {type: String, default: null},
  access_token: {type: String, unique: true},
  expiration_date: {type: String},
  refresh_token: {type: String, unique: true},
  refresh_token_expiration: {type: String},
});
const Session = mongoose.model('session', sessionSchema);
module.exports = Session;
