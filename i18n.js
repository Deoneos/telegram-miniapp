// ===== MINI APP i18n =====
const TRANSLATIONS = {
    'app.title': { ru: 'ANTI_SPAM Bot', en: 'ANTI_SPAM Bot' },
    'app.subtitle': { ru: 'Защита групп от спама и рекламы', en: 'Protection from spam and ads' },
    'user.guest': { ru: 'Гость', en: 'Guest' },
    'user.open_via_tg': { ru: 'Откройте через Telegram', en: 'Open via Telegram' },
    'user.loading': { ru: 'Загрузка...', en: 'Loading...' },
    'user.placeholder': { ru: 'Пользователь', en: 'User' },

    'stats.chats': { ru: 'групп', en: 'groups' },
    'stats.deleted': { ru: 'удалено', en: 'deleted' },
    'stats.bans': { ru: 'банов', en: 'bans' },

    'add.title': { ru: '➕ Добавить бота в группу', en: '➕ Add bot to group' },
    'add.hint': {
        ru: 'Нажмите кнопку ниже — бот начнёт защищать вашу группу от спама',
        en: 'Tap the button below — the bot will start protecting your group from spam',
    },
    'add.button': { ru: 'Добавить в группу', en: 'Add to group' },

    'groups.title': { ru: '📋 Мои группы', en: '📋 My groups' },
    'groups.loading': { ru: 'Загрузка...', en: 'Loading...' },
    'groups.no_title': { ru: 'Без названия', en: 'Untitled' },
    'groups.empty_title': { ru: 'Нет групп', en: 'No groups' },
    'groups.empty_text': {
        ru: 'Добавьте бота в свою группу через кнопку выше',
        en: 'Add the bot to your group using the button above',
    },
    'groups.locked_title': { ru: 'Откройте через Telegram', en: 'Open via Telegram' },
    'groups.locked_text': {
        ru: 'Для просмотра групп откройте приложение из бота',
        en: 'To view groups, open the app from the bot',
    },
    'groups.error_title': { ru: 'Не удалось загрузить', en: 'Failed to load' },

    'modal.title_default': { ru: 'Группа', en: 'Group' },
    'modal.added': { ru: 'Добавлена', en: 'Added' },
    'modal.type': { ru: 'Тип', en: 'Type' },
    'modal.type_group': { ru: 'Группа', en: 'Group' },
    'modal.type_supergroup': { ru: 'Супергруппа', en: 'Supergroup' },
    'modal.type_channel': { ru: 'Канал', en: 'Channel' },
    'modal.unknown': { ru: 'неизвестно', en: 'unknown' },

    'modal.stat_deleted': { ru: 'Удалено', en: 'Deleted' },
    'modal.stat_bans': { ru: 'Банов', en: 'Bans' },
    'modal.stat_violations': { ru: 'Нарушений', en: 'Violations' },

    'modal.chart_title': { ru: '📊 Активность за 30 дней', en: '📊 Activity for 30 days' },
    'modal.chart_no_data': { ru: 'Нет данных', en: 'No data' },
    'modal.chart_error': { ru: 'Не удалось загрузить', en: 'Failed to load' },

    'modal.btn_open_group': { ru: '🚪 Открыть группу', en: '🚪 Open group' },
    'modal.btn_open_channel': { ru: '📢 Открыть канал', en: '📢 Open channel' },

    'chart.deleted': { ru: '🗑 Удалено', en: '🗑 Deleted' },
    'chart.bans': { ru: '⚖️ Баны', en: '⚖️ Bans' },
    'chart.violations': { ru: '⚠️ Нарушения', en: '⚠️ Violations' },
};

// ===== ОПРЕДЕЛЕНИЕ ЯЗЫКА =====
function detectLanguage() {
    const saved = localStorage.getItem('lang');
    if (saved === 'ru' || saved === 'en') return saved;

    const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
    if (tgLang && tgLang.toLowerCase().startsWith('en')) return 'en';
    if (tgLang && tgLang.toLowerCase().startsWith('ru')) return 'ru';

    const browserLang = (navigator.language || 'ru').toLowerCase();
    if (browserLang.startsWith('en')) return 'en';

    return 'ru';
}

let currentLang = detectLanguage();

function t(key, params = {}) {
    const entry = TRANSLATIONS[key];
    if (!entry) {
        console.warn(`i18n: missing key "${key}"`);
        return key;
    }
    let text = entry[currentLang] || entry.ru || key;
    Object.keys(params).forEach(k => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
    });
    return text;
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        const btnLang = btn.getAttribute('data-lang');
        btn.classList.toggle('active', btnLang === currentLang);
    });
}

// ===== СМЕНА ЯЗЫКА =====
async function setLanguage(lang, syncToApi = true) {
    if (lang !== 'ru' && lang !== 'en') return;
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    applyTranslations();

    // Синк в API (чтобы бот подхватил)
    if (syncToApi && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
        try {
            await fetch(`${API_BASE}/api/user/set_lang`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: window.Telegram.WebApp.initDataUnsafe.user.id,
                    locale: lang,
                }),
            });
        } catch (e) {
            console.warn('Failed to sync lang to API:', e);
        }
    }
}

window.t = t;
window.setLanguage = setLanguage;
window.applyTranslations = applyTranslations;
window.currentLang = () => currentLang;
