// Se importa la conexión a la BBDD. Esta conexión es necesaria para ejecutar consultas y recuperar datos desde la BBDD
const { connection } = require('../database/database');

const getAllEventFechas = (req, res) => {
    const sql = 'SELECT * FROM evento';
    /*
    Ejecutamos la consulta. Si hay un error durante la ejecución de la consulta, se responde con un estado 500 y un
    mensaje de error en formato JSON. Si la consulta se ejecuta correctamente, los resultados se envían como respuesta
    JSON con un estado 200 (OK).
    */
    connection.query(sql, (error, results) => {
      if (error) {
        console.error('Error al obtener la agenda:', error);
        return res.status(500).json({ error: 'Error al obtener los eventos' });
      }
      res.status(200).json(results);
    });
  };
  const getEventByIdFecha = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM evento WHERE id_evento = ?';
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
  
  

  module.exports = {
    getAllEventFechas,
    getEventByIdFecha
  };