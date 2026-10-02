// ===== API URL =====
const API_BASE = 'https://antispam-api-zakharsakharov.amvera.io';

// ===== ИНИЦИАЛИЗАЦИЯ =====
const tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('secondary_bg_color');
tg.setBackgroundColor('bg_color');

// Пользователь
const user = tg.initDataUnsafe?.user;

const nameEl = document.getElementById('user-name');
nameEl.removeAttribute('data-i18n');  // чтобы applyTranslations не перезаписывал

if (user) {
    nameEl.textContent =
        [user.first_name, user.last_name].filter(Boolean).join(' ') || t('user.placeholder');
    document.getElementById('user-id').textContent = `ID: ${user.id}`;

    if (user.photo_url) {
        const avatar = document.getElementById('user-avatar');
        avatar.style.backgroundImage = `url('${user.photo_url}')`;
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
        avatar.textContent = '';
    }
} else {
    nameEl.textContent = t('user.guest');
    document.getElementById('user-id').textContent = t('user.open_via_tg');
}

// Применяем переводы к статике
applyTranslations();

// ===== ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА =====
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.getAttribute('data-lang');
        // Через localStorage — не зависит от внешних функций
        if (localStorage.getItem('lang') === lang) return;
        setLanguage(lang);
        renderGroups();
    });
});

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
                <h3>${t('groups.locked_title')}</h3>
                <p>${t('groups.locked_text')}</p>
                <a href="https://deoneos.github.io/antispam-landing/"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="btn btn-secondary"
                   style="display:inline-block; margin-top:16px; text-decoration:none;">
                    ${t('groups.learn_more')}
                </a>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/groups?user_id=${user.id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        if (data.stats && data.stats.total_chats > 0) {
            summary.style.display = 'grid';
            document.getElementById('stat-chats').textContent = data.stats.total_chats;
            document.getElementById('stat-deleted').textContent = data.stats.total_deleted;
            document.getElementById('stat-bans').textContent = data.stats.total_bans;
        } else {
            summary.style.display = 'none';
        }

        if (!data.groups || data.groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <h3>${t('groups.empty_title')}</h3>
                    <p>${t('groups.empty_text')}</p>
                    <a href="https://deoneos.github.io/antispam-landing/"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="btn btn-secondary"
                       style="display:inline-block; margin-top:16px; text-decoration:none;">
                        ${t('groups.learn_more')}
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = data.groups.map(g => {
            const initial = (g.title || 'Г').trim()[0].toUpperCase();
            const title = g.title || t('groups.no_title');
            return `
                <div class="group-item" onclick="openGroupModal(
                    ${g.telegram_chat_id},
                    '${(title).replace(/'/g, "\\'")}',
                    '${g.chat_type || ''}',
                    ${g.deleted_count || 0},
                    ${g.bans_count || 0},
                    ${g.violations_count || 0},
                    '${(g.added_at || '').slice(0, 10)}',
                    '${(g.invite_link || '').replace(/'/g, "\\'")}',
                    '${(g.channel_link || '').replace(/'/g, "\\'")}'
                )">
                    <div class="group-avatar">${initial}</div>
                    <div class="group-content">
                        <div class="group-name">${title}</div>
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
                <h3>${t('groups.error_title')}</h3>
                <p>${e.message}</p>
            </div>
        `;
    }
}

// ===== МОДАЛЬНОЕ ОКНО =====
function openGroupModal(chatId, title, chatType, deleted, bans, violations, added, inviteLink, channelLink) {
    currentChartChatId = chatId;
    document.getElementById('modal-title').textContent = title || t('modal.title_default');
    document.getElementById('modal-subtitle').textContent = `ID: ${chatId}`;
    document.getElementById('modal-deleted').textContent = deleted;
    document.getElementById('modal-bans').textContent = bans;
    document.getElementById('modal-violations').textContent = violations;

    let typeText = t('modal.type_group');
    if (chatType === 'supergroup') typeText = t('modal.type_supergroup');
    if (chatType === 'channel') typeText = t('modal.type_channel');

    document.getElementById('modal-info').innerHTML =
        `📅 ${t('modal.added')}: ${added || t('modal.unknown')}<br>📁 ${t('modal.type')}: ${typeText}`;

    const openGroupBtn = document.getElementById('modal-open-group');
    if (inviteLink && inviteLink.startsWith('http')) {
        openGroupBtn.href = inviteLink;
        openGroupBtn.style.display = 'block';
    } else {
        openGroupBtn.style.display = 'none';
    }

    const openChannelBtn = document.getElementById('modal-open-channel');
    if (channelLink && channelLink.startsWith('http')) {
        openChannelBtn.href = channelLink;
        openChannelBtn.style.display = 'block';
    } else {
        openChannelBtn.style.display = 'none';
    }

    // Берём последний выбранный период или дефолт 30
    const savedDays = parseInt(localStorage.getItem('chart_days')) || 30;
    loadTimelineChart(chatId, savedDays);
    loadCategoriesChart(chatId, savedDays);
    loadTopViolators(chatId);
    document.getElementById('modal-overlay').style.display = 'flex';
}

function closeGroupModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

document.getElementById('modal-close').addEventListener('click', closeGroupModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeGroupModal();
});

window.openGroupModal = openGroupModal;

// ===== ГРАФИК АКТИВНОСТИ =====
let timelineChart = null;
let currentChartChatId = null;

async function loadTimelineChart(chatId, days = 30) {
    const canvas = document.getElementById('chart-timeline');
    if (!canvas || typeof Chart === 'undefined') return;

    // Обновляем заголовок
    const titleEl = document.getElementById('chart-title');
    if (titleEl) {
        titleEl.setAttribute('data-i18n', `modal.chart_title_${days}`);
        titleEl.textContent = t(`modal.chart_title_${days}`);
    }

    // Обновляем активную кнопку периода
    document.querySelectorAll('.period-btn').forEach(btn => {
        const btnDays = parseInt(btn.getAttribute('data-days'));
        btn.classList.toggle('active', btnDays === days);
    });

    // Запоминаем выбор
    localStorage.setItem('chart_days', days);

    // Уничтожаем старый график
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
            ctx.fillText(t('modal.chart_no_data'), canvas.width / 2, canvas.height / 2);
            return;
        }

        const labels = items.map(d => {
            const p = d.date.split('-');
            return `${p[2]}.${p[1]}`;
        });

        // Для 90 дней — показываем реже подписи
        const maxTicks = days > 60 ? 10 : 8;

        timelineChart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: t('chart.deleted'),
                        data: items.map(d => d.deleted || 0),
                        borderColor: '#2481cc',
                        backgroundColor: 'rgba(36, 129, 204, 0.12)',
                        borderWidth: 2, tension: 0.3, pointRadius: days > 60 ? 0 : 2,
                        pointHoverRadius: 5, fill: true,
                    },
                    {
                        label: t('chart.bans'),
                        data: items.map(d => d.bans || 0),
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.12)',
                        borderWidth: 2, tension: 0.3, pointRadius: days > 60 ? 0 : 2,
                        pointHoverRadius: 5, fill: true,
                    },
                    {
                        label: t('chart.violations'),
                        data: items.map(d => d.violations || 0),
                        borderColor: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.12)',
                        borderWidth: 2, tension: 0.3, pointRadius: days > 60 ? 0 : 2,
                        pointHoverRadius: 5, fill: true,
                    },
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, padding: 8, font: { size: 11 }, color: textColor }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.85)', padding: 8,
                        titleFont: { size: 12 }, bodyFont: { size: 12 },
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 }, color: textColor, maxRotation: 0, autoSkip: true, maxTicksLimit: maxTicks }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { font: { size: 10 }, color: textColor, precision: 0 },
                        grid: { color: 'rgba(128,128,128,0.15)' }
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
        ctx.fillText(t('modal.chart_error'), canvas.width / 2, canvas.height / 2);
    }
}
// ===== ПЕРЕКЛЮЧАТЕЛЬ ПЕРИОДА ГРАФИКА =====
document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const days = parseInt(btn.getAttribute('data-days'));
        const savedDays = parseInt(localStorage.getItem('chart_days')) || 30;
        if (days === savedDays) return;
        if (currentChartChatId !== null) {
            loadTimelineChart(currentChartChatId, days);
            loadCategoriesChart(currentChartChatId, days);
            loadTopViolators(currentChartChatId);
        }
    });
});
window.loadTimelineChart = loadTimelineChart;

