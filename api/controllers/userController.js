require('dotenv').config();

const { connection } = require('../database/database');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require("mysql2");
const keys = require("../keys");
const JWT_SECRET = "admin";
const JWT_EXPIRES_IN = "1h";
const upload = multer({ dest: 'logos/' });

function registerUser(req, res) {
  console.log('Solicitud de registro recibida:', req.body);
  const connection = mysql.createConnection({
    host: keys.dbHost,
    user: "root",
    password: "root",
    port: keys.dbPort,
    database: keys.dbDatabase,
  });
  connection.connect((err) => {
    if (err) {
      console.error("Error al conectar a la base de datos:", err);
      return res.status(500).json({ message: "Error de conexión a la base de datos" });
    }
    const {
      email,
      password,
      entidad,
      rol,
      nombre_empresa,
      web,
      spot,
      logo,
      descripcion,
      url_meet,
      horario_meet_morning_start,
      horario_meet_morning_end,
      horario_meet_afternoon_start,
      horario_meet_afternoon_end
      } = req.body;
      const logoPath = req.file ? req.file.path : null;
    if (!email) {
      console.log('Error: El email es obligatorio');
      connection.destroy();
      return res.status(400).json({ message: 'El email es obligatorio' });
    }
    const checkUserQuery = `SELECT * FROM usuario
                          WHERE email = ?`;
    connection.query(checkUserQuery, [email], (err, results) => {
      if (err) {
        console.error('Error al consultar usuario en MySQL:', err);
        connection.destroy();
        return res.status(500).json({ message: 'Error al consultar el email' });
      }
      console.log('Resultados de la consulta de usuario:', results);
      if (results.length > 0) {
        const user = results[0];
        if (user.password) {
          console.log('Correo ya registrado con contraseña');
          connection.destroy();
          return res.status(400).json({ message: 'Este correo ya está registrado' });
        } else {
          console.log('Correo registrado sin contraseña');
          if (!password) {
            console.log('Error: Debes proporcionar una contraseña');
            connection.destroy();
            return res.status(400).json({ message: 'Debes proporcionar una contraseña' });
          }
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              console.error('Error al hashear la contraseña:', err);
              connection.destroy();
              return res.status(500).json({ message: 'Error al hashear la contraseña' });
            }
            console.log('Contraseña hasheada:', hash);
            const updatePasswordQuery = `UPDATE usuario
                                        SET password = ?
                                        WHERE email = ?`;
            connection.query(updatePasswordQuery, [hash, email], (err, result) => {
              if (err) {
                console.error('Error al actualizar la contraseña:', err);
                connection.destroy();
                return res.status(500).json({ message: 'Error al actualizar la contraseña' });
              }
              console.log('Contraseña actualizada para el usuario:', result);
              if (parseInt(rol, 10) === 1) {
                const insertEmpresaQuery = `INSERT INTO empresa
                                          (id_usuario, nombre_empresa, web, spot, logo, descripcion, url_meet, horario_meet_morning_start, horario_meet_morning_end, horario_meet_afternoon_start, horario_meet_afternoon_end)
                                          VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const empresaParams = [
                  user.id_usuario,
                  nombre_empresa,
                  web, spot,
                  logoPath,
                  descripcion,
                  url_meet,
                  horario_meet_morning_start || null,
                  horario_meet_morning_end || null,
                  horario_meet_afternoon_start || null,
                  horario_meet_afternoon_end || null,
                ];
                connection.query(insertEmpresaQuery, empresaParams, (err, result) => {
                  if (err) {
                    console.error('Error al registrar empresa en MySQL: ', err);
                    connection.destroy();
                    return res.status(500).json({ message: 'Error al registrar empresa' });
                  }
                  console.log('Empresa registrada en MySQL:', result);
                  connection.destroy();
                  res.status(201).json({ message: 'Empresa registrada exitosamente', entidad });
                });
              } else {
                connection.destroy();
                res.status(200).json({ message: 'Contraseña actualizada. Redirigiendo al login...', entidad });
              }
            });
          });
          return;
        }
      } else {
        console.log('El correo no está registrado');
        if (!password) {
          console.log('Error: Debes proporcionar una contraseña');
          connection.destroy();
          return res.status(400).json({ message: 'Debes proporcionar una contraseña' });
        }
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            console.error('Error al hashear la contraseña:', err);
            connection.destroy();
            return res.status(500).json({ message: 'Error al hashear la contraseña' });
          }
          console.log('Contraseña hasheada:', hash);
          const insertUserQuery = `INSERT INTO usuario (email, password, entidad, rol)
                                  VALUES (?, ?, ?, ?)`;
          connection.query(insertUserQuery, [email, hash, entidad, rol], (err, result) => {
            if (err) {
              console.error('Error al registrar usuario en MySQL:', err);
              connection.destroy();
              return res.status(500).json({ message: 'Error al registrar usuario en el back' });
            }
            console.log('Usuario registrado en MySQL:', result);
            const userId = result.insertId;
            let insertRoleQuery;
            let roleParams;
            switch (parseInt(rol, 10)) {
              case 1: // Empresa
                insertRoleQuery = `INSERT INTO empresa
                                  (id_usuario, nombre_empresa, web, spot, logo, descripcion, url_meet, horario_meet_morning_start, horario_meet_morning_end, horario_meet_afternoon_start, horario_meet_afternoon_end)
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                roleParams = [userId, nombre_empresa, web, spot, logo, descripcion, url_meet, horario_meet_morning_start, horario_meet_morning_end, horario_meet_afternoon_start, horario_meet_afternoon_end];
                break;
              case 2: // Visitante
                insertRoleQuery = `INSERT INTO visitante (id_usuario)
                                  VALUES (?, ?)`;
                roleParams = [userId];
                break;
              case 3: // Administrador
                insertRoleQuery = `INSERT INTO administrador (id_usuario)
                                  VALUES (?, ?)`;
                roleParams = [userId];
                break;
              default:
                console.error('Rol no válido:', rol);
                connection.destroy();
                return res.status(400).json({ message: 'Rol no válido' });
            }
            console.log('Insertando en la tabla de rol con la consulta:', insertRoleQuery);
            console.log('Datos a insertar para el rol:', roleParams);
            connection.query(insertRoleQuery, roleParams, (err, result) => {
              if (err) {
                console.error('Error al registrar rol en MySQL: ', err);
                connection.destroy();
                return res.status(500).json({ message: 'Error al registrar rol' });
              }
              console.log('Rol registrado en MySQL:', result);
              connection.destroy();
              res.status(201).json({ message: 'Usuario registrado exitosamente con rol correspondiente' });
            });
          });
        });
      }
    });
  });
}

