const { connection } = require('../database/database');

// Obtener todos los eventos de la agenda
const getAllEvents = (req, res) => {
  const sql = 'SELECT * FROM agenda';
  
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener la agenda:', error);
      return res.status(500).json({ error: 'Error al obtener la agenda' });
    }
    res.status(200).json(results);
  });
};

// Obtener un evento específico por ID
const getEventById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM agenda WHERE id = ?';
  
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
  getAllEvents,
  getEventById
};
