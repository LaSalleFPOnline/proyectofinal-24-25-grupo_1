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
        const createTableEmpresasQuery = `
        CREATE TABLE IF NOT EXISTS empresas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT,
          web_url VARCHAR(2083),
          spot_url VARCHAR(2083),
          logo_url VARCHAR(2083),
          descripcion VARCHAR(1000),
          url_meet VARCHAR(2083),
          horario_meet TIME,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )
      `;
      connection.query(createTableEmpresasQuery, (err) => {
        if (err) {
          console.error('Error al crear la tabla de empresas: ', err);
          throw err;
        }
        console.log('Tabla de empresas creada o ya existe');
      });
      const createTableVisitantesQuery = `
          CREATE TABLE IF NOT EXISTS visitantes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT,
            entidad VARCHAR(500),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
          )
        `;
        connection.query(createTableVisitantesQuery, (err) => {
          if (err) {
            console.error('Error al crear la tabla de visitantes: ', err);
            throw err;
          }
          console.log('Tabla de visitantes creada o ya existe');
        });
        const createTableAdministradoresQuery = `
          CREATE TABLE IF NOT EXISTS administradores (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
          )
        `;
        connection.query(createTableAdministradoresQuery, (err) => {
          if (err) {
            console.error('Error al crear la tabla de administradores: ', err);
            throw err;
          }
          console.log('Tabla de administradores creada o ya existe');
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