function loginUser(req, res) {
  const { email, password } = req.body;
  console.log('Datos recibidos:', { email, password });
  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }
  const query = 'SELECT * FROM usuario WHERE email = ?';
  const connection = mysql.createConnection({
    host: keys.dbHost,
    // user: keys.dbUser,
    // password: keys.dbPassword,
    user: "root",
    password: "root",
    port: keys.dbPort,
    database: keys.dbDatabase,
  });
  connection.connect((err) => {
    if (err) {
      console.error(
        "Error al reconectar a la base de datos desde /agenda:",
        err
      );
    }
    connection.query(query, [email], (err, results) => {
      if (err) {
        console.error('Error al consultar usuario en MySQL: ', err);
        connection.destroy();
        return res.status(500).json({ message: 'Error al intentar iniciar sesión' });
      }
      if (results.length > 0) {
        const user = results[0];
        console.log('Usuario encontrado:', user);
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            console.error('Error al comparar contraseñas:', err);
            connection.destroy();
            return res.status(500).json({ message: 'Error al intentar iniciar sesión' });
          }
          if (isMatch) {
            console.log('Contraseña válida para usuario:', user);
            let empresaQuery = null;
            let empresaParams = [];
            if (user.rol === 1) {
              empresaQuery = `SELECT * FROM empresa
                            WHERE id_usuario = ?`;
              empresaParams = [user.id_usuario];
            }
            if (empresaQuery) {
              connection.query(empresaQuery, empresaParams, (err, empresaResults) => {
                if (err) {
                  console.error('Error al consultar empresa en MySQL: ', err);
                  connection.destroy();
                  return res.status(500).json({ message: 'Error al intentar iniciar sesión' });
                }
                const empresa = empresaResults[0] || null;
                const token = jwt.sign({ id: user.id_usuario, rol: user.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
                console.log('Token generado:', token);
                connection.destroy();
                return res.status(200).json({ token, empresa, entidad: user.entidad, rol: user.rol, user });
              });
            } else {
              const token = jwt.sign({ id: user.id_usuario, rol: user.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
              console.log('Token generado para visitante/administrador:', token);
              const entidadQuery = `SELECT entidad FROM usuario
                                  WHERE id_usuario = ?`;
              connection.query(entidadQuery, [user.id_usuario], (err, entidadResults) => {
                if (err) {
                  console.error('Error al consultar entidad en MySQL: ', err);
                  connection.destroy();
                  return res.status(500).json({ message: 'Error al intentar iniciar sesión' });
                }
                const entidad = entidadResults[0].entidad;
                connection.destroy();
                return res.status(200).json({ token, rol: user.rol, entidad });
              });
            }
          } else {
            console.log('Contraseña inválida');
            connection.destroy();
            return res.status(401).json({ message: 'Credenciales inválidas', rol: null });
          }
        });
      } else {
        console.log('Usuario no encontrado');
        connection.destroy();
        return res.status(401).json({ message: 'Credenciales inválidas', rol: null });
      }
    });
  });
}

