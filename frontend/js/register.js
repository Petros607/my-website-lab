const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    initRegisterForm();
    setupPasswordStrength();
    setupUniqueCheck();
    setupPhoneMask();
});

// Таймеры для debounce
let usernameTimeout;
let emailTimeout;
let phoneTimeout;

// ------------------------
// Проверка уникальности
// ------------------------

function setupUniqueCheck() {
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    // Добавляем индикаторы для каждого поля
    addAvailabilityIndicator(usernameInput, 'username');
    addAvailabilityIndicator(emailInput, 'email');
    addAvailabilityIndicator(phoneInput, 'phone');

    // Проверка username с debounce
    usernameInput.addEventListener('input', () => {
        clearTimeout(usernameTimeout);
        const value = usernameInput.value.trim();
        
        if (value.length < 2) {
            updateFieldStatus('username', 'Слишком короткий', false);
            return;
        }

        usernameTimeout = setTimeout(() => {
            checkAvailability('username', value);
        }, 500);
    });

    // Проверка email с debounce
    emailInput.addEventListener('input', () => {
        clearTimeout(emailTimeout);
        const value = emailInput.value.trim();
        
        if (value.length === 0) {
            updateFieldStatus('email', '', null);
            return;
        }

        emailTimeout = setTimeout(() => {
            checkAvailability('email', value);
        }, 500);
    });

    // Проверка телефона с debounce
    phoneInput.addEventListener('input', () => {
        clearTimeout(phoneTimeout);
        const value = phoneInput.value.trim();
        
        if (value.length < 5) {
            updateFieldStatus('phone', 'Введите номер', false);
            return;
        }

        phoneTimeout = setTimeout(() => {
            checkAvailability('phone', value);
        }, 500);
    });
}

function addAvailabilityIndicator(input, fieldName) {
    const container = input.parentElement;
    container.style.position = 'relative';

    const indicator = document.createElement('div');
    indicator.className = `availability-indicator ${fieldName}-indicator`;
    indicator.style.cssText = `
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transition: all 0.3s;
    `;
    container.appendChild(indicator);

    const message = document.createElement('div');
    message.className = `availability-message ${fieldName}-message`;
    message.style.cssText = `
        font-size: 12px;
        margin-top: 5px;
        padding-left: 10px;
        transition: all 0.3s;
    `;
    container.appendChild(message);
}

