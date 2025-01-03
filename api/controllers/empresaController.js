const { connection } = require('../database/database');
const mysql = require("mysql2");
const keys = require("../keys");

const getEmpresaDataByUsuarioId = (id_usuario, callback) => {
  const query = `SELECT e.id_empresa AS id_empresa, e.nombre_empresa, e.web, e.spot, e.logo, e.descripcion, e.url_meet, e.horario_meet_morning_start, e.horario_meet_morning_end, e.horario_meet_afternoon_start, e.horario_meet_afternoon_end
                FROM usuario u
                JOIN empresa e ON u.id_usuario = e.id_usuario
                WHERE u.id_usuario = ?`;
  console.log('Ejecutando consulta con usuario_id:',id_usuario);
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
    connection.query(query, [id_usuario], (err, results) => {
      if (err) {
        console.error('Error al obtener datos combinados: ', err);
        connection.destroy();
        return callback(err);
      }
      console.log('Resultados de la consulta:', JSON.stringify(results, null, 2));
      connection.destroy();
      if (results.length > 0) {
        const data = results[0];
        console.log('Datos combinados encontrados:', data);
        connection.destroy();
        return callback(null, data);
      } else {
        console.error('No se encontraron datos para el usuario_id:', id_usuario);
        connection.destroy();
        return callback(new Error('Datos no encontrados'));
      }
    });
  });
};

const updateEmpresa = (empresa, callback) => {
  let { id_empresa, nombre_empresa, web, spot, logo, descripcion, url_meet, horario_meet_morning_start, horario_meet_morning_end, horario_meet_afternoon_start, horario_meet_afternoon_end, id_usuario } = empresa;
  if (!id_empresa) {
    if (!id_usuario) {
      console.error('ID de la empresa no proporcionado y usuario_id no disponible');
      return callback(new Error('ID de la empresa es necesario para la actualización'));
    }
    console.error('ID de la empresa no proporcionado, obteniendo ID utilizando usuario_id');
    getEmpresaDataByUsuarioId(id_usuario, (err, data) => {
      if (err) {
        console.error('Error al obtener datos de la empresa para obtener ID:', err);
        return callback(err);
      }
      id_empresa = data.id_empresa;
      proceedWithUpdate();
    });
  } else {
    proceedWithUpdate();
  }

  function proceedWithUpdate() {
    console.log('Datos recibidos para actualizar la empresa:', empresa);
    const updateQuery = `UPDATE empresa
                        SET nombre_empresa = ?, web = ?, spot = ?, logo = ?, descripcion = ?, url_meet = ?, horario_meet_morning_start = ?, horario_meet_morning_end = ?, horario_meet_afternoon_start = ?, horario_meet_afternoon_end = ?
                        WHERE id_empresa = ?`;
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
      connection.query(updateQuery, [nombre_empresa, web, spot, logo, descripcion, url_meet, horario_meet_morning_start, horario_meet_morning_end, horario_meet_afternoon_start, horario_meet_afternoon_end, id_empresa], (err) => {
        if (err) {
          console.error('Error al actualizar la empresa: ', err);
          connection.destroy();
          return callback(err);
        }
        console.log('Empresa actualizada correctamente');
        connection.destroy();
        getEmpresaDataByUsuarioId(id_usuario, (err, data) => {
          if (err) {
            connection.destroy();
            return callback(err);
          }
          connection.destroy();
          return callback(null, data);
        });
      });
    });
  }
};

module.exports = {
  updateEmpresa,
  getEmpresaDataByUsuarioId,
};