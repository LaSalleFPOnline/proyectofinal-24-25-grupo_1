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

module.exports = { addInterest, getInterests };
