const express = require('express');
const cors = require('cors');

const filtersRouter = require('./routes/filters');
const carsRouter = require('./routes/cars');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Делаем папку uploads публичной
app.use('/api/uploads', express.static('uploads'));

app.use('/api/filters', filtersRouter);
app.use('/api/cars', carsRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
