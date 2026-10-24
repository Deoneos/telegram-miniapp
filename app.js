// ===== API URL =====
const API_BASE = 'https://telegram-bot-zakharsakharov.msk1.amvera.tech';

// ===== ИНИЦИАЛИЗАЦИЯ =====
const tg = window.Telegram.WebApp;

function openAddToGroup() {
    const url = 'https://t.me/ANTI_SPAM_MWKbot?startgroup=true';
    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(url);
    } else {
        window.open(url, '_blank');
    }
}
tg.expand();

// ===== ИНИЦИАЛИЗАЦИЯ ТЕМЫ =====
function initTheme() {
    const savedTheme = localStorage.getItem('app_theme');
    const tgTheme = tg.colorScheme || 'light';
    const theme = savedTheme || tgTheme;
    
    applyTheme(theme);
    
    const checkbox = document.getElementById('theme-checkbox');
    if (checkbox) {
        // Чекбокс включен = светлая тема
        checkbox.checked = (theme === 'light');
        checkbox.addEventListener('change', () => {
            const newTheme = checkbox.checked ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('app_theme', newTheme);
        });
    }

    // Добавляем активный класс для языка
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
        if (tg.setHeaderColor) tg.setHeaderColor('#ffffff');
        if (tg.setBackgroundColor) tg.setBackgroundColor('#ffffff');
    } else {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
        if (tg.setHeaderColor) tg.setHeaderColor('#17212b');
        if (tg.setBackgroundColor) tg.setBackgroundColor('#17212b');
    }
}
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
    openAddToGroup();
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
                <button onclick="openAddToGroup()"
                            class="btn btn-primary"
                            style="display:inline-block; margin-top:16px;">
                        ➕ ${t('groups.add_to_group')}
                    </button>
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
                    <button onclick="openAddToGroup()"
                            class="btn btn-primary"
                            style="display:inline-block; margin-top:16px;">
                        ➕ ${t('groups.add_to_group')}
                    </button>
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
        { key: 'captcha_enabled',    label: t('settings.captcha'),    desc: t('settings.captcha_desc') },
    ];

    const ghostEnabled = s.ghost_enabled == 1;
    const ghostTimeout = s.ghost_timeout_seconds || 60;
    const timeoutH = Math.floor(ghostTimeout / 3600);
    const timeoutM = Math.floor((ghostTimeout % 3600) / 60);
    const timeoutS = ghostTimeout % 60;
    const ghostAll = s.ghost_delete_all == 1;
    const ghostTrigger = s.ghost_trigger || 0;
    const isPaused = s.paused_until && new Date(s.paused_until) > new Date();

    container.innerHTML =
        items.map(it => `
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
        `).join('')
        + `
            <div class="setting-row" style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                <div class="setting-info">
                    <div class="setting-label">🤖 ML-фильтр (эксперимент)</div>
                    <div class="setting-desc">Нейросеть для отлова скрытого спама (может ошибаться)</div>
                </div>
                <label class="switch">
                    <input type="checkbox" data-key="ml_enabled" ${s.ml_enabled ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>

        <div class="setting-row">
            <div class="setting-info">
                <div class="setting-name">${t('settings.ghost')}</div>
                <div class="setting-desc">${t('settings.ghost_desc')}</div>
            </div>
            <button type="button" class="setting-help-btn" data-help="ghost" title="?">?</button>
            <label class="switch">
                <input type="checkbox" data-key="ghost_enabled" ${ghostEnabled ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        </div>
        <!-- Выключить бота -->
        <div class="setting-row" style="margin-top: 16px; padding: 12px; background: var(--tg-theme-secondary-bg-color, #232e3c); border-radius: 12px; border: 1px solid ${isPaused ? 'var(--tg-theme-button-color, #5288c1)' : 'transparent'};">
            <div class="setting-info">
                <div class="setting-name">${t('settings.pause')}</div>
                <div class="setting-desc">${isPaused ? t('settings.pause_on') : t('settings.pause_desc')}</div>
            </div>
            <label class="switch">
                <input type="checkbox" data-key="paused_until" ${isPaused ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        </div>

        <!-- Расписание модерации -->
        <div class="schedule-settings-block" id="schedule-settings-block" style="margin-top: 16px; padding: 16px; background: var(--tg-theme-secondary-bg-color, #232e3c); border-radius: 12px;">
            <div class="setting-name" style="margin-bottom: 8px;">${t('settings.schedule_title')}</div>
            <div class="setting-desc" style="margin-bottom: 12px; font-size: 13px; color: var(--tg-theme-hint-color, #999);">${t('settings.schedule_desc')}</div>
            
            <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                <div style="flex: 1;">
                    <label style="font-size: 12px; color: var(--tg-theme-hint-color, #999); display: block; margin-bottom: 4px;">${t('settings.schedule_start')}</label>
                    <input type="time" id="mod-start-time" value="${s.moderation_start_time || '00:00'}" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid var(--tg-theme-hint-color, #444); background: var(--tg-theme-bg-color, #17212b); color: var(--tg-theme-text-color, #fff);">
                </div>
                <div style="flex: 1;">
                    <label style="font-size: 12px; color: var(--tg-theme-hint-color, #999); display: block; margin-bottom: 4px;">${t('settings.schedule_end')}</label>
                    <input type="time" id="mod-end-time" value="${s.moderation_end_time || '23:59'}" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid var(--tg-theme-hint-color, #444); background: var(--tg-theme-bg-color, #17212b); color: var(--tg-theme-text-color, #fff);">
                </div>
            </div>
            
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; cursor: pointer;">
                <input type="checkbox" id="mod-weekends" ${s.moderation_weekends == 1 ? 'checked' : ''}>
                ${t('settings.schedule_weekends')}
            </label>
            
            <button type="button" class="btn btn-secondary" id="save-schedule-btn" style="width: 100%; padding: 10px; font-size: 14px;">
                💾 ${t('settings.schedule_save')}
            </button>
        </div>
        
        <div class="ghost-settings-block ${ghostEnabled ? 'active' : ''}" id="ghost-settings-block">
            <label class="ghost-label">${t('settings.ghost_trigger')}</label>
            
            <label class="ghost-radio">
                <input type="radio" name="ghost_trigger" value="0" ${ghostTrigger == 0 ? 'checked' : ''}>
                ${t('settings.ghost_trigger_all')}
            </label>
            <label class="ghost-radio">
                <input type="radio" name="ghost_trigger" value="1" ${ghostTrigger == 1 ? 'checked' : ''}>
                ${t('settings.ghost_trigger_links')}
            </label>
            <label class="ghost-radio">
                <input type="radio" name="ghost_trigger" value="2" ${ghostTrigger == 2 ? 'checked' : ''}>
                ${t('settings.ghost_trigger_text')}
            </label>
            <label class="ghost-radio">
                <input type="radio" name="ghost_trigger" value="3" ${ghostTrigger == 3 ? 'checked' : ''}>
                ${t('settings.ghost_trigger_media')}
            </label>
            
            <label class="ghost-label">${t('settings.ghost_timeout')}</label>
            <div class="ghost-timeout-row" style="display: flex; gap: 8px; align-items: center; justify-content: flex-start;">
                <div style="display: flex; align-items: center; gap: 4px;">
                    <input type="number" class="ghost-timeout-input" id="ghost-timeout-hours" min="0" max="24" value="${timeoutH}" style="width: 60px; text-align: center; padding: 8px;">
                    <span class="ghost-timeout-unit">${t('settings.ghost_hours')}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <input type="number" class="ghost-timeout-input" id="ghost-timeout-mins" min="0" max="59" value="${timeoutM}" style="width: 60px; text-align: center; padding: 8px;">
                    <span class="ghost-timeout-unit">${t('settings.ghost_mins')}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <input type="number" class="ghost-timeout-input" id="ghost-timeout-secs" min="0" max="59" value="${timeoutS}" style="width: 60px; text-align: center; padding: 8px;">
                    <span class="ghost-timeout-unit">${t('settings.ghost_seconds')}</span>
                </div>
            </div>

            <label class="ghost-label">${t('settings.ghost_delete_all')}</label>
            <label class="ghost-radio">
                <input type="radio" name="ghost-delete-mode" value="1" ${ghostAll ? 'checked' : ''}>
                <span>${t('settings.ghost_all')}</span>
            </label>
            <label class="ghost-radio">
                <input type="radio" name="ghost-delete-mode" value="0" ${!ghostAll ? 'checked' : ''}>
                <span>${t('settings.ghost_service')}</span>
            </label>

            <button type="button" class="ghost-save-btn" id="ghost-save-btn">
                ${t('settings.ghost_save')}
            </button>
        </div>
        `;

    // Обычные тумблеры
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        if (cb.dataset.key !== 'ghost_enabled') {
            cb.addEventListener('change', () => toggleSetting(cb));
        }
    });

    // Пауза
    const pauseCb = container.querySelector('input[data-key="paused_until"]');
    if (pauseCb) {
        pauseCb.addEventListener('change', async () => {
            const chatId = currentChartChatId;
            if (!chatId || !user || !user.id) return;

            let pausedUntil = null;
            if (pauseCb.checked) {
                pausedUntil = "2099-12-31T23:59:59+03:00";
            }

            // Показываем тост сразу (оптимистично)
            const msg = document.createElement('div');
            msg.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#2ecc71;color:#fff;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.3);';
            msg.textContent = pauseCb.checked ? t('settings.pause_toast_on') : t('settings.pause_toast_off');
            document.body.appendChild(msg);
            setTimeout(() => msg.remove(), 2500);

            try {
                const resp = await fetch(`${API_BASE}/api/chat/${chatId}/settings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: user.id, key: 'paused_until', value: pausedUntil })
                });
                
                if (!resp.ok) {
                    throw new Error('HTTP ' + resp.status);
                }
                // Никаких перезагрузок! UI уже обновился.
            } catch (e) {
                console.error('pause error:', e);
                // Если ошибка — возвращаем тумблер назад и показываем алерт
                pauseCb.checked = !pauseCb.checked;
                alert('⚠️ Ошибка сети. Попробуйте еще раз.');
            }
        });
    }

    // Ghost toggle
    const ghostCb = container.querySelector('input[data-key="ghost_enabled"]');
    if (ghostCb) {
        ghostCb.addEventListener('change', async () => {
            const block = document.getElementById('ghost-settings-block');
            if (block) {
                block.classList.toggle('active', ghostCb.checked);
            }
            await toggleSetting(ghostCb);
        });
    }

    // Кнопка "?"
    const helpBtn = container.querySelector('.setting-help-btn[data-help="ghost"]');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => showHelp(
            t('settings.ghost_help_title'),
            t('settings.ghost_help_body')
        ));
    }

    // Кнопка "Сохранить" в ghost-блоке
    const saveBtn = document.getElementById('ghost-save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveGhostSettings);
    }

    // Обработчик сохранения расписания
    const saveScheduleBtn = document.getElementById('save-schedule-btn');
    if (saveScheduleBtn) {
        saveScheduleBtn.addEventListener('click', saveScheduleSettings);
    }
}


async function saveGhostSettings() {
    const chatId = currentChartChatId;
    if (!chatId || !user || !user.id) return;

    const h = parseInt(document.getElementById('ghost-timeout-hours')?.value) || 0;
    const m = parseInt(document.getElementById('ghost-timeout-mins')?.value) || 0;
    const s = parseInt(document.getElementById('ghost-timeout-secs')?.value) || 0;
    const radioAll = document.querySelector('input[name="ghost-delete-mode"][value="1"]');

    let timeout = (h * 3600) + (m * 60) + s;
    if (timeout < 10) timeout = 10;
    if (timeout > 86400) timeout = 86400;

    const deleteAll = radioAll && radioAll.checked ? 1 : 0;
    
    const triggerRadio = document.querySelector('input[name="ghost_trigger"]:checked');
    const ghostTrigger = triggerRadio ? parseInt(triggerRadio.value) : 0;

    const saveBtn = document.getElementById('ghost-save-btn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = t('settings.applying');
    }

    try {
        // Сохраняем timeout
        let resp = await fetch(`${API_BASE}/api/chat/${chatId}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, key: 'ghost_timeout_seconds', value: timeout })
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        // Сохраняем режим
        resp = await fetch(`${API_BASE}/api/chat/${chatId}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, key: 'ghost_delete_all', value: deleteAll })
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        // Сохраняем триггер
        resp = await fetch(`${API_BASE}/api/chat/${chatId}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, key: 'ghost_trigger', value: ghostTrigger })
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        // Тост
        const msg = document.createElement('div');
        msg.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#2ecc71;color:#fff;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.3);';
        msg.textContent = t('settings.ghost_saved');
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2500);
    } catch (e) {
        console.error('saveGhostSettings error:', e);
        alert(t('settings.error') + ': ' + e.message);
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = t('settings.ghost_save');
        }
    }
}


