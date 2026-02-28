-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Хеш пароля, не сам пароль!
    role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Проверки (валидация)
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone ~* '^\+?[0-9\s\-\(\)]+$'),
    CONSTRAINT valid_username CHECK (LENGTH(username) >= 2),
    CONSTRAINT valid_role CHECK (role IN ('user', 'admin'))
);

-- Комментарии к таблице и колонкам
COMMENT ON TABLE users IS 'Пользователи сервиса AutoLambada';
COMMENT ON COLUMN users.id IS 'Уникальный идентификатор пользователя';
COMMENT ON COLUMN users.username IS 'Имя пользователя (уникальное)';
COMMENT ON COLUMN users.email IS 'Email пользователя (уникальный)';
COMMENT ON COLUMN users.phone IS 'Номер телефона (уникальный)';
COMMENT ON COLUMN users.password_hash IS 'Хеш пароля (не храним пароли в открытом виде)';
COMMENT ON COLUMN users.role IS 'Роль пользователя: user (обычный) или admin (администратор)';
COMMENT ON COLUMN users.created_at IS 'Дата и время регистрации';

-- Индекс для быстрого поиска по email (часто используется при входе)
CREATE INDEX idx_users_email ON users(email);

-- Индекс для поиска по телефону
CREATE INDEX idx_users_phone ON users(phone);

-- Индекс для поиска по имени пользователя
CREATE INDEX idx_users_username ON users(username);

CREATE TABLE favorites (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, car_id)
);

-- Добавить в избранное
-- INSERT INTO favorites (user_id, car_id)
-- VALUES (1, 5);
-- Убрать из избранного
-- DELETE FROM favorites
-- WHERE user_id = 1 AND car_id = 5;
-- Получить избранные машины пользователя
-- SELECT cars.*
-- FROM favorites
-- JOIN cars ON favorites.car_id = cars.id
-- WHERE favorites.user_id = 1;
