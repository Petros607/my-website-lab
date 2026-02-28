const express = require('express');
const pool = require('../db');
const multer = require('multer');
const fs = require('fs');

const router = express.Router();


if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) =>
        cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// --------------------
// GET cars
// --------------------
router.get('/', async (req, res) => {
    try {
        const {
            transmission,
            color,
            bodyType,
            fuelType,
            minPrice,
            maxPrice,
            search
        } = req.query;

        let query = `
            SELECT 
                c.*,
                COALESCE(
                    json_agg(p.*) FILTER (WHERE p.id IS NOT NULL),
                    '[]'
                ) AS photos
            FROM cars c
            LEFT JOIN car_photos p ON c.id = p.car_id
            WHERE 1=1
        `;

        const values = [];
        let index = 1;

        if (transmission) {
            query += ` AND c.transmission_id = $${index++}`;
            values.push(transmission);
        }

        if (color) {
            query += ` AND c.color = $${index++}`;
            values.push(color);
        }

        if (minPrice) {
            query += ` AND c.price >= $${index++}`;
            values.push(minPrice);
        }

        if (maxPrice) {
            query += ` AND c.price <= $${index++}`;
            values.push(maxPrice);
        }

        if (search) {
            query += ` AND c.brand_model ILIKE $${index++}`;
            values.push(`%${search}%`);
        }

        query += ` GROUP BY c.id ORDER BY c.id DESC`;

        const result = await pool.query(query, values);
        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// --------------------
// POST car + photos
// --------------------
router.post('/', upload.array('photos', 5), async (req, res) => {
    try {
        const {
            brand_model,
            year,
            price,
            mileage,
            engine_volume,
            engine_power,
            fuel_type_id,
            body_type_id,
            transmission_id,
            color,
            additional_info
        } = req.body;

        const carResult = await pool.query(
            `INSERT INTO cars 
            (brand_model, year, price, mileage, engine_volume, engine_power,
             fuel_type_id, body_type_id, transmission_id, color, additional_info)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING id`,
            [
                brand_model,
                year,
                price,
                mileage,
                engine_volume,
                engine_power,
                fuel_type_id,
                body_type_id,
                transmission_id,
                color,
                additional_info
            ]
        );

        const carId = carResult.rows[0].id;

        if (req.files) {
            for (let i = 0; i < req.files.length; i++) {
                await pool.query(
                    `INSERT INTO car_photos
                    (car_id, photo_url, is_main, sort_order)
                    VALUES ($1,$2,$3,$4)`,
                    [
                        carId,
                        `/uploads/${req.files[i].filename}`,
                        i === 0,
                        i
                    ]
                );
            }
        }

        res.status(201).json({ message: 'Авто создано' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка добавления' });
    }
});

// --------------------
// DELETE car
// --------------------
router.delete('/:id', async (req, res) => {
    const client = await pool.connect();

    try {
        const carId = req.params.id;

        await client.query('BEGIN');

        const photosResult = await client.query(
            'SELECT photo_url FROM car_photos WHERE car_id = $1',
            [carId]
        );

        const photos = photosResult.rows;

        const deleteResult = await client.query(
            'DELETE FROM cars WHERE id = $1 RETURNING *',
            [carId]
        );

        if (deleteResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Авто не найдено' });
        }

        await client.query('COMMIT');

        photos.forEach(photo => {
            const filePath = photo.photo_url.replace('/uploads/', 'uploads/');
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        res.json({ message: 'Авто удалено' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Ошибка удаления' });
    } finally {
        client.release();
    }
});

module.exports = router;
