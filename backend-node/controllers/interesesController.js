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
      return res.status(500).json({ error: 'Error al agregar el interés.' });
    }
    res.status(201).json({ message: 'Interés agregado exitosamente.' });
  });
};



// Función para obtener las relaciones comerciales
const getInterests = (req, res) => {
  const { empresa_id } = req.params;

  if (!empresa_id) {
    return res.status(400).json({ error: 'El ID de la empresa es requerido.' });
  }

  const queryInteresadasPorMi = `
    SELECT e.* FROM empresas e
    JOIN intereses i ON e.usuario_id = i.empresa_interesada_id
    WHERE i.empresa_id = ?
  `;

  const queryInteresadasEnMi = `
    SELECT e.* FROM empresas e
    JOIN intereses i ON e.usuario_id = i.empresa_id
    WHERE i.empresa_interesada_id = ?
  `;

  connection.query(queryInteresadasPorMi, [empresa_id], (err, empresasMarcadas) => {
    if (err) {
      console.error('Error al obtener las empresas que me interesan: ', err);
      return res.status(500).json({ error: 'Error al obtener las empresas que te interesan.' });
    }

    connection.query(queryInteresadasEnMi, [empresa_id], (err, empresasInteresadasEnMi) => {
      if (err) {
        console.error('Error al obtener las empresas interesadas en mí: ', err);
        return res.status(500).json({ error: 'Error al obtener las empresas interesadas en ti.' });
      }

      res.status(200).json({
        empresasMarcadas,
        empresasInteresadasEnMi,
      });
    });
  });
};

module.exports = {
  addInterest,
  getInterests,
};
