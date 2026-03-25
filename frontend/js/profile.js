import { API_URL } from './config.js';
import { MAIN_URL } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Проверяем авторизацию
    if (!isAuthenticated()) {
        window.location.href = 'authPhone.html';
        return;
    }
    await loadUserProfile();
    await loadFavoriteCars();
});

// ------------------------
// Загрузка данных профиля
// ------------------------
async function loadUserProfile() {
    try {
        // Получаем данные пользователя из localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            throw new Error('Данные пользователя не найдены');
        }

        const user = JSON.parse(userStr);
        
        // Обновляем UI с данными пользователя
        updateProfileUI(user);
        
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        showNotification('Ошибка загрузки данных профиля', 'error');
    }
}

function updateProfileUI(user) {
    // Обновляем имя пользователя
    const nameElement = document.querySelector('.profile-name');
    if (nameElement) {
        nameElement.textContent = user.username || 'Пользователь';
    }

    // Обновляем статус (роль)
    const statusElement = document.querySelector('.profile-status');
    if (statusElement) {
        const role = user.role === 'admin' ? 'Администратор' : 'Покупатель';
        statusElement.textContent = role;
    }

    // Обновляем телефон
    const phoneElement = document.querySelector('.profile-phone');
    if (phoneElement) {
        phoneElement.textContent = `Телефон: ${user.phone || 'Не указан'}`;
    }

    // Обновляем email
    const emailElement = document.querySelector('.profile-email');
    if (emailElement) {
        emailElement.textContent = `Email: ${user.email || 'Не указан'}`;
    }
}

// ------------------------
// Загрузка избранных автомобилей
// ------------------------
async function loadFavoriteCars() {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/favorites`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки избранных автомобилей');
        }

        const favorites = await response.json();
        renderFavoriteCars(favorites);

    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка загрузки избранного', 'error');
    }
}

function renderFavoriteCars(cars) {
    const container = document.querySelector('.profile-cars-list');
    if (!container) return;

    if (!cars || cars.length === 0) {
        // Показываем сообщение, если нет избранных
        container.innerHTML = `
            <div class="profile-no-cars">
                У вас пока нет избранных автомобилей
            </div>
        `;
        return;
    }

    // Очищаем контейнер
    container.innerHTML = '';

    // Рендерим каждый автомобиль
    cars.forEach(car => {
        const carCard = createFavoriteCarCard(car);
        container.appendChild(carCard);
    });
}

function createFavoriteCarCard(car) {
    console.log(car);
    const card = document.createElement('div');
    card.className = 'profile-car-card';
    card.dataset.carId = car.id;

    // Получаем первое фото или используем заглушку
    const photoUrl = car.photos && car.photos.length > 0 
        ? `${MAIN_URL}${car.photos[0].photoUrl.substring(1)}`
        : `${MAIN_URL}uploads/default-car.jpg`;

    // Форматируем цену
    const formattedPrice = Number(car.price).toLocaleString('ru-RU') + ' ₽';

    // Форматируем год (берем из car.year или парсим из car.brand_model если есть)
    const year = car.year || '';

    card.innerHTML = `
        <div class="profile-car-image-container">
            <img src="${photoUrl}" 
                 alt="${car.brandModel}" 
                 class="profile-car-image" 
                 width="120" 
                 height="100"
                 onerror="this.src='images/default-car.jpg'">
        </div>
        <div class="profile-car-info">
            <h2 class="profile-car-title">${car.brandModel} ${year}</h2>
            <div class="profile-car-details">
                <p class="profile-car-price"><strong>Цена:</strong> ${formattedPrice}</p>
            </div>
        </div>
        <button class="profile-favorite-btn" data-car-id="${car.id}">❤️</button>
    `;

    // <p class="profile-car-specs">
    //                 ${car.engineVolume} л / ${car.enginePower} л.с •
    //                 ${car.mileage.toLocaleString()} км
    //             </p>

    // Добавляем обработчик для кнопки удаления из избранного
    const favBtn = card.querySelector('.profile-favorite-btn');
    favBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await removeFromFavorites(car.id, card);
    });

    return card;
}

// ------------------------
// Удаление из избранного
// ------------------------
async function removeFromFavorites(carId, cardElement) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/favorites/${carId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка при удалении из избранного');
        }

        // Анимация сердечка
        const btn = cardElement.querySelector('.profile-favorite-btn');
        
        // Меняем сердечко на белое и запускаем биение
        btn.textContent = '🤍';
        btn.style.animation = 'heartBeatReverse 0.6s ease';
        btn.style.transform = 'scale(0.8)';
        btn.style.background = '#f0f0f0';
        btn.style.color = '#666';
        
        // Показываем уведомление
        showNotification('Автомобиль удален из избранного', 'info');
        
        // Через 600мс (после анимации сердечка) начинаем анимацию карточки
        setTimeout(() => {
            // Останавливаем анимацию сердечка
            btn.style.animation = '';
            btn.style.transform = 'scale(1)';
            
            // Запускаем анимацию исчезновения карточки
            cardElement.style.animation = 'fadeOut 0.4s ease forwards';
            
            // Удаляем карточку после окончания анимации
            setTimeout(() => {
                cardElement.remove();
                
                // Проверяем, остались ли еще автомобили
                const container = document.querySelector('.profile-cars-list');
                if (container.children.length === 0) {
                    container.innerHTML = `
                        <div class="profile-no-cars">
                            У вас пока нет избранных автомобилей
                        </div>
                    `;
                }
            }, 200); // 400мс для анимации fadeOut
            
        }, 300); // 600мс для анимации сердечка

    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка при удалении', 'error');
    }
}

// ------------------------
// Уведомления
// ------------------------
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    let backgroundColor;
    switch(type) {
        case 'success':
            backgroundColor = '#4CAF50';
            break;
        case 'warning':
            backgroundColor = '#ff9800';
            break;
        case 'error':
            backgroundColor = '#f44336';
            break;
        default:
            backgroundColor = '#2196F3';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
