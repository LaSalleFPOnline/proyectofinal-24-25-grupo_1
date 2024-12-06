const { connection } = require('../database/database');

const createVote = (req, res) => {
    const { id_usuarioVotante, id_empresaVotada, voto } = req.body;

    if (!id_usuarioVotante || !id_empresaVotada || voto === undefined) {
        return res.status(400).json({ error: 'Datos insuficientes para registrar el voto.' });
    }

    // Verificar que la empresa no se esté votando a sí misma
    if (id_usuarioVotante === id_empresaVotada) {
        return res.status(400).json({ error: 'Una empresa no puede votarse a sí misma.' });
    }

    // Verificar si el usuario ya ha votado
    const verificarUsuarioQuery = 'SELECT * FROM votacion WHERE id_usuarioVotante = ?';
    
    connection.query(verificarUsuarioQuery, [id_usuarioVotante], (err, results) => {
        if (err) {
            console.error('Error al verificar el voto del usuario: ', err);
            return res.status(500).json({ error: 'Error al verificar el voto del usuario' });
        }

        // Si el usuario ya tiene un voto registrado
        if (results.length > 0) {
            return res.status(400).json({ error: 'Ya has votado una vez. No puedes votar más.' });
        }

        // Si el usuario no tiene un voto, se procede a insertar el nuevo voto
        const query = `
            INSERT INTO votacion (id_usuarioVotante, id_empresaVotada, voto)
            VALUES (?, ?, ?);
        `;

        connection.query(query, [id_usuarioVotante, id_empresaVotada, voto], (err) => {
            if (err) {
                console.error('Error al registrar el voto: ', err);
                return res.status(500).json({ error: 'Error al registrar el voto' });
            }
            res.status(200).json({ message: 'Voto registrado exitosamente' });
        });
    });
};

const getAllVotes = (req, res) => {
    const query = 'SELECT * FROM votacion';
    
    connection.query(query, (err, results) => {
        if (err) {
        console.error('Error al obtener los votos: ', err);
        return res.status(500).json({ error: 'Error al obtener los votos' });
        }
        res.status(200).json(results);
    });
};

const getUserVote = (req, res) => {
    const usuario_id = req.params.id_usuarioVotante;

    const query = 'SELECT * FROM votacion WHERE id_usuarioVotante = ?';
    
    connection.query(query, [id_usuarioVotante], (err, results) => {
        if (err) {
        console.error('Error al obtener el voto del usuario: ', err);
        return res.status(500).json({ error: 'Error al obtener el voto del usuario' });
        }
        res.status(200).json(results);
    });
};

const verificarVoto = (req, res) => {
    const { id_usuarioVotante, id_empresaVotada } = req.query;

    if (!id_usuarioVotante || !id_empresaVotada) {
        return res.status(400).json({ error: 'Datos insuficientes para verificar el voto.' });
    }

    const query = 'SELECT * FROM votacion WHERE id_usuarioVotante = ? AND id_empresaVotada = ?';

    connection.query(query, [id_usuarioVotante,id_empresaVotada], (err, results) => {
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
    const { id_usuarioVotante, id_empresaVotada } = req.body;

    if (!id_usuarioVotante || !id_empresaVotada) {
        return res.status(400).json({ message: 'Datos insuficientes para eliminar el voto' });
    }

    const query = 'DELETE FROM votacion WHERE id_usuarioVotante = ? AND id_empresaVotada = ?';

    connection.query(query, [id_usuarioVotante, id_empresaVotada], (err, result) => {
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