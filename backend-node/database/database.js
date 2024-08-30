/*
Importamos la biblioteca mysql2 que es una extensión del módulo original, con soporte mejorado para Promises y otras
características. Este módulo se usa para interactuar con BBDD MySQL
*/
const mysql = require('mysql2');

/*
Se crea una conexión a la BBDD. Especificamos el servidor de la BBDD, el nombre de usuario que se utiliza para
conectarse a la BBDD, y la contraseña del usuario
*/
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

/*
Esta función maneja la inicialización de la BBDD. Se intenta conectar a la BBDD, si ocurre un error se imprime por
la consola y se pasa al callback. Connection.threadId es el identificador del hilo que se conecta a MySQL y es de
ayuda para la depuración
*/
const initializeDatabase = (callback) => {
  connection.connect(err => {
    if (err) {
      console.error('Error conectando a la base de datos: ' + err.stack);
      return callback(err);
    }
    console.log('Conectado a la base de datos con ID ' + connection.threadId);
    // Se ejecuta la consulta SQL para crear la BBDD si aún no existe
    connection.query('CREATE DATABASE IF NOT EXISTS Feria_virtual', (err) => {
      if (err) {
        console.error('Error al crear la base de datos: ', err);
        return callback(err);
      }
      console.log('Base de datos creada o ya existe');
      // Se cambia la conexión para que use la nueva BBDD después de haber sido creada o verificada su existencia
      connection.changeUser({ database: 'Feria_virtual' }, (err) => {
        if (err) {
          console.error('Error al cambiar de base de datos: ', err);
          return callback(err);
        }
        console.log('Conectado a la base de datos Feria_virtual');
        /*
        Se define un array de consultas SQL que crean las tablas necesarias si no existen. Estas tablas incluyen:
        usuarios, empresas, visitantes, administradores, agenda e intereses
        */
        const queries = [
          `CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
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
          )`,
          `CREATE TABLE IF NOT EXISTS agenda (
            id INT AUTO_INCREMENT PRIMARY KEY,
            horaI TIME NOT NULL,
            horaF TIME NOT NULL,
            descripcion VARCHAR(3000),
            detalles VARCHAR(3000)
          )`,
          `CREATE TABLE IF NOT EXISTS intereses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            empresa_id INT NOT NULL,
            empresa_interesada_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (empresa_id) REFERENCES empresas(id),
            FOREIGN KEY (empresa_interesada_id) REFERENCES empresas(id)
          )`,
          `CREATE TABLE IF NOT EXISTS votaciones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            empresa_id INT NOT NULL,
            voto TINYINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
            FOREIGN KEY (empresa_id) REFERENCES empresas(id)
          )`
        ];
        /*
        Iteramos sobre cada consulta para crear las tablas. CompletedQueries lleva un conteo de las consultas completas.
        Cuando todas las tablas han sido creadas, se invoca el callback con null, indicando que todo fue exitoso
        */
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
              callback(null);
            }
          });
        });
      });
    });
  });
};

/*
Cierra la conexión a la BBDD. Connection.end cierra la conexión activa. Si hay un error se maneja y se pasa al callback.
Si no hay errores, se imprime un mensaje indicando que la conexión fue cerrada con éxito
*/
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

// Se exportan las funciones y el objeto para que puedan ser utilizadas en otros módulos de la aplicación
module.exports = {
  initializeDatabase,
  endDatabaseConnection,
  connection
};