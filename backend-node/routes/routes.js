// routes/routes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const { updateEmpresa } = require('../controllers/empresaController'); // Asegúrate de que esto esté correcto
const { parseRequestBody } = require('../middlewares/middlewares');
const authenticateToken = require('../middlewares/authMiddleware');
const { getEmpresas } = require('../controllers/adminController');
const { getEmpresaById } = require('../controllers/adminController');  // Asegúrate de importar correctamente la función
const { getAllEvents } = require('../controllers/agendaController');
const { addInterest, getInterests } = require('../controllers/interesesController');

// Ruta para obtener la agenda
router.get('/agenda', getAllEvents);

// Rutas relacionadas con usuarios
router.post('/register', parseRequestBody, registerUser);
router.post('/login', parseRequestBody, loginUser);

// Ruta protegida de ejemplo
router.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Acceso concedido', user: req.user });
});

// Rutas relacionadas con empresas
router.post('/actualizar-empresa', (req, res) => {
  const empresa = req.body;
  updateEmpresa(empresa, (err, data) => {
    if (err) {
      console.error('Error al actualizar la empresa:', err);
      return res.status(500).json({ message: 'Error al actualizar la empresa: ' + err.message });
    }
    console.log('Datos enviados al cliente:', data);
    res.status(200).json({ message: 'Empresa actualizada correctamente', data });
  });
});

// Ruta para obtener todas las empresas
router.get('/empresas', getEmpresas);

// Ruta para obtener los detalles de una empresa por ID
router.get('/empresa/:id', getEmpresaById);

// Ruta para agregar interés
router.post('/add-interest', authenticateToken, addInterest);

// Ruta para obtener relaciones comerciales
router.get('/relaciones/:empresa_id', authenticateToken, getInterests);

module.exports = router;




/*const express = require('express');
const { body, validationResult } = require('express-validator');
const { registerUser, loginUser } = require('../controllers/userController');
const { updateEmpresa } = require('../controllers/empresaController');
const { parseRequestBody } = require('../middlewares/middlewares');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Rutas relacionadas con usuarios
router.post('/register', 
  parseRequestBody,
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email no es válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('rol').isIn([1, 2, 3]).withMessage('El rol es inválido'),
    // Validaciones adicionales para empresas (rol 1)
    body('web_url').if(body('rol').equals('1')).isURL().withMessage('Web URL no es válida'),
    body('spot_url').if(body('rol').equals('1')).isURL().withMessage('Spot URL no es válida'),
    body('logo_url').if(body('rol').equals('1')).isURL().withMessage('Logo URL no es válida'),
    body('descripcion').if(body('rol').equals('1')).notEmpty().withMessage('La descripción es obligatoria'),
    body('url_meet').if(body('rol').equals('1')).isURL().withMessage('URL Meet no es válida'),
    body('horario_meet').if(body('rol').equals('1')).notEmpty().withMessage('El horario Meet es obligatorio'),
    // Validaciones adicionales para visitantes (rol 2)
    body('entidad').if(body('rol').equals('2')).notEmpty().withMessage('La entidad es obligatoria')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    registerUser(req, res);
  }
);

router.post('/login', 
  parseRequestBody,
  [
    body('email').isEmail().withMessage('Email no es válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    loginUser(req, res);
  }
);

// Ruta protegida de ejemplo
router.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Acceso concedido', user: req.user });
});

// Rutas relacionadas con empresas
router.post('/actualizar-empresa', 
  parseRequestBody,
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('web_url').isURL().withMessage('Web URL no es válida'),
    body('spot_url').isURL().withMessage('Spot URL no es válida'),
    body('logo_url').isURL().withMessage('Logo URL no es válida'),
    body('descripcion').notEmpty().withMessage('La descripción es obligatoria'),
    body('url_meet').isURL().withMessage('URL Meet no es válida'),
    body('horario_meet').notEmpty().withMessage('El horario Meet es obligatorio'),
    body('entidad').notEmpty().withMessage('La entidad es obligatoria')
  ],
  (req, res) => {
    const empresa = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    updateEmpresa(empresa, (err, data) => {
      if (err) {
        console.error('Error al actualizar la empresa:', err);
        return res.status(500).json({ message: 'Error al actualizar la empresa: ' + err.message });
      }
      console.log('Datos enviados al cliente:', data);
      res.status(200).json({ message: 'Empresa actualizada correctamente', data });
    });
  }
);

module.exports = router;*/
