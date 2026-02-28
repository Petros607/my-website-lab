const express = require('express');
const cors = require('cors');

const filtersRouter = require('./routes/filters');
const carsRouter = require('./routes/cars');
const authRoutes = require('./routes/auth');
const favoritesRouter = require('./routes/favorites');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Делаем папку uploads публичной
app.use('/api/uploads', express.static('uploads'));

app.use('/api/filters', filtersRouter);
app.use('/api/cars', carsRouter);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
