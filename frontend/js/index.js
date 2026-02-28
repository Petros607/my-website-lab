const API_URL = 'http://localhost:3000/api';

let transmissionMap = {};
let bodyTypeMap = {};
let fuelsMap = {};
let colors = [];
let carsData = [];
let currentPage = 1;
const PAGE_SIZE = 6;

// ------------------------
// Range-слайдеры: обновление отображения
// ------------------------
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
}

function initializeSliders() {

    // -----------------
    // Цена
    // -----------------
    const priceSlider = document.getElementById('priceSlider');

    noUiSlider.create(priceSlider, {
        start: [0, 10000000],
        connect: true,
        step: 100000,
        range: {
            min: 0,
            max: 10000000
        }
    });

    const priceMinEl = document.getElementById('priceMin');
    const priceMaxEl = document.getElementById('priceMax');

    priceSlider.noUiSlider.on('update', (values) => {
        const min = Math.round(values[0]);
        const max = Math.round(values[1]);

        // сохраняем значение для фильтра
        priceMinEl.value = min;
        priceMaxEl.value = max;

        // отображаем красиво
        priceMinEl.textContent = formatPrice(min);
        priceMaxEl.textContent = formatPrice(max);
    });

    // priceSlider.noUiSlider.on('change', () => {
    //     currentPage = 1;
    //     loadCars(true);
    // });

    // -----------------
    // Год
    // -----------------
    const yearSlider = document.getElementById('yearSlider');

    noUiSlider.create(yearSlider, {
        start: [1960, 2026],
        connect: true,
        step: 1,
        range: {
            min: 1960,
            max: 2026
        }
    });

    const yearMinEl = document.getElementById('yearMin');
    const yearMaxEl = document.getElementById('yearMax');

    yearSlider.noUiSlider.on('update', (values) => {
        const min = Math.round(values[0]);
        const max = Math.round(values[1]);

        yearMinEl.value = min;
        yearMaxEl.value = max;

        yearMinEl.textContent = min;
        yearMaxEl.textContent = max;
    });

    // yearSlider.noUiSlider.on('change', () => {
    //     currentPage = 1;
    //     loadCars(true);
    // });
}


// Функция форматирования цены
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
}


// ------------------------
// Загрузка справочников и фильтров
// ------------------------
async function loadLookups() {
    try {
        const res = await fetch(`${API_URL}/filters`);
        const data = await res.json();

        fillSelect('filterTransmission', data.transmissions);
        fillSelect('filterBodyType', data.bodies);
        fillSelect('filterFuelType', data.fuels);

        colors = data.colors || [];
        const colorSelect = document.getElementById('filterColor');
        colors.forEach(c => {
            const option = document.createElement('option');
            option.value = c.color;
            option.textContent = c.color;
            colorSelect.appendChild(option);
        });

        data.transmissions.forEach(t => transmissionMap[t.id] = t.name);
        data.bodies.forEach(b => bodyTypeMap[b.id] = b.name);
        data.fuels.forEach(f => fuelsMap[f.id] = f.name);

    } catch (err) {
        console.error('Ошибка загрузки фильтров:', err);
    }
}

function fillSelect(selectId, items) {
    const select = document.getElementById(selectId);
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        select.appendChild(option);
    });
}

// ------------------------
// Загрузка автомобилей
// ------------------------
async function loadCars(reset = true) {
    try {
        const params = buildFilterParams();
        const res = await fetch(`${API_URL}/cars?${params}&page=${currentPage}&limit=${PAGE_SIZE}`);
        const data = await res.json();

        if (reset) carsData = [];
        carsData = carsData.concat(data);

        renderCars(carsData);

        const loadMoreBtn = document.getElementById('load-more-btn');
        loadMoreBtn.style.display = (data.length <= PAGE_SIZE) ? 'none' : 'block';

        document.getElementById('noCarsMessage').style.display = carsData.length ? 'none' : 'block';

    } catch (err) {
        console.error('Ошибка загрузки автомобилей:', err);
    }
}

function buildFilterParams() {
    const params = new URLSearchParams();
    const transmission = document.getElementById('filterTransmission').value;
    const bodyType = document.getElementById('filterBodyType').value;
    const fuelType = document.getElementById('filterFuelType').value;
    const color = document.getElementById('filterColor').value;
    const priceMin = document.getElementById('priceMin').value;
    const priceMax = document.getElementById('priceMax').value;
    const yearMin = document.getElementById('yearMin').value;
    const yearMax = document.getElementById('yearMax').value;
    const mileageMax = document.getElementById('filterMileage').value;
    const search = document.getElementById('searchInput').value.trim();

    if (transmission) params.append('transmission_id', transmission);
    if (bodyType) params.append('body_type_id', bodyType);
    if (fuelType) params.append('fuel_type_id', fuelType);
    if (color) params.append('color', color);
    if (priceMin) params.append('price_min', priceMin);
    if (priceMax) params.append('price_max', priceMax);
    if (yearMin) params.append('year_min', yearMin);
    if (yearMax) params.append('year_max', yearMax);
    if (mileageMax) params.append('mileage_max', mileageMax);
    if (search) params.append('search', search);

    return params.toString();
}

