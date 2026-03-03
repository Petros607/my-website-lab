const API_URL = 'http://localhost:5195/api';

document.addEventListener('DOMContentLoaded', () => {
    loadSelects();
    setupPhotoPreview();
    initForm();
});

// ------------------------
// Загрузка опций селектов
// ------------------------
async function loadSelects() {
    try {
        const res = await fetch(`${API_URL}/filters`);
        const data = await res.json();

        fillSelect('fuelType', data.fuels);
        fillSelect('bodyType', data.bodies);
        fillSelect('transmissionType', data.transmissions);
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
// Предпросмотр фото
// ------------------------
let selectedFiles = []; // глобально, все выбранные файлы

function setupPhotoPreview() {
    const photosInput = document.getElementById('carPhotos');

    photosInput.addEventListener('change', function () {
        // Добавляем новые файлы в массив
        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            if (!selectedFiles.includes(file)) selectedFiles.push(file);
        }
        renderPhotoPreviews();
    });
}

function renderPhotoPreviews() {
    const photosPreview = document.getElementById('photosPreview');
    const photosInput = document.getElementById('carPhotos');

    photosPreview.innerHTML = '';
    updatePhotoCounter(selectedFiles.length);

    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (!file.type.match('image.*')) continue;

        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.createElement('div');
            preview.className = 'photo-preview';

            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Preview';

            const removeBtn = document.createElement('button');
            removeBtn.className = 'photo-preview-remove';
            removeBtn.innerHTML = '×';
            removeBtn.title = 'Удалить';

            removeBtn.addEventListener('click', function () {
                selectedFiles.splice(i, 1);
                photosInput.value = '';
                renderPhotoPreviews();
            });

            preview.appendChild(img);
            preview.appendChild(removeBtn);
            photosPreview.appendChild(preview);
        };
        reader.readAsDataURL(file);
    }
}


function updatePhotoCounter(count) {
    const photosPreview = document.getElementById('photosPreview');
    let counter = photosPreview.querySelector('.photo-counter');
    if (count > 0) {
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'photo-counter';
            photosPreview.prepend(counter);
        }
        counter.textContent = `Выбрано файлов: ${count}/5`;
    } else if (counter) counter.remove();
}

// ------------------------
// Валидация формы
// ------------------------
function setError(el, msg) {
    const errorField = el.closest('.form-group').querySelector('.error-msg');
    el.classList.add('input-error');
    errorField.textContent = msg;
}

function clearError(el) {
    const errorField = el.closest('.form-group').querySelector('.error-msg');
    el.classList.remove('input-error');
    errorField.textContent = '';
}

function validateEngine() {
    const engineVolume = document.getElementById('engineVolume');
    const enginePower = document.getElementById('enginePower');
    const fuelType = document.getElementById('fuelType');
    const engineErrors = document.getElementById('engineErrors');
    engineErrors.innerHTML = '';
    let errors = [];

    if (!/^\d+(\.\d)?$/.test(engineVolume.value)) errors.push("Введите объём двигателя (например, 1.6)");
    if (!enginePower.value || parseInt(enginePower.value) < 30) errors.push("Мощность должна быть не менее 30 л.с.");
    if (!fuelType.value) errors.push("Выберите тип топлива");

    errors.forEach(err => {
        const div = document.createElement('div');
        div.className = 'engine-error';
        div.textContent = err;
        engineErrors.appendChild(div);
    });

    if (errors.length) return false;
    return true;
}

function validatePhotos() {
    const photosInput = document.getElementById('carPhotos');
    const photosError = document.getElementById('photosError');
    const files = photosInput.files;
    photosInput.classList.remove('error');
    photosError.style.display = 'none';

    if (files.length > 5) {
        photosInput.classList.add('error');
        photosError.textContent = "Можно загрузить не более 5 фотографий";
        photosError.style.display = 'block';
        return false;
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (!allowedTypes.includes(f.type) || f.size > maxSize) {
            photosInput.classList.add('error');
            photosError.textContent = `Файл "${f.name}" недопустим или слишком большой`;
            photosError.style.display = 'block';
            return false;
        }
    }
    return true;
}

