// Se importa la conexión a la BBDD. Esta conexión es necesaria para ejecutar consultas y recuperar datos desde la BBDD
const { connection } = require('../database/database');

/*
Esta función maneja una solcitud para obtener una lista de todas las empresas en la BBDD. Selecciona varias columnas de
la tabla empresas y hace un JOIN con la tabla usuarios. Esto asegura que solo se seleccionen empresas que estén
asociadas a un usuario válido.
*/
const getEmpresas = (req, res) => {
  const query ='SELECT empresas. id, empresas.nombre_empresa, empresas.logo_url,empresas.web_url, empresas.descripcion, empresas.url_meet, empresas.horario_meet_morning_start, empresas.horario_meet_morning_end, empresas.horario_meet_afternoon_start, empresas.horario_meet_afternoon_end FROM empresas JOIN usuarios ON empresas.usuario_id = usuarios.id;';
  /*
  Se ejecuta la consulta. Si hay un error durante la ejecución se regustra el error en la consola y se responde con
  un estado 500. Si la consulta es exitosa, los resultados se envían como una respuesta JSON con un estado 200
  */
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener empresas:', err);
      return res.status(500).json({ message: 'Error al obtener empresas' });
    }
    res.status(200).json(results);
  });
};

/*
Esta función maneja una solicitud para obtener información detallada de una empresa específica, identificada por su id.
Extraemos el ID de la empresa de los parámetros de la solicitud. Este ID es proporcionado en la URL de la solicitud.
Esta consulta utiliza un where para filtrar por el ID. El ? es un marcador de posición que se reemplazará por el valor
de empresaId
*/
const getEmpresaById = (req, res) => {
  const empresaId = req.params.id;
  const query = 'SELECT empresas.id, empresas.nombre_empresa, empresas.logo_url, empresas.web_url, empresas.descripcion, empresas.url_meet, empresas.horario_meet_morning_start, empresas.horario_meet_morning_end, empresas.horario_meet_afternoon_start, empresas.horario_meet_afternoon_end  FROM empresas JOIN usuarios ON empresas.usuario_id = usuarios.id WHERE empresas.id = ?';
  /*
  Ejecutamos la consulta con empresaId como parámetro. Manejamos los errores igual que en getEmpresas. Si no se
  encuentra ninguna empresa con el ID dado, se responde con un estado HTTP 404. Si se encuentra la empresa, se devuelve
  el primer resultado en formato JSON con un estado 200.
  */
  connection.query(query, [empresaId], (err, results) => {
    if (err) {
      console.error('Error al obtener la empresa:', err);
      return res.status(500).json({ message: 'Error al obtener la empresa' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }
    res.status(200).json(results[0]);
  });
};

// Exportamos las funciones para que puedan ser utilizadas en otros archivos de la aplicación
module.exports = {
  getEmpresas,
  getEmpresaById,
};