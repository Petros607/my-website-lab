document.addEventListener("DOMContentLoaded", () => {
    initializeFilters();
});

function initializeFilters() {
    setupRangeSliders();
    setupFilterEvents();
}

// 1. Настройка range-слайдеров
function setupRangeSliders() {
    updatePriceDisplay();
    updateYearDisplay();
}

function updatePriceDisplay() {
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const priceMinValue = document.getElementById('price-min');
    const priceMaxValue = document.getElementById('price-max');

    if (priceMin && priceMax && priceMinValue && priceMaxValue) {
        priceMinValue.textContent = formatPrice(priceMin.value);
        priceMaxValue.textContent = formatPrice(priceMax.value);
    }
}

function updateYearDisplay() {
    const yearMin = document.getElementById('yearMin');
    const yearMax = document.getElementById('yearMax');
    const yearMinValue = document.getElementById('year-min');
    const yearMaxValue = document.getElementById('year-max');

    if (yearMin && yearMax && yearMinValue && yearMaxValue) {
        yearMinValue.textContent = yearMin.value;
        yearMaxValue.textContent = yearMax.value;
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
}

// 2. Настройка событий фильтров
function setupFilterEvents() {
    const filterForm = document.getElementById('filterForm');
    const filterSelects = document.querySelectorAll('.index-filter-select');
    const mileageInput = document.getElementById('filterMileage');
    const resetBtn = document.querySelector('.filter-reset-btn');

    // События для слайдеров
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const yearMin = document.getElementById('yearMin');
    const yearMax = document.getElementById('yearMax');

    if (priceMin && priceMax) {
        [priceMin, priceMax].forEach(slider => {
            slider.addEventListener('input', function() {
                updatePriceDisplay();
                applyFilters();
            });
        });
    }

    if (yearMin && yearMax) {
        [yearMin, yearMax].forEach(slider => {
            slider.addEventListener('input', function() {
                updateYearDisplay();
                applyFilters();
            });
        });
    }

    // События для выпадающих списков
    filterSelects.forEach(select => {
        select.addEventListener('change', applyFilters);
    });

    // Событие для поля пробега
    if (mileageInput) {
        mileageInput.addEventListener('input', applyFilters);
    }

    // Событие для кнопки сброса
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            setTimeout(() => {
                updatePriceDisplay();
                updateYearDisplay();
                applyFilters();
            }, 10);
        });
    }

    // Обработчик события reset формы
    if (filterForm) {
        filterForm.addEventListener('reset', function() {
            setTimeout(() => {
                updatePriceDisplay();
                updateYearDisplay();
                applyFilters();
            }, 10);
        });
    }

    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            applyFilters();
        });
    }
}

// 3. Основная функция применения фильтров
function applyFilters() {
    const cars = document.querySelectorAll('.index-car-card');
    const filters = getCurrentFilters();
    
    let visibleCount = 0;

    cars.forEach(car => {
        const carData = extractCarData(car);
        const isVisible = checkCarAgainstFilters(carData, filters);
        
        if (isVisible) {
            car.style.display = 'block';
            visibleCount++;
        } else {
            car.style.display = 'none';
        }
    });

    updateResultsCounter(visibleCount);
}

// 4. Получение текущих значений фильтров
function getCurrentFilters() {
    return {
        transmission: document.getElementById('filterTransmission').value,
        color: document.getElementById('filterColor').value,
        bodyType: document.getElementById('filterBodyType').value,
        fuelType: document.getElementById('filterFuelType').value,
        priceMin: parseInt(document.getElementById('priceMin').value),
        priceMax: parseInt(document.getElementById('priceMax').value),
        yearMin: parseInt(document.getElementById('yearMin').value),
        yearMax: parseInt(document.getElementById('yearMax').value),
        maxMileage: document.getElementById('filterMileage').value ? 
                    parseInt(document.getElementById('filterMileage').value) : null
    };
}

