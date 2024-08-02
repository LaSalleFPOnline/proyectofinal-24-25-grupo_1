const bodyParser = require('body-parser');

const parseRequestBody = (req, res, next) => {
  bodyParser.json()(req, res, () => {
    bodyParser.urlencoded({ extended: true })(req, res, next);
  });
};

module.exports = { parseRequestBody };
