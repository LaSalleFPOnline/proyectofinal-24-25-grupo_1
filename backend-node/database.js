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
    connection.query('CREATE DATABASE IF NOT EXISTS Feria_virtual', (err) => {
      if (err) {
        console.error('Error al crear la base de datos: ', err);
        throw err;
      }
      console.log('Base de datos creada o ya existe');

      // Conectar a la base de datos usuarios_db
      connection.changeUser({ database: 'Feria_virtual' }, (err) => {
        if (err) {
          console.error('Error al cambiar de base de datos: ', err);
          throw err;
        }
        console.log('Conectado a la base de datos Feria_virtual');

        // Crear la tabla de usuarios si no existe
        const createTableUsuariosQuery = `
          CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            rol INT NOT NULL CHECK (rol IN (1, 2, 3))
          )
        `;
        connection.query(createTableUsuariosQuery, (err) => {
          if (err) {
            console.error('Error al crear la tabla usuarios: ', err);
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
