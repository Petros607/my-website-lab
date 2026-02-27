const API_URL = 'http://localhost:3000/api';

async function loadTransmissionTypes() {
    const res = await fetch(`${API_URL}/transmission-types`);
    const data = await res.json();

    const select = document.getElementById('filterTransmission');

    data.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        select.appendChild(option);
    });
}

async function loadCars() {
    const res = await fetch(`${API_URL}/cars`);
    const cars = await res.json();

    const grid = document.getElementById('carsGrid');
    grid.innerHTML = '';

    cars.forEach(car => {
        const div = document.createElement('div');
        div.innerHTML = `
            <h3>${car.brand} ${car.model}</h3>
            <p>${car.price} ₽</p>
        `;
        grid.appendChild(div);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadTransmissionTypes();
    loadCars();
});
