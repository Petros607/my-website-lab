const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadSelects();
    initForm();
});

async function loadSelects() {
    const res = await fetch(`${API_URL}/filters`);
    const data = await res.json();

    fillSelect('fuelType', data.fuels);
    fillSelect('bodyType', data.bodies);
    fillSelect('transmissionType', data.transmissions);
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

function initForm() {
    const form = document.getElementById('addCarForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('brand_model', document.getElementById('carModel').value);
        formData.append('year', document.getElementById('carYear').value);
        formData.append('price', document.getElementById('carPrice').value);
        formData.append('mileage', document.getElementById('carMileage').value);
        formData.append('engine_volume', document.getElementById('engineVolume').value);
        formData.append('engine_power', document.getElementById('enginePower').value);
        formData.append('fuel_type_id', document.getElementById('fuelType').value);
        formData.append('body_type_id', document.getElementById('bodyType').value);
        formData.append('transmission_id', document.getElementById('transmissionType').value);
        formData.append('color', document.getElementById('color').value);
        formData.append('additional_info', document.getElementById('additionalInfo').value);

        const files = document.getElementById('carPhotos').files;

        for (let i = 0; i < files.length; i++) {
            formData.append('photos', files[i]);
        }

        const res = await fetch(`${API_URL}/cars`, {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            alert('Автомобиль добавлен!');
            window.location.href = 'index.html';
        } else {
            alert('Ошибка добавления');
        }
    });
}