// 5. Извлечение данных из карточки автомобиля
function extractCarData(carElement) {
    // Цена
    const priceText = carElement.querySelector('.index-car-card-price').textContent;
    const price = parseInt(priceText.replace(/\D/g, ''));

    // Год (из заголовка)
    const title = carElement.querySelector('.index-car-card-title').textContent;
    const yearMatch = title.match(/, (\d{4})$/);
    const year = yearMatch ? parseInt(yearMatch[1]) : 2020;

    // Пробег
    const mileageText = carElement.querySelector('.index-car-card-mileage').textContent;
    const mileage = parseInt(mileageText.replace(/\D/g, ''));

    // Двигатель и топливо
    const engineText = carElement.querySelector('.index-car-card-engine').textContent;
    
    // Определяем тип топлива
    let fuelType = 'petrol';
    if (engineText.includes('Дизель')) fuelType = 'diesel';
    if (engineText.includes('Электро')) fuelType = 'electric';
    if (engineText.includes('Гибрид')) fuelType = 'hybrid';

    // Коробка передач
    const transmissionText = carElement.querySelector('.index-car-card-transmission').textContent.toLowerCase();
    let transmission = 'automatic';
    if (transmissionText.includes('механическая')) transmission = 'manual';
    if (transmissionText.includes('робот')) transmission = 'robot';

    // Тип кузова
    const bodyTypeText = carElement.querySelector('.index-car-card-body-type').textContent.toLowerCase();
    let bodyType = 'sedan';
    if (bodyTypeText.includes('хэтчбек')) bodyType = 'hatchback';
    if (bodyTypeText.includes('внедорожник')) bodyType = 'suv';
    if (bodyTypeText.includes('купе')) bodyType = 'coupe';
    if (bodyTypeText.includes('минивэн')) bodyType = 'minivan';

    // Цвет
    const colorText = carElement.querySelector('.index-car-card-color').textContent.toLowerCase();
    let color = 'black';
    if (colorText.includes('белый')) color = 'white';
    if (colorText.includes('серый')) color = 'silver';
    if (colorText.includes('красный')) color = 'red';
    if (colorText.includes('синий')) color = 'blue';

    return {
        price,
        year,
        mileage,
        transmission,
        bodyType,
        color,
        fuelType
    };
}

// 6. Проверка автомобиля по фильтрам
function checkCarAgainstFilters(car, filters) {
    if (filters.transmission && car.transmission !== filters.transmission) {
        return false;
    }
    if (filters.color && car.color !== filters.color) {
        return false;
    }
    if (filters.bodyType && car.bodyType !== filters.bodyType) {
        return false;
    }
    if (filters.fuelType && car.fuelType !== filters.fuelType) {
        return false;
    }
    if (car.price < filters.priceMin || car.price > filters.priceMax) {
        return false;
    }
    if (car.year < filters.yearMin || car.year > filters.yearMax) {
        return false;
    }
    if (filters.maxMileage && car.mileage > filters.maxMileage) {
        return false;
    }

    return true;
}

// 7. Обновление счетчика результатов
function updateResultsCounter(count) {
    let counter = document.querySelector('.results-counter');
    const title = document.querySelector('.index-cars-title');
    
    if (!counter && title) {
        counter = document.createElement('span');
        counter.className = 'results-counter';
        title.appendChild(counter);
    }
    
    if (counter) {
        counter.textContent = ` (найдено: ${count})`;
        counter.style.color = '#666';
        counter.style.fontSize = '18px';
        counter.style.marginLeft = '10px';
    }
}

// 8. данные-атрибуты для упрощения фильтрации
function enhanceCarCards() {
    const cars = document.querySelectorAll('.index-car-card');
    
    cars.forEach((car, index) => {
        const carData = extractCarData(car);
        
        car.dataset.transmission = carData.transmission;
        car.dataset.bodyType = carData.bodyType;
        car.dataset.color = carData.color;
        car.dataset.fuelType = carData.fuelType;
        car.dataset.price = carData.price;
        car.dataset.year = carData.year;
        car.dataset.mileage = carData.mileage;
    });
}

setTimeout(enhanceCarCards, 100);
