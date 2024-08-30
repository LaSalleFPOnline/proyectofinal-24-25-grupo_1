/*
Importamos la biblioteca que permite crear y verificar tokens JWT. Se obtiene la clave secreta utilizada para firmar y
verificar los tokens JWT. Esta clave se extrae de las variables de entorno
*/
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

/*
El middleware toma el token JWT de la cabecera de autorización (Authorization), lo verifica usando una clave secreta,
y si es válido, permite que la solicitud continúe. Si el token es inválido o falta, responde con un error HTTP (401 o
403). Si el token es válido, se asigna la información del usuario a req.user, que permite que las siguientes funciones
de middleware o controladores accedan a los datos del usuario autenticado.
*/
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

/*
Exporta la función authenticateToken para que pueda ser utilizada en otras partes de la aplicación, como en rutas
que necesitan protección mediante autenticación.
*/
module.exports = authenticateToken;