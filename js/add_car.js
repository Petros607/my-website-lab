document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addCarForm");

    function setError(el, msg) {
        const group = el.closest(".form-group");
        const errorField = group.querySelector(".error-msg");
        el.classList.add("input-error");
        errorField.textContent = msg;
    }

    function clearError(el) {
        const group = el.closest(".form-group");
        const errorField = group.querySelector(".error-msg");
        el.classList.remove("input-error");
        errorField.textContent = "";
    }

    function validate() {
        let valid = true;

        // 1. Марка и модель: только буквы, пробелы, цифры, длина ≥ 3
        const carModel = document.getElementById("carModel");
        const modelVal = carModel.value.trim();
        if (!/^[А-Яа-яA-Za-z0-9\s\-]{3,}$/.test(modelVal)) {
            setError(carModel, "Введите корректную марку и модель (не менее 3 символов).");
            valid = false;
        } else clearError(carModel);

        // 2. Год выпуска: диапазон 1990–2025
        const carYear = document.getElementById("carYear");
        const year = Number(carYear.value);
        if (year < 1990 || year > 2025) {
            setError(carYear, "Год должен быть в диапазоне 1990–2025.");
            valid = false;
        } else clearError(carYear);

        // 3. Цена: только числа, больше 10 000
        const carPrice = document.getElementById("carPrice");
        if (carPrice.value < 10000) {
            setError(carPrice, "Цена должна быть больше 10 000 рублей.");
            valid = false;
        } else clearError(carPrice);

        // 4. Пробег: только положительное число
        const mileage = document.getElementById("carMileage");
        if (mileage.value <= 0) {
            setError(mileage, "Пробег должен быть положительным числом.");
            valid = false;
        } else clearError(mileage);

        // 5. Объём двигателя: формат 1.2 / 2.0 / 0.9
        const engineVolume = document.getElementById("engineVolume");
        if (!/^\d(\.\d)?$/.test(engineVolume.value)) {
            setError(engineVolume, "Введите объём двигателя (например, 1.6).");
            valid = false;
        } else clearError(engineVolume);

        // 6. Мощность: только число, минимум 30
        const enginePower = document.getElementById("enginePower");
        if (enginePower.value < 30) {
            setError(enginePower, "Мощность должна быть не менее 30 л.с.");
            valid = false;
        } else clearError(enginePower);

        // 7. Тип топлива: выбран
        const fuelType = document.getElementById("fuelType");
        if (fuelType.value === "") {
            setError(fuelType, "Выберите тип топлива.");
            valid = false;
        } else clearError(fuelType);

        // 8. Кузов
        const bodyType = document.getElementById("bodyType");
        if (bodyType.value === "") {
            setError(bodyType, "Выберите тип кузова.");
            valid = false;
        } else clearError(bodyType);

        // 9. Коробка
        const transmission = document.getElementById("transmission");
        if (transmission.value === "") {
            setError(transmission, "Выберите тип коробки передач.");
            valid = false;
        } else clearError(transmission);

        // 10. Цвет – только буквы, минимум 3 символа
        const color = document.getElementById("color");
        if (!/^[А-Яа-яA-Za-z]{3,}$/.test(color.value)) {
            setError(color, "Введите корректный цвет (минимум 3 буквы).");
            valid = false;
        } else clearError(color);

        return valid;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (validate()) {
            alert("Автомобиль успешно добавлен!");
        }
    });
});