function checkEmail(req, res) {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'El email es obligatorio' });
  }
  const checkEmailQuery = `SELECT * FROM usuario
                          WHERE email = ?`;
  const connection = mysql.createConnection({
    host: keys.dbHost,
    // user: keys.dbUser,
    // password: keys.dbPassword,
    user: "root",
    password: "root",
    port: keys.dbPort,
    database: keys.dbDatabase,
  });
  connection.connect((err) => {
    if (err) {
      console.error(
        "Error al reconectar a la base de datos desde /agenda:",
        err
      );
    }
    connection.query(checkEmailQuery, [email], (err, results) => {
      if (err) {
        console.error('Error al consultar el email en MySQL:', err);
        connection.destroy();
        return res.status(500).json({ message: 'Error al consultar el email' });
      }
      if (results.length > 0) {
        const user = results[0];
        if (user.password) {
          connection.destroy();
          return res.status(200).json({
            message: 'Este correo ya está registrado',
            rol: user.rol,
            entidad: user.entidad
          });
        } else {
          connection.destroy();
          return res.status(200).json({
            message: 'El correo está registrado sin contraseña',
            email: user.email,
            rol: user.rol,
            entidad: user.entidad
          });
        }
      } else {
        connection.destroy();
        return res.status(200).json({ message: 'Credenciales inválidas', rol: null });
      }
    });
  });
}

function getUserDetails(req, res) {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'El email es obligatorio' });
  }
  const getUserQuery = `SELECT * FROM usuario
                      WHERE email = ?`;
  const connection = mysql.createConnection({
    host: keys.dbHost,
    // user: keys.dbUser,
    // password: keys.dbPassword,
    user: "root",
    password: "root",
    port: keys.dbPort,
    database: keys.dbDatabase,
  });
  connection.connect((err) => {
    if (err) {
      console.error(
        "Error al reconectar a la base de datos desde /agenda:",
        err
      );
    }
    connection.query(getUserQuery, [email], (err, results) => {
      if (err) {
        console.error('Error al obtener los detalles del usuario en MySQL:', err);
        connection.destroy();
        return res.status(500).json({ message: 'Error al obtener los detalles del usuario' });
      }
      if (results.length > 0) {
        const user = results[0];
        connection.destroy();
        return res.status(200).json({
          user: user,
          email: user.email,
          rol: user.rol,
          entidad: user.entidad
        });
      } else {
        connection.destroy();
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
    });
  });
}

function cambiarContrasena(req, res) {
  const { usuarioId, nuevaContrasena } = req.body;
  if (!usuarioId || !nuevaContrasena) {
    return res.status(400).json({ message: 'Usuario ID y nueva contraseña son obligatorios' });
  }
  const connection = mysql.createConnection({
    host: keys.dbHost,
    // user: keys.dbUser,
    // password: keys.dbPassword,
    user: "root",
    password: "root",
    port: keys.dbPort,
    database: keys.dbDatabase,
  });
  connection.connect((err) => {
    if (err) {
      console.error(
        "Error al reconectar a la base de datos desde /agenda:",
        err
      );
    }
    bcrypt.hash(nuevaContrasena, 10, (err, hash) => {
      if (err) {
        console.error('Error al hashear la nueva contraseña:', err);
        connection.destroy();
        return res.status(500).json({ message: 'Error al cambiar la contraseña' });
      }
      const updatePasswordQuery = `UPDATE usuario
                                  SET password = ?
                                  WHERE id_usuario = ?`;
      connection.query(updatePasswordQuery, [hash, usuarioId], (err, result) => {
        if (err) {
          console.error('Error al actualizar la contraseña:', err);
          connection.destroy();
          return res.status(500).json({ message: 'Error al actualizar la contraseña' });
        }
        connection.destroy();
        res.status(200).json({ message: 'Contraseña cambiada exitosamente' });
      });
    });
  });
}

function getUsuariosSinPassword(req, res) {
  const query = `SELECT * FROM usuario
                WHERE rol = 1
                AND (password IS NULL OR password = \'\')`;
  const connection = mysql.createConnection({
    host: keys.dbHost,
    // user: keys.dbUser,
    // password: keys.dbPassword,
    user: "root",
    password: "root",
    port: keys.dbPort,
    database: keys.dbDatabase,
  });
  connection.connect((err) => {
    if (err) {
      console.error(
        "Error al reconectar a la base de datos desde /agenda:",
        err
      );
    }
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios sin contraseña:', err);
            connection.destroy();
            return res.status(500).json({ message: 'Error al obtener usuarios' });
        }
        connection.destroy();
        res.status(200).json(results);
    });
  });
}

module.exports = {
  registerUser,
  loginUser,
  checkEmail,
  getUserDetails,
  cambiarContrasena,
  getUsuariosSinPassword
};