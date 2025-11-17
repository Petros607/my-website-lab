document.addEventListener("DOMContentLoaded", function() {
    initializeCarDetail();
});

function initializeCarDetail() {
    setupPhotoGallery();
    setupFavoriteButton();
    setupContactModal();
    setupSmoothAnimations();
}

// 1. Галерея фотографий
function setupPhotoGallery() {
    const mainPhoto = document.querySelector('.car-detail-main-photo');
    const thumbnails = document.querySelectorAll('.car-detail-thumbnail');
    const mainPhotoWrapper = document.querySelector('.car-detail-main-photo-wrapper');

    if (!mainPhoto || thumbnails.length === 0) return;

    // Добавляем эффект увеличения при клике на главное фото
    mainPhotoWrapper.addEventListener('click', function() {
        openFullscreenGallery(mainPhoto.src);
    });

    // Обработчики для миниатюр
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            switchMainPhoto(this, mainPhoto, thumbnails);
        });

        // Эффект при наведении на миниатюру
        thumbnail.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.2s ease';
        });

        thumbnail.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Добавляем клавиатурную навигацию
    document.addEventListener('keydown', function(e) {
        handleKeyboardNavigation(e, thumbnails, mainPhoto);
    });
}

function switchMainPhoto(clickedThumbnail, mainPhoto, allThumbnails) {
    // Сохраняем текущее состояние для анимации
    const oldSrc = mainPhoto.src;
    const newSrc = clickedThumbnail.src;

    // Если фото уже активно, ничего не делаем
    if (oldSrc === newSrc) return;

    // Анимация исчезновения текущего фото
    mainPhoto.style.opacity = '0';
    mainPhoto.style.transform = 'scale(0.8)';

    setTimeout(() => {
        // Меняем источник фото
        mainPhoto.src = newSrc;
        mainPhoto.alt = clickedThumbnail.alt;

        // Анимация появления нового фото
        mainPhoto.style.opacity = '1';
        mainPhoto.style.transform = 'scale(1)';
        mainPhoto.style.transition = 'all 0.3s ease';

        // Обновляем активную миниатюру
        allThumbnails.forEach(thumb => {
            thumb.classList.remove('car-detail-thumbnail-active');
        });
        clickedThumbnail.classList.add('car-detail-thumbnail-active');

        // Добавляем эффект пульсации для активной миниатюры
        addPulseEffect(clickedThumbnail);
    }, 150);
}

function addPulseEffect(element) {
    element.style.animation = 'thumbnailPulse 0.6s ease';
    setTimeout(() => {
        element.style.animation = '';
    }, 600);
}

function handleKeyboardNavigation(e, thumbnails, mainPhoto) {
    const activeThumbnail = document.querySelector('.car-detail-thumbnail-active');
    if (!activeThumbnail) return;

    const currentIndex = Array.from(thumbnails).indexOf(activeThumbnail);

    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
            switchMainPhoto(thumbnails[prevIndex], mainPhoto, thumbnails);
            break;
        case 'ArrowRight':
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % thumbnails.length;
            switchMainPhoto(thumbnails[nextIndex], mainPhoto, thumbnails);
            break;
        case 'Home':
            e.preventDefault();
            switchMainPhoto(thumbnails[0], mainPhoto, thumbnails);
            break;
        case 'End':
            e.preventDefault();
            switchMainPhoto(thumbnails[thumbnails.length - 1], mainPhoto, thumbnails);
            break;
    }
}

// 2. Кнопка избранного
function setupFavoriteButton() {
    const favoriteBtn = document.querySelector('.car-detail-favorite-btn');
    const notification = document.querySelector('.car-detail-notification');

    if (!favoriteBtn) return;

    // Загружаем состояние избранного из localStorage
    const carId = window.location.pathname; // или другой идентификатор автомобиля
    const favorites = JSON.parse(localStorage.getItem('carFavorites') || '{}');
    
    if (favorites[carId]) {
        favoriteBtn.textContent = '♥';
        favoriteBtn.classList.add('favorite-active');
    }

    favoriteBtn.addEventListener('click', function() {
        toggleFavorite(this, carId, notification);
    });
}

