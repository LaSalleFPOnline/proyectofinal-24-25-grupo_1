// Cargamos las variables desde .env para acceder a configuraciones sensibles de forma segura
require('dotenv').config();
/*
Se importa la conexión a la BBDD. Esta conexión es necesaria para ejecutar consultas y recuperar datos desde la BBDD.
Importamos el módulo para crear y verificar tokens JWT. Importamos el módulo para encriptar contraseñas y verificar
contraseñas encriptadas
*/
const { connection } = require('../database/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Variables de entorno para recuperar la clave secreta para firmar tokens y el tiempo de expiración de los tokens
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

/*
La función recibe los datos del cuerpo de la solicitud y si faltan el email, password, o rol, la función responde con
un estado 400 y un mensaje de error
*/
function registerUser(req, res) {
  console.log('Solicitud de registro recibida:', req.body);

  const { 
      email, 
      password, 
      rol, 
      nombre_empresa, 
      web_url, 
      spot_url, 
      logo_url, 
      descripcion, 
      url_meet, 
      horario_meet_morning_start, 
      horario_meet_morning_end, 
      horario_meet_afternoon_start, 
      horario_meet_afternoon_end, 
      entidad 
  } = req.body;

  if (!email) {
      console.log('Error: El email es obligatorio');
      return res.status(400).json({ message: 'El email es obligatorio' });
  }

  const checkUserQuery = 'SELECT * FROM usuarios WHERE email = ?';
  connection.query(checkUserQuery, [email], (err, results) => {
      if (err) {
          console.error('Error al consultar usuario en MySQL:', err);
          return res.status(500).json({ message: 'Error al consultar el email' });
      }

      console.log('Resultados de la consulta de usuario:', results);

      if (results.length > 0) {
          const user = results[0];
          if (user.password) {
              console.log('Correo ya registrado con contraseña');
              return res.status(400).json({ message: 'Este correo ya está registrado' });
          } else {
              console.log('Correo registrado sin contraseña');
              if (!password) {
                  console.log('Error: Debes proporcionar una contraseña');
                  return res.status(400).json({ message: 'Debes proporcionar una contraseña' });
              }
              bcrypt.hash(password, 10, (err, hash) => {
                  if (err) {
                      console.error('Error al hashear la contraseña:', err);
                      return res.status(500).json({ message: 'Error al hashear la contraseña' });
                  }
                  console.log('Contraseña hasheada:', hash);
                  const updatePasswordQuery = 'UPDATE usuarios SET password = ? WHERE email = ?';
                  connection.query(updatePasswordQuery, [hash, email], (err, result) => {
                      if (err) {
                          console.error('Error al actualizar la contraseña:', err);
                          return res.status(500).json({ message: 'Error al actualizar la contraseña' });
                      }
                      console.log('Contraseña actualizada para el usuario:', result);
                      
                      // Insertar los datos de la empresa
                      if (parseInt(rol, 10) === 1) { // Empresa
                          const insertEmpresaQuery = 'INSERT INTO empresas (usuario_id, nombre_empresa, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet_morning_start, horario_meet_morning_end, horario_meet_afternoon_start, horario_meet_afternoon_end, entidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                          const empresaParams = [user.id, nombre_empresa, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet_morning_start, horario_meet_morning_end, horario_meet_afternoon_start, horario_meet_afternoon_end, entidad];

                          connection.query(insertEmpresaQuery, empresaParams, (err, result) => {
                              if (err) {
                                  console.error('Error al registrar empresa en MySQL: ', err);
                                  return res.status(500).json({ message: 'Error al registrar empresa' });
                              }
                              console.log('Empresa registrada en MySQL:', result);
                              res.status(201).json({ message: 'Empresa registrada exitosamente' });
                          });
                      } else {
                          res.status(200).json({ message: 'Contraseña actualizada. Redirigiendo al login...' });
                      }
                  });
              });
              return;
          }
      } else {
          console.log('El correo no está registrado');
          if (!password) {
              console.log('Error: Debes proporcionar una contraseña');
              return res.status(400).json({ message: 'Debes proporcionar una contraseña' });
          }
          bcrypt.hash(password, 10, (err, hash) => {
              if (err) {
                  console.error('Error al hashear la contraseña:', err);
                  return res.status(500).json({ message: 'Error al hashear la contraseña' });
              }

              console.log('Contraseña hasheada:', hash);

              const insertUserQuery = 'INSERT INTO usuarios (email, password, rol) VALUES (?, ?, ?)';
              connection.query(insertUserQuery, [email, hash, rol], (err, result) => {
                  if (err) {
                      console.error('Error al registrar usuario en MySQL:', err);
                      return res.status(500).json({ message: 'Error al registrar usuario en el back' });
                  }
                  console.log('Usuario registrado en MySQL:', result);

                  const userId = result.insertId;
                  let insertRoleQuery;
                  let roleParams;

                  switch (parseInt(rol, 10)) {
                      case 1: // Empresa
                          insertRoleQuery = 'INSERT INTO empresas (usuario_id, nombre_empresa, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet_morning_start, horario_meet_morning_end, horario_meet_afternoon_start, horario_meet_afternoon_end, entidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                          roleParams = [userId, nombre_empresa, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet_morning_start, horario_meet_morning_end, horario_meet_afternoon_start, horario_meet_afternoon_end, entidad];
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

                  console.log('Insertando en la tabla de rol con la consulta:', insertRoleQuery);
                  console.log('Datos a insertar para el rol:', roleParams);

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
  });
}




/*
La función recibe el email y password del cuerpo de la solicitud. Si faltan el email o pasword la función responde con
un estado 400 y un mensaje de error
*/
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
          if (user.rol === 1) {
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
              const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
              console.log('Token generado:', token);
              return res.status(200).json({ token, empresa, rol: user.rol }); // Asegúrate de incluir el rol aquí
            });
          } else {
            const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            console.log('Token generado para visitante/administrador:', token);
            return res.status(200).json({ token, rol: user.rol }); // Asegúrate de incluir el rol aquí
          }
        } else {
          console.log('Contraseña inválida');
          return res.status(401).json({ message: 'Credenciales inválidas', rol: null });
        }
      });
    } else {
      console.log('Usuario no encontrado');
      return res.status(401).json({ message: 'Credenciales inválidas', rol: null });
    }
  });
}