// ===== Help-модалка =====
function showHelp(title, body) {
    const overlay = document.getElementById('help-overlay');
    const titleEl = document.getElementById('help-modal-title');
    const bodyEl = document.getElementById('help-modal-body');

    if (!overlay || !titleEl || !bodyEl) return;

    titleEl.textContent = title;
    bodyEl.innerHTML = body.replace(/\n/g, '<br>');
    overlay.style.display = 'flex';
}

function hideHelp() {
    const overlay = document.getElementById('help-overlay');
    if (overlay) overlay.style.display = 'none';
}

// Привязка close и overlay click
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('help-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', hideHelp);

    const overlay = document.getElementById('help-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target.id === 'help-overlay') hideHelp();
        });
    }
});

window.showHelp = showHelp;
window.hideHelp = hideHelp;

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
initTheme();

// ===== ЛОГИКА БУРГЕР-МЕНЮ =====
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-toggle');
    const dropdown = document.getElementById('dropdown-menu');
    
    if (menuBtn && dropdown) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });
        
        // Закрываем меню при клике в любое другое место
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && e.target !== menuBtn) {
                dropdown.style.display = 'none';
            }
        });
    }
});

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
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 20px;">
                    <div class="empty-icon" style="font-size: 40px; margin-bottom: 10px;">🎉</div>
                    <h3 style="margin-bottom: 8px;">${t('violators.empty_title')}</h3>
                    <p style="color: var(--tg-theme-hint-color, #999); font-size: 14px;">${t('violators.empty_text')}</p>
                </div>
            `;
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
        else if (tab === 'federations') await renderFederationsAdmin(content);
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
    { key: 'flood.cumulative', labelKey: 'custom_texts.label_flood_cumulative', hintKey: 'custom_texts.hint_flood',
      placeholder: '🌊 {user}, не флуди короткими сообщениями. Мут на {minutes} мин.' },
    { key: 'welcome', labelKey: 'custom_texts.label_welcome', hintKey: 'custom_texts.hint_welcome',
      placeholder: '👋 Привет, {name}! Добро пожаловать в {chat_title}.\nПожалуйста, прочитай правила: /rules' },
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

        // Сохраняем триггер
        resp = await fetch(`${API_BASE}/api/chat/${chatId}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, key: 'ghost_trigger', value: ghostTrigger })
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

