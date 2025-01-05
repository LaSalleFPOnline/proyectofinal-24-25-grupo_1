const { connection } = require('../database/database');
const mysql = require("mysql2");
const keys = require("../keys");

const createVote = (req, res) => {
    const { id_usuarioVotante, id_empresaVotada, voto } = req.body;
    if (!id_usuarioVotante || !id_empresaVotada || voto === undefined) {
        return res.status(400).json({ error: 'Datos insuficientes para registrar el voto.' });
    }
    if (id_usuarioVotante === id_empresaVotada) {
        return res.status(400).json({ error: 'Una empresa no puede votarse a sí misma.' });
    }
    const verificarUsuarioQuery = `SELECT * FROM votacion
                                WHERE id_usuarioVotante = ?
                                AND id_empresaVotada = ?`;
    const connection = mysql.createConnection({
        host: keys.dbHost,
        // user: keys.dbUser,
        // password: keys.dbPassword,
        user: "root",
        password: "root",
        port: keys.dbPort,
        database: keys.dbDatabase,
        });
        connection.connect((err) => {
        if (err) {
            console.error(
            "Error al reconectar a la base de datos desde /agenda:",
            err
            );
        }
        connection.query(verificarUsuarioQuery, [id_usuarioVotante, id_empresaVotada], (err, results) => {
            if (err) {
                console.error('Error al verificar el voto del usuario: ', err);
                connection.destroy();
                return res.status(500).json({ error: 'Error al verificar el voto del usuario' });
            }
            if (results.length > 0) {
                connection.destroy();
                return res.status(400).json({ error: 'Ya has votado una vez. No puedes votar más.' });
            }
            const query = `INSERT INTO votacion (id_usuarioVotante, id_empresaVotada, voto)
                        VALUES (?, ?, ?);`;
            connection.query(query, [id_usuarioVotante, id_empresaVotada, voto], (err) => {
                if (err) {
                    console.error('Error al registrar el voto: ', err);
                    connection.destroy();
                    return res.status(500).json({ error: 'Error al registrar el voto' });
                }
                connection.destroy();
                res.status(200).json({ message: 'Voto registrado exitosamente' });
            });
        });
    });
};

const getAllVotes = (req, res) => {
    const query = `SELECT e.*, COUNT(v.id_votacion) AS votos
                FROM empresa e
                LEFT JOIN votacion v
                ON e.id_empresa = v.id_empresaVotada
                GROUP BY e.id_empresa
                ORDER BY votos DESC`;
    const connection = mysql.createConnection({
        host: keys.dbHost,
        // user: keys.dbUser,
        // password: keys.dbPassword,
        user: "root",
        password: "root",
        port: keys.dbPort,
        database: keys.dbDatabase,
    });
    connection.connect((err) => {
        if (err) {
            console.error(
            "Error al reconectar a la base de datos desde /agenda:",
            err
            );
        }
        connection.query(query, (err, results) => {
            if (err) {
            console.error('Error al obtener los votos: ', err);
            connection.destroy();
            return res.status(500).json({ error: 'Error al obtener los votos' });
            }
            connection.destroy();
            res.status(200).json(results);
        });
    });
};

const getUserVote = (req, res) => {
    const usuario_id = req.params.usuario_id;
    const query = `SELECT * FROM votacion
                WHERE id_usuarioVotante = ?`;
    const connection = mysql.createConnection({
        host: keys.dbHost,
        // user: keys.dbUser,
        // password: keys.dbPassword,
        user: "root",
        password: "root",
        port: keys.dbPort,
        database: keys.dbDatabase,
    });
    connection.connect((err) => {
        if (err) {
            console.error(
            "Error al reconectar a la base de datos desde /agenda:",
            err
            );
        }
        connection.query(query, [usuario_id], (err, results) => {
            if (err) {
            console.error('Error al obtener el voto del usuario: ', err);
            connection.destroy();
            return res.status(500).json({ error: 'Error al obtener el voto del usuario' });
            }
            connection.destroy();
            res.status(200).json(results);
        });
    });
};

const verificarVoto = (req, res) => {
    const { id_usuarioVotante, id_empresaVotada } = req.query;
    if (!id_usuarioVotante || !id_empresaVotada) {
        return res.status(400).json({ error: 'Datos insuficientes para verificar el voto.' });
    }
    const query = `SELECT * FROM votacion
                WHERE id_usuarioVotante = ?
                AND id_empresaVotada = ?`;
    const connection = mysql.createConnection({
        host: keys.dbHost,
        // user: keys.dbUser,
        // password: keys.dbPassword,
        user: "root",
        password: "root",
        port: keys.dbPort,
        database: keys.dbDatabase,
    });
    connection.connect((err) => {
        if (err) {
            console.error(
            "Error al reconectar a la base de datos desde /agenda:",
            err
            );
        }
        connection.query(query, [id_usuarioVotante,id_empresaVotada], (err, results) => {
            if (err) {
                console.error('Error al verificar el voto: ', err);
                connection.destroy();
                return res.status(500).json({ error: 'Error al verificar el voto' });
            }
            if (results.length > 0) {
                connection.destroy();
                res.status(200).json({ existe: true, voto: results[0] });
            } else {
                connection.destroy();
                res.status(200).json({ existe: false });
            }
        });
    });
};

const deleteVote = (req, res) => {
    const { id_usuarioVotante, id_empresaVotada } = req.body;
    if (!id_usuarioVotante || !id_empresaVotada) {
        return res.status(400).json({ message: 'Datos insuficientes para eliminar el voto' });
    }
    const query = `DELETE FROM votacion
                WHERE id_usuarioVotante = ?
                AND id_empresaVotada = ?`;
    const connection = mysql.createConnection({
        host: keys.dbHost,
        // user: keys.dbUser,
        // password: keys.dbPassword,
        user: "root",
        password: "root",
        port: keys.dbPort,
        database: keys.dbDatabase,
    });
    connection.connect((err) => {
        if (err) {
            console.error(
            "Error al reconectar a la base de datos desde /agenda:",
            err
            );
        }
        connection.query(query, [id_usuarioVotante, id_empresaVotada], (err, result) => {
            if (err) {
                console.error('Error al eliminar el voto: ', err);
                connection.destroy();
                return res.status(500).json({ message: 'Error al eliminar el voto' });
            }
            if (result.affectedRows > 0) {
                connection.destroy();
                res.status(200).json({ message: 'Voto eliminado exitosamente' });
            } else {
                connection.destroy();
                res.status(404).json({ message: 'Voto no encontrado' });
            }
        });
    });
};

module.exports = {
    createVote,
    getAllVotes,
    getUserVote,
    verificarVoto,
    deleteVote,
};