document.addEventListener("DOMContentLoaded", () => {
    setupFavoriteButtons();
});

// Кнопки избранного
function setupFavoriteButtons() {
    const favoriteBtns = document.querySelectorAll('.index-car-card-favorite-btn');
    
    favoriteBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            toggleFavorite(this);
        });
    });
}

function toggleFavorite(btn) {
    const isFavorite = btn.textContent === '❤️';
    
    if (isFavorite) {
        btn.textContent = '🤍';
        btn.style.transform = 'scale(0.8)';
        showNotification('Убрано из избранного', 'info');
    } else {
        btn.textContent = '❤️';
        btn.style.animation = 'heartBeat 0.6s ease';
        showNotification('Добавлено в избранное', 'success');
        saveToFavorites(btn);
    }
    
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
        btn.style.animation = '';
    }, 600);
}

function saveToFavorites(btn) {
    const carCard = btn.closest('.index-car-card');
    const carTitle = carCard.querySelector('.index-car-card-title').textContent;
    const carPrice = carCard.querySelector('.index-car-card-price').textContent;
    
    const favorites = JSON.parse(localStorage.getItem('carFavorites') || '[]');
    favorites.push({
        title: carTitle,
        price: carPrice,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('carFavorites', JSON.stringify(favorites));
}

function showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
