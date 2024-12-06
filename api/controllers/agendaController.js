// Se importa la conexión a la BBDD. Esta conexión es necesaria para ejecutar consultas y recuperar datos desde la BBDD
const { connection } = require('../database/database');

/*
Esta función maneja una solicitud para obtener una lista de todos los eventos almacenados en la tabla agenda de la BBDD
La consulta SQL selecciona todos los registros de la tabla que contiene los eventos
*/
const getAllEvents = (req, res) => {
  const sql = 'SELECT * FROM agenda';
  /*
  Ejecutamos la consulta. Si hay un error durante la ejecución de la consulta, se responde con un estado 500 y un
  mensaje de error en formato JSON. Si la consulta se ejecuta correctamente, los resultados se envían como respuesta
  JSON con un estado 200 (OK).
  */
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener la agenda:', error);
      return res.status(500).json({ error: 'Error al obtener la agenda' });
    }
    res.status(200).json(results);
  });
};

/*
Esta función maneja una solicitud para obtener información detallada de un evento específico identificado por su ID.
Extrae del evento el ID de los parámetros de la solicitud. Este ID se proporciona en la URL de la solicitud. La consulta
SQL selecciona todos los campos de la tabla agenda donde el id del evento coincide con el valor proporcionado. El ? es
un marcador de posición para el parámetro
*/
const getEventById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM agenda WHERE id_agenda = ?';
  /*
  Ejecutamos la consulta SQL utilizando el ID como parámetro. Maneja los error igual que la función getAllEvents. Si
  la consulta no devuelve ningún resultado se responde con un error 404 y un mensaje. Si se encuentra el evento, se
  devuelve el primer resultado en formato JSON con un estado 200.
  */
  connection.query(sql, [id], (error, result) => {
    if (error) {
      console.error('Error al obtener el evento:', error);
      return res.status(500).json({ error: 'Error al obtener el evento' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    res.status(200).json(result[0]);
  });
};

// Exportamos las funciones para que puedan ser utilizadas en otros archivos de la aplicación
module.exports = {
  getAllEvents,
  getEventById
};