async function checkAvailability(type, value) {
    const indicator = document.querySelector(`.${type}-indicator`);
    const message = document.querySelector(`.${type}-message`);

    indicator.innerHTML = '⏳';
    indicator.style.background = '#f0f0f0';
    message.textContent = 'Проверка...';
    message.style.color = '#666';

    try {
        const response = await fetch(`${API_URL}/auth/check-${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [type]: value })
        });

        const data = await response.json();

        if (!response.ok) {
            updateFieldStatus(type, data.message || 'Ошибка валидации', false, indicator, message);
            return;
        }

        if (data.available === true) {
            updateFieldStatus(type, data.message, true, indicator, message);
        } else {
            updateFieldStatus(type, data.message, false, indicator, message);
        }

    } catch (error) {
        console.error('Ошибка проверки:', error);
        updateFieldStatus(type, 'Ошибка проверки', false, indicator, message);
    }
}

function updateFieldStatus(type, message, isAvailable, indicator, messageEl) {
    // Если элементы не переданы, находим их
    const ind = indicator || document.querySelector(`.${type}-indicator`);
    const msg = messageEl || document.querySelector(`.${type}-message`);

    if (!ind || !msg) return;

    if (isAvailable === null) {
        // Сброс состояния
        ind.innerHTML = '';
        ind.style.background = 'transparent';
        msg.textContent = '';
        return;
    }

    if (isAvailable) {
        ind.innerHTML = '✓';
        ind.style.background = '#4caf50';
        ind.style.color = 'white';
        msg.textContent = message || 'Доступно';
        msg.style.color = '#4caf50';
    } else {
        ind.innerHTML = '✗';
        ind.style.background = '#f44336';
        ind.style.color = 'white';
        msg.textContent = message || 'Недоступно';
        msg.style.color = '#f44336';
    }
}

// ------------------------
// Маска для телефона
// ------------------------

function setupPhoneMask() {
    const phoneInput = document.getElementById('phone');
    
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value[0] === '7' || value[0] === '8') {
                value = value.substring(1);
            }
            
            let formattedValue = '+7';
            
            if (value.length > 0) {
                formattedValue += ' (' + value.substring(0, 3);
            }
            if (value.length >= 4) {
                formattedValue += ') ' + value.substring(3, 6);
            }
            if (value.length >= 7) {
                formattedValue += '-' + value.substring(6, 8);
            }
            if (value.length >= 9) {
                formattedValue += '-' + value.substring(8, 10);
            }
            
            e.target.value = formattedValue;
        }
    });
}

// ------------------------
// Валидация
// ------------------------

function showErrors(errors) {
    const container = document.getElementById('formErrors');
    container.innerHTML = '';
    container.style.display = 'block';

    errors.forEach(err => {
        const div = document.createElement('div');
        div.className = 'auth-error-message';
        div.textContent = err;
        container.appendChild(div);
    });
}

function clearErrors() {
    const container = document.getElementById('formErrors');
    container.innerHTML = '';
    container.style.display = 'none';
}

function validateForm() {
    let errors = [];

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Проверка заполненности
    if (username.length < 2)
        errors.push("Имя пользователя должно содержать минимум 2 символа");

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email))
        errors.push("Введите корректный email");

    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    if (!phoneRegex.test(phone))
        errors.push("Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX");

    if (password.length < 8)
        errors.push("Пароль должен быть минимум 8 символов");

    if (!/\d/.test(password))
        errors.push("Пароль должен содержать хотя бы одну цифру");

    if (!/[!@#$%^&*-]/.test(password))
        errors.push("Пароль должен содержать специальный символ");

    if (password !== confirmPassword)
        errors.push("Пароли не совпадают");

    return errors;
}

// ------------------------
// Сила пароля
// ------------------------

function setupPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const bar = document.querySelector('.password-strength-bar');
    const text = document.querySelector('.password-strength-text');

    passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        let strength = 0;

        if (val.length >= 8) strength++;
        if (/\d/.test(val)) strength++;
        if (/[!@#$%^&*-]/.test(val)) strength++;
        if (/[A-Z]/.test(val)) strength++;

        bar.style.width = (strength * 25) + "%";

        if (strength <= 1) {
            bar.style.background = "#f44336";
            text.textContent = "Слабый пароль";
        } else if (strength === 2 || strength === 3) {
            bar.style.background = "#ff9800";
            text.textContent = "Средний пароль";
        } else {
            bar.style.background = "#4caf50";
            text.textContent = "Сильный пароль";
        }
    });
}

// ------------------------
// Отправка
// ------------------------

function initRegisterForm() {
    const form = document.getElementById('registerForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const errors = validateForm();
        if (errors.length > 0) {
            showErrors(errors);
            return;
        }

        // Дополнительная проверка уникальности перед отправкой
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        try {
            // Проверяем username
            const usernameCheck = await fetch(`${API_URL}/auth/check-username`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const usernameData = await usernameCheck.json();
            
            if (!usernameData.available) {
                showErrors([`Логин "${username}" уже занят`]);
                return;
            }

            // Проверяем email
            const emailCheck = await fetch(`${API_URL}/auth/check-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const emailData = await emailCheck.json();
            
            if (!emailData.available) {
                showErrors([`Email "${email}" уже используется`]);
                return;
            }

            // Проверяем телефон
            const phoneCheck = await fetch(`${API_URL}/auth/check-phone`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const phoneData = await phoneCheck.json();
            
            if (!phoneData.available) {
                showErrors([`Телефон "${phone}" уже используется`]);
                return;
            }

            // Если все проверки пройдены, отправляем форму
            const payload = {
                username,
                email,
                phone,
                password: document.getElementById('password').value
            };

            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                showErrors([data.error || data.message || "Ошибка регистрации"]);
                return;
            }

            alert("Регистрация успешна!");
            window.location.href = "authEmail.html";

        } catch (err) {
            showErrors(["Ошибка соединения с сервером"]);
            console.error(err);
        }
    });
}
