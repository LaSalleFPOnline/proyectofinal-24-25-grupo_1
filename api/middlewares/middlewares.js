/*
Importamos el middleware que permite a Express analizar cuerpos de solicitudes entrantes y ponerlos a disposición
en req.body. En versiones actuales de Express estas funciones están integradas
*/
const bodyParser = require('body-parser');

/*
Se define un middleware para analizar los cuerpos de solicitudes HTTP que contienen datos en formato JSON. Cualquier
solicitud entrante con un cuerpo JSON será procesada por este middleware y su contenido estará disponible en req.body
*/
const parseRequestBody = bodyParser.json();

/*
Definimos un middleware personalizado que registra el contenido del cuerpo de la solicitud en la consola. Se verifica
si req.body exite, y se imprime un mensaje descriptivo en la consola con el contenido. Next pasa el control al siguiente
middleware. Si no se llama la solicitud quedará pendiente y no se procesará correctamente, y bloqueará la aplicación
*/
const logRequestBody = (req, res, next) => {
  if (req.body) {
    console.log('Cuerpo de la solicitud:', req.body);
  }
  next();
};

// Exportamos los middlewares para que puedan ser importados y utilizados en otros archivos de la aplicación
module.exports = { parseRequestBody, logRequestBody };