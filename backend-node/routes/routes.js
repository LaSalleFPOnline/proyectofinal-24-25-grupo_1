const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const { updateEmpresa } = require('../controllers/empresaController');
const { parseRequestBody } = require('../middlewares/middlewares');

// Rutas relacionadas con usuarios
router.post('/register', parseRequestBody, registerUser);
router.post('/login', parseRequestBody, loginUser);

// Rutas relacionadas con empresas
router.post('/actualizar-empresa', (req, res) => {
  const empresa = req.body;
  updateEmpresa(empresa, (err, data) => {
    if (err) {
      console.error('Error al actualizar la empresa:', err);
      return res.status(500).json({ message: 'Error al actualizar la empresa: ' + err.message });
    }
    console.log('Datos enviados al cliente:', data); // Verifica los datos enviados al cliente
    res.status(200).json({ message: 'Empresa actualizada correctamente', data });
  });
});

module.exports = router;
