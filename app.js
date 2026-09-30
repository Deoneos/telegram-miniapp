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

// ===== ГРАФИК АКТИВНОСТИ (Chart.js) =====
let timelineChart = null;

async function loadTimelineChart(chatId, days = 30) {
    const canvas = document.getElementById('chart-timeline');
    if (!canvas || typeof Chart === 'undefined') return;

    // Уничтожаем старый график, если есть
    if (timelineChart) {
        timelineChart.destroy();
        timelineChart = null;
    }

    try {
        const response = await fetch(`${API_BASE}/api/timeline?chat_id=${chatId}&days=${days}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        const items = data.days || [];
        const textColor = getComputedStyle(document.body).color;

        if (items.length === 0) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#999';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Нет данных', canvas.width / 2, canvas.height / 2);
            return;
        }

        const labels = items.map(d => {
            const p = d.date.split('-');
            return `${p[2]}.${p[1]}`;
        });

        timelineChart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '🗑 Удалено',
                        data: items.map(d => d.deleted || 0),
                        borderColor: '#2481cc',
                        backgroundColor: 'rgba(36, 129, 204, 0.12)',
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                        fill: true,
                    },
                    {
                        label: '⚖️ Баны',
                        data: items.map(d => d.bans || 0),
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.12)',
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                        fill: true,
                    },
                    {
                        label: '⚠️ Нарушения',
                        data: items.map(d => d.violations || 0),
                        borderColor: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.12)',
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                        fill: true,
                    },
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 8,
                            font: { size: 11 },
                            color: textColor,
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        padding: 8,
                        titleFont: { size: 12 },
                        bodyFont: { size: 12 },
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 10 },
                            color: textColor,
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 8,
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: { size: 10 },
                            color: textColor,
                            precision: 0,
                        },
                        grid: {
                            color: 'rgba(128,128,128,0.15)',
                        }
                    }
                }
            }
        });

    } catch (e) {
        console.error('Timeline error:', e);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#999';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Не удалось загрузить', canvas.width / 2, canvas.height / 2);
    }
}

window.loadTimelineChart = loadTimelineChart;