function toggleFavorite(button, carId, notification) {
    const favorites = JSON.parse(localStorage.getItem('carFavorites') || '{}');
    const isCurrentlyFavorite = favorites[carId];

    if (isCurrentlyFavorite) {
        // Удаляем из избранного
        delete favorites[carId];
        button.textContent = '♡';
        button.classList.remove('favorite-active');
        showNotification(notification, 'Автомобиль удален из избранного', 'info');
    } else {
        // Добавляем в избранное
        favorites[carId] = {
            title: document.querySelector('.car-detail-title').textContent,
            price: document.querySelector('.car-detail-spec strong').nextSibling.textContent.trim(),
            date: new Date().toISOString()
        };
        button.textContent = '♥';
        button.classList.add('favorite-active');
        showNotification(notification, 'Автомобиль добавлен в избранное', 'success');
        
        // Анимация сердца
        button.style.animation = 'heartBeat 0.6s ease';
        setTimeout(() => {
            button.style.animation = '';
        }, 600);
    }

    localStorage.setItem('carFavorites', JSON.stringify(favorites));
}

// 3. Модальное окно контактов
function setupContactModal() {
    const contactBtn = document.querySelector('.car-detail-contact-btn');
    const modalOverlay = document.querySelector('.car-detail-modal-overlay');
    const modalClose = document.querySelector('.car-detail-modal-close');

    if (!contactBtn || !modalOverlay) return;

    contactBtn.addEventListener('click', function() {
        openContactModal(modalOverlay);
    });

    if (modalClose) {
        modalClose.addEventListener('click', function() {
            closeContactModal(modalOverlay);
        });
    }

    // Закрытие по клику на overlay
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeContactModal(modalOverlay);
        }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.style.display !== 'none') {
            closeContactModal(modalOverlay);
        }
    });
}

function openContactModal(modalOverlay) {
    modalOverlay.style.display = 'flex';
    setTimeout(() => {
        modalOverlay.style.opacity = '1';
        modalOverlay.querySelector('.car-detail-modal-content').style.transform = 'scale(1)';
    }, 10);

    // Блокируем прокрутку body
    document.body.style.overflow = 'hidden';
}

function closeContactModal(modalOverlay) {
    modalOverlay.style.opacity = '0';
    modalOverlay.querySelector('.car-detail-modal-content').style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// 4. Уведомления
function showNotification(notificationElement, message, type = 'success') {
    if (!notificationElement) return;

    notificationElement.textContent = message;
    notificationElement.className = `car-detail-notification notification-${type}`;
    notificationElement.style.display = 'block';

    // Анимация появления
    setTimeout(() => {
        notificationElement.style.opacity = '1';
        notificationElement.style.transform = 'translateY(0)';
    }, 10);

    // Автоматическое скрытие
    setTimeout(() => {
        notificationElement.style.opacity = '0';
        notificationElement.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            notificationElement.style.display = 'none';
        }, 300);
    }, 3000);
}

// 5. Дополнительные анимации
function setupSmoothAnimations() {
    // Плавное появление элементов при загрузке
    const elementsToAnimate = document.querySelectorAll('.car-detail-main-photo, .car-detail-thumbnail, .car-detail-specs, .car-detail-additional-info');
    
    elementsToAnimate.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 + index * 100);
    });
}

// 6. Полноэкранная галерея (опционально)
function openFullscreenGallery(imageSrc) {
    const fullscreenOverlay = document.createElement('div');
    fullscreenOverlay.className = 'fullscreen-gallery-overlay';
    fullscreenOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    const fullscreenImage = document.createElement('img');
    fullscreenImage.src = imageSrc;
    fullscreenImage.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        transform: scale(0.8);
        transition: transform 0.3s ease;
    `;

    fullscreenOverlay.appendChild(fullscreenImage);
    document.body.appendChild(fullscreenOverlay);

    // Анимация появления
    setTimeout(() => {
        fullscreenOverlay.style.opacity = '1';
        fullscreenImage.style.transform = 'scale(1)';
    }, 10);

    // Закрытие по клику
    fullscreenOverlay.addEventListener('click', function() {
        fullscreenOverlay.style.opacity = '0';
        fullscreenImage.style.transform = 'scale(0.8)';
        setTimeout(() => {
            document.body.removeChild(fullscreenOverlay);
        }, 300);
    });

    // Блокировка прокрутки
    document.body.style.overflow = 'hidden';
}
