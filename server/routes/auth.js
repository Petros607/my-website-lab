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

// Унифицированный вход (поддерживает и email, и телефон)
router.post('/login', async (req, res) => {
    const { login, password } = req.body; // login может быть email или телефоном

    if (!login || !password) {
        return res.status(400).json({ error: 'Введите логин (email или телефон) и пароль' });
    }

    try {
        let user;
        
        // Проверяем, является ли login email-ом
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        const isEmail = emailRegex.test(login);
        
        if (isEmail) {
            // Поиск по email
            user = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [login]
            );
        } else {
            // Поиск по телефону (очищаем от форматирования)
            const cleanPhone = login.replace(/[\s\-\(\)\+]/g, '');
            
            // Ищем по оригинальному формату или очищенному
            user = await pool.query(
                'SELECT * FROM users WHERE phone = $1 OR REPLACE(REPLACE(REPLACE(REPLACE(phone, \' \', \'\'), \'-\', \'\'), \'(\', \'\'), \')\', \'\') = $2',
                [login, cleanPhone]
            );
        }

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Неверный логин или пароль' });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.rows[0].password_hash
        );

        if (!validPassword) {
            return res.status(400).json({ error: 'Неверный логин или пароль' });
        }

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
                phone: user.rows[0].phone,
                role: user.rows[0].role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка авторизации' });
    }
});

// Проверка уникальности username
router.post('/check-username', async (req, res) => {
    const { username } = req.body;

    if (!username || username.length < 2) {
        return res.status(400).json({ 
            available: false, 
            message: 'Слишком короткий логин' 
        });
    }

    try {
        const user = await pool.query(
            'SELECT id FROM users WHERE username = $1',
            [username]
        );

        if (user.rows.length > 0) {
            return res.json({ 
                available: false, 
                message: 'Логин уже занят' 
            });
        }

        res.json({ 
            available: true, 
            message: 'Логин доступен' 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            available: false, 
            message: 'Ошибка проверки' 
        });
    }
});

// Проверка уникальности email
router.post('/check-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ 
            available: false, 
            message: 'Введите email' 
        });
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            available: false, 
            message: 'Некорректный email' 
        });
    }

    try {
        const user = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length > 0) {
            return res.json({ 
                available: false, 
                message: 'Email уже используется' 
            });
        }

        res.json({ 
            available: true, 
            message: 'Email доступен' 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            available: false, 
            message: 'Ошибка проверки' 
        });
    }
});

// Проверка уникальности телефона
router.post('/check-phone', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ 
            available: false, 
            message: 'Введите номер телефона' 
        });
    }

    // Очищаем телефон от лишних символов для проверки
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    const phoneRegex = /^[0-9]{10,15}$/;
    
    if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({ 
            available: false, 
            message: 'Некорректный номер телефона' 
        });
    }

    try {
        const user = await pool.query(
            'SELECT id FROM users WHERE phone = $1',
            [phone] // Сравниваем с оригинальным форматом из БД
        );

        if (user.rows.length > 0) {
            return res.json({ 
                available: false, 
                message: 'Телефон уже используется' 
            });
        }

        res.json({ 
            available: true, 
            message: 'Телефон доступен' 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            available: false, 
            message: 'Ошибка проверки' 
        });
    }
});

module.exports = router;
