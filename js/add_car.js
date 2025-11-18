document.addEventListener("DOMContentLoaded", () => {
    setupPhotoPreviewSimple();
    const form = document.getElementById("addCarForm");

    function setError(el, msg) {
        const errorField = el.closest(".form-group").querySelector(".error-msg");
        el.classList.add("input-error");
        errorField.textContent = msg;
    }

    function clearError(el) {
        const group = el.closest(".form-group");
        const errorField = group.querySelector(".error-msg");
        el.classList.remove("input-error");
        errorField.textContent = "";
    }

    function validateEngine() {
        const engineVolume = document.getElementById("engineVolume");
        const enginePower = document.getElementById("enginePower");
        const fuelType = document.getElementById("fuelType");
        const engineErrors = document.getElementById("engineErrors");
        
        let errors = [];
        
        engineVolume.classList.remove('error');
        enginePower.classList.remove('error');
        fuelType.classList.remove('error');
        engineErrors.innerHTML = '';

        // Проверка объема двигателя
        if (!/^\d+(\.\d)?$/.test(engineVolume.value)) {
            errors.push("Введите объём двигателя (например, 1.6)");
            engineVolume.classList.add('error');
        }

        // Проверка мощности
        if (!enginePower.value || parseInt(enginePower.value) < 30) {
            errors.push("Мощность должна быть не менее 30 л.с.");
            enginePower.classList.add('error');
        }

        // Проверка типа топлива
        if (fuelType.value === "") {
            errors.push("Выберите тип топлива");
            fuelType.classList.add('error');
        }

        if (errors.length > 0) {
            errors.forEach(error => {
                const errorElement = document.createElement('div');
                errorElement.className = 'engine-error';
                errorElement.textContent = error;
                engineErrors.appendChild(errorElement);
            });
            return false;
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

    function validatePhotos() {
        const photosInput = document.getElementById("carPhotos");
        const photosError = document.getElementById("photosError");
        const files = photosInput.files;
        
        photosInput.classList.remove('error');
        photosError.style.display = 'none';
        
        if (files.length === 0) {
            return true;
        }
        
        if (files.length > 5) {
            photosInput.classList.add('error');
            photosError.textContent = "Можно загрузить не более 5 фотографий";
            photosError.style.display = 'block';
            return false;
        }
        
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (!allowedTypes.includes(file.type)) {
                photosInput.classList.add('error');
                photosError.textContent = `Файл "${file.name}" не является изображением (разрешены JPG, PNG)`;
                photosError.style.display = 'block';
                return false;
            }
            
            if (file.size > maxSize) {
                photosInput.classList.add('error');
                photosError.textContent = `Файл "${file.name}" слишком большой (максимум 5MB)`;
                photosError.style.display = 'block';
                return false;
            }
            
            // Проверка на вирусы (базовая - по расширению)
            const fileName = file.name.toLowerCase();
            if (!fileName.match(/\.(jpg|jpeg|png)$/)) {
                photosInput.classList.add('error');
                photosError.textContent = `Недопустимое расширение файла "${file.name}"`;
                photosError.style.display = 'block';
                return false;
            }
        }
        
        return true;
    }

    // Функция для предпросмотра фотографий
    function setupPhotoPreviewSimple() {
        const photosInput = document.getElementById("carPhotos");
        
        photosInput.addEventListener('change', function() {
            renderPhotoPreviews(this.files);
        });
    }

    function renderPhotoPreviews(files) {
        const photosPreview = document.getElementById("photosPreview");
        photosPreview.innerHTML = '';
        
        updatePhotoCounter(files.length);
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const preview = document.createElement('div');
                    preview.className = 'photo-preview';
                    
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = 'Preview';
                    
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'photo-preview-remove';
                    removeBtn.innerHTML = '×';
                    removeBtn.title = 'Удалить';
                    
                    removeBtn.addEventListener('click', function() {
                        const photosInput = document.getElementById("carPhotos");
                        const currentFiles = photosInput.files;
                        
                        const dt = new DataTransfer();
                        let fileRemoved = false;
                        
                        for (let j = 0; j < currentFiles.length; j++) {
                            const currentFile = currentFiles[j];
                            if (fileRemoved || 
                            (currentFile.name !== file.name || currentFile.size !== file.size)) {
                                dt.items.add(currentFile);
                            } else {
                                fileRemoved = true;
                            }
                        }
                        photosInput.files = dt.files;
                        // Полностью перерисовываем все превью
                        renderPhotoPreviews(dt.files);
                    });
                    
                    preview.appendChild(img);
                    preview.appendChild(removeBtn);
                    photosPreview.appendChild(preview);
                };
                
                reader.readAsDataURL(file);
            }
        }
    }

    function updatePhotoCounter(fileCount) {
        const photosPreview = document.getElementById("photosPreview");
        let counter = photosPreview.querySelector('.photo-counter');
        
        if (fileCount > 0) {
            if (!counter) {
                counter = document.createElement('div');
                counter.className = 'photo-counter';
                photosPreview.prepend(counter);
            }
            counter.textContent = `Выбрано файлов: ${fileCount}/5`;
        } else if (counter) {
            counter.remove();
        }
    }

    function validate() {
        let valid = true;

        // Марка и модель: только буквы, пробелы, цифры, длина ≥ 3
        const carModel = document.getElementById("carModel");
        const modelVal = carModel.value.trim();
        if (!/^[А-Яа-яA-Za-z0-9\s\-]{3,}$/.test(modelVal)) {
            setError(carModel, "Введите корректную марку и модель (не менее 3 символов).");
            valid = false;
        } else clearError(carModel);

        // Год выпуска: диапазон 1960–2025
        const carYear = document.getElementById("carYear");
        const year = Number(carYear.value);
        if (year < 1960 || year > 2025) {
            setError(carYear, "Год должен быть в диапазоне 1960–2025.");
            valid = false;
        } else clearError(carYear);

        // Цена: только числа, больше 10 000
        const carPrice = document.getElementById("carPrice");
        if (carPrice.value < 10000) {
            setError(carPrice, "Цена должна быть больше 10 000 рублей.");
            valid = false;
        } else clearError(carPrice);

        // Пробег: только положительное число
        const mileage = document.getElementById("carMileage");
        if (mileage.value <= 0) {
            setError(mileage, "Пробег должен быть положительным числом.");
            valid = false;
        } else clearError(mileage);

        // Кузов
        const bodyType = document.getElementById("bodyType");
        if (bodyType.value === "") {
            setError(bodyType, "Выберите тип кузова.");
            valid = false;
        } else clearError(bodyType);

        // Коробка
        const transmission = document.getElementById("transmission");
        if (transmission.value === "") {
            setError(transmission, "Выберите тип коробки передач.");
            valid = false;
        } else clearError(transmission);

        if (!validateEngine()) {
            valid = false;
        }

        // Цвет: только буквы, минимум 3 символа
        const color = document.getElementById("color");
        if (!/^[А-Яа-яA-Za-z\-]{3,}$/.test(color.value)) {
            setError(color, "Введите корректный цвет (минимум 3 буквы).");
            valid = false;
        } else clearError(color);

        if (!validateDescription()) {
            valid = false;
        }
        if (!validatePhotos()) {
            valid = false;
        }
        return valid;
    }

    function scrollToFirstError() {
    const firstErrorField = document.querySelector('.input-error, .error, .form-select.error');
    
    if (firstErrorField) {
        const yOffset = -100; // Отступ в пикселях от верха
        const y = firstErrorField.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({
            top: y,
            behavior: 'smooth'
        });
        firstErrorField.focus();
    }
}

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        var is_valid = validate()
        console.log(is_valid)
        if (validate()) {
            alert("Автомобиль успешно добавлен!");
        } else {
            scrollToFirstError();
        }
    });
    document.getElementById('carPhotos').addEventListener('change', validatePhotos);
    document.getElementById('carDescription').addEventListener('input', validateDescription);
});