// ------------------------
// Рендер карточек
// ------------------------
function renderCars(cars) {
    const grid = document.getElementById('carsGrid');
    grid.innerHTML = '';

    const template = document.getElementById('carCardTemplate');

    cars.forEach(car => {
        const card = template.content.cloneNode(true);

        // ----------------------
        // Фото и стрелки
        // ----------------------
        const img = card.querySelector('.index-car-card-image');
        const photos = (car.photos && car.photos.length) 
            ? car.photos.map(p => `${API_URL}${p.photo_url}`) 
            : [`${API_URL}/uploads/default-car.jpg`];
        let currentPhotoIndex = 0;
        img.src = photos[currentPhotoIndex];
        img.alt = car.brand_model;

        const leftArrow = card.querySelector('.photo-arrow-left');
        const rightArrow = card.querySelector('.photo-arrow-right');

        leftArrow.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            leftArrow.classList.add('arrow-clicked');
            setTimeout(() => leftArrow.classList.remove('arrow-clicked'), 150);

            currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
            img.src = photos[currentPhotoIndex];
        });

        rightArrow.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            rightArrow.classList.add('arrow-clicked');
            setTimeout(() => rightArrow.classList.remove('arrow-clicked'), 150);

            currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
            img.src = photos[currentPhotoIndex];
        });

        // ----------------------
        // Текстовые данные
        // ----------------------
        card.querySelector('.index-car-card-title').textContent = car.brand_model;
        card.querySelector('.index-car-card-price').textContent = Number(car.price).toLocaleString('ru-RU') + ' ₽';
        card.querySelector('.index-car-card-mileage').textContent = car.mileage.toLocaleString() + ' км';
        card.querySelector('.index-car-card-engine').textContent = `${car.engine_volume} л / ${car.engine_power} л.с`;
        card.querySelector('.index-car-card-color').textContent = car.color;
        card.querySelector('.index-car-card-transmission').textContent = transmissionMap[car.transmission_id] || 'Неизвестно';
        card.querySelector('.index-car-card-body-type').textContent = bodyTypeMap[car.body_type_id] || 'Неизвестно';

        // ----------------------
        // Динамически добавляем additional info
        // ----------------------
        const infoContainer = card.querySelector('.index-car-card-additional-info');
        infoContainer.innerHTML = ''; // на случай перерендера
        if (car.additional_info) {
            const features = car.additional_info.split(',').map(f => f.trim());
            features.forEach(f => {
                const span = document.createElement('span');
                span.className = 'index-car-card-feature';
                span.textContent = `+ ${f}`;
                infoContainer.appendChild(span);
            });
        }

        // ----------------------
        // Кнопки избранного
        // ----------------------
        const favBtn = card.querySelector('.index-car-card-favorite-btn');
        favBtn.dataset.carId = car.id;
        favBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(favBtn);
        });

        grid.appendChild(card);
    });
}

// ------------------------
// Фильтры и слайдеры
// ------------------------
function setupFilterEvents() {
    const filterForm = document.getElementById('filterForm');

    // Submit формы
    filterForm.addEventListener('submit', e => {
        e.preventDefault();
        currentPage = 1;
        loadCars(true);
    });

    // Reset формы
    filterForm.addEventListener('reset', () => {
        setTimeout(() => {
            const priceSlider = document.getElementById('priceSlider');
            priceSlider.noUiSlider.set([0, 10000000]);
            const yearSlider = document.getElementById('yearSlider');
            yearSlider.noUiSlider.set([1960, 2026]);
            currentPage = 1;
            loadCars(true);
        }, 10);
    });

    // Load more
    document.getElementById('load-more-btn').addEventListener('click', () => {
        currentPage++;
        loadCars(false);
    });

    // Слайдеры
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const yearMin = document.getElementById('yearMin');
    const yearMax = document.getElementById('yearMax');
}

// ------------------------
// Избранное (heart.js)
// ------------------------
function toggleFavorite(btn) {
    const isFavorite = btn.textContent === '❤️';
    
    if (isFavorite) {
        btn.textContent = '🤍';
        btn.style.transform = 'scale(0.8)';
        showNotification('Убрано из избранного', 'info');
    } else {
        btn.textContent = '❤️';
        btn.style.animation = 'heartBeat 0.6s ease';
        showNotification('Добавлено в избранное', 'success');
        saveToFavorites(btn);
    }
    
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
        btn.style.animation = '';
    }, 600);
}

function saveToFavorites(btn) {
    const carCard = btn.closest('.index-car-card');
    const carTitle = carCard.querySelector('.index-car-card-title').textContent;
    const carPrice = carCard.querySelector('.index-car-card-price').textContent;
    
    const favorites = JSON.parse(localStorage.getItem('carFavorites') || '[]');
    favorites.push({
        title: carTitle,
        price: carPrice,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('carFavorites', JSON.stringify(favorites));
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ------------------------
// Инициализация
// ------------------------
document.addEventListener('DOMContentLoaded', async () => {
    await loadLookups();
    initializeSliders();
    setupFilterEvents();
    loadCars();
});
