/*
Cargamos las variables de entorno desde el archivo .env en el directorio raíz. La boblioteca dotenv es útil para
mantener la configuración del entorno fuera del código fuente, importante para la seguridad y flexibilidad
*/
require('dotenv').config();

/*
Importamos: Express se utiliza para crear el servidor web
BodyParser es el middleware para manejar el cuerpo de las solicitudes HTTP
Cors es el middleware que permite que el servidor acepte solicitudes de dominios diferentes al propio
InitializeDatabase y endDatabaseConnection son funciones que inician la conexión a la BBDD y cierran la conexión
Routes es el archivo de rutas que importamos y define los endpoints de la API
*/
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeDatabase, endDatabaseConnection } = require('./database/database');
const routes = require('./routes/routes'); // Importa el archivo de rutas

/*
Se crea una instancia de la aplicación Express
El puerto en el que el servidor escucha las solicitudes entrantes es el 5000
*/
const app = express();
const port = 5000;

/*
Activamos CORS para todas las rutas, permitiendo solicitudes desde otros dominios
Configuramos el servidor para que acepte el formato JSON en el cuerpo de las solicitudes
Permitimos que el servidor procese datos codificados en la URL, permitiendo decodificar objetos más complejos
*/
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
Intentamos establecer la conexión a la BBDD. Si hay un error se imprime un mensaje de error y el proceso se detiene,
si la BBDD se inicia correctamente, se inicia el servidor en el puerto especificado
*/
initializeDatabase((err) => {
  if (err) {
    console.error('Error inicializando la base de datos Feria_virtual: ', err);
    process.exit(1);
  } else {
    console.log('Base de datos inicializada correctamente');
    app.listen(port, () => {
      console.log(`Servidor Node.js corriendo en http://localhost:${port}`);
    });
  }
});

/*
Todas las rutas están disponibles bajo el prefijo /api.
*/
app.use('/api', routes);

/*
Capturamos la señal SIGINT (ctrl+c en el terminal). Al recibir la señal se llama a la función endDatabaseConnection
para cerrar la conexión a la BBDD de manera ordenada. Una vez cerrada la conexión el proceso se termina
*/
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