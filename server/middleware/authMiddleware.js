const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

module.exports = function (req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader)
        return res.status(401).json({ error: 'Нет токена' });

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // теперь в любом роуте есть req.user
        next();
    } catch (err) {
        res.status(401).json({ error: 'Недействительный токен' });
    }
};

// Шаг 3 — подключаем в роуте
// Например в routes/cars.js:
// const express = require('express');
// const pool = require('../db');
// const authMiddleware = require('../middleware/authMiddleware');

// const router = express.Router();
// И защищаем маршрут:
// router.post('/', authMiddleware, async (req, res) => {
//     // Теперь req.user.id доступен
// });
