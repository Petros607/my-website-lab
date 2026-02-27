const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const {
            transmission,
            color,
            bodyType,
            fuelType,
            minPrice,
            maxPrice,
            minYear,
            maxYear,
            mileage,
            search
        } = req.query;

        let query = `
            SELECT cars.*, 
                   transmission_types.name AS transmission_name,
                   body_types.name AS body_type_name,
                   fuel_types.name AS fuel_type_name
            FROM cars
            LEFT JOIN transmission_types ON cars.transmission_type_id = transmission_types.id
            LEFT JOIN body_types ON cars.body_type_id = body_types.id
            LEFT JOIN fuel_types ON cars.fuel_type_id = fuel_types.id
            WHERE 1=1
        `;

        const values = [];
        let index = 1;

        if (transmission) {
            query += ` AND cars.transmission_type_id = $${index++}`;
            values.push(transmission);
        }

        if (color) {
            query += ` AND cars.color = $${index++}`;
            values.push(color);
        }

        if (minPrice) {
            query += ` AND cars.price >= $${index++}`;
            values.push(minPrice);
        }

        if (maxPrice) {
            query += ` AND cars.price <= $${index++}`;
            values.push(maxPrice);
        }

        if (search) {
            query += ` AND (cars.brand ILIKE $${index} OR cars.model ILIKE $${index})`;
            values.push(`%${search}%`);
            index++;
        }

        const result = await pool.query(query, values);

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;
