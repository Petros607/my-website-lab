const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'auto_lambada_db',
    port: 5432,
});

module.exports = pool;
