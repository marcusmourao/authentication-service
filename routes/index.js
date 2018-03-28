const express = require('express');

const router = express.Router();
const Session = require('../schemas/sessions');



/* GET home page. */
router.get('/', (req, res, next) => {
  const sessionDocument = new Session({
    token: 'oaksoajsaisiashaosk',
    expiration_date: Date.now(),
    refresh_token: 'ṕsiojasçkasbhwkdjqwi',
    refresh_token_expiration: Date.now(),
  });

  sessionDocument.save(() => {
    console.log('sucess')
  }, (err) => {
    console.error('error', err)
  });

  res.status(200).json({title: 'News API - Is Working'});



});

module.exports = router;
