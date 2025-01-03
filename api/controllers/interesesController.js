const { connection } = require('../database/database');
const mysql = require("mysql2");
const keys = require("../keys");

const addInterest = (req, res) => {
  const { id_empresaVendedora, id_empresaCompradora } = req.body;
  if (!id_empresaVendedora || !id_empresaCompradora) {
    return res.status(400).json({ error: 'Se requieren los IDs de ambas empresas para agregar un interés.' });
  }
  const query = `INSERT INTO relacion_comercial (id_empresaVendedora, id_empresaCompradora)
                VALUES (?, ?)`;
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
    connection.query(query, [id_empresaVendedora, id_empresaCompradora], (err) => {
      if (err) {
        console.error('Error al agregar interés: ', err);
        connection.destroy();
        return res.status(500).json({ error: 'Error al agregar interés' });
      }
      connection.destroy();
      res.status(200).json({ message: 'Interés agregado exitosamente' });
    });
  });
};

const getInterests = (req, res) => {
  const empresa_id = req.params.id_empresaVendedora;
  const queryCompras = `SELECT * FROM relacion_comercial
                      WHERE id_empresaCompradora = ?`;
  const queryVentas = `SELECT * FROM relacion_comercial
                      WHERE id_empresaVendedora = ?`;
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
    connection.query(queryCompras, [empresa_id], (err, compras) => {
      if (err) {
        console.error('Error al obtener relaciones de compra: ', err);
        connection.destroy();
        return res.status(500).json({ error: 'Error al obtener relaciones de compra' });
      }
      connection.query(queryVentas, [empresa_id], (err, ventas) => {
        if (err) {
          console.error('Error al obtener relaciones de venta: ', err);
          connection.destroy();
          return res.status(500).json({ error: 'Error al obtener relaciones de venta' });
        }
        connection.destroy();
        res.status(200).json({ compras, ventas });
      });
    });
  });
};

const eliminarInteres = (req, res) => {
  const empresa_id = req.query.empresaId;
  const empresa_interesada_id = req.query.empresaInteresadaId;
  if (!empresa_id || !empresa_interesada_id) {
    return res.status(400).json({ message: 'Datos insuficientes' });
  }
  const query = `DELETE FROM relacion_comercial
                WHERE id_empresaVendedora = ?
                AND id_empresaCompradora = ?;`;
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
    connection.query(query, [empresa_id, empresa_interesada_id], (err, result) => {
      if (err) {
        console.error('Error al eliminar interés:', err);
        connection.destroy();
        return res.status(500).json({ message: 'Error al eliminar interés' });
      }
      if (result.affectedRows > 0) {
        connection.destroy();
        res.status(200).json({ message: 'Interés eliminado exitosamente' });
      } else {
        connection.destroy();
        res.status(404).json({ message: 'Relación de interés no encontrada' });
      }
    });
  });
};

module.exports = {
  addInterest,
  getInterests,
  eliminarInteres,
};