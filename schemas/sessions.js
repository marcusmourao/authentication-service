const mongoose = require('mongoose');

const {ObjectId} = mongoose.Schema.Types;

mongoose.connect('mongodb://auth-database/authentication');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('mongo connect');
  // we're connected!
});

const sessionSchema = mongoose.Schema({
  user_id: {type: ObjectId, default: null},
  access_token: {type: String, unique: true},
  expiration_date: {type: Date},
  refresh_token: {type: String, unique: true},
  refresh_token_expiration: {type: Date},
});
const Session = mongoose.model('session', sessionSchema);
module.exports = Session;
