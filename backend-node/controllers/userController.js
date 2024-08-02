const { connection } = require('../database/database');
const bcrypt = require('bcrypt');

function registerUser(req, res) {
  console.log('Solicitud de registro recibida:', req.body);
  const { nombre, email, password, rol, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error al hashear la contraseña:', err);
      return res.status(500).json({ message: 'Error al hashear la contraseña' });
    }

    const insertUserQuery = 'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)';
    connection.query(insertUserQuery, [nombre, email, hash, rol], (err, result) => {
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
  });
}

/*function loginUser(req, res) {
  const { email, password } = req.body;
  console.log('Datos recibidos:', { email, password });

  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  const query = 'SELECT * FROM usuarios WHERE email = ?';
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error al consultar usuario en MySQL: ', err);
      return res.status(500).json({ message: 'Error al intentar iniciar sesión' });
    }

    if (results.length > 0) {
      const user = results[0];
      console.log('Usuario encontrado:', user);

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Error al comparar contraseñas:', err);
          return res.status(500).json({ message: 'Error al intentar iniciar sesión' });
        }

        if (isMatch) {
          console.log('Contraseña válida para usuario:', user);

          let empresaQuery = null;
          let empresaParams = [];

          if (user.rol === 1) { // Si es una empresa
            empresaQuery = 'SELECT * FROM empresas WHERE usuario_id = ?';
            empresaParams = [user.id];
          }

          if (empresaQuery) {
            connection.query(empresaQuery, empresaParams, (err, empresaResults) => {
              if (err) {
                console.error('Error al consultar empresa en MySQL: ', err);
                return res.status(500).json({ message: 'Error al intentar iniciar sesión' });
              }
              console.log('Empresa encontrada:', empresaResults[0]);
              res.status(200).json({
                message: 'Inicio de sesión exitoso',
                user: user,
                empresa: empresaResults[0] || null
              });
            });
          } else {
            res.status(200).json({
              message: 'Inicio de sesión exitoso',
              user: user,
              empresa: null
            });
          }
        } else {
          console.log('Contraseña inválida para usuario:', user);
          res.status(401).json({ message: 'Credenciales inválidas' });
        }
      });
    } else {
      console.log('Usuario no encontrado con email:', email);
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  });
}*/
function loginUser(req, res) {
  const { email, password } = req.body;
  console.log('Datos recibidos:', { email, password });

  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  const query = 'SELECT * FROM usuarios WHERE email = ?';
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error al consultar usuario en MySQL: ', err);
      return res.status(500).json({ message: 'Error al intentar iniciar sesión' });
    }

    if (results.length > 0) {
      const user = results[0];
      console.log('Usuario encontrado:', user);

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Error al comparar contraseñas:', err);
          return res.status(500).json({ message: 'Error al intentar iniciar sesión' });
        }

        if (isMatch) {
          console.log('Contraseña válida para usuario:', user);

          let empresaQuery = null;
          let empresaParams = [];

          if (user.rol === 1) { // Si es una empresa
            empresaQuery = 'SELECT * FROM empresas WHERE usuario_id = ?';
            empresaParams = [user.id];
          }

          if (empresaQuery) {
            connection.query(empresaQuery, empresaParams, (err, empresaResults) => {
              if (err) {
                console.error('Error al consultar empresa en MySQL: ', err);
                return res.status(500).json({ message: 'Error al intentar iniciar sesión' });
              }

              const empresa = empresaResults[0] || null;
              let redirigir = '';

              if (empresa) {
                // Verificar si todos los campos necesarios están completos
                const camposCompletos = empresa.entidad && empresa.url_meet && empresa.logo_url &&
                                         empresa.spot_url && empresa.descripcion && empresa.horario_meet &&
                                         empresa.web_url;

                // Determinar redirección basada en la completitud de los campos
                if (camposCompletos) {
                  redirigir = 'feria';
                } else {
                  redirigir = 'empresa';
                }
              } else {
                redirigir = 'empresa'; // Redirigir a empresa si no hay datos de la empresa
              }

              res.status(200).json({
                message: 'Inicio de sesión exitoso',
                user: user,
                empresa: empresa,
                redirigir: redirigir // Indica a qué página redirigir
              });
            });
          } else {
            res.status(200).json({
              message: 'Inicio de sesión exitoso',
              user: user,
              empresa: null,
              redirigir: 'feria' // Redirigir a feria si no hay datos de la empresa (para usuarios que no son empresas)
            });
          }
        } else {
          console.log('Contraseña inválida para usuario:', user);
          res.status(401).json({ message: 'Credenciales inválidas' });
        }
      });
    } else {
      console.log('Usuario no encontrado con email:', email);
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  });
}

module.exports = {
  registerUser,
  loginUser,
};