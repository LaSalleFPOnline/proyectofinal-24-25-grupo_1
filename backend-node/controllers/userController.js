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
  const { email, password, rol, nombre_empresa, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad } = req.body;
  if (!email || !password || !rol) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }
  // Encripta la contraseña, si hay un error en el proceso se responde con un estado 500
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error al hashear la contraseña:', err);
      return res.status(500).json({ message: 'Error al hashear la contraseña' });
    }
    /*
    Definimos la consulta SQL para insertar un nuevo usuario en la tabla. Si el correo electrónico ya está en uso, se
    responde con un estado 400 otros con estado 500. Si la inserción es exitosa se obtiene el userId que se usará para
    insertar datos adicionales dependiendo del rol
    */
    const insertUserQuery = 'INSERT INTO usuarios (email, password, rol) VALUES (?, ?, ?)';
    connection.query(insertUserQuery, [email, hash, rol], (err, result) => {
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
      /*
      Inserta datos adicionales en las tablas empresas, visitantes y administradores utilizando userId y otros campos
      relacionados. Si se recibe un rol no válido se responde con un estado de error 400
      */
      let insertRoleQuery;
      let roleParams;
      switch (parseInt(rol, 10)) {
        case 1: // Empresa
          insertRoleQuery = 'INSERT INTO empresas (usuario_id, nombre_empresa, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
          roleParams = [userId, nombre_empresa, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad];
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
      /*
      Ejecutamos la consulta SQL especificando el rol y maneja cualquier error que pueda ocurrir. Si la inserción es
      exitosa se responde con un estado 201 y un mensaje de éxito
      */
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
  /*
  Ejecutamos la consulta SQL para buscar al usuario por su correo. Si hay un error en la consulta se responde con un
  estado 500, pero si el usuario existe se almacena en la variable user y se procede a la validación de la contraseña
  */
  const query = 'SELECT * FROM usuarios WHERE email = ?';
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error al consultar usuario en MySQL: ', err);
      return res.status(500).json({ message: 'Error al intentar iniciar sesión' });
    }
    if (results.length > 0) {
      const user = results[0];
      console.log('Usuario encontrado:', user);
      /*
      Compara la contraseña proporcionada con el hash almacenado en la BBDD. Si hay un error se responde con un estado
      500. Si la comparación es exitosa se procede a verificar el rol de usuario y generar un token
      */
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Error al comparar contraseñas:', err);
          return res.status(500).json({ message: 'Error al intentar iniciar sesión' });
        }
        if (isMatch) {
          console.log('Contraseña válida para usuario:', user);
          /*
          Si el usuario tiene un rol de empresa se consuta la tabla empresas para obtener datos adicionales. Si ocurre
          un error en la consulta se responde con un estado 500. Si se encuentran datos de la empresa, se almacenan en
          la variable empresa
          */
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
              /*
              Si los datos de la empresa están completos, se redirige a la feria. Si no se redirige a la página de
              empresa para completar los datos. Se genera un token JWT incluyendo el id y rol de usuario y se envía en
              la respuesta. Se responde con un estado 200 si la respuesta es exitos.
              */
              let redirigir = '';
              if (empresa) {
                const camposCompletos = empresa.entidad && empresa.url_meet && empresa.logo_url &&
                                         empresa.spot_url && empresa.descripcion && empresa.horario_meet &&
                                         empresa.web_url;
                if (camposCompletos) {
                  redirigir = 'feria';
                } else {
                  redirigir = 'empresa';
                }
              } else {
                redirigir = 'empresa';
              }
              const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, {
                expiresIn: JWT_EXPIRES_IN
              });
              res.status(200).json({
                message: 'Inicio de sesión exitoso',
                token: token,
                user: user,
                empresa: empresa,
                redirigir: redirigir
              });
            });
          } else {
            res.status(200).json({
              message: 'Inicio de sesión exitoso',
              token: jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, {
                expiresIn: JWT_EXPIRES_IN
              }),
              user: user,
              empresa: null,
              redirigir: 'feria'
            });
          }
        /*
        Si la contraseña es incorrecta, se responde con un estado 401 y un mensaje de error. Si no se encuentra al
        usuario con mail proporcionado se responde con un estado 404.
        */
        } else {
          console.log('Contraseña inválida para usuario:', user);
          res.status(401).json({ message: 'Credenciales inválidas' });
        }
      });
    } else {
      console.log('Usuario no encontrado con el email:', email);
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  });
}

// Exportamos las funciones para que puedan ser utilizadas en otros archivos de la aplicación
module.exports = {
  registerUser,
  loginUser,
};