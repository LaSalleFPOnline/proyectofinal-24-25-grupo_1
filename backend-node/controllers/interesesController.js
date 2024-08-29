const { connection } = require('../database/database');

// Función para agregar un interés
const addInterest = (req, res) => {
  const { empresa_id, empresa_interesada_id } = req.body;

  if (!empresa_id || !empresa_interesada_id) {
    return res.status(400).json({ error: 'Se requieren los IDs de ambas empresas para agregar un interés.' });
  }

  const query = 'INSERT INTO intereses (empresa_id, empresa_interesada_id) VALUES (?, ?)';
  connection.query(query, [empresa_id, empresa_interesada_id], (err) => {
    if (err) {
      console.error('Error al agregar interés: ', err);
      return res.status(500).json({ error: 'Error al agregar interés' });
    }
    res.status(200).json({ message: 'Interés agregado exitosamente' });
  });
};

// Función para obtener intereses/relaciones
const getInterests = (req, res) => {
  const empresa_id = req.params.empresa_id;

  const queryCompras = 'SELECT * FROM intereses WHERE empresa_interesada_id = ?';
  const queryVentas = 'SELECT * FROM intereses WHERE empresa_id = ?';

  connection.query(queryCompras, [empresa_id], (err, compras) => {
    if (err) {
      console.error('Error al obtener relaciones de compra: ', err);
      return res.status(500).json({ error: 'Error al obtener relaciones de compra' });
    }

    connection.query(queryVentas, [empresa_id], (err, ventas) => {
      if (err) {
        console.error('Error al obtener relaciones de venta: ', err);
        return res.status(500).json({ error: 'Error al obtener relaciones de venta' });
      }

      res.status(200).json({ compras, ventas });
    });
  });
};

// Eliminar interés de una empresa
const eliminarInteres = (req, res) => {
  const { empresaId, empresaInteresadaId } = req.body;

  if (!empresaId || !empresaInteresadaId) {
    return res.status(400).json({ message: 'Datos insuficientes' });
  }

  // Ajusta el nombre de la tabla según tu esquema
  const query = `
    DELETE FROM intereses
    WHERE empresa_id = ? AND empresa_interesada_id = ?;
  `;
  
  connection.query(query, [empresaId, empresaInteresadaId], (err, result) => {
    if (err) {
      console.error('Error al eliminar interés:', err);
      return res.status(500).json({ message: 'Error al eliminar interés' });
    }
    
    // Verificar si se eliminó alguna fila
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Interés eliminado exitosamente' });
    } else {
      res.status(404).json({ message: 'Relación de interés no encontrada' });
    }
  });
};

module.exports = {
  addInterest,
  getInterests,
  eliminarInteres
};
