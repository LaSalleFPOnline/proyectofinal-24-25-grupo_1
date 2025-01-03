const { connection } = require('../database/database');
const mysql = require("mysql2");
const keys = require("../keys");


const getEmpresas = (req, res) => {
  const query = `SELECT empresa.id_empresa, empresa.nombre_empresa, empresa.logo, empresa.web, empresa.spot, empresa.descripcion, empresa.url_meet, empresa.horario_meet_morning_start, empresa.horario_meet_morning_end, empresa.horario_meet_afternoon_start, empresa.horario_meet_afternoon_end
                FROM empresa
                JOIN usuario
                ON empresa.id_usuario = usuario.id_usuario`;
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
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener empresas:', err);
        connection.destroy();
        return res.status(500).json({ message: 'Error al obtener empresas' });
      }
      connection.destroy();
      res.status(200).json(results);
    });
  });
};

const getEmpresaById = (req, res) => {
  const empresaId = req.params.id_empresa;
  const query = `SELECT empresa.id_empresa, empresa.nombre_empresa, empresa.logo, empresa.web, empresa.spot, empresa.descripcion, empresa.url_meet, empresa.horario_meet_morning_start, empresa.horario_meet_morning_end, empresa.horario_meet_afternoon_start, empresa.horario_meet_afternoon_end
                FROM empresa
                JOIN usuario
                ON empresa.id_usuario = usuario.id_usuario
                WHERE empresa.id_empresa = ?`;
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
    connection.query(query, [empresaId], (err, results) => {
      if (err) {
        console.error('Error al obtener la empresa:', err);
        connection.destroy();
        return res.status(500).json({ message: 'Error al obtener la empresa' });
      }
      if (results.length === 0) {
        connection.destroy();
        return res.status(404).json({ message: 'Empresa no encontrada' });
      }
      connection.destroy();
      res.status(200).json(results[0]);
    });
  });
};

module.exports = {
  getEmpresas,
  getEmpresaById,
};