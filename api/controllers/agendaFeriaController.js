const { connection } = require('../database/database');
const mysql = require("mysql2");
const keys = require("../keys");

const getEventFechasAgendaFeria = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT fechaEvento_inicio, fechaEvento_fin
                  FROM evento`;
    const connection = mysql.createConnection({
      host: keys.dbHost,
      // user: keys.dbUser,
      // password: keys.dbPassword,
      user: "root",
      password: "root",
      port: keys.dbPort,
      database: keys.dbDatabase,
    });
    connection.connect((err) => {
      if (err) {
        console.error(
          "Error al reconectar a la base de datos desde /agenda:",
          err
        );
      }
      connection.query(sql, [id], (error, result) => {
        if (error) {
          console.error('Error al obtener el evento:', error);
          connection.destroy();
          return res.status(500).json({ error: 'Error al obtener el evento' });
        }
        if (result.length === 0) {
          connection.destroy();
          return res.status(404).json({ error: 'Evento no encontrado' });
        }
        connection.destroy();
        res.status(200).json(result[0]);
      });
    });
  };

  module.exports = {
    getEventFechasAgendaFeria
  };