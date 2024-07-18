const { connection } = require('./database');

function registerUser(req, res) {
  console.log('Solicitud de registro recibida:', req.body);
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
}

function loginUser(req, res) {
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
}

module.exports = {
  registerUser,
  loginUser,
};