function validateDescription() {
        const description = document.getElementById("carDescription");
        const descriptionError = document.getElementById("descriptionError");
        
        description.classList.remove('error');
        descriptionError.style.display = 'none';
        
        if (description.value.length > 500) {
            description.classList.add('error');
            descriptionError.textContent = "Описание не должно превышать 500 символов";
            descriptionError.style.display = 'block';
            return false;
        }
        
        return true;
    }

function validateAdditionalInfo() {
    const additionalInfo = document.getElementById("additionalInfo");
    const additionalInfoError = document.getElementById("additionalInfoError");
    
    additionalInfo.classList.remove('error');
    additionalInfoError.style.display = 'none';
    
    if (additionalInfo.value.length > 500) {
        additionalInfo.classList.add('error');
        additionalInfoError.textContent = "Дополнительная информация не должна превышать 500 символов";
        additionalInfoError.style.display = 'block';
        return false;
    }
    
    return true;
}

function validateForm() {
    let valid = true;

    const model = document.getElementById('carModel');
    if (!/^[А-Яа-яA-Za-z0-9\s\-]{3,}$/.test(model.value.trim())) { setError(model, "Введите корректную марку и модель (≥3 символов)"); valid = false; } 
    else clearError(model);

    const year = Number(document.getElementById('carYear').value);
    if (year < 1960 || year > new Date().getFullYear()) { setError(document.getElementById('carYear'), "Год выпуска некорректен (должен быть с 1960)"); valid = false; } 
    else clearError(document.getElementById('carYear'));

    const price = document.getElementById("carPrice");
    if (!price.value || parseInt(price.value) < 10000) { setError(price, "Цена должна быть более 10000 руб."); valid = false; } 
    else clearError(price);

    const mileage = document.getElementById("carMileage");
    if (!mileage.value || parseInt(mileage.value) < 0) { setError(mileage, "Пробег должен быть неотрицательным числом"); valid = false; } 
    else clearError(mileage);

    if (!validateEngine()) valid = false;
    if (!validatePhotos()) valid = false;

    const bodyType = document.getElementById('bodyType');
    if (!bodyType.value) { setError(bodyType, "Выберите кузов"); valid = false; } 
    else clearError(bodyType);

    const transmission = document.getElementById('transmissionType');
    if (!transmission.value) { setError(transmission, "Выберите коробку"); valid = false; } 
    else clearError(transmission);

    const color = document.getElementById("color");
    if (!/^[А-Яа-яA-Za-z\-]{3,}$/.test(color.value)) {
        setError(color, "Введите корректный цвет (минимум 3 буквы).");
        valid = false;
    } else clearError(color);

    if (!validateAdditionalInfo()) {
        valid = false;
    }

    return valid;
}

// ------------------------
// Отправка формы
// ------------------------
function initForm() {
    const form = document.getElementById('addCarForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateForm()) return scrollToFirstError();

        const formData = new FormData();
        formData.append('BrandModel', document.getElementById('carModel').value);
        formData.append('Year', document.getElementById('carYear').value);
        formData.append('Price', document.getElementById('carPrice').value);
        formData.append('Mileage', document.getElementById('carMileage').value);
        formData.append('EngineVolume', document.getElementById('engineVolume').value);
        formData.append('EnginePower', document.getElementById('enginePower').value);
        formData.append('FuelTypeId', document.getElementById('fuelType').value);
        formData.append('BodyTypeId', document.getElementById('bodyType').value);
        formData.append('TransmissionId', document.getElementById('transmissionType').value);
        formData.append('Color', document.getElementById('color').value);
        formData.append('AdditionalInfo', document.getElementById('additionalInfo').value);

        // Добавляем все файлы из массива
        selectedFiles.forEach(file => formData.append('photos', file));

        try {
            const res = await fetch(`${API_URL}/cars`, { method: 'POST', body: formData });
            if (res.ok) {
                alert('Автомобиль успешно добавлен!');
                window.location.href = 'index.html';
            } else throw new Error('Ошибка сервера');
        } catch (err) {
            alert('Не удалось добавить автомобиль');
            console.error(err);
        }
    });
}

function scrollToFirstError() {
    const firstError = document.querySelector('.input-error, .error');
    if (!firstError) return;
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstError.focus();
}
