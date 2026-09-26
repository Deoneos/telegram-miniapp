// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Разворачиваем на весь экран (опционально)
tg.expand();

// Применяем тему Telegram к CSS-переменным
tg.setHeaderColor('secondary_bg_color');
tg.setBackgroundColor('bg_color');

// Получаем пользователя
const user = tg.initDataUnsafe?.user;

if (user) {
    document.getElementById('user-name').textContent =
        [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Пользователь';
    document.getElementById('user-id').textContent = `ID: ${user.id}`;

    // Аватарка — если есть фото, можно поставить, иначе эмодзи
    if (user.photo_url) {
        const avatar = document.getElementById('user-avatar');
        avatar.style.backgroundImage = `url('${user.photo_url}')`;
        avatar.style.backgroundSize = 'cover';
        avatar.textContent = '';
    }
} else {
    document.getElementById('user-name').textContent = 'Гость';
    document.getElementById('user-id').textContent = 'Откройте через Telegram';
}

// Кнопка "Добавить в группу"
document.getElementById('add-to-group-btn').addEventListener('click', () => {
    // Ссылка с параметром startgroup — Telegram откроет выбор группы
    const botUsername = 'ANTI_SPAM_MWKbot'; // ← замените на ваш юзернейм
    const url = `https://t.me/${botUsername}?startgroup=true`;

    // Открываем ссылку через Telegram
    tg.openTelegramLink(url);
});

// Сообщаем Telegram, что приложение готово
tg.ready();