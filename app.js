// ===== ИНИЦИАЛИЗАЦИЯ =====
const tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('secondary_bg_color');
tg.setBackgroundColor('bg_color');

// API URL
const API_BASE = 'https://antispam-api-zakharsakharov.amvera.io';

// Пользователь
const user = tg.initDataUnsafe?.user;

if (user) {
    document.getElementById('user-name').textContent =
        [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Пользователь';
    document.getElementById('user-id').textContent = `ID: ${user.id}`;

    if (user.photo_url) {
        const avatar = document.getElementById('user-avatar');
        avatar.style.backgroundImage = `url('${user.photo_url}')`;
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
        avatar.textContent = '';
    }
} else {
    document.getElementById('user-name').textContent = 'Гость';
    document.getElementById('user-id').textContent = 'Откройте через Telegram';
}

// Кнопка "Добавить в группу"
document.getElementById('add-to-group-btn').addEventListener('click', () => {
    tg.openTelegramLink('https://t.me/ANTI_SPAM_MWKbot?startgroup=true');
});

// ===== ЗАГРУЗКА ГРУПП =====
async function loadGroups() {
    const container = document.getElementById('groups-list');
    const summary = document.getElementById('stats-summary');

    if (!user || !user.id) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔒</div>
                <h3>Откройте через Telegram</h3>
                <p>Для просмотра групп откройте приложение из бота</p>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/groups?user_id=${user.id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        // Сводка
        if (data.stats && data.stats.total_chats > 0) {
            summary.style.display = 'grid';
            document.getElementById('stat-chats').textContent = data.stats.total_chats;
            document.getElementById('stat-deleted').textContent = data.stats.total_deleted;
            document.getElementById('stat-bans').textContent = data.stats.total_bans;
        } else {
            summary.style.display = 'none';
        }

        // Пустой список
        if (!data.groups || data.groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <h3>Нет групп</h3>
                    <p>Добавьте бота в свою группу через кнопку выше</p>
                </div>
            `;
            return;
        }

        // Рендер групп
        container.innerHTML = data.groups.map(g => {
            const initial = (g.title || 'Г').trim()[0].toUpperCase();
            return `
                <div class="group-item" onclick="openGroupModal(
                    ${g.telegram_chat_id},
                    '${(g.title || '').replace(/'/g, "\\'")}',
                    '${g.chat_type || ''}',
                    ${g.deleted_count || 0},
                    ${g.bans_count || 0},
                    ${g.violations_count || 0},
                    '${(g.added_at || '').slice(0, 10)}'
                )">
                    <div class="group-avatar">${initial}</div>
                    <div class="group-content">
                        <div class="group-name">${g.title || 'Без названия'}</div>
                        <div class="group-stats">
                            <span class="group-stat">🗑 ${g.deleted_count || 0}</span>
                            <span class="group-stat">⚖️ ${g.bans_count || 0}</span>
                            <span class="group-stat">⚠️ ${g.violations_count || 0}</span>
                        </div>
                    </div>
                    <div class="group-arrow">›</div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error('Ошибка:', e);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3>Не удалось загрузить</h3>
                <p>${e.message}</p>
            </div>
        `;
    }
}

// ===== МОДАЛЬНОЕ ОКНО =====
function openGroupModal(chatId, title, chatType, deleted, bans, violations, added) {
    document.getElementById('modal-title').textContent = title || 'Без названия';
    document.getElementById('modal-subtitle').textContent = `ID: ${chatId}`;
    document.getElementById('modal-deleted').textContent = deleted;
    document.getElementById('modal-bans').textContent = bans;
    document.getElementById('modal-violations').textContent = violations;

    // Тип чата
    let typeText = 'Группа';
    if (chatType === 'supergroup') typeText = 'Супергруппа';
    if (chatType === 'channel') typeText = 'Канал';

    document.getElementById('modal-info').innerHTML =
        `📅 Добавлена: ${added || 'неизвестно'}<br>📁 Тип: ${typeText}`;

    // Кнопка "Открыть в Telegram"
    document.getElementById('modal-open-tg').onclick = () => {
        // Для групп ID отрицательный: -100XXX
        // Ссылка: https://t.me/c/XXX/1 — но это требует message_id
        // Проще: tg://resolve?domain=... но для приватных не работает
        // Используем tg.openTelegramLink для внешних
        tg.openTelegramLink(`https://t.me/ANTI_SPAM_MWKbot`);
    };

    // Загружаем график активности
    loadTimelineChart(chatId, 30);

    document.getElementById('modal-overlay').style.display = 'flex';
}

function closeGroupModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

document.getElementById('modal-close').addEventListener('click', closeGroupModal);

document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeGroupModal();
});

// Экспорт в window
window.openGroupModal = openGroupModal;

// ===== ЗАПУСК =====
loadGroups();
tg.ready();
