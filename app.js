// === Инициализация Telegram Web App ===
const tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('secondary_bg_color');
tg.setBackgroundColor('bg_color');

// === API URL (Amvera) ===
const API_BASE = 'https://antispam-api-zakharsakharov.amvera.io';

// === Пользователь ===
const user = tg.initDataUnsafe?.user;
const initData = tg.initData;

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

    if (!user || !user.id) {
        container.innerHTML = '<p>Откройте через Telegram</p>';
        return;
    }

    container.innerHTML = '<p style="text-align:center;color:#999;">Загрузка...</p>';

    try {
        const url = `${API_BASE}/api/groups?user_id=${user.id}`;
        console.log('Запрос:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('Ответ:', data);

        if (!data.groups || data.groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>У вас пока нет групп с ботом</p>
                    <p style="font-size:12px;margin-top:8px;">Добавьте бота через кнопку выше</p>
                </div>
            `;
            return;
        }

        // Сводка
        let html = `
            <div style="margin-bottom:12px;padding:10px;background:var(--tg-theme-bg-color,#fff);border-radius:10px;">
                <div style="font-size:13px;color:var(--tg-theme-hint-color,#999);">Всего групп</div>
                <div style="font-size:20px;font-weight:600;">${data.stats.total_chats}</div>
                <div style="margin-top:8px;display:flex;gap:12px;font-size:13px;">
                    <span>🗑 ${data.stats.total_deleted}</span>
                    <span>⚖️ ${data.stats.total_bans}</span>
                    <span>⚠️ ${data.stats.total_violations}</span>
                </div>
            </div>
        `;

        // Список групп
        html += data.groups.map(g => `
            <div class="group-item">
                <div class="group-name">${g.title || 'Без названия'}</div>
                <div class="group-stats">
                    🗑 ${g.deleted_count} · ⚖️ ${g.bans_count} · ⚠️ ${g.violations_count}
                </div>
            </div>
        `).join('');

        container.innerHTML = html;

    } catch (e) {
        console.error('Ошибка загрузки групп:', e);
        container.innerHTML = `
            <div class="empty-state">
                <p>❌ Не удалось загрузить данные</p>
                <p style="font-size:12px;margin-top:8px;">${e.message}</p>
            </div>
        `;
    }
}

// === Запуск ===
loadGroups();
tg.ready();
