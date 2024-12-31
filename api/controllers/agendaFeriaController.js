const { connection } = require('../database/database');

const getEventFechasAgendaFeria = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT fechaEvento_inicio, fechaEvento_fin FROM evento';
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
    getEventFechasAgendaFeria
  };