const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initDatabaseConnection } = require('./database');
const { registerUser, loginUser } = require('./routes');
const { parseRequestBody } = require('./middlewares');

const app = express();
const port = 3001;

// Configuración de middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Iniciar la conexión a la base de datos
initDatabaseConnection();

// Endpoints
app.post('/register', parseRequestBody, registerUser);
app.post('/login', parseRequestBody, loginUser);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Node.js corriendo en http://localhost:${port}`);
});

// Manejar cierre de la conexión a MySQL al terminar el programa (opcional)
process.on('SIGINT', () => {
  // Cerrar la conexión a la base de datos
  endDatabaseConnection();
  console.log('Conexión a MySQL cerrada');
  process.exit();
});
