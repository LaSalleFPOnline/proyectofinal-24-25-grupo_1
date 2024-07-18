const mysql = require('mysql');

let connection;

function initDatabaseConnection() {
  connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
  });

  // Conectar a MySQL
  connection.connect((err) => {
    if (err) {
      console.error('Error de conexión a MySQL: ', err);
      throw err;
    }
    console.log('Conexión a MySQL establecida');

    // Crear la base de datos si no existe
    connection.query('CREATE DATABASE IF NOT EXISTS usuarios_db', (err) => {
      if (err) {
        console.error('Error al crear la base de datos: ', err);
        throw err;
      }
      console.log('Base de datos creada o ya existe');

      // Conectar a la base de datos usuarios_db
      connection.changeUser({ database: 'usuarios_db' }, (err) => {
        if (err) {
          console.error('Error al cambiar de base de datos: ', err);
          throw err;
        }
        console.log('Conectado a la base de datos usuarios_db');

        // Crear la tabla de usuarios si no existe
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL
          )
        `;
        connection.query(createTableQuery, (err) => {
          if (err) {
            console.error('Error al crear la tabla: ', err);
            throw err;
          }
          console.log('Tabla de usuarios creada o ya existe');
        });
      });
    });
  });
}

function endDatabaseConnection() {
  if (connection) {
    connection.end();
  }
}

module.exports = {
  initDatabaseConnection,
  endDatabaseConnection,
};
