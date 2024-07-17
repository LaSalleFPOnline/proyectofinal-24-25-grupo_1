/*// backend-node/server.js

const mysql = require('mysql');

// Configuración de la conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

// Conectar a MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a MySQL: ', err);
    throw err;
  }
  console.log('Conexión a MySQL establecida');

  // Crear la base de datos si no existe
  connection.query('CREATE DATABASE IF NOT EXISTS usuarios_db', (err, result) => {
    if (err) {
      console.error('Error al crear la base de datos: ', err);
      throw err;
    }
    console.log('Base de datos usuarios_db creada o ya existente');

    // Usar la base de datos usuarios_db
    connection.query('USE usuarios_db', (err, result) => {
      if (err) {
        console.error('Error al seleccionar la base de datos: ', err);
        throw err;
      }
      console.log('Usando la base de datos usuarios_db');

      // Crear la tabla usuarios si no existe
      connection.query(`CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
      )`, (err, result) => {
        if (err) {
          console.error('Error al crear la tabla usuarios: ', err);
          throw err;
        }
        console.log('Tabla usuarios creada o ya existente');
      });
    });
  });
});

// Cerrar la conexión a MySQL al terminar el programa (opcional)
process.on('SIGINT', () => {
  connection.end();
  console.log('Conexión a MySQL cerrada');
  process.exit();
});*/

/*const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Configuración de la conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'usuarios_db' // Asegúrate de usar la base de datos correcta
});

// Conectar a MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a MySQL: ', err);
    throw err;
  }
  console.log('Conexión a MySQL establecida');
});

// Middleware para parsear el body de las solicitudes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint para registrar usuario
app.post('/register', (req, res) => {
  console.log('Solicitud de registro recibida:', req.body);  // Agrega este log
  const { email, password } = req.body;

  // Insertar usuario en la tabla usuarios
  const query = 'INSERT INTO usuarios (email, password) VALUES (?, ?)';
  connection.query(query, [email, password], (err, result) => {
    if (err) {
      console.error('Error al registrar usuario en MySQL: ', err);
      return res.status(500).json({ message: 'Error al registrar usuario' });
    }
    console.log('Usuario registrado en MySQL:', result);
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Node.js corriendo en http://localhost:${port}`);
});

// Manejar cierre de la conexión a MySQL al terminar el programa (opcional)
process.on('SIGINT', () => {
  connection.end();
  console.log('Conexión a MySQL cerrada');
  process.exit();
});*/
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');


const app = express();
const port = 3001;
// Configuración de CORS
app.use(cors());

// Configuración de la conexión a MySQL
const connection = mysql.createConnection({
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

    // Conectar a la base de datos
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

// Middleware para parsear el body de las solicitudes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint para registrar usuario
app.post('/register', (req, res) => {
  console.log('Solicitud de registro recibida:', req.body);  // Agrega este log
  const { email, password } = req.body;

  // Insertar usuario en la tabla usuarios
  const query = 'INSERT INTO usuarios (email, password) VALUES (?, ?)';
  connection.query(query, [email, password], (err, result) => {
    if (err) {
      console.error('Error al registrar usuario en MySQL: ', err);
      return res.status(500).json({ message: 'Error al registrar usuario' });
    }
    console.log('Usuario registrado en MySQL:', result);
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  });
});
// Endpoint para login de usuario
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Consulta para verificar si el usuario existe en la base de datos
  const query = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';
  connection.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error al consultar usuario en MySQL: ', err);
      return res.status(500).json({ message: 'Error al intentar iniciar sesión' });
    }

    // Verificar si se encontró el usuario
    if (results.length > 0) {
      console.log('Usuario autenticado:', results[0]);
      res.status(200).json({ message: 'Inicio de sesión exitoso', user: results[0] });
    } else {
      console.log('Credenciales inválidas para el usuario:', email);
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  });
});
// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Node.js corriendo en http://localhost:${port}`);
});

// Manejar cierre de la conexión a MySQL al terminar el programa (opcional)
process.on('SIGINT', () => {
  connection.end();
  console.log('Conexión a MySQL cerrada');
  process.exit();
});

