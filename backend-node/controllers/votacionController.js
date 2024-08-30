const { connection } = require('../database/database');

const createVote = (req, res) => {
    const { usuario_id, empresa_id, voto } = req.body;

    if (!usuario_id || !empresa_id || voto === undefined) {
        return res.status(400).json({ error: 'Datos insuficientes para registrar el voto.' });
    }

    const query = `
        INSERT INTO votaciones (usuario_id, empresa_id, voto)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE voto = ?;
    `;

    connection.query(query, [usuario_id, empresa_id, voto, voto], (err) => {
        if (err) {
        console.error('Error al registrar el voto: ', err);
        return res.status(500).json({ error: 'Error al registrar el voto' });
        }
        res.status(200).json({ message: 'Voto registrado exitosamente' });
    });
};

const getAllVotes = (req, res) => {
    const query = 'SELECT * FROM votaciones';
    
    connection.query(query, (err, results) => {
        if (err) {
        console.error('Error al obtener los votos: ', err);
        return res.status(500).json({ error: 'Error al obtener los votos' });
        }
        res.status(200).json(results);
    });
};

const getUserVote = (req, res) => {
    const usuario_id = req.params.usuario_id;

    const query = 'SELECT * FROM votaciones WHERE usuario_id = ?';
    
    connection.query(query, [usuario_id], (err, results) => {
        if (err) {
        console.error('Error al obtener el voto del usuario: ', err);
        return res.status(500).json({ error: 'Error al obtener el voto del usuario' });
        }
        res.status(200).json(results);
    });
};

const verificarVoto = (req, res) => {
    const { usuario_id, empresa_id } = req.query;

    if (!usuario_id || !empresa_id) {
        return res.status(400).json({ error: 'Datos insuficientes para verificar el voto.' });
    }

    const query = 'SELECT * FROM votaciones WHERE usuario_id = ? AND empresa_id = ?';

    connection.query(query, [usuario_id, empresa_id], (err, results) => {
        if (err) {
            console.error('Error al verificar el voto: ', err);
            return res.status(500).json({ error: 'Error al verificar el voto' });
        }
        if (results.length > 0) {
            res.status(200).json({ existe: true, voto: results[0] });
        } else {
            res.status(200).json({ existe: false });
        }
    });
};


const deleteVote = (req, res) => {
    const { usuario_id, empresa_id } = req.body;

    if (!usuario_id || !empresa_id) {
        return res.status(400).json({ message: 'Datos insuficientes para eliminar el voto' });
    }

    const query = 'DELETE FROM votaciones WHERE usuario_id = ? AND empresa_id = ?';

    connection.query(query, [usuario_id, empresa_id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el voto: ', err);
            return res.status(500).json({ message: 'Error al eliminar el voto' });
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Voto eliminado exitosamente' });
        } else {
            res.status(404).json({ message: 'Voto no encontrado' });
        }
    });
};




module.exports = {
    createVote,
    getAllVotes,
    getUserVote,
    verificarVoto,
    deleteVote,
};