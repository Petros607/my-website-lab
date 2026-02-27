const http = require('http');
const url = require('url');
const pool = require('./db');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS (чтобы фронт мог обращаться к серверу)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (pathname === '/api/transmission-types' && req.method === 'GET') {
        const result = await pool.query('SELECT * FROM transmission_types');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows));
    }

    else if (pathname === '/api/body-types' && req.method === 'GET') {
        const result = await pool.query('SELECT * FROM body_types');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows));
    }

    else if (pathname === '/api/fuel-types' && req.method === 'GET') {
        const result = await pool.query('SELECT * FROM fuel_types');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows));
    }

    else if (pathname === '/api/cars' && req.method === 'GET') {

        const {
            transmission,
            bodyType,
            fuelType,
            color,
            priceMin,
            priceMax,
            yearMin,
            yearMax,
            mileage,
            search
        } = parsedUrl.query;

        let query = `
            SELECT * FROM cars
            WHERE 1=1
        `;
        const values = [];
        let index = 1;

        if (transmission) {
            query += ` AND transmission_type_id = $${index++}`;
            values.push(transmission);
        }

        if (bodyType) {
            query += ` AND body_type_id = $${index++}`;
            values.push(bodyType);
        }

        if (fuelType) {
            query += ` AND fuel_type_id = $${index++}`;
            values.push(fuelType);
        }

        if (color) {
            query += ` AND color = $${index++}`;
            values.push(color);
        }

        if (priceMin) {
            query += ` AND price >= $${index++}`;
            values.push(priceMin);
        }

        if (priceMax) {
            query += ` AND price <= $${index++}`;
            values.push(priceMax);
        }

        if (yearMin) {
            query += ` AND year >= $${index++}`;
            values.push(yearMin);
        }

        if (yearMax) {
            query += ` AND year <= $${index++}`;
            values.push(yearMax);
        }

        if (mileage) {
            query += ` AND mileage <= $${index++}`;
            values.push(mileage);
        }

        if (search) {
            query += ` AND (brand ILIKE $${index} OR model ILIKE $${index})`;
            values.push(`%${search}%`);
            index++;
        }

        const result = await pool.query(query, values);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows));
    }

    else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
