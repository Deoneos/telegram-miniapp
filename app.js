const tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('secondary_bg_color');
tg.setBackgroundColor('bg_color');

const user = tg.initDataUnsafe?.user;
const initData = tg.initData;

// API-эндпоинт бота (пока заглушка)
// Позже заменим на реальный
const API_BASE = 'https://ВАШ_ДОМЕН/api';

// === Показываем пользователя ===
if (user) {
    document.getElementById('user-name').textContent =
        [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Пользователь';
    document.getElementById('user-id').textContent = `ID: ${user.id}`;
} else {
    document.getElementById('user-name').textContent = 'Гость';
    document.getElementById('user-id').textContent = 'Откройте через Telegram';
}

// === Кнопка "Добавить в группу" ===
document.getElementById('add-to-group-btn').addEventListener('click', () => {
    const botUsername = 'ANTI_SPAM_MWKbot';
    tg.openTelegramLink(`https://t.me/${botUsername}?startgroup=true`);
});

// === Загрузка списка групп ===
async function loadGroups() {
    const container = document.getElementById('groups-list');

    if (!user || !initData) {
        container.innerHTML = '<p>Откройте через Telegram</p>';
        return;
    }

    try {
        // TODO: заменить на реальный API
        // Пока — демо-данные
        const response = await fetch(`${API_BASE}/groups?user_id=${user.id}`, {
            headers: { 'X-Telegram-InitData': initData }
        });

        if (!response.ok) throw new Error('Ошибка API');

        const data = await response.json();

        if (!data.groups || data.groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>У вас пока нет групп с ботом</p>
                    <p style="font-size:12px;margin-top:8px;">Добавьте бота через кнопку выше</p>
                </div>
            `;
            return;
        }

        // Рендер групп
        container.innerHTML = data.groups.map(g => `
            <div class="group-item">
                <div class="group-name">${g.title || 'Группа'}</div>
                <div class="group-id">ID: ${g.telegram_chat_id}</div>
                <div class="group-stats">
                    🗑 ${g.deleted_count || 0} · ⚖️ ${g.bans_count || 0}
                </div>
            </div>
        `).join('');

    } catch (e) {
        // Заглушка: показываем демо
        container.innerHTML = `
            <div class="empty-state">
                <p>API ещё не подключён</p>
                <p style="font-size:12px;margin-top:8px;">Группы появятся здесь после настройки бэкенда</p>
            </div>
        `;
    }
}

// === Запуск ===
loadGroups();
tg.ready();