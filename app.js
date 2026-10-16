// ===== API URL =====
const API_BASE = 'https://telegram-bot-zakharsakharov.msk1.amvera.tech';

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
    loadChatSettings(chatId);
    document.getElementById('modal-overlay').style.display = 'flex';
}

function closeGroupModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

document.getElementById('modal-close').addEventListener('click', closeGroupModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeGroupModal();
});

// ===== НАСТРОЙКИ ГРУППЫ (модерация / антифлуд / OCR) =====
async function loadChatSettings(chatId) {
    const container = document.getElementById('settings-toggles');
    if (!container) return;

    if (!user || !user.id) {
        container.innerHTML = `<p class="violators-empty">${t('settings.no_access')}</p>`;
        return;
    }

    container.innerHTML = `<p class="violators-loading">${t('groups.loading')}</p>`;

    try {
        const resp = await fetch(`${API_BASE}/api/chat/${chatId}/settings?user_id=${user.id}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        renderSettings(data.settings || {});
    } catch (e) {
        console.error('loadChatSettings error:', e);
        container.innerHTML = `<p class="violators-empty">${t('settings.error')}</p>`;
    }
}

function renderSettings(s) {
    const container = document.getElementById('settings-toggles');
    if (!container) return;

    const items = [
        { key: 'moderation_enabled', label: t('settings.moderation'), desc: t('settings.moderation_desc') },
        { key: 'antiflood_enabled',  label: t('settings.antiflood'),  desc: t('settings.antiflood_desc') },
        { key: 'ocr_enabled',        label: t('settings.ocr'),        desc: t('settings.ocr_desc') },
    ];

    container.innerHTML = items.map(it => `
        <div class="setting-row">
            <div class="setting-info">
                <div class="setting-name">${it.label}</div>
                <div class="setting-desc">${it.desc}</div>
            </div>
            <label class="switch">
                <input type="checkbox" data-key="${it.key}" ${s[it.key] ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        </div>
    `).join('');

    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => toggleSetting(cb));
    });
}

async function toggleSetting(cb) {
    const chatId = currentChartChatId;
    const key = cb.dataset.key;
    const value = cb.checked ? 1 : 0;
    const hint = document.getElementById('settings-hint');

    cb.disabled = true;
    const oldHint = hint ? hint.textContent : '';
    if (hint) {
        hint.classList.add('applying');
        hint.textContent = t('settings.applying');
    }

    try {
        const resp = await fetch(`${API_BASE}/api/chat/${chatId}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, key, value })
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        // Через 30 секунд возвращаем обычный текст
        setTimeout(() => {
            if (hint) {
                hint.classList.remove('applying');
                hint.textContent = t('settings.hint');
            }
        }, 30000);
    } catch (e) {
        console.error('toggleSetting error:', e);
        cb.checked = !cb.checked;   // откат
        if (hint) {
            hint.classList.remove('applying');
            hint.textContent = oldHint || t('settings.hint');
        }
        alert(t('settings.error'));
    } finally {
        cb.disabled = false;
    }
}

window.openGroupModal = openGroupModal;
window.loadChatSettings = loadChatSettings;

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

// ===== АДМИН-ПАНЕЛЬ =====
async function checkAdminStatus() {
    const btn = document.getElementById('admin-panel-btn');
    if (!btn) return;

    if (!user || !user.id) return;

    try {
        const resp = await fetch(`${API_BASE}/api/admin/me?user_id=${user.id}`);
        if (!resp.ok) return;
        const data = await resp.json();

        if (data.ok && data.is_admin) {
            btn.style.display = 'flex';
            console.log('👑 Пользователь — админ бота');
        }
    } catch (e) {
        console.warn('checkAdminStatus error:', e);
    }
}

function openAdminModal() {
    const overlay = document.getElementById('admin-overlay');
    if (overlay) overlay.style.display = 'flex';

    // Загружаем начальный таб
    loadAdminTab('summary');

    // Привязываем обработчики табов (один раз)
    if (!window._adminTabsBound) {
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                loadAdminTab(tab.dataset.tab);
            });
        });
        window._adminTabsBound = true;
    }
}

function closeAdminModal() {
    const overlay = document.getElementById('admin-overlay');
    if (overlay) overlay.style.display = 'none';
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkAdminStatus, 500);

    const btn = document.getElementById('admin-panel-btn');
    if (btn) {
        btn.addEventListener('click', openAdminModal);
    }

    const closeBtn = document.getElementById('admin-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeAdminModal);

    const overlay = document.getElementById('admin-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target.id === 'admin-overlay') closeAdminModal();
        });
    }
});

window.checkAdminStatus = checkAdminStatus;
window.openAdminModal = openAdminModal;