async function saveScheduleSettings() {
    const chatId = currentChartChatId;
    if (!chatId || !user || !user.id) return;

    const startVal = document.getElementById('mod-start-time')?.value || '00:00';
    const endVal = document.getElementById('mod-end-time')?.value || '23:59';
    const weekendsVal = document.getElementById('mod-weekends')?.checked ? 1 : 0;

    const btn = document.getElementById('save-schedule-btn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = t('settings.applying');
    }

    try {
        const keys = {
            'moderation_start_time': startVal,
            'moderation_end_time': endVal,
            'moderation_weekends': weekendsVal
        };

        for (const [key, value] of Object.entries(keys)) {
            const resp = await fetch(`${API_BASE}/api/chat/${chatId}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, key: key, value: value })
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        }

        const msg = document.createElement('div');
        msg.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#2ecc71;color:#fff;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.3);';
        msg.textContent = t('settings.schedule_saved');
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2500);

    } catch (e) {
        console.error('saveScheduleSettings error:', e);
        alert(t('settings.error') + ': ' + e.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = '💾 ' + t('settings.schedule_save');
        }
    }
}


// ========== ФЕДЕРАЦИИ (АДМИН-ПАНЕЛЬ) ==========

async function renderFederationsAdmin(container) {
    container.innerHTML = `<p class="admin-loading">Загрузка федераций...</p>`;
    
    try {
        const resp = await fetch(`${API_BASE}/api/admin/federations?user_id=${user.id}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        
        if (!data.ok || !data.federations) {
            container.innerHTML = `<p class="admin-error">Ошибка загрузки</p>`;
            return;
        }
        
        if (data.federations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🌐</div>
                    <h3>Федераций пока нет</h3>
                    <p>Создайте федерацию в боте командой /fcreate</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        for (const fed of data.federations) {
            html += `
                <div class="admin-card" style="margin-bottom: 12px; padding: 12px; background: var(--tg-theme-secondary-bg-color); border-radius: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; font-size: 15px;">🌐 ${fed.name}</div>
                            <div style="font-size: 12px; color: var(--tg-theme-hint-color);">ID: ${fed.id} · Владелец: ${fed.owner_id}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 12px;">👥 ${fed.chats_approved} / ⏳ ${fed.chats_pending}</div>
                            <div style="font-size: 12px;">🚫 ${fed.bans_count} банов</div>
                        </div>
                    </div>
                    <button onclick="renderFederationDetails(${fed.id})" style="margin-top: 10px; width: 100%; padding: 8px; background: var(--tg-theme-button-color); color: var(--tg-theme-button-text-color); border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Управление
                    </button>
                </div>
            `;
        }
        
        container.innerHTML = html;
    } catch (e) {
        console.error(e);
        container.innerHTML = `<p class="admin-error">Ошибка: ${e.message}</p>`;
    }
}


async function renameFederation(fedId, currentName) {
    const newName = prompt(`Введите новое название для федерации «${currentName}»:`, currentName);
    if (!newName || newName.trim() === '' || newName.trim() === currentName) return;

    try {
        const resp = await fetch(`${API_BASE}/api/admin/federation/rename`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, federation_id: fedId, name: newName.trim() })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.detail || 'Ошибка сервера');
        
        alert(`✅ Федерация переименована в «${newName.trim()}»`);
        if (typeof renderFederationsAdmin === 'function') {
            renderFederationsAdmin(document.getElementById('admin-content'));
        } else {
            location.reload();
        }
    } catch (e) {
        alert(`❌ Ошибка: ${e.message}`);
    }
}

async function deleteFederation(fedId, fedName) {
    if (!confirm(`Вы уверены, что хотите удалить федерацию «${fedName}»?\n\nЭто действие удалит её из бота и API, а также все связанные баны.`)) {
        return;
    }
    
    try {
        const resp = await fetch(`${API_BASE}/api/admin/federation/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, federation_id: fedId })
        });
        
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        
        if (data.ok) {
            alert('✅ Федерация удалена');
            renderFederationsAdmin(document.getElementById('admin-content'));
        } else {
            alert('❌ Ошибка: ' + (data.detail || 'Неизвестно'));
        }
    } catch (e) {
        console.error(e);
        alert('❌ Ошибка сети: ' + e.message);
    }
}

async function renderFederationDetails(fedId) {
    const container = document.getElementById('admin-content');
    container.innerHTML = `<p class="admin-loading">Загрузка деталей...</p>`;
    
    try {
        const resp = await fetch(`${API_BASE}/api/admin/federations/${fedId}?user_id=${user.id}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        
        if (!data.ok) throw new Error('Ошибка API');
        
        const fed = data.federation;
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3>🌐 ${fed.name}</h3>
                <div>
                    <button onclick="renameFederation(${fedId}, this.dataset.name)" data-name="${fed.name.replace(/"/g, '&quot;')}" style="background: none; border: none; font-size: 18px; cursor: pointer; margin-right: 8px;" title="Переименовать">✏️</button>
                    <button onclick="deleteFederation(${fedId}, '${fed.name.replace(/'/g, "\\'")}')" style="background: none; border: none; font-size: 18px; cursor: pointer; margin-right: 8px;" title="Удалить федерацию">🗑</button>
                    <button onclick="renderFederationsAdmin(document.getElementById('admin-content'))" style="background: none; border: none; font-size: 20px; cursor: pointer;">🔙</button>
                </div>
            </div>
        `;
        
        // Группы
        html += `<h4 style="margin-top: 16px;">👥 Группы (${data.chats.length})</h4>`;
        if (data.chats.length === 0) {
            html += `<p>Нет групп</p>`;
        } else {
            for (const chat of data.chats) {
                const title = chat.title || `ID: ${chat.chat_id}`;
                const isApproved = chat.status === 'approved';
                html += `
                    <div style="padding: 8px; border-bottom: 1px solid var(--tg-theme-hint-color); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600;">${title}</div>
                            <div style="font-size: 12px; color: ${isApproved ? '#2ecc71' : '#f39c12'};">
                                ${isApproved ? '✅ Одобрена' : '⏳ Ожидает'}
                            </div>
                        </div>
                        <div>
                            ${!isApproved ? `
                                <button onclick="fedAction(${fedId}, ${chat.chat_id}, 'approve')" style="background: #2ecc71; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">✅</button>
                                <button onclick="fedAction(${fedId}, ${chat.chat_id}, 'reject')" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">❌</button>
                            ` : `
                                <button onclick="fedAction(${fedId}, ${chat.chat_id}, 'remove')" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">🚪 Выйти</button>
                            `}
                        </div>
                    </div>
                `;
            }
        }
        
        // Баны
        html += `<h4 style="margin-top: 24px;">🚫 Последние баны (${data.bans.length})</h4>`;
        if (data.bans.length === 0) {
            html += `<p>Нет банов</p>`;
        } else {
            for (const ban of data.bans) {
                html += `
                    <div style="padding: 8px; border-bottom: 1px solid var(--tg-theme-hint-color);">
                        <div style="font-weight: 600;">ID: ${ban.user_id} ${ban.username ? '@' + ban.username : ''}</div>
                        <div style="font-size: 12px; color: var(--tg-theme-hint-color);">${ban.reason}</div>
                        <div style="font-size: 11px; color: var(--tg-theme-hint-color);">${ban.banned_at.slice(0, 16)}</div>
                    </div>
                `;
            }
        }
        
        container.innerHTML = html;
    } catch (e) {
        console.error(e);
        container.innerHTML = `<p class="admin-error">Ошибка: ${e.message}</p>`;
    }
}

async function fedAction(fedId, chatId, action) {
    if (action === 'remove') {
        if (!confirm('Вы уверены, что хотите исключить группу из федерации?\\n\\nОна больше не будет получать федеративные баны.')) return;
    } else {
        if (!confirm(`Вы уверены, что хотите ${action === 'approve' ? 'одобрить' : action === 'reject' ? 'отклонить' : 'удалить'} группу?`)) return;
    }

    try {
        const resp = await fetch(`${API_BASE}/api/admin/federations/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, federation_id: fedId, chat_id: chatId, action: action })
        });
        
        if (resp.ok) {
            alert('✅ Успешно');
            renderFederationDetails(fedId);
        } else {
            alert('❌ Ошибка');
        }
    } catch (e) {
        alert('❌ Ошибка сети');
    }
}
