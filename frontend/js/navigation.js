// js/navigation.js
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
});

function updateNavigation() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;

    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (isAuthenticated) {
        navLinks.innerHTML = `
            <a href="index.html" class="header-nav-link ${currentPage === 'index.html' ? 'active' : ''}">Главное Меню</a>
            <a href="news.html" class="header-nav-link ${currentPage === 'news.html' ? 'active' : ''}">Новости</a>
            <a href="profile.html" class="header-nav-link ${currentPage === 'profile.html' ? 'active' : ''}">Профиль</a>
        `;
    } else {
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
window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavigation();
    window.location.href = 'index.html';
};
