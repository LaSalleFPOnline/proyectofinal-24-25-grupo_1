/*
Se importa el módulo express y se crea un router utilizando express.Router. Esto permite definir rutas en un módulo
separado, que luego se pueden integrar en la aplicación principal
*/
const express = require('express');
const router = express.Router();
/*
Los controladores se importan desde archivos específicos dentro de la carpeta controllers. Cada controlador tiene
funciones que manejan la lógica para una ruta específica
*/
const { registerUser, loginUser, checkEmail, getUserDetails, cambiarContrasena } = require('../controllers/userController');
const { updateEmpresa } = require('../controllers/empresaController'); // Asegúrate de que esto esté correcto
const { getEmpresas, getEmpresaById } = require('../controllers/adminController');
const { getAllEvents } = require('../controllers/agendaController');
const { addInterest, getInterests, eliminarInteres } = require('../controllers/interesesController');
const { createVote, getAllVotes, getUserVote, verificarVoto, deleteVote } = require('../controllers/votacionController'); // Importa el controlador de votación
/*
Importamos los middlewares que son funciones que se ejecutan antes de llegar al controlador. El primero procesa el
cuerpo de la solicitud y el segundo verifica si el usuario está autenticado
*/
const { parseRequestBody } = require('../middlewares/middlewares');
const authenticateToken = require('../middlewares/authMiddleware');


// Esta ruta permite obtener todos los eventos de la agenda.
router.get('/agenda', getAllEvents);

// Ruta para registrar un nuevo usuario
router.post('/register', registerUser);

// Ruta para iniciar sesión de un usuario
router.post('/login', loginUser);


// Ruta protegida de ejemplo. Solo se puede acceder si el usuario está autenticado
router.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Acceso concedido', user: req.user });
});

// Esta ruta permite actualizar la información de una empresa
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

// Estas rutas devuelven un listado de todas las empresas y los detalles de una empresa identificada por un ID
router.get('/empresas', getEmpresas);
router.get('/empresa/:id', getEmpresaById);

// Rutas para agregar un interés, devolver los intereses relacionados con una empresa, y eliminar un interés existente
router.post('/add-interest', authenticateToken, addInterest);
router.get('/relaciones/:empresa_id', authenticateToken, getInterests);

// Rutas para necesarias para realizar un registro de un usuario en cualquier rol
router.get('/check-email', checkEmail);
router.get('/user-details', getUserDetails);

// Ruta para eliminar interés
router.delete('/eliminar-interes' ,authenticateToken, eliminarInteres);

// Rutas relacionadas con las interés
router.post('/voto', authenticateToken, createVote);       // Ruta para crear un voto
router.get('/votos', authenticateToken, getAllVotes);      // Ruta para obtener todos los votos
router.get('/voto/:usuario_id', authenticateToken, getUserVote); // Ruta para obtener el voto de un usuario
router.get('/verificar-voto', authenticateToken, verificarVoto);
router.delete('/voto', authenticateToken, deleteVote);     // Ruta para eliminar un voto

// Rutas para cambiar la contraseña
router.put('/cambiar-contrasena', cambiarContrasena);
/*
Exportamo el router para ser utilizado en otras partes de la aplicación, típicamente el archivo principal de la
configuración de rutas
*/
module.exports = router;