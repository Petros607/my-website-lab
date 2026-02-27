const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const transmissions = await pool.query('SELECT * FROM transmission_types');
        const bodies = await pool.query('SELECT * FROM body_types');
        const fuels = await pool.query('SELECT * FROM fuel_types');
        const colors = await pool.query('SELECT DISTINCT color FROM cars');

        res.json({
            transmissions: transmissions.rows,
            bodies: bodies.rows,
            fuels: fuels.rows,
            colors: colors.rows
        });

    } catch (err) {
        res.status(500).json({ error: 'Ошибка загрузки фильтров' });
    }
});

module.exports = router;
