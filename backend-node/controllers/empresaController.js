const { connection } = require('../database/database');

const getEmpresaDataByUsuarioId = (usuario_id, callback) => {
  const query = `
    SELECT e.id AS empresa_id, e.nombre_empresa, e.web_url, e.spot_url, e.logo_url, e.descripcion, e.url_meet, e.horario_meet, e.entidad
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
      console.log('Datos combinados encontrados:', data);
      return callback(null, data);
    } else {
      console.error('No se encontraron datos para el usuario_id:', usuario_id);
      return callback(new Error('Datos no encontrados'));
    }
  });
};

// Función para actualizar la empresa
const updateEmpresa = (empresa, callback) => {
  const { id, nombre_empresa, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad, usuario_id } = empresa;
  console.log('Datos recibidos para actualizar la empresa:', empresa);

  // Actualizar la empresa usando el id
  const updateQuery = `
    UPDATE empresas
    SET nombre_empresa = ?, web_url = ?, spot_url = ?, logo_url = ?, descripcion = ?, url_meet = ?, horario_meet = ?, entidad = ?
    WHERE id = ?
  `;
  connection.query(updateQuery, [nombre_empresa, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad, id], (err) => {
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
  updateEmpresa,
  getEmpresaDataByUsuarioId,
};