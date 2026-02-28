-- Таблица для справочника типов топлива
CREATE TABLE fuel_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
);

-- Таблица для справочника типов кузова
CREATE TABLE body_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
);

-- Таблица для справочника типов коробки передач
CREATE TABLE transmission_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
);

-- Основная таблица автомобилей
CREATE TABLE cars (
    id SERIAL PRIMARY KEY,
    brand_model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL CHECK (year BETWEEN 1960 AND EXTRACT(YEAR FROM CURRENT_DATE)),
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 10000),
    mileage INTEGER NOT NULL CHECK (mileage >= 0),
    engine_volume DECIMAL(3, 1) NOT NULL CHECK (engine_volume BETWEEN 0.8 AND 8.0),
    engine_power INTEGER NOT NULL CHECK (engine_power BETWEEN 30 AND 1000),
    fuel_type_id INTEGER NOT NULL REFERENCES fuel_types(id),
    body_type_id INTEGER NOT NULL REFERENCES body_types(id),
    transmission_id INTEGER NOT NULL REFERENCES transmission_types(id),
    color VARCHAR(50) NOT NULL,
    additional_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Таблица для фотографий
CREATE TABLE car_photos (
    id SERIAL PRIMARY KEY,
    car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL,
    is_main BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Заполняем справочники
INSERT INTO fuel_types (name) VALUES 
    ('Бензин'),
    ('Дизель'),
    ('Электро'),
    ('Гибрид');

INSERT INTO body_types (name) VALUES 
    ('Седан'),
    ('Хэтчбек'),
    ('Внедорожник'),
    ('Купе'),
    ('Минивэн'),
    ('Универсал');

INSERT INTO transmission_types (name) VALUES 
    ('Автоматическая'),
    ('Механическая'),
    ('Робот'),
    ('Вариатор');

	-- Индексы для часто используемых полей в поиске
CREATE INDEX idx_cars_brand_model ON cars(brand_model);
CREATE INDEX idx_cars_price ON cars(price);
CREATE INDEX idx_cars_year ON cars(year);
CREATE INDEX idx_cars_mileage ON cars(mileage);
CREATE INDEX idx_cars_fuel_type ON cars(fuel_type_id);
CREATE INDEX idx_cars_body_type ON cars(body_type_id);
CREATE INDEX idx_cars_transmission ON cars(transmission_id);

-- Функция для обновления поля updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS '
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- Триггер для cars
CREATE TRIGGER update_cars_updated_at 
    BEFORE UPDATE ON cars 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();