const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

const initializeDatabase = (callback) => {
  connection.connect(err => {
    if (err) {
      console.error('Error conectando a la base de datos: ' + err.stack);
      return callback(err);
    }
    console.log('Conectado a la base de datos con ID ' + connection.threadId);

    // Crear la base de datos si no existe
    connection.query('CREATE DATABASE IF NOT EXISTS Feria_virtual', (err) => {
      if (err) {
        console.error('Error al crear la base de datos: ', err);
        return callback(err);
      }
      console.log('Base de datos creada o ya existe');

      // Cambiar a la base de datos Feria_virtual
      connection.changeUser({ database: 'Feria_virtual' }, (err) => {
        if (err) {
          console.error('Error al cambiar de base de datos: ', err);
          return callback(err);
        }
        console.log('Conectado a la base de datos Feria_virtual');

        // Crear las tablas si no existen
        const queries = [
          `CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            rol INT NOT NULL CHECK (rol IN (1, 2, 3))
          )`,
          `CREATE TABLE IF NOT EXISTS empresas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT,
            nombre_empresa VARCHAR(255),
            web_url VARCHAR(2083),
            spot_url VARCHAR(2083),
            logo_url VARCHAR(2083),
            descripcion VARCHAR(5000),
            url_meet VARCHAR(2083),
            horario_meet TIME,
            entidad VARCHAR(500),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
          )`,
          `CREATE TABLE IF NOT EXISTS visitantes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT,
            entidad VARCHAR(500),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
          )`,
          `CREATE TABLE IF NOT EXISTS administradores (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
          )`
        ];

        let completedQueries = 0;

        queries.forEach((query) => {
          connection.query(query, (err) => {
            if (err) {
              console.error('Error al crear la tabla: ', err);
              return callback(err);
            }
            completedQueries += 1;
            if (completedQueries === queries.length) {
              console.log('Tablas creadas o ya existen');
              callback(null); // Indicar que todo se completó exitosamente
            }
          });
        });
      });
    });
  });
};

const endDatabaseConnection = (callback) => {
  if (connection) {
    connection.end((err) => {
      if (err) {
        console.error('Error al cerrar la conexión a MySQL: ', err);
        return callback(err);
      }
      console.log('Conexión a MySQL cerrada');
      callback(null);
    });
  } else {
    callback(null);
  }
};

module.exports = {
  initializeDatabase,
  endDatabaseConnection,
  connection
};