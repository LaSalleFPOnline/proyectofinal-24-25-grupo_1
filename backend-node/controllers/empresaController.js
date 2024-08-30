// Se importa la conexión a la BBDD. Esta conexión es necesaria para ejecutar consultas y recuperar datos desde la BBDD
const { connection } = require('../database/database');

/*
Definimos una función que acepta 2 parámetros: el ID del usuario para buscar la empresa asociada y una función de
callback que se ejecutará después de completar la operación de la BBDD. Realizamos la consulta SQL que selecciona varios
campos de la tabla usuarios utilizando el campo usuario_id. Y registra el usuario_id en la consola con el que se
ejecutará la consulta.
*/
const getEmpresaDataByUsuarioId = (usuario_id, callback) => {
  const query = `
    SELECT e.id AS empresa_id, e.nombre_empresa, e.web_url, e.spot_url, e.logo_url, e.descripcion, e.url_meet, e.horario_meet, e.entidad
    FROM usuarios u
    JOIN empresas e ON u.id = e.usuario_id
    WHERE u.id = ?
  `;
  console.log('Ejecutando consulta con usuario_id:', usuario_id);
  /*
  Ejecutamos la consulta SQL utilizando usuario_id como parámetro. Verificamos si ha ocurrido algún error durante la
  ejecución de la consulta y registramos el error en la consola. Llamamos al callback y terminamos la ejecución de la
  función.
  */
  connection.query(query, [usuario_id], (err, results) => {
    if (err) {
      console.error('Error al obtener datos combinados: ', err);
      return callback(err);
    }
    /*
    Si todo ha ido bien mostramos en la consola los resultados obtenidos. Verificamos si hay resultados y extraemos el
    resultado. Mostramos los datos en la consola y llamamos al callback con null como error y data como resultado. Si
    no se encuentran datos se muestra el error y llamamos al callback con un error indicando que no se han encontrado
    los datos
    */
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

/*
Definimos una función que acepta dos parámetros: un objeto que contiene los datos de la empresa a actualizar y una
función de callback para manejar el resultado de la actualización. Extraemos las propiedades del objeto empresa para
utilizarlas en la consulta y registramos en la consola los datos de la empresa recibidos para la actualización.
*/
const updateEmpresa = (empresa, callback) => {
  const { id, nombre_empresa, web_url, spot_url, logo_url, descripcion, url_meet, horario_meet, entidad, usuario_id } = empresa;
  console.log('Datos recibidos para actualizar la empresa:', empresa);
  /*
  Realizamos la consulta SQL que actualiza los campos de la tabla empresas, donde el ID coincide con el ID de la empresa
  proporcionada, y ejecutamos la consulta SQL con los parámetros de la empresa. Verificamos si ocurrió algún error
  durante la actualización, lo registramos en la consola, y llamamos al callback terminando la ejecución de la función.
  Si todo ha ido bien, registramos un mensaje de éxito en la consola
  */
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
    /*
    Llamamos a esta función para obtener los datos actualizados de la empresa después de la actualización. Verificamos
    si ocurrió un error al recuperar los datos actualizados y registramos el error en la consola. Si todo va bien
    mostramos los datos actualizados en la consola y llamamos al callback con null como error y data como los datos
    actualizados
    */
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

// Exportamos las funciones para que puedan ser utilizadas en otros archivos de la aplicación
module.exports = {
  updateEmpresa,
  getEmpresaDataByUsuarioId,
};