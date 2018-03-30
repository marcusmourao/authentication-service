const express = require('express');

const router = express.Router();
const Session = require('../schemas/sessions');
const config  = require('./../generated_files/config');
const IndexController = require('./../controllers/IndexController');

/* GET home page. */
router.get('/', IndexController.indexAction);
// router.get('/', (req, res, next) => {
//   console.log(JSON.stringify(req.headers));
//   const sessionDocument = new Session({
//     access_token: 'oaksoajsaisiashaosk',
//     expiration_date: Date.now(),
//     refresh_token: 'ikisasujkwmsmasiasjijas',
//     refresh_token_expiration: Date.now(),
//   });
//   console.log(config);
//   sessionDocument.save(() => {
//     console.log('sucess');
//   }, (err) => {
//     console.error('error', err);
//   });
//   res.status(200).json({title: 'News API - Is Working'});
// });

module.exports = router;
