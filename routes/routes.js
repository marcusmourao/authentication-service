const express = require('express');

const router = express.Router();
const IndexController = require('./../controllers/IndexController');
const SessionController = require('./../controllers/SessionController');

/* GET home page. */
router.get('/', IndexController.indexAction);
router.post('/sessions', SessionController.createSession);

module.exports = router;