// ===== АДМИН-ПАНЕЛЬ: ЗАГРУЗКА ДАННЫХ =====
let adminCurrentTab = 'summary';

async function loadAdminTab(tab) {
    adminCurrentTab = tab;
    const content = document.getElementById('admin-content');
    if (!content) return;

    content.innerHTML = `<p class="admin-loading">${t('groups.loading')}</p>`;

    try {
        if (tab === 'summary') await loadAdminSummary();
        else if (tab === 'bans') await loadAdminBans();
        else if (tab === 'violators') await loadAdminViolators();
        else if (tab === 'deleted') await loadAdminDeleted();
        else if (tab === 'roles') await loadAdminRoles();
    } catch (e) {
        console.error('loadAdminTab error:', e);
        content.innerHTML = `<p class="admin-empty">${t('admin.error')}</p>`;
    }
}

async function loadAdminSummary() {
    const content = document.getElementById('admin-content');
    const resp = await fetch(`${API_BASE}/api/admin/summary?user_id=${user.id}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const s = data.summary || {};

    const tiles = [
        { icon: '📢', label: t('stats.chats'), value: s.total_chats || 0 },
        { icon: '🗑', label: t('stats.deleted'), value: s.total_deleted || 0 },
        { icon: '⚖️', label: t('stats.bans'), value: s.total_bans || 0 },
        { icon: '⚠️', label: 'Нарушений', value: s.total_violations || 0 },
        { icon: '👤', label: 'Нарушителей', value: s.total_violators || 0 },
        { icon: '👑', label: 'Админов', value: (s.admins || []).length },
    ];

    content.innerHTML = `
        <div class="admin-summary-grid">
            ${tiles.map(t => `
                <div class="admin-summary-tile">
                    <div class="admin-summary-icon">${t.icon}</div>
                    <div class="admin-summary-value">${t.value}</div>
                    <div class="admin-summary-label">${t.label}</div>
                </div>
            `).join('')}
        </div>
        <p style="text-align:center; font-size:11px; color:var(--tg-theme-hint-color, #999); margin-top:12px;">
            Sync: ${s.synced_at ? s.synced_at.slice(0, 16).replace('T', ' ') : '—'}
        </p>
    `;
}

async function loadAdminBans() {
    const content = document.getElementById('admin-content');
    const resp = await fetch(`${API_BASE}/api/admin/bans?user_id=${user.id}&limit=50`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const bans = data.bans || [];

    if (!bans.length) {
        content.innerHTML = `<p class="admin-empty">${t('admin.no_data')}</p>`;
        return;
    }

    content.innerHTML = bans.map(b => {
        const name = b.username || `ID ${b.user_id}`;
        const reason = (b.reason || '').slice(0, 80);
        const date = (b.ban_date || '').slice(0, 16).replace('T', ' ');
        const action = b.action || 'ban';
        const badgeClass = action === 'mute' ? 'gold' : action === 'perm_ban' ? 'warn' : '';
        const badgeText = action === 'mute' ? '🔇 MUTE' : action === 'perm_ban' ? '🚫 PERM' : '⚖️ BAN';

        return `
            <div class="admin-item">
                <div class="admin-item-row">
                    <div class="admin-item-main">
                        <div class="admin-item-name">${escapeHtml(name)}</div>
                        <div class="admin-item-meta">
                            ${escapeHtml(reason)}<br>
                            🕐 ${date}
                        </div>
                    </div>
                    <span class="admin-item-badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="admin-item-actions">
                    <button class="admin-action-btn danger"
                            onclick="adminAction('unban', ${b.user_id}, ${b.chat_id}, this)">
                        ${t('admin.unban')}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function loadAdminViolators() {
    const content = document.getElementById('admin-content');
    const resp = await fetch(`${API_BASE}/api/admin/violators?user_id=${user.id}&limit=50`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const violators = data.violators || [];

    if (!violators.length) {
        content.innerHTML = `<p class="admin-empty">${t('admin.no_data')}</p>`;
        return;
    }

    content.innerHTML = violators.map(v => {
        const name = v.first_name || v.username || `ID ${v.user_id}`;
        return `
            <div class="admin-item">
                <div class="admin-item-row">
                    <div class="admin-item-main">
                        <div class="admin-item-name">${escapeHtml(name)}</div>
                        <div class="admin-item-meta">ID: ${v.user_id}</div>
                    </div>
                    <span class="admin-item-badge warn">${v.violation_count} ⚠️</span>
                </div>
                <div class="admin-item-actions">
                    <button class="admin-action-btn"
                            onclick="adminAction('reset_violations', ${v.user_id}, null, this)">
                        ${t('admin.reset')}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function loadAdminDeleted() {
    const content = document.getElementById('admin-content');
    const resp = await fetch(`${API_BASE}/api/admin/deleted?user_id=${user.id}&limit=50`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const items = data.deleted || [];

    if (!items.length) {
        content.innerHTML = `<p class="admin-empty">${t('admin.no_data')}</p>`;
        return;
    }

    content.innerHTML = items.map(d => {
        const name = d.first_name || d.username || `ID ${d.user_id}`;
        const date = (d.delete_time || '').slice(0, 16).replace('T', ' ');
        const text = (d.text || '').slice(0, 200);
        const reason = (d.reason || '').slice(0, 60);

        return `
            <div class="admin-item">
                <div class="admin-item-name">${escapeHtml(name)}</div>
                <div class="admin-item-meta">🕐 ${date} · ${escapeHtml(reason)}</div>
                <div class="admin-item-text">${escapeHtml(text)}</div>
            </div>
        `;
    }).join('');
}

async function loadAdminRoles() {
    const content = document.getElementById('admin-content');
    const resp = await fetch(`${API_BASE}/api/admin/summary?user_id=${user.id}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const s = data.summary || {};

    const admins = s.admins || [];
    const whitelist = s.whitelist || [];

    const renderList = (ids, role) => {
        if (!ids.length) return `<p class="admin-empty">${t('admin.no_data')}</p>`;
        return ids.map(uid => `
            <div class="admin-item">
                <div class="admin-item-row">
                    <div class="admin-item-main">
                        <div class="admin-item-name">ID: ${uid}</div>
                    </div>
                    <span class="admin-item-badge ${role === 'admin' ? 'gold' : ''}">${role.toUpperCase()}</span>
                </div>
                ${uid === user.id ? '<div class="admin-item-meta">Это вы</div>' : `
                <div class="admin-item-actions">
                    <button class="admin-action-btn danger"
                            onclick="adminAction('remove_${role}', ${uid}, null, this)">
                        ${t('admin.remove')}
                    </button>
                </div>`}
            </div>
        `).join('');
    };

    content.innerHTML = `
        <div class="admin-role-section">
            <div class="admin-role-title">👑 Админы (${admins.length})</div>
            ${renderList(admins, 'admin')}
        </div>
        <div class="admin-role-section">
            <div class="admin-role-title">🛡️ Вайтлист (${whitelist.length})</div>
            ${renderList(whitelist, 'whitelist')}
        </div>
    `;
}

async function adminAction(action, targetId, chatId, btn) {
    if (!confirm(t('admin.confirm_' + (action.includes('unban') ? 'unban' : action.includes('reset') ? 'reset' : 'remove')))) return;

    if (btn) btn.disabled = true;

    try {
        const resp = await fetch(`${API_BASE}/api/admin/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                action: action,
                target_id: targetId,
                chat_id: chatId,
            })
        });

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        // Показываем уведомление
        const msg = document.createElement('div');
        msg.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#2ecc71;color:#fff;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.3);';
        msg.textContent = t('admin.action_sent') + ' · ' + t('admin.action_wait');
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);

        // Обновляем текущий таб через 2 сек (ждём, пока бот применит)
        setTimeout(() => loadAdminTab(adminCurrentTab), 2000);

    } catch (e) {
        console.error('adminAction error:', e);
        alert(t('admin.error') + ': ' + e.message);
        if (btn) btn.disabled = false;
    }
}

window.adminAction = adminAction;
window.loadAdminTab = loadAdminTab;

// ===== КАСТОМНЫЕ ТЕКСТЫ =====
const CUSTOM_TEXT_FIELDS = [
    { key: 'public.warn', labelKey: 'custom_texts.label_public_warn', hintKey: 'custom_texts.hint_name',
      placeholder: '⚠️ {name}, ваше сообщение удалено. Это предупреждение — при повторе будет мут.' },
    { key: 'public.mute_until', labelKey: 'custom_texts.label_mute', hintKey: 'custom_texts.hint_name',
      placeholder: '🔇 {name} замучен на {duration}.\nРазблокировка: {until} (МСК)' },
    { key: 'public.ban_until', labelKey: 'custom_texts.label_ban', hintKey: 'custom_texts.hint_name',
      placeholder: '🚫 {name} заблокирован на {duration}.\nРазблокировка: {until} (МСК)' },
    { key: 'public.perm_ban', labelKey: 'custom_texts.label_perm_ban', hintKey: 'custom_texts.hint_name',
      placeholder: '🚫 {name} заблокирован навсегда.' },
    { key: 'warn.dm_text', labelKey: 'custom_texts.label_dm_text', hintKey: 'custom_texts.hint_dm',
      placeholder: '⚠️ <b>Предупреждение</b>\n\nВаше сообщение в группе <b>{chat_title}</b> было удалено.\n\n📋 Причина: {reason}' },
    { key: 'flood.muted', labelKey: 'custom_texts.label_flood_muted', hintKey: 'custom_texts.hint_flood',
      placeholder: '🌊 {user} замучен на {minutes} минут за флуд.' },
    { key: 'flood.mass_spam', labelKey: 'custom_texts.label_flood_mass_spam', hintKey: 'custom_texts.hint_mass_spam',
      placeholder: '🚫 Пользователь @{username} заблокирован на {days} дней за массовую рассылку.' },
];

let customTextsChatId = null;

async function openCustomTextsModal() {
    if (!currentChartChatId) return;

    customTextsChatId = currentChartChatId;
    document.getElementById('custom-texts-overlay').style.display = 'flex';
    await loadCustomTexts(customTextsChatId);
}

function closeCustomTextsModal() {
    document.getElementById('custom-texts-overlay').style.display = 'none';
}

async function loadCustomTexts(chatId) {
    const container = document.getElementById('custom-texts-list');
    if (!container) return;

    container.innerHTML = `<p class="violators-loading">${t('groups.loading')}</p>`;

    let texts = {};
    try {
        const resp = await fetch(`${API_BASE}/api/chat/${chatId}/custom_texts?user_id=${user.id}`);
        if (resp.ok) {
            const data = await resp.json();
            texts = data.texts || {};
        }
    } catch (e) {
        console.warn('loadCustomTexts error:', e);
    }

    container.innerHTML = CUSTOM_TEXT_FIELDS.map(f => {
        const current = texts[f.key] || '';
        const isCustom = !!current;
        const value = isCustom ? current : '';
        const placeholder = escapeHtml(f.placeholder);
        const label = t(f.labelKey);
        const hint = t(f.hintKey);
        const badgeClass = isCustom ? 'custom' : 'default';
        const badgeText = isCustom ? '✏️ Custom' : 'Default';

        return `
            <div class="custom-texts-item" data-key="${f.key}">
                <div class="custom-texts-item-header">
                    <div class="custom-texts-item-label">${label}</div>
                    <div class="custom-texts-item-status ${badgeClass}">${badgeText}</div>
                </div>
                <textarea class="custom-texts-textarea"
                          data-key="${f.key}"
                          placeholder="${placeholder}">${escapeHtml(value)}</textarea>
                <div class="custom-texts-hint-vars">${hint}</div>
                <div class="custom-texts-actions">
                    <button class="custom-texts-btn save" data-action="save" data-key="${f.key}">
                        ${t('custom_texts.save')}
                    </button>
                    <button class="custom-texts-btn reset" data-action="reset" data-key="${f.key}">
                        ${t('custom_texts.reset')}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Обработчики
    container.querySelectorAll('.custom-texts-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.key;
            const action = btn.dataset.action;
            const ta = container.querySelector(`textarea[data-key="${key}"]`);
            const value = ta ? ta.value.trim() : '';

            if (action === 'save') {
                saveCustomText(customTextsChatId, key, value, btn);
            } else {
                saveCustomText(customTextsChatId, key, '', btn);
            }
        });
    });
}

async function saveCustomText(chatId, key, value, btn) {
    if (!user || !user.id) return;

    btn.disabled = true;
    const oldText = btn.textContent;
    btn.textContent = t('custom_texts.applying');

    try {
        const resp = await fetch(`${API_BASE}/api/chat/${chatId}/custom_texts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, key: key, value: value })
        });

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        // Тост
        const msg = document.createElement('div');
        msg.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#2ecc71;color:#fff;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.3);';
        msg.textContent = value ? t('custom_texts.saved') : t('custom_texts.reset_done');
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2500);

        // Перезагрузить список через 1 сек
        setTimeout(() => loadCustomTexts(chatId), 1000);
    } catch (e) {
        console.error('saveCustomText error:', e);
        alert(t('custom_texts.error') + ': ' + e.message);
    } finally {
        btn.disabled = false;
        btn.textContent = oldText;
    }
}

// Инициализация: привязываем кнопку и закрытие
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('custom-texts-open-btn');
    if (openBtn) {
        openBtn.addEventListener('click', openCustomTextsModal);
    }

    const closeBtn = document.getElementById('custom-texts-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCustomTextsModal);
    }

    const overlay = document.getElementById('custom-texts-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target.id === 'custom-texts-overlay') closeCustomTextsModal();
        });
    }
});

window.openCustomTextsModal = openCustomTextsModal;
window.closeCustomTextsModal = closeCustomTextsModal;