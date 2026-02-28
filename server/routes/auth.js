const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

router.post('/register', async (req, res) => {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !phone || !password) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `INSERT INTO users (username, email, phone, password_hash)
             VALUES ($1, $2, $3, $4)
             RETURNING id, username, email, role`,
            [username, email, phone, hashedPassword]
        );

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: newUser.rows[0]
        });

    } catch (err) {

        // duplicate (unique constraint)
        if (err.code === '23505') {
            return res.status(400).json({
                error: 'Пользователь с такими данными уже существует'
            });
        }

        console.error(err);
        res.status(500).json({ error: 'Ошибка регистрации' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: 'Введите email и пароль' });

    try {
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0)
            return res.status(400).json({ error: 'Неверный email или пароль' });

        const validPassword = await bcrypt.compare(
            password,
            user.rows[0].password_hash
        );

        if (!validPassword)
            return res.status(400).json({ error: 'Неверный email или пароль' });

        const token = jwt.sign(
            {
                id: user.rows[0].id,
                role: user.rows[0].role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Успешный вход',
            token,
            user: {
                id: user.rows[0].id,
                username: user.rows[0].username,
                email: user.rows[0].email,
                role: user.rows[0].role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка авторизации' });
    }
});

module.exports = router;
