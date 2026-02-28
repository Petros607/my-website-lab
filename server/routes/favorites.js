const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Добавить в избранное
router.post('/', authMiddleware, async (req, res) => {
    const { car_id } = req.body;
    const user_id = req.user.id;

    if (!car_id) {
        return res.status(400).json({ error: 'ID автомобиля обязателен' });
    }

    try {
        // Проверяем, существует ли автомобиль
        const carCheck = await pool.query(
            'SELECT id FROM cars WHERE id = $1',
            [car_id]
        );

        if (carCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Автомобиль не найден' });
        }

        // Добавляем в избранное
        await pool.query(
            'INSERT INTO favorites (user_id, car_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [user_id, car_id]
        );

        res.json({ message: 'Добавлено в избранное' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удалить из избранного
router.delete('/:car_id', authMiddleware, async (req, res) => {
    const car_id = req.params.car_id;
    const user_id = req.user.id;

    try {
        await pool.query(
            'DELETE FROM favorites WHERE user_id = $1 AND car_id = $2',
            [user_id, car_id]
        );

        res.json({ message: 'Удалено из избранного' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить все избранные автомобили пользователя
router.get('/', authMiddleware, async (req, res) => {
    const user_id = req.user.id;

    try {
        const favorites = await pool.query(
            `SELECT 
                c.*,
                f.created_at as favorite_created_at,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'photo_url', cp.photo_url,
                            'is_main', cp.is_main
                        ) ORDER BY cp.sort_order, cp.id
                    ) FILTER (WHERE cp.id IS NOT NULL),
                    '[]'::json
                ) as photos
             FROM favorites f
             JOIN cars c ON c.id = f.car_id
             LEFT JOIN car_photos cp ON cp.car_id = c.id
             WHERE f.user_id = $1
             GROUP BY c.id, f.created_at
             ORDER BY f.created_at DESC`,
            [user_id]
        );

        res.json(favorites.rows);

    } catch (err) {
        console.error('Ошибка в favorites GET:', err);
        res.status(500).json({ error: 'Ошибка сервера: ' + err.message });
    }
});

// Проверить, находится ли автомобиль в избранном у пользователя
router.get('/check/:car_id', authMiddleware, async (req, res) => {
    const car_id = req.params.car_id;
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            'SELECT 1 FROM favorites WHERE user_id = $1 AND car_id = $2',
            [user_id, car_id]
        );

        res.json({ isFavorite: result.rows.length > 0 });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;
