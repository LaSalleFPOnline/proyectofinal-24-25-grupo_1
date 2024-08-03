const bodyParser = require('body-parser');

// Middleware para analizar cuerpos JSON
const parseRequestBody = bodyParser.json();

const logRequestBody = (req, res, next) => {
  if (req.body) {
    console.log('Cuerpo de la solicitud:', req.body);
  }
  next(); // Pasar al siguiente middleware
};

module.exports = { parseRequestBody, logRequestBody };
