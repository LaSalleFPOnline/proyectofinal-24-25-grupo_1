const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeDatabase, endDatabaseConnection } = require('./database');
const { registerUser, loginUser } = require('./routes');
const { parseRequestBody } = require('./middlewares');

const app = express();
const port = 3000;

// Configuración de middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Iniciar la base de datos y luego el servidor
initializeDatabase((err) => {
  if (err) {
    console.error('Error inicializando la base de datos: ', err);
    process.exit(1); // Salir del proceso si hay un error al inicializar la base de datos
  } else {
    console.log('Base de datos inicializada correctamente');
    
    // Iniciar el servidor después de que la base de datos se haya inicializado
    app.listen(port, () => {
      console.log(`Servidor Node.js corriendo en http://localhost:${port}`);
    });
  }
});

// Endpoints
app.post('/register', parseRequestBody, registerUser);
app.post('/login', parseRequestBody, loginUser);

// Manejar cierre de la conexión a MySQL al terminar el programa (opcional)
process.on('SIGINT', () => {
  endDatabaseConnection((err) => {
    if (err) {
      console.error('Error cerrando la conexión a MySQL: ', err);
    } else {
      console.log('Conexión a MySQL cerrada');
      process.exit();
    }
  });
});
