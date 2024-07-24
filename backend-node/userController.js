const { connection } = require('./database');

function registerUser(req, res) {
  console.log('Solicitud de registro recibida:', req.body);
  const { nombre, email, password, rol, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad } = req.body;

  // Verificar que todos los campos necesarios estén presentes
  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  // Insertar usuario en la tabla usuarios
  const insertUserQuery = 'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)';
  connection.query(insertUserQuery, [nombre, email, password, rol], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.error('Error: El correo electrónico ya está en uso');
        return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
      }
      console.error('Error al registrar usuario en MySQL: ', err);
      return res.status(500).json({ message: 'Error al registrar usuario en el back' });
    }
    console.log('Usuario registrado en MySQL:', result);

    const userId = result.insertId;

    // Insertar datos en la tabla correspondiente según el rol
    let insertRoleQuery;
    let roleParams;

    switch (parseInt(rol, 10)) {
      case 1: // Empresa
        insertRoleQuery = 'INSERT INTO empresas (usuario_id, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        roleParams = [userId, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad];
        break;
      case 2: // Visitante
        insertRoleQuery = 'INSERT INTO visitantes (usuario_id, entidad) VALUES (?, ?)';
        roleParams = [userId, entidad];
        break;
      case 3: // Administrador
        insertRoleQuery = 'INSERT INTO administradores (usuario_id) VALUES (?)';
        roleParams = [userId];
        break;
      default:
        console.error('Rol no válido:', rol);
        return res.status(400).json({ message: 'Rol no válido' });
    }

    connection.query(insertRoleQuery, roleParams, (err, result) => {
      if (err) {
        console.error('Error al registrar rol en MySQL: ', err);
        return res.status(500).json({ message: 'Error al registrar rol' });
      }
      console.log('Rol registrado en MySQL:', result);
      res.status(201).json({ message: 'Usuario registrado exitosamente con rol correspondiente' });
    });
  });
}

function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  const query = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';
  connection.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error al consultar usuario en MySQL: ', err);
      return res.status(500).json({ message: 'Error al intentar iniciar sesión' });
    }

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



