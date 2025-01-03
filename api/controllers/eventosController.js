const { connection } = require('../database/database');
const mysql = require("mysql2");
const keys = require("../keys");

const getAllEventFechas = (req, res) => {
  const sql = 'SELECT * FROM evento';
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
    connection.query(sql, (error, results) => {
      if (error) {
        console.error('Error al obtener la agenda:', error);
        connection.destroy();
        return res.status(500).json({ error: 'Error al obtener los eventos' });
      }
      connection.destroy();
      res.status(200).json(results);
    });
  });
};

const getEventByIdFecha = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM evento
              WHERE id_evento = ?`;
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
    getAllEventFechas,
    getEventByIdFecha
  };