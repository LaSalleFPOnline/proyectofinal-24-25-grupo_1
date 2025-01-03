const { connection } = require("../database/database");
const mysql = require("mysql2");
const keys = require("../keys");

/*
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
*/
// Suponiendo que estás usando Express y tienes acceso a tu base de datos
const getAllEvents = (req, res) => {
  const sql = `SELECT a.*, e.fechaEvento_inicio, e.fechaEvento_fin
              FROM agenda a
              CROSS JOIN evento e`;
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
        console.error("Error al obtener la agenda:", error);
        connection.destroy();
        return res.status(500).json({ error: "Error al obtener la agenda" });
      }
      connection.destroy();
      res.status(200).json(results);
    });
  });
};

const getEventById = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM agenda
              WHERE id_agenda = ?`;
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
        console.error("Error al obtener el evento:", error);
        connection.destroy();
        return res.status(500).json({ error: "Error al obtener el evento" });
      }
      if (result.length === 0) {
        connection.destroy();
        return res.status(404).json({ error: "Evento no encontrado" });
      }
      connection.destroy();
      res.status(200).json(result[0]);
    });
  });
};

module.exports = {
  getAllEvents,
  getEventById,
};
