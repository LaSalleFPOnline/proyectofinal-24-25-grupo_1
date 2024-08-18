const { connection } = require('../database/database');
//traer datos de empresa
const getEmpresas = (req, res) => {
    const query = 'SELECT usuarios.nombre, empresas.entidad, empresas.logo_url FROM empresas JOIN usuarios ON empresas.usuario_id = usuarios.id;';
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener empresas:', err);
        return res.status(500).json({ message: 'Error al obtener empresas' });
      }
      res.status(200).json(results);
    });
  };
  module.exports = {
    getEmpresas
  };