// ===== ЗАПУСК =====
loadGroups();
tg.ready();

// ===== ПИРОГ КАТЕГОРИЙ =====
let categoriesChart = null;

// Цвета для категорий
const CATEGORY_COLORS = {
    drugs: '#e74c3c',
    job: '#f39c12',
    porn: '#9b59b6',
    links: '#3498db',
    rules: '#95a5a6',
    contact: '#1abc9c',
    flood: '#16a085',
    mass_spam: '#e67e22',
    other: '#7f8c8d',
};

async function loadCategoriesChart(chatId, days = 30) {
    const canvas = document.getElementById('chart-categories');
    if (!canvas || typeof Chart === 'undefined') return;

    if (categoriesChart) {
        categoriesChart.destroy();
        categoriesChart = null;
    }

    try {
        const response = await fetch(`${API_BASE}/api/categories?chat_id=${chatId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        const items = data.categories || [];
        const textColor = getComputedStyle(document.body).color;

        if (items.length === 0) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#999';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(t('categories.no_data'), canvas.width / 2, canvas.height / 2);
            return;
        }

        const labels = items.map(c => t(`cat.${c.code}`));
        const values = items.map(c => c.count);
        const colors = items.map(c => CATEGORY_COLORS[c.code] || '#7f8c8d');

        categoriesChart = new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: 'rgba(255,255,255,0.1)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '55%',
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
                        callbacks: {
                            label: (ctx) => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const val = ctx.parsed;
                                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                                return ` ${ctx.label}: ${val} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });

    } catch (e) {
        console.error('Categories error:', e);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#999';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(t('categories.error'), canvas.width / 2, canvas.height / 2);
    }
}

