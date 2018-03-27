const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.status(200).json({title: 'News API - Is Working'});
});

module.exports = router;
