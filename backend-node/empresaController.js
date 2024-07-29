const { connection } = require('./database');

/*const updateEmpresa = (empresa, callback) => {
    const { usuario_id, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad } = empresa;
  
    const checkEmpresaQuery = 'SELECT * FROM empresas WHERE usuario_id = ?';
    connection.query(checkEmpresaQuery, [usuario_id], (err, results) => {
      if (err) {
        console.error('Error al buscar la empresa: ', err);
        return callback(err);
      }
  
      if (results.length > 0) {
        const updateQuery = `
          UPDATE empresas SET web_url = ?, spot_url = ?, logo_url = ?, descripcion = ?, url_meet = ?, horario_meet = ?, entidad = ?
          WHERE usuario_id = ?
        `;
        connection.query(updateQuery, [web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad, usuario_id], (err) => {
          if (err) {
            console.error('Error al actualizar la empresa: ', err);
            return callback(err);
          }
          console.log('Empresa actualizada correctamente');
          callback(null);
        });
      } else {
        console.error('La empresa no existe.');
        callback(new Error('La empresa no existe.'));
      }
    });
  };*/
 // const connection = require('./database').connection; // Asegúrate de importar la conexión correctamente

  // Función para obtener el usuario_id a partir del nombre
  const getUsuarioIdByNombre = (nombre, callback) => {
    const query = 'SELECT id FROM usuarios WHERE nombre = ?';
    connection.query(query, [nombre], (err, results) => {
      if (err) {
        console.error('Error al buscar el usuario_id: ', err);
        return callback(err);
      }
      if (results.length > 0) {
        callback(null, results[0].id);
      } else {
        callback(new Error('Empresa no registrada, por favor regístrate o ponte en contacto con el administrador.'));
      }
    });
  };
  
  // Función para actualizar la empresa usando el usuario_id
  const updateEmpresa = (empresa, callback) => {
    const { nombre, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad } = empresa;
  
    getUsuarioIdByNombre(nombre, (err, usuario_id) => {
      if (err) {
        console.error('Error al obtener usuario_id: ', err);
        return callback(err);
      }
  
      // Actualizar la empresa usando el usuario_id
      const updateQuery = `
        UPDATE empresas SET web_url = ?, spot_url = ?, logo_url = ?, descripcion = ?, url_meet = ?, horario_meet = ?, entidad = ?
        WHERE usuario_id = ?
      `;
      connection.query(updateQuery, [web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad, usuario_id], (err) => {
        if (err) {
          console.error('Error al registrar la empresa: ', err);
          return callback(err);
        }
        console.log('Empresa registrada correctamente');
        callback(null);
      });
    });
  };
  
  module.exports = {
    getUsuarioIdByNombre,
    updateEmpresa
  };
  
 