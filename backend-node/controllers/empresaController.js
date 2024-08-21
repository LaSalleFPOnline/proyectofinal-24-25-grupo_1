const { connection } = require('../database/database');

// Función para obtener el usuario_id a partir del nombre
const getUsuarioIdByNombre = (nombre, callback) => {
  const query = 'SELECT id FROM usuarios WHERE nombre = ?';
  connection.query(query, [nombre], (err, results) => {
    if (err) {
      console.error('Error al buscar el usuario_id: ', err);
      return callback(err);
    }
    if (results.length > 0) {
      return callback(null, results[0].id);
    } else {
      return callback(new Error('Empresa no registrada, por favor regístrate o ponte en contacto con el administrador.'));
    }
  });
};

const getEmpresaDataByUsuarioId = (usuario_id, callback) => {
  const query = `
    SELECT u.nombre AS nombreEmpresa, e.nombre_empresa, e.web_url, e.spot_url, e.logo_url, e.descripcion, e.url_meet, e.horario_meet, e.entidad
    FROM usuarios u
    JOIN empresas e ON u.id = e.usuario_id
    WHERE u.id = ?
  `;
  console.log('Ejecutando consulta con usuario_id:', usuario_id);

  connection.query(query, [usuario_id], (err, results) => {
    if (err) {
      console.error('Error al obtener datos combinados: ', err);
      return callback(err);
    }
    console.log('Resultados de la consulta:', results);

    if (results.length > 0) {
      const data = results[0];
      console.log('Nombre de empresa:', data.nombreEmpresa);
      console.log('Datos combinados encontrados:', data);
      return callback(null, results[0]);
    } else {
      console.error('No se encontraron datos para el usuario_id:', usuario_id);
      return callback(new Error('Datos no encontrados'));
    }
  });
};

// Función para actualizar la empresa y el nombre del usuario
const updateEmpresa = (empresa, callback) => {
  const { nombre_empresa, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad, usuario_id } = empresa;
  console.log('Datos recibidos para actualizar la empresa:', empresa);

  // Solo actualizar el nombre del usuario si se proporciona un valor válido
  if (nombre_empresa) {
    const updateUserQuery = 'UPDATE usuarios SET nombre = ? WHERE id = ?';
    connection.query(updateUserQuery, [nombre_empresa, usuario_id], (err) => {
      if (err) {
        console.error('Error al actualizar el nombre del usuario: ', err);
        return callback(err);
      }
      console.log('Nombre del usuario actualizado correctamente');
    });
  } else {
    console.log('No se proporcionó un nuevo nombre, se omite la actualización del nombre del usuario.');
  }

  // Actualizar la empresa usando el usuario_id
  const updateQuery = `
    UPDATE empresas
    SET nombre_empresa = ?, web_url = ?, spot_url = ?, logo_url = ?, descripcion = ?, url_meet = ?, horario_meet = ?, entidad = ?
    WHERE usuario_id = ?
  `;
  connection.query(updateQuery, [nombre_empresa, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad, usuario_id], (err) => {
    if (err) {
      console.error('Error al actualizar la empresa: ', err);
      return callback(err);
    }

    console.log('Empresa actualizada correctamente');

    // Obtener los datos combinados de usuarios y empresas
    getEmpresaDataByUsuarioId(usuario_id, (err, data) => {
      if (err) {
        console.error('Error al obtener datos combinados después de actualizar:', err);
        return callback(err);
      }
      console.log('Datos combinados después de la actualización:', data);
      return callback(null, data);
    });
  });
};

module.exports = {
  getUsuarioIdByNombre,
  updateEmpresa,
  getEmpresaDataByUsuarioId,
};