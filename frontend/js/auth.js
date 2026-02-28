const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    initLoginForms();
    setupPhoneMask();
});

// ------------------------
// Инициализация форм входа
// ------------------------

function initLoginForms() {
    // Определяем, на какой странице мы находимся
    const isPhonePage = window.location.pathname.includes('authPhone.html');
    const isEmailPage = window.location.pathname.includes('authEmail.html');
    
    if (isPhonePage) {
        initPhoneLoginForm();
    } else if (isEmailPage) {
        initEmailLoginForm();
    }
}

// Форма входа по телефону
function initPhoneLoginForm() {
    const form = document.querySelector('.auth-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const phoneInput = form.querySelector('input[type="tel"]');
        const passwordInput = form.querySelector('input[type="password"]');

        const phone = phoneInput.value.trim();
        const password = passwordInput.value;

        // Валидация
        const errors = [];
        
        const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
        if (!phoneRegex.test(phone)) {
            errors.push('Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX');
        }

        if (password.length < 8) {
            errors.push('Пароль должен быть минимум 8 символов');
        }

        if (errors.length > 0) {
            showErrors(errors);
            return;
        }

        // Отправка запроса
        await loginUser(phone, password);
    });
}

// Форма входа по email
function initEmailLoginForm() {
    const form = document.querySelector('.auth-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const emailInput = form.querySelector('input[type="email"]');
        const passwordInput = form.querySelector('input[type="password"]');

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Валидация
        const errors = [];
        
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(email)) {
            errors.push('Введите корректный email');
        }

        if (password.length < 8) {
            errors.push('Пароль должен быть минимум 8 символов');
        }

        if (errors.length > 0) {
            showErrors(errors);
            return;
        }

        // Отправка запроса
        await loginUser(email, password);
    });
}

// ------------------------
// Общая функция входа
// ------------------------

async function loginUser(login, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password }) // Отправляем как login (универсально)
        });

        const data = await response.json();

        if (!response.ok) {
            showErrors([data.error || 'Ошибка входа']);
            return;
        }

        // Успешный вход
        console.log('Успешный вход:', data);
        
        // Сохраняем токен и данные пользователя
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        window.dispatchEvent(new Event('storage'));
        
        // Показываем сообщение об успехе
        showSuccess('Вход выполнен успешно!');
        
        // Перенаправляем на главную или в профиль
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        console.error('Ошибка входа:', error);
        showErrors(['Ошибка соединения с сервером']);
    }
}

// ------------------------
// Маска для телефона
// ------------------------

function setupPhoneMask() {
    const phoneInput = document.querySelector('input[type="tel"]');
    if (!phoneInput) return;

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
        } else {
            e.target.value = '';
        }
    });
}

// ------------------------
// Отображение ошибок и успеха
// ------------------------

function showErrors(errors) {
    const container = document.querySelector('.auth-error-messages');
    if (!container) return;
    
    container.innerHTML = '';
    container.style.display = 'block';

    errors.forEach(err => {
        const div = document.createElement('div');
        div.className = 'auth-error-message';
        div.textContent = err;
        container.appendChild(div);
    });
}

function showSuccess(message) {
    const container = document.querySelector('.auth-error-messages'); // Переиспользуем контейнер
    if (!container) return;
    
    container.innerHTML = '';
    container.style.display = 'block';
    container.style.background = '#d4edda';
    container.style.border = '1px solid #c3e6cb';
    container.style.borderRadius = '8px';

    const div = document.createElement('div');
    div.className = 'auth-success-message';
    div.textContent = message;
    div.style.color = '#155724';
    div.style.padding = '12px';
    container.appendChild(div);
}

function clearErrors() {
    const container = document.querySelector('.auth-error-messages');
    if (container) {
        container.innerHTML = '';
        container.style.display = 'none';
        container.style.background = ''; // Сбрасываем фон
    }
}
