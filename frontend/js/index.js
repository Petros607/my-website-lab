const API_URL = 'http://localhost:3000/api';

let transmissionMap = {};
let bodyTypeMap = {};

async function loadLookups() {
    const [transmissionsRes, bodyTypesRes] = await Promise.all([
        fetch(`${API_URL}/transmission-types`),
        fetch(`${API_URL}/body-types`)
    ]);

    const transmissions = await transmissionsRes.json();
    const bodyTypes = await bodyTypesRes.json();

    transmissions.forEach(t => transmissionMap[t.id] = t.name);
    bodyTypes.forEach(b => bodyTypeMap[b.id] = b.name);
}

async function loadCars() {
    const res = await fetch(`${API_URL}/cars`);
    const cars = await res.json();

    const grid = document.getElementById('carsGrid');
    grid.innerHTML = '';

    cars.forEach(car => {
        const template = document.getElementById('carCardTemplate');
        const card = template.content.cloneNode(true);

        // Фото
        const img = card.querySelector('.index-car-card-image');
        img.src = ''; 
        img.alt = car.brand_model;

        // Основные данные
        card.querySelector('.index-car-card-title').textContent = car.brand_model;
        card.querySelector('.index-car-card-price').textContent = Number(car.price).toLocaleString('ru-RU') + ' ₽';
        card.querySelector('.index-car-card-mileage').textContent = car.mileage.toLocaleString() + ' км';
        card.querySelector('.index-car-card-engine').textContent = `${car.engine_volume} л / ${car.engine_power} л.с`;
        card.querySelector('.index-car-card-color').textContent = car.color;

        // Кузов и коробка
        card.querySelector('.index-car-card-transmission').textContent = transmissionMap[car.transmission_id] || 'Неизвестно';
        card.querySelector('.index-car-card-body-type').textContent = bodyTypeMap[car.body_type_id] || 'Неизвестно';

        grid.appendChild(card);
    });
}

// Загружаем все данные при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    await loadLookups();
    await loadCars();
});