// ===== ТОП НАРУШИТЕЛЕЙ =====
async function loadTopViolators(chatId) {
    const container = document.getElementById('violators-list');
    if (!container) return;

    container.innerHTML = `<p class="violators-loading">${t('groups.loading')}</p>`;

    try {
        const response = await fetch(`${API_BASE}/api/top_violators?chat_id=${chatId}&limit=5`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        const items = data.violators || [];

        if (items.length === 0) {
            container.innerHTML = `<p class="violators-empty">${t('violators.no_data')}</p>`;
            return;
        }

        container.innerHTML = items.map((v, i) => {
            const name = v.first_name || v.username || t('violators.no_name');
            const countText = t('violators.count', { n: v.count });
            const codeText = v.last_code ? t(`cat.${v.last_code}`) : '';
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;

            return `
                <div class="violator-item">
                    <div class="violator-rank">${medal}</div>
                    <div class="violator-info">
                        <div class="violator-name">${escapeHtml(name)}</div>
                        <div class="violator-meta">
                            ${codeText}${v.last_date ? ' · ' + v.last_date : ''}
                        </div>
                    </div>
                    <div class="violator-count">${countText}</div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error('Top violators error:', e);
        container.innerHTML = `<p class="violators-empty">${t('violators.error')}</p>`;
    }
}

// Утилита для экранирования HTML
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

window.loadTopViolators = loadTopViolators;
window.loadCategoriesChart = loadCategoriesChart;