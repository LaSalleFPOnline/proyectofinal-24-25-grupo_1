const { connection } = require('../database/database');
//traer datos de empresa
const getEmpresas = (req, res) => {
    const query = 'SELECT empresas. id, empresas.entidad, empresas.nombre_empresa, empresas.logo_url, empresas.web_url, empresas.descripcion, empresas.url_meet, empresas.horario_meet FROM empresas JOIN usuarios ON empresas.usuario_id = usuarios.id;';
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener empresas:', err);
        return res.status(500).json({ message: 'Error al obtener empresas' });
      }
      res.status(200).json(results);
    });
  };

  const getEmpresaById = (req, res) => {
    const empresaId = req.params.id; // Obtener el ID de la URL
    const query = 'SELECT empresas.id, empresas.entidad, empresas.nombre_empresa, empresas.logo_url, empresas.web_url, empresas.descripcion, empresas.url_meet, empresas.horario_meet FROM empresas JOIN usuarios ON empresas.usuario_id = usuarios.id WHERE empresas.id = ?';
    connection.query(query, [empresaId], (err, results) => {
      if (err) {
        console.error('Error al obtener la empresa:', err);
        return res.status(500).json({ message: 'Error al obtener la empresa' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Empresa no encontrada' });
      }
      res.status(200).json(results[0]);
    });
  };

  module.exports = {
    getEmpresas,
    getEmpresaById,
  };