// Función para verificar el correo electrónico
function checkEmail(req, res) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'El email es obligatorio' });
  }

  // Verifica si el email está registrado
  const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = ?';
  connection.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error('Error al consultar el email en MySQL:', err);
      return res.status(500).json({ message: 'Error al consultar el email' });
    }

    if (results.length > 0) {
      const user = results[0];
      if (user.password) {
        // El correo está registrado y tiene un password
        return res.status(200).json({
          message: 'Este correo ya está registrado',
          rol: user.rol // Añade el rol a la respuesta
        });
      } else {
        // El correo está registrado pero no tiene un password
        return res.status(200).json({
          message: 'El correo está registrado sin contraseña',
          email: user.email, // Añade el email
          rol: user.rol // Añade el rol a la respuesta
        });
      }
    } else {
      // El correo no está registrado
      return res.status(200).json({ message: 'Credenciales inválidas', rol: null });
    }
  });
}


// Función para obtener los detalles del usuario
function getUserDetails(req, res) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'El email es obligatorio' });
  }

  // Consulta para obtener los detalles del usuario por email
  const getUserQuery = 'SELECT * FROM usuarios WHERE email = ?';
  connection.query(getUserQuery, [email], (err, results) => {
    if (err) {
      console.error('Error al obtener los detalles del usuario en MySQL:', err);
      return res.status(500).json({ message: 'Error al obtener los detalles del usuario' });
    }

    if (results.length > 0) {
      const user = results[0];
      return res.status(200).json({
        user: user,
        email: user.email,
        rol: user.rol // Asegúrate de incluir el rol en la respuesta
      });
    } else {
      // Si el usuario no existe, devolvemos un 404
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
  });
}


// Exportamos las funciones para que puedan ser utilizadas en otros archivos de la aplicación
module.exports = {
  registerUser,
  loginUser,
  checkEmail,
  getUserDetails,
};