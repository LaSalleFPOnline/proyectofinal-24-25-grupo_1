const bodyParser = require('body-parser');

function parseRequestBody(req, res, next) {
  bodyParser.json()(req, res, (err) => {
    if (err) {
      console.error('Error al analizar el cuerpo de la solicitud JSON:', err);
      return res.status(400).json({ message: 'Error en el formato de la solicitud JSON' });
    }
    next();
  });
}

module.exports = {
  parseRequestBody,
};
