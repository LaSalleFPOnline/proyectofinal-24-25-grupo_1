// Se importa la conexión a la BBDD. Esta conexión es necesaria para ejecutar consultas y recuperar datos desde la BBDD
const { connection } = require('../database/database');

/*
Definimos una función que acepta 2 parámetros: el ID del usuario para buscar la empresa asociada y una función de
callback que se ejecutará después de completar la operación de la BBDD. Realizamos la consulta SQL que selecciona varios
campos de la tabla usuarios utilizando el campo usuario_id. Y registra el usuario_id en la consola con el que se
ejecutará la consulta.
*/
const getEmpresaDataByUsuarioId = (id_usuario, callback) => {
  const query = `
    SELECT e.id_empresa AS id_empresa, e.nombre_empresa, e.web, e.spot, e.logo, e.descripcion, e.url_meet, e.horario_meet_morning_start, e.horario_meet_morning_end, e.horario_meet_afternoon_start, e.horario_meet_afternoon_end
    FROM usuario u
    JOIN empresa e ON u.id_usuario = e.id_usuario
    WHERE u.id_usuario = ?
  `;
  console.log('Ejecutando consulta con usuario_id:',id_usuario);
  connection.query(query, [id_usuario], (err, results) => {
    if (err) {
      console.error('Error al obtener datos combinados: ', err);
      return callback(err);
    }
    console.log('Resultados de la consulta:', JSON.stringify(results, null, 2)); // Imprime los resultados completos
    if (results.length > 0) {
      const data = results[0];  // Selecciona el primer resultado
      console.log('Datos combinados encontrados:', data);
      return callback(null, data); // Devuelve 'data' directamente
    } else {
      console.error('No se encontraron datos para el usuario_id:', id_usuario);
      return callback(new Error('Datos no encontrados'));
    }
  });

};




/*
Definimos una función que acepta dos parámetros: un objeto que contiene los datos de la empresa a actualizar y una
función de callback para manejar el resultado de la actualización. Extraemos las propiedades del objeto empresa para
utilizarlas en la consulta y registramos en la consola los datos de la empresa recibidos para la actualización.
*/
const updateEmpresa = (empresa, callback) => {
  let { id_empresa, nombre_empresa, web, spot, logo, descripcion, url_meet, horario_meet_morning_start, horario_meet_morning_end, horario_meet_afternoon_start, horario_meet_afternoon_end, id_usuario } = empresa;

  if (!id_empresa) {
    if (!id_usuario) {
      console.error('ID de la empresa no proporcionado y usuario_id no disponible');
      return callback(new Error('ID de la empresa es necesario para la actualización'));
    }

    console.error('ID de la empresa no proporcionado, obteniendo ID utilizando usuario_id');
    getEmpresaDataByUsuarioId(id_usuario, (err, data) => {
      if (err) {
        console.error('Error al obtener datos de la empresa para obtener ID:', err);
        return callback(err);
      }

      id_empresa = data.id_empresa;
      proceedWithUpdate();
    });
  } else {
    proceedWithUpdate();
  }

  function proceedWithUpdate() {
    console.log('Datos recibidos para actualizar la empresa:', empresa);
  
    const updateQuery = `
      UPDATE empresa
      SET nombre_empresa = ?, web = ?, spot = ?, logo = ?, descripcion = ?, url_meet = ?, horario_meet_morning_start = ?, horario_meet_morning_end = ?, horario_meet_afternoon_start = ?, horario_meet_afternoon_end = ?
      WHERE id_empresa = ?
    `;
  
    connection.query(updateQuery, [nombre_empresa, web, spot, logo, descripcion, url_meet, horario_meet_morning_start, horario_meet_morning_end, horario_meet_afternoon_start, horario_meet_afternoon_end, id_empresa], (err) => {
      if (err) {
        console.error('Error al actualizar la empresa: ', err);
        return callback(err);
      }
  
      console.log('Empresa actualizada correctamente');
      
      // Ahora hacemos una consulta para obtener los datos actualizados de la empresa
      getEmpresaDataByUsuarioId(id_usuario, (err, data) => {
        if (err) {
          return callback(err);
        }
        
        return callback(null, data); // Devolver los datos actualizados directamente
      });
    });
  }
};

// Exportamos las funciones para que puedan ser utilizadas en otros archivos de la aplicación
module.exports = {
  updateEmpresa,
  getEmpresaDataByUsuarioId,
};