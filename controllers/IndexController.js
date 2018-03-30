const IndexController = {};

IndexController.indexAction = (req, res) => {
  res.status(200).json({title: 'Authentication Service - Is Working'});
};
module.exports = IndexController;
