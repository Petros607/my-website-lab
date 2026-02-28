const API_URL = 'http://localhost:3000/api';

let transmissionMap = {};
let bodyTypeMap = {};
let fuelsMap = {};
let colors = [];
let carsData = [];
let currentPage = 1;
const PAGE_SIZE = 6;

// ------------------------
// Загрузка справочников и фильтров
// ------------------------
async function loadLookups() {
    try {
        const res = await fetch(`${API_URL}/filters`);
        const data = await res.json();

        // Заполняем селекты
        fillSelect('filterTransmission', data.transmissions);
        fillSelect('filterBodyType', data.bodies);
        fillSelect('filterFuelType', data.fuels);

        // Цвета из уникальных значений
        colors = data.colors || [];
        const colorSelect = document.getElementById('filterColor');
        colors.forEach(c => {
            const option = document.createElement('option');
            option.value = c.color;
            option.textContent = c.color;
            colorSelect.appendChild(option);
        });

        // Создаём мапы для отображения в карточках
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

        // Показать или скрыть кнопку "Загрузить ещё"
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (data.length < PAGE_SIZE) loadMoreBtn.style.display = 'none';
        else loadMoreBtn.style.display = 'block';

        // Сообщение "не найдено"
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

        const img = card.querySelector('.index-car-card-image');
        if (car.photos && car.photos.length) {
            img.src = `${API_URL}${car.photos[0].photo_url}`;
        } else {
            img.src = `${API_URL}/uploads/default-car.jpg`;
        }
        img.alt = car.brand_model;

        card.querySelector('.index-car-card-title').textContent = car.brand_model;
        card.querySelector('.index-car-card-price').textContent = Number(car.price).toLocaleString('ru-RU') + ' ₽';
        card.querySelector('.index-car-card-mileage').textContent = car.mileage.toLocaleString() + ' км';
        card.querySelector('.index-car-card-engine').textContent = `${car.engine_volume} л / ${car.engine_power} л.с`;
        card.querySelector('.index-car-card-color').textContent = car.color;

        card.querySelector('.index-car-card-transmission').textContent = transmissionMap[car.transmission_id] || 'Неизвестно';
        card.querySelector('.index-car-card-body-type').textContent = bodyTypeMap[car.body_type_id] || 'Неизвестно';

        const favBtn = card.querySelector('.index-car-card-favorite-btn');
        favBtn.dataset.carId = car.id;
        favBtn.addEventListener('click', () => {
            favBtn.textContent = favBtn.textContent === '🤍' ? '❤️' : '🤍';
        });

        grid.appendChild(card);
    });
}

// ------------------------
// События фильтров
// ------------------------
function setupFilterEvents() {
    const filterForm = document.getElementById('filterForm');

    filterForm.addEventListener('submit', e => {
        e.preventDefault();
        currentPage = 1;
        loadCars(true);
    });

    document.getElementById('load-more-btn').addEventListener('click', () => {
        currentPage++;
        loadCars(false);
    });
}

// ------------------------
// Инициализация
// ------------------------
document.addEventListener('DOMContentLoaded', async () => {
    await loadLookups();
    setupFilterEvents();
    loadCars();
});
