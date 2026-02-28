// js/navigation.js
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
});

function updateNavigation() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;

    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;
    
    // Получаем данные пользователя из localStorage
    let isAdmin = false;
    if (isAuthenticated) {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                isAdmin = user.role === 'admin';
            }
        } catch (e) {
            console.error('Ошибка парсинга данных пользователя:', e);
        }
    }
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (isAuthenticated) {
        // Для авторизованных пользователей
        let navHtml = `
            <a href="index.html" class="header-nav-link ${currentPage === 'index.html' ? 'active' : ''}">Главное Меню</a>
            <a href="news.html" class="header-nav-link ${currentPage === 'news.html' ? 'active' : ''}">Новости</a>
        `;
        
        // Если админ - добавляем ссылку на добавление автомобиля
        if (isAdmin) {
            navHtml += `
                <a href="addCar.html" class="header-nav-link ${currentPage === 'addCar.html' ? 'active' : ''}">➕ Добавить авто</a>
            `;
        }
        
        // Добавляем ссылку на профиль (доступна всем авторизованным)
        navHtml += `
            <a href="profile.html" class="header-nav-link ${currentPage === 'profile.html' ? 'active' : ''}">Профиль</a>
        `;
        
        navLinks.innerHTML = navHtml;
        
    } else {
        // Для неавторизованных пользователей
        navLinks.innerHTML = `
            <a href="index.html" class="header-nav-link ${currentPage === 'index.html' ? 'active' : ''}">Главное Меню</a>
            <a href="news.html" class="header-nav-link ${currentPage === 'news.html' ? 'active' : ''}">Новости</a>
            <a href="authPhone.html" class="header-nav-link ${currentPage === 'authPhone.html' || currentPage === 'authEmail.html' || currentPage === 'register.html' ? 'active' : ''}">Войти</a>
        `;
    }
}

// Слушаем изменения в localStorage
window.addEventListener('storage', (e) => {
    if (e.key === 'token' || e.key === 'user') {
        updateNavigation();
    }
});

// Делаем функцию глобальной для вызова из консоли или других скриптов
window.updateNavigation = updateNavigation;
window.isAuthenticated = function() {
    return !!localStorage.getItem('token');
};

// Функция для проверки, является ли пользователь админом
window.isAdmin = function() {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return false;
        const user = JSON.parse(userStr);
        return user.role === 'admin';
    } catch (e) {
        return false;
    }
};

window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavigation();
    window.location.href = 'index.html';
};
