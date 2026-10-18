// ===== MINI APP i18n =====
const TRANSLATIONS = {
    'app.title': { ru: 'ANTI_SPAM Bot', en: 'ANTI_SPAM Bot' },
    'app.subtitle': { ru: 'Защита групп от спама и рекламы', en: 'Protection from spam and ads' },

    // ===== Админ-панель =====
    'admin.button_title': { ru: 'Админ-панель', en: 'Admin panel' },
    'admin.title': { ru: 'Админ-панель', en: 'Admin panel' },
    'admin.subtitle': {
        ru: 'Скоро здесь появятся инструменты управления',
        en: 'Management tools coming soon'
    },
    'admin.tab_summary': { ru: '📊 Сводка', en: '📊 Summary' },
    'admin.tab_bans': { ru: '🚫 Баны', en: '🚫 Bans' },
    'admin.tab_violators': { ru: '🔨 Наруш.', en: '🔨 Viol.' },
    'admin.tab_deleted': { ru: '🗑 Удал.', en: '🗑 Del.' },
    'admin.tab_roles': { ru: '👑 Роли', en: '👑 Roles' },
    'admin.no_data': { ru: 'Нет данных', en: 'No data' },
    'admin.error': { ru: 'Ошибка загрузки', en: 'Load error' },
    'admin.actions': { ru: 'Действия', en: 'Actions' },
    'admin.unban': { ru: '🔓 Разбанить', en: '🔓 Unban' },
    'admin.reset': { ru: '♻️ Сбросить', en: '♻️ Reset' },
    'admin.remove': { ru: '❌ Снять', en: '❌ Remove' },
    'admin.confirm_unban': { ru: 'Разбанить пользователя?', en: 'Unban user?' },
    'admin.confirm_reset': { ru: 'Сбросить счётчик нарушений?', en: 'Reset violation counter?' },
    'admin.confirm_remove': { ru: 'Удалить роль?', en: 'Remove role?' },
    'admin.action_sent': { ru: '✅ Команда отправлена боту', en: '✅ Command sent to bot' },
    'admin.action_wait': { ru: 'Применится в течение 30 секунд', en: 'Applies within 30 seconds' },
    'admin.soon': { ru: '🚧 В разработке', en: '🚧 Coming soon' },
    'admin.soon_hint': {
        ru: 'В следующем обновлении: список банов, нарушителей, удалённых сообщений, управление админами.',
        en: 'Coming next: list of bans, violators, deleted messages, admin management.'
    },
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
    'groups.add_to_group': { ru: 'Добавить в группу', en: 'Add to group' },
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

    'modal.chart_title_7': { ru: '📊 Активность за 7 дней', en: '📊 Activity for 7 days' },
    'modal.chart_title_30': { ru: '📊 Активность за 30 дней', en: '📊 Activity for 30 days' },
    'modal.chart_title_90': { ru: '📊 Активность за 90 дней', en: '📊 Activity for 90 days' },
    'modal.chart_days_7': { ru: '7 дней', en: '7 days' },
    'modal.chart_days_30': { ru: '30 дней', en: '30 days' },
    'modal.chart_days_90': { ru: '90 дней', en: '90 days' },
    'modal.chart_no_data': { ru: 'Нет данных', en: 'No data' },
    'modal.chart_error': { ru: 'Не удалось загрузить', en: 'Failed to load' },

    // ===== Настройки модерации =====
    'settings.title': { ru: '⚙️ Настройки модерации', en: '⚙️ Moderation settings' },
    'settings.moderation': { ru: '🛡️ Модерация', en: '🛡️ Moderation' },
    'settings.moderation_desc': { ru: 'Удалять спам, рекламу, 18+', en: 'Remove spam, ads, 18+' },
    'settings.antiflood': { ru: '🌊 Антифлуд', en: '🌊 Antiflood' },
    'settings.antiflood_desc': { ru: 'Мут за флуд', en: 'Mute for flooding' },
    'settings.ocr': { ru: '📸 OCR фото/видео', en: '📸 OCR photo/video' },
    'settings.ocr_desc': { ru: 'Читать текст с картинок', en: 'Read text from images' },
    'settings.hint': { ru: 'Изменения применяются в течение 30 секунд', en: 'Changes apply within 30 seconds' },
    'settings.applying': { ru: '⏳ Применяется...', en: '⏳ Applying...' },
    'settings.error': { ru: 'Ошибка', en: 'Error' },
    'settings.no_access': { ru: 'Откройте через Telegram', en: 'Open via Telegram' },

    // ===== Ghost mode =====
    'settings.ghost': { ru: '👻 Призрачный режим', en: '👻 Ghost mode' },
    'settings.ghost_desc': { ru: 'Автоудаление сообщений', en: 'Auto-delete messages' },
    'settings.ghost_help_title': { ru: '👻 Что такое призрачный режим?', en: '👻 What is ghost mode?' },
    'settings.ghost_help_body': {
        ru: '<b>Все сообщения в группе будут автоматически удаляться через N секунд после отправки.</b>\n\n' +
            '<b>Зачем это нужно:</b>\n' +
            '• 👥 Группы для знакомств, флирта — без истории\n' +
            '• 🎉 Временные чаты (мероприятия, конференции)\n' +
            '• 🔒 Приватные обсуждения без следов\n' +
            '• 🧹 Чистка сервисных уведомлений (вход/выход)\n\n' +
            '<b>Что важно знать:</b>\n' +
            '• 📸 Скриншоты никто не отменял\n' +
            '• 📵 Если человек оффлайн — увидит только push\n' +
            '• 🛡 Бот должен быть админом с правом удалять\n' +
            '• ⏱ Минимум 10 сек, максимум 1 час\n\n' +
            '<b>Пример:</b> timeout = 60 сек → сообщение исчезнет через минуту.',
        en: '<b>All messages in the group will be auto-deleted N seconds after posting.</b>\n\n' +
            '<b>Why you might need it:</b>\n' +
            '• 👥 Dating, flirt chats — no history\n' +
            '• 🎉 Temporary chats (events, conferences)\n' +
            '• 🔒 Private discussions without traces\n' +
            '• 🧹 Cleaning service notifications (join/leave)\n\n' +
            '<b>Important to know:</b>\n' +
            '• 📸 Screenshots are still possible\n' +
            '• 📵 If user is offline — only push notification\n' +
            '• 🛡 Bot must be admin with delete permission\n' +
            '• ⏱ Min 10 sec, max 1 hour\n\n' +
            '<b>Example:</b> timeout = 60 sec → message disappears after a minute.'
    },
    'settings.ghost_trigger': { ru: 'Что удалять', en: 'What to delete' },
    'settings.ghost_trigger_all': { ru: 'Все сообщения', en: 'All messages' },
    'settings.ghost_trigger_links': { ru: 'Только ссылки', en: 'Only links' },
    'settings.ghost_trigger_text': { ru: 'Только текст', en: 'Only text' },
    'settings.ghost_trigger_media': { ru: 'Только медиа', en: 'Only media' },
    'settings.ghost_timeout': { ru: '⏱ Удалять через:', en: '⏱ Delete after:' },
    'settings.ghost_hours': { ru: 'ч', en: 'h' },
    'settings.ghost_mins': { ru: 'мин', en: 'm' },
    'settings.ghost_seconds': { ru: 'секунд', en: 'seconds' },
    'settings.ghost_delete_all': { ru: 'Что удалять:', en: 'What to delete:' },
    'settings.ghost_all': { ru: 'Все сообщения', en: 'All messages' },
    'settings.ghost_service': { ru: 'Только сервисные (вход/выход)', en: 'Only service (join/leave)' },
    'settings.ghost_save': { ru: '💾 Сохранить', en: '💾 Save' },
    'settings.ghost_saved': { ru: '✅ Сохранено', en: '✅ Saved' },
    'common.close': { ru: 'Закрыть', en: 'Close' },

    // ===== Кастомные тексты =====
    'custom_texts.title': { ru: '✏️ Тексты модерации', en: '✏️ Moderation texts' },
    'custom_texts.hint': {
        ru: 'Настройте сообщения бота под стиль вашей группы',
        en: 'Customize bot messages for your group style'
    },
    'custom_texts.open': { ru: '✏️ Настроить тексты', en: '✏️ Configure texts' },
    'custom_texts.modal_title': { ru: 'Тексты модерации', en: 'Moderation texts' },
    'custom_texts.modal_subtitle': {
        ru: 'Сообщения будут отправляться от имени бота',
        en: 'Messages will be sent on behalf of the bot'
    },
    'custom_texts.placeholder_default': {
        ru: 'По умолчанию — стандартный текст бота',
        en: 'Default — standard bot text'
    },
    'custom_texts.save': { ru: '💾 Сохранить', en: '💾 Save' },
    'custom_texts.reset': { ru: '♻️ Сбросить', en: '♻️ Reset' },
    'custom_texts.saved': { ru: '✅ Сохранено', en: '✅ Saved' },
    'custom_texts.reset_done': { ru: '♻️ Сброшено на стандарт', en: '♻️ Reset to default' },
    'custom_texts.applying': { ru: '⏳ Применяется...', en: '⏳ Applying...' },
    'custom_texts.error': { ru: 'Ошибка', en: 'Error' },
    'custom_texts.empty': { ru: 'Ничего не настроено', en: 'Nothing configured' },

    // Названия полей
    'custom_texts.label_public_warn': { ru: '⚠️ Предупреждение в группе', en: '⚠️ Warning in group' },
    'custom_texts.label_mute': { ru: '🔇 Публичный мут', en: '🔇 Public mute' },
    'custom_texts.label_ban': { ru: '🚫 Публичный бан', en: '🚫 Public ban' },
    'custom_texts.label_perm_ban': { ru: '⛔ Постоянный бан', en: '⛔ Permanent ban' },
    'custom_texts.label_dm_text': { ru: '📩 ЛС предупреждение', en: '📩 DM warning' },
    'custom_texts.label_flood_muted': { ru: '🌊 Мут за флуд', en: '🌊 Flood mute' },
    'custom_texts.label_flood_cumulative': { ru: '🌊 Мут за склейку', en: '🌊 Cumulative flood mute' },
    'custom_texts.label_welcome': { ru: '👋 Приветствие', en: '👋 Welcome' },
    'custom_texts.hint_welcome': { ru: 'Доступно: {name}, {chat_title}', en: 'Available: {name}, {chat_title}' },
    'custom_texts.label_flood_mass_spam': { ru: '📢 Массовая рассылка', en: '📢 Mass spam' },

    // Подсказки про плейсхолдеры
    'custom_texts.hint_name': { ru: 'Переменные: {name}, {duration}, {until}', en: 'Vars: {name}, {duration}, {until}' },
    'custom_texts.hint_dm': { ru: 'Переменные: {chat_title}, {reason}', en: 'Vars: {chat_title}, {reason}' },
    'custom_texts.hint_flood': { ru: 'Переменные: {user}, {minutes}', en: 'Vars: {user}, {minutes}' },
    'custom_texts.hint_mass_spam': { ru: 'Переменные: {username}, {days}', en: 'Vars: {username}, {days}' },

    'modal.btn_open_group': { ru: '🚪 Открыть группу', en: '🚪 Open group' },
    'modal.btn_open_channel': { ru: '📢 Открыть канал', en: '📢 Open channel' },

    'chart.deleted': { ru: '🗑 Удалено', en: '🗑 Deleted' },
    'chart.bans': { ru: '⚖️ Баны', en: '⚖️ Bans' },
    'chart.violations': { ru: '⚠️ Нарушения', en: '⚠️ Violations' },
        // Категории для пирога
    'categories.title': { ru: '📊 Категории нарушений', en: '📊 Violation categories' },
    'categories.no_data': { ru: 'Нет данных', en: 'No data' },
    'categories.error': { ru: 'Не удалось загрузить', en: 'Failed to load' },

    'cat.drugs': { ru: '🚨 Наркотики', en: '🚨 Drugs' },
    'cat.job': { ru: '💼 Спам-работа', en: '💼 Spam-job' },
    'cat.porn': { ru: '🔞 Порнография', en: '🔞 Porn' },
    'cat.links': { ru: '🔗 Ссылки/контакты', en: '🔗 Links/contacts' },
    'cat.rules': { ru: '⚠️ Нарушение правил', en: '⚠️ Rules violation' },
    'cat.contact': { ru: '📇 Контакты', en: '📇 Contacts' },
    'cat.flood': { ru: '🌊 Флуд', en: '🌊 Flood' },
    'cat.mass_spam': { ru: '🚫 Массовая рассылка', en: '🚫 Mass spam' },
    'cat.other': { ru: '❓ Прочее', en: '❓ Other' },
        // Топ нарушителей
    'violators.title': { ru: '🏆 Топ нарушителей', en: '🏆 Top violators' },
    'violators.empty_title': { ru: 'Все чисто! 🎉', en: 'All clean! 🎉' },
    'violators.empty_text': { ru: 'В этой группе пока нет нарушителей. Отличная работа!', en: 'No violators in this group yet. Great job!' },
    'violators.no_data': { ru: 'Нарушителей нет', en: 'No violators' },
    'violators.error': { ru: 'Не удалось загрузить', en: 'Failed to load' },
    'violators.count': { ru: '{n} наруш.', en: '{n} viol.' },
    'violators.no_name': { ru: 'Без имени', en: 'No name' },

    // Footer + Landing link
    'footer.about': { ru: '🌐 О боте', en: '🌐 About the bot' },
    'groups.learn_more': { ru: '🌐 Узнать больше о боте', en: '🌐 Learn more about the bot' },
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
