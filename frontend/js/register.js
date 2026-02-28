const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    initRegisterForm();
    setupPasswordStrength();
});

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

    if (username.length < 2)
        errors.push("Имя пользователя должно содержать минимум 2 символа");

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email))
        errors.push("Введите корректный email");

    const phoneRegex = /^\+?[0-9\s\-\(\)]+$/;
    if (!phoneRegex.test(phone))
        errors.push("Введите корректный номер телефона");

    if (password.length < 8)
        errors.push("Пароль должен быть минимум 8 символов");

    if (!/\d/.test(password))
        errors.push("Пароль должен содержать хотя бы одну цифру");

    if (!/[!@#$%^&*]/.test(password))
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
            bar.style.background = "red";
            text.textContent = "Слабый пароль";
        } else if (strength === 2 || strength === 3) {
            bar.style.background = "orange";
            text.textContent = "Средний пароль";
        } else {
            bar.style.background = "green";
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

        const payload = {
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            password: document.getElementById('password').value
        };

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                showErrors([data.message || "Ошибка регистрации"]);
                return;
            }

            alert("Регистрация успешна!");
            window.location.href = "authPhone.html";

        } catch (err) {
            showErrors(["Ошибка соединения с сервером"]);
            console.error(err);
        }
    });
}
