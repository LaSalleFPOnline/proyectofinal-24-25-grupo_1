// Se importa la conexión a la BBDD. Esta conexión es necesaria para ejecutar consultas y recuperar datos desde la BBDD
const { connection } = require('../database/database');

/*
Definimos una función para añadir un nuevo interés entre 2 empresas en la BBDD. Esta función recibe 2 parámetros: El
objeto de la solicitud que contiene los datos enviados por cliente, y el objeto de respuesta que se utiliza para enviar
la respuesta de vuelta al cliente
*/
const addInterest = (req, res) => {
  /*
  Extraemos los campos de las 2 IDs del cuerpo de la solicitud, que son los IDs de las empresas involucradas en la
  relación de interés. Enviamos una respuesta con estado 400 si falta algún ID. Y definimos una consulta SQL que
  insertará una nueva fila en la tabla con los IDs de las 2 empresas involucradas
  */
  const { empresa_id, empresa_interesada_id } = req.body;
  if (!empresa_id || !empresa_interesada_id) {
    return res.status(400).json({ error: 'Se requieren los IDs de ambas empresas para agregar un interés.' });
  }
  const query = 'INSERT INTO intereses (empresa_id, empresa_interesada_id) VALUES (?, ?)';
  /*
  Ejecutamos la consulta SQL utilizando los IDs de las empresas como parámetros. Verificamos si hubo un error al
  ejecutar la consulta, registramos el error en la consola y enviamos una respuesta con cóigo de estado 500. Si no
  hay errores enviamos una respuesta 200 y un mensaje indicando que el interés se ha añadido con éxito.
  */
  connection.query(query, [empresa_id, empresa_interesada_id], (err) => {
    if (err) {
      console.error('Error al agregar interés: ', err);
      return res.status(500).json({ error: 'Error al agregar interés' });
    }
    res.status(200).json({ message: 'Interés agregado exitosamente' });
  });
};

/*
Define una función que recupera todas las relaciones de interés asociadas con una empresa específica. Esta función
también recibe los parámetros req y res. Extraemos el empresa_id de los parámetros de la ruta que identifica la empresa
cuyas relaciones se van a recuperar. Realizamos las consulas que selecciona todas las filas de la tabla intereses donde
la empresa identificada está interesada en otras empresas, y donde la empresa identificada es la que despierta el
interés de otras empresas
*/
const getInterests = (req, res) => {
  const empresa_id = req.params.empresa_id;
  const queryCompras = 'SELECT * FROM intereses WHERE empresa_interesada_id = ?';
  const queryVentas = 'SELECT * FROM intereses WHERE empresa_id = ?';
  /*
  Ejecuta la consulta para obtener las relaciones de compra y verifica si hubo un error al ejecutar la consulta. Si lo
  hubo lo registra en la consola y envía una respuesta 500 y un mensaje de error
  */
  connection.query(queryCompras, [empresa_id], (err, compras) => {
    if (err) {
      console.error('Error al obtener relaciones de compra: ', err);
      return res.status(500).json({ error: 'Error al obtener relaciones de compra' });
    }
    // Ejecuta la consulta para obtener las relaciones de venta y igual que se hace con la relaciones de compra
    connection.query(queryVentas, [empresa_id], (err, ventas) => {
      if (err) {
        console.error('Error al obtener relaciones de venta: ', err);
        return res.status(500).json({ error: 'Error al obtener relaciones de venta' });
      }
      res.status(200).json({ compras, ventas });
    });
  });
};



const eliminarInteres = (req, res) => {
  const empresa_id = req.query.empresaId;
  const empresa_interesada_id = req.query.empresaInteresadaId;

  if (!empresa_id || !empresa_interesada_id) {
    return res.status(400).json({ message: 'Datos insuficientes' });
  }

  const query = `
    DELETE FROM intereses
    WHERE empresa_id = ? AND empresa_interesada_id = ?;
  `;
  /*
  Ejecutamos la consulta SQL para eliminar la relación de interés. Manejamos cualquier error en la ejecución y lo
  registramos por consola enviando una respuesta con código 500. Verificamos la consulta afecta a alguna fila y enviamos
  una respuesta 200 y un mensaje de éxito. Si no se afecta ninguna fila significa que la relación no existe y enviamos
  una respuesta 404 indicando que no se ha encontrado la relación
  */
  connection.query(query, [empresa_id, empresa_interesada_id], (err, result) => {
    if (err) {
      console.error('Error al eliminar interés:', err);
      return res.status(500).json({ message: 'Error al eliminar interés' });
    }
    
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
  eliminarInteres,
};