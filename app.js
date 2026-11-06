'use strict';

const DEFAULT_MODEL = 'google/gemini-3.8-flash';
const CASE_VERSION = 2;
const MAX_CRED = 5;
const LS_KEY = 'aa_openrouter_key';
const LS_MODEL = 'aa_openrouter_model';
const LS_PROVIDER = 'aa_provider';
const LS_GAME = 'aa_game';
const LS_DIFFICULTY = 'aa_difficulty';
const DEFAULT_DIFFICULTY = 'normal';
const LS_LANG = 'aa_lang';
const DEFAULT_LANG = 'ru';
const LANGS = ['ru', 'en'];
const LANG_TAG = { ru: 'ru', en: 'en-GB' };
const PROVIDERS = ['openrouter', 'agent'];
const DEFAULT_PROVIDER = 'openrouter';

const DIFFICULTIES = {
  easy: { key: 'easy', evidence: [6, 7], rounds: [4, 5], witnesses: [2, 3] },
  normal: { key: 'normal', evidence: [8, 9], rounds: [5, 6], witnesses: [3, 4] },
  hard: { key: 'hard', evidence: [10, 12], rounds: [6, 7], witnesses: [4, 5] },
};

const I18N = {
  ru: {
    'brand.subtitle': 'суд идёт здесь и сейчас',
    'lang.label': 'Язык',

    'setup.title': 'Новое дело',
    'setup.lead': 'Два игрока за одним экраном: прокурор и защита. Выбери сложность логики — от короткого дела до паутины алиби. В конце ИИ-судья вынесет вердикт.',
    'setup.provider': 'Источник ИИ',
    'provider.openrouter.label': 'OpenRouter',
    'provider.openrouter.short': 'Свой ключ, запросы напрямую из браузера.',
    'provider.agent.label': 'Локальный агент',
    'provider.agent.short': 'opencode через локальный сервер, ключ не нужен.',
    'setup.agentNotice': 'Запусти <code>python3 agent_server.py</code> и открой <code>http://127.0.0.1:8000</code>. Агент сам придумает дело, ответит за свидетеля и вынесет вердикт.',
    'setup.agentHint': 'Модель задаёт agent_server.py; по умолчанию opencode/big-pickle.',
    'setup.checkAgent': 'Проверить агента',
    'setup.key': 'Ключ OpenRouter',
    'setup.notice': 'Ключ хранится только в этом браузере (localStorage) и уходит напрямую в OpenRouter. Не сохраняй его на чужом компьютере.',
    'setup.model': 'Модель',
    'setup.theme': 'Тема или зацепка',
    'setup.optional': '(необязательно)',
    'setup.themePlaceholder': 'например: отравление в театре',
    'setup.difficulty': 'Сложность логики',
    'setup.generate': 'Сгенерировать дело',
    'setup.save': 'Сохранить ключ',
    'setup.saveAgent': 'Сохранить настройки',
    'setup.back': 'Вернуться к делу',
    'setup.footer': 'Фан-проект по мотивам Ace Attorney. Все дела вымышлены.',

    'diff.easy.label': 'Новичок',
    'diff.easy.short': '6–7 улик, 4–5 раундов, 2–3 свидетеля. Один ложный след.',
    'diff.easy.logic': 'Одна ясная цепочка улик и 1–2 ложных следа. Виновник не очевиден, но вычисляется по одной нестыковке.',
    'diff.normal.label': 'Детектив',
    'diff.normal.short': '8–9 улик, 5–6 раундов, 3–4 свидетеля. Несколько мотивов.',
    'diff.normal.logic': '2–3 ложных следа, у нескольких свидетелей есть мотив, алиби противоречат друг другу. Истина собирается из 2 улик и показаний.',
    'diff.hard.label': 'Мастер',
    'diff.hard.short': '10–12 улик, 6–7 раундов, 4–5 свидетелей. Паутина алиби.',
    'diff.hard.logic': '3–4 ложных следа, несколько мотивов и алиби, истина требует сопоставить 2–3 улики. Виновник не должен быть очевиден по роли или поведению.',

    'loading.writer': 'Сценарист придумывает дело',
    'loading.editor': 'Редактор проверяет улики и противоречия',
    'loading.repair': 'Сценарист исправляет противоречия',
    'loading.judge': 'Судья изучает материалы',
    'loading.verdict': 'Судья удаляется для вынесения вердикта',
    'loading.note': 'Обычно это занимает 10–30 секунд.',
    'loading.noteAgent': 'В режиме агента это может занять до нескольких минут.',
    'loading.elapsed': 'Прошло {n} с.',

    'meters.cred': 'Доверие суда',
    'meters.broken': 'Опровергнуто',
    'meters.misses': 'Промахи',
    'meters.hints': 'Подсказки',
    'play.evidence': 'Улики',

    'file.tag': 'Материалы дела',
    'file.defendant': 'Подсудимый',
    'file.victim': 'Потерпевший',
    'file.difficulty': 'Сложность',
    'file.witnesses': 'Свидетели · {n}',

    'round.badge': 'Раунд {n} / {total}',
    'round.defence': 'Слово защите',
    'round.prosecution': 'Слово обвинению',
    'role.prosecution': 'Прокурор',
    'role.defence': 'Защита',
    'role.witness': 'Свидетель',
    'witness.who': 'Свидетель · {name}',

    'press.button': 'Надавить на свидетеля',
    'press.done': 'Свидетель допрошен',
    'press.hint': 'Бесплатно. Свидетель может проговориться о важном.',
    'press.reveal': 'При давлении',
    'breakdown.title': 'Противоречие вскрыто.',

    'form.argument': 'Возражение защиты',
    'form.argumentPlaceholder': 'Что не сходится в словах прокурора или свидетеля?',
    'form.evidence': 'Предъявить улику',
    'form.noEvidence': '— без улики —',
    'form.missNote': 'Неверная улика стоит 1 доверия и не продвигает раунд.',
    'form.missAfter': 'Улика не относится к утверждению. Доверие суда −1, раунд продолжается.',
    'hint.button': 'Подсказка судьи −1 ⚡',
    'hint.line': 'Судья намекает: «{name}».',
    'hint.silent': 'Судья хранит молчание.',
    'form.objection': 'OBJECTION!',
    'form.rebuttal': 'Реплика прокурора',
    'form.rebuttalOptional': '(можно оставить пустой)',
    'form.rebuttalPlaceholder': 'Чем прокурор парирует возражение?',
    'form.continue': 'Продолжить',
    'form.nextHint': 'Дальше — следующий раунд или вердикт.',

    'round.ctaTitle': 'Прения окончены',
    'round.ctaText': 'Судья готов вынести вердикт. Последний шанс перечитать протокол.',
    'round.verdictButton': 'Передать слово суду',

    'protocol.title': 'Протокол прений · {n}',
    'protocol.roundShort': 'Р{n}',
    'entry.evidence': 'Улика: {name}',
    'entry.broken': ' — утверждение опровергнуто',
    'entry.silentProsecution': 'Прокурор промолчал.',
    'witness.typing': 'Подбирает слова',
    'confirm.newCase': 'Начать новое дело? Текущее дело и протокол будут потеряны.',

    'verdict.guilty': 'ВИНОВЕН',
    'verdict.notGuilty': 'НЕВИНОВЕН',
    'verdict.stampLabel': 'вердикт',
    'verdict.decisive': 'Решающая улика: {name}',
    'verdict.statsBroken': '{done} из {total} утверждений опровергнуто',
    'verdict.statsMisses': 'промахов уликами',
    'verdict.statsHints': 'подсказок судьи',
    'verdict.truthTag': 'Истина',
    'verdict.truthTitle': 'Что произошло на самом деле',
    'verdict.truthGuilty': 'По истине подсудимый действительно виновен.',
    'verdict.truthInnocent': 'По истине подсудимый невиновен.',
    'verdict.culprit': 'Настоящий виновник: {name}',
    'verdict.newCase': 'Новое дело',
    'verdict.defaultGuilty': 'Виновен',
    'verdict.defaultNotGuilty': 'Невиновен',
    'verdict.defaultReasoning': 'Судья не стал объяснять решение.',

    'action.settings': 'Ключ и модель',
    'action.newCase': 'Новое дело',

    'toast.saved': 'Ключ и модель сохранены.',
    'toast.agentSaved': 'Режим локального агента сохранён.',
    'toast.agentOk': 'Агент на связи: {agent}.',
    'toast.agentFail': 'Агент недоступен: {detail}',
    'toast.key': 'Вставь ключ OpenRouter.',
    'toast.argument': 'Напиши возражение.',
    'toast.miss': 'Улика не бьёт по утверждению. Доверие суда −1.',
    'toast.broken': 'Противоречие вскрыто: {name}.',
    'toast.press': 'Свидетель добавил новое показание.',
    'toast.generateFailed': 'Не получилось сгенерировать дело.',
    'toast.continueFailed': 'Не получилось продолжить прения.',
    'toast.verdictFailed': 'Судья не смог вынести вердикт.',

    'collapse.headline': 'Защита потеряла доверие суда',
    'collapse.reasoning': 'Защита слишком часто предъявляла улики, не относящиеся к утверждению обвинения. Суд прекращает прения и выносит обвинительный вердикт.',

    'error.nokey': 'Нет ключа OpenRouter.',
    'error.timeout': 'Запрос к ИИ занял слишком много времени. Попробуй ещё раз или выбери другую модель.',
    'error.agent': 'Локальный агент не ответил ({detail}). Запусти python3 agent_server.py и открой игру через http://127.0.0.1:8000.',
    'error.agentEmpty': 'Локальный агент вернул пустой ответ.',
    'error.batch': 'Модель с суффиксом :batch не отвечает в реальном времени. Убери :batch из названия модели.',
    'error.network': 'Нет связи с OpenRouter ({detail}). Проверь интернет, VPN/прокси и блокировщик рекламы. Если открываешь index.html двойным кликом, запусти локальный сервер: python3 -m http.server 8000.',
    'error.status401': 'OpenRouter отклонил ключ (401). Проверь ключ.',
    'error.status402': 'На ключе OpenRouter закончились средства (402).',
    'error.status429': 'OpenRouter просит подождать: слишком много запросов (429).',
    'error.http': 'OpenRouter {status}: {detail}',
    'error.provider': 'OpenRouter: {detail}',
    'error.refusal': 'Модель отказалась отвечать: {detail}',
    'error.filter': 'Провайдер заблокировал ответ (content_filter). Переформулируй тему дела.',
    'error.empty': 'Модель вернула пустой ответ{finish}{reasoning}. Скорее всего, reasoning-модель потратила весь лимит на размышления. Выбери flash-модель или модель без reasoning.',
    'error.noJson': 'в ответе нет JSON',
    'error.case': 'Модель не собрала дело: {detail}',
    'error.verdict': 'судья не вынес вердикт',
    'validation.empty': 'пустой объект',
    'validation.missing': 'не хватает title/charge/summary/truth',
    'validation.evidence': 'нужно {range}',
    'validation.witnesses': 'нужно {range}',
    'validation.round': 'раунд {n} заполнен не полностью',
    'validation.links': 'раунд {n} не ссылается на улику из списка',
    'validation.rounds': 'нужно {range}',

    'modal.photo': 'Фото',
    'modal.close': 'Закрыть',
    'evidence.forensic.name': 'Заключение судмедэксперта',
    'evidence.forensic.description': 'Судебно-медицинское освидетельствование: врач зафиксировал состояние потерпевшего и время осмотра. Выводы приобщены к материалам дела.',
  },
  en: {
    'brand.subtitle': 'court is now in session',
    'lang.label': 'Language',

    'setup.title': 'New case',
    'setup.lead': 'Two players share one screen: prosecution and defence. Choose how deep the logic goes — from a short case to a web of alibis. The AI judge delivers the verdict at the end.',
    'setup.provider': 'AI source',
    'provider.openrouter.label': 'OpenRouter',
    'provider.openrouter.short': 'Your own key, requests straight from the browser.',
    'provider.agent.label': 'Local agent',
    'provider.agent.short': 'opencode through a local server, no key needed.',
    'setup.agentNotice': 'Run <code>python3 agent_server.py</code> and open <code>http://127.0.0.1:8000</code>. The agent will invent the case, answer for the witness and deliver the verdict.',
    'setup.agentHint': 'The model is set by agent_server.py; opencode/big-pickle by default.',
    'setup.checkAgent': 'Check the agent',
    'setup.key': 'OpenRouter key',
    'setup.notice': 'The key is stored only in this browser (localStorage) and goes straight to OpenRouter. Do not save it on a shared computer.',
    'setup.model': 'Model',
    'setup.theme': 'Theme or hook',
    'setup.optional': '(optional)',
    'setup.themePlaceholder': 'e.g. a poisoning at the theatre',
    'setup.difficulty': 'Depth of the logic',
    'setup.generate': 'Generate case',
    'setup.save': 'Save key',
    'setup.saveAgent': 'Save settings',
    'setup.back': 'Back to the case',
    'setup.footer': 'A fan project inspired by Ace Attorney. All cases are fictional.',

    'diff.easy.label': 'Beginner',
    'diff.easy.short': '6–7 pieces of evidence, 4–5 rounds, 2–3 witnesses. One false lead.',
    'diff.easy.logic': 'One clear chain of evidence and 1–2 false leads. The culprit is not obvious, but one inconsistency gives them away.',
    'diff.normal.label': 'Detective',
    'diff.normal.short': '8–9 pieces of evidence, 5–6 rounds, 3–4 witnesses. Several motives.',
    'diff.normal.logic': '2–3 false leads; several witnesses have a motive and their alibis contradict one another. The truth is assembled from 2 pieces of evidence and the testimony.',
    'diff.hard.label': 'Master',
    'diff.hard.short': '10–12 pieces of evidence, 6–7 rounds, 4–5 witnesses. A web of alibis.',
    'diff.hard.logic': '3–4 false leads, several motives and alibis; the truth requires comparing 2–3 pieces of evidence. The culprit must not be obvious from their role or behaviour.',

    'loading.writer': 'The writer is inventing a case',
    'loading.editor': 'The editor is checking evidence and contradictions',
    'loading.repair': 'The writer is fixing contradictions',
    'loading.judge': 'The judge is studying the case file',
    'loading.verdict': 'The judge has retired to reach a verdict',
    'loading.note': 'This usually takes 10–30 seconds.',
    'loading.noteAgent': 'In agent mode this can take a few minutes.',
    'loading.elapsed': '{n}s elapsed.',

    'meters.cred': 'Credibility',
    'meters.broken': 'Disproved',
    'meters.misses': 'Mistakes',
    'meters.hints': 'Hints',
    'play.evidence': 'Evidence',

    'file.tag': 'Case file',
    'file.defendant': 'Defendant',
    'file.victim': 'Victim',
    'file.difficulty': 'Difficulty',
    'file.witnesses': 'Witnesses · {n}',

    'round.badge': 'Round {n} / {total}',
    'round.defence': 'The defence speaks',
    'round.prosecution': 'The prosecution speaks',
    'role.prosecution': 'Prosecution',
    'role.defence': 'Defence',
    'role.witness': 'Witness',
    'witness.who': 'Witness · {name}',

    'press.button': 'Press the witness',
    'press.done': 'Witness pressed',
    'press.hint': 'Free. The witness may let something slip.',
    'press.reveal': 'Under pressure',
    'breakdown.title': 'Contradiction exposed.',

    'form.argument': 'Defence objection',
    'form.argumentPlaceholder': 'What does not add up in the prosecution’s or the witness’s words?',
    'form.evidence': 'Present evidence',
    'form.noEvidence': '— no evidence —',
    'form.missNote': 'Wrong evidence costs 1 credibility and does not advance the round.',
    'form.missAfter': 'That evidence does not address the claim. Credibility −1; the round continues.',
    'hint.button': 'Judge’s hint −1 ⚡',
    'hint.line': 'The judge hints: “{name}”.',
    'hint.silent': 'The judge stays silent.',
    'form.objection': 'OBJECTION!',
    'form.rebuttal': 'Prosecution reply',
    'form.rebuttalOptional': '(may be left empty)',
    'form.rebuttalPlaceholder': 'How does the prosecution answer the objection?',
    'form.continue': 'Continue',
    'form.nextHint': 'Next comes the following round or the verdict.',

    'round.ctaTitle': 'Arguments are over',
    'round.ctaText': 'The judge is ready to rule. One last chance to reread the record.',
    'round.verdictButton': 'Give the floor to the court',

    'protocol.title': 'Record of proceedings · {n}',
    'protocol.roundShort': 'R{n}',
    'entry.evidence': 'Evidence: {name}',
    'entry.broken': ' — claim disproved',
    'entry.silentProsecution': 'The prosecution said nothing.',
    'witness.typing': 'Choosing words',
    'confirm.newCase': 'Start a new case? The current case and the record will be lost.',

    'verdict.guilty': 'GUILTY',
    'verdict.notGuilty': 'NOT GUILTY',
    'verdict.stampLabel': 'verdict',
    'verdict.decisive': 'Decisive evidence: {name}',
    'verdict.statsBroken': '{done} of {total} claims disproved',
    'verdict.statsMisses': 'evidence mistakes',
    'verdict.statsHints': 'judge’s hints',
    'verdict.truthTag': 'The truth',
    'verdict.truthTitle': 'What really happened',
    'verdict.truthGuilty': 'In truth, the defendant really is guilty.',
    'verdict.truthInnocent': 'In truth, the defendant is innocent.',
    'verdict.culprit': 'The real culprit: {name}',
    'verdict.newCase': 'New case',
    'verdict.defaultGuilty': 'Guilty',
    'verdict.defaultNotGuilty': 'Not guilty',
    'verdict.defaultReasoning': 'The judge declined to explain the ruling.',

    'action.settings': 'Key and model',
    'action.newCase': 'New case',

    'toast.saved': 'Key and model saved.',
    'toast.agentSaved': 'Local agent mode saved.',
    'toast.agentOk': 'Agent is reachable: {agent}.',
    'toast.agentFail': 'Agent is unreachable: {detail}',
    'toast.key': 'Enter your OpenRouter key.',
    'toast.argument': 'Write an objection.',
    'toast.miss': 'That evidence does not touch the claim. Credibility −1.',
    'toast.broken': 'Contradiction exposed: {name}.',
    'toast.press': 'The witness adds a new statement.',
    'toast.generateFailed': 'Could not generate a case.',
    'toast.continueFailed': 'Could not continue the proceedings.',
    'toast.verdictFailed': 'The judge could not deliver a verdict.',

    'collapse.headline': 'The defence has lost the court’s trust',
    'collapse.reasoning': 'The defence repeatedly presented evidence that had nothing to do with the prosecution’s claims. The court ends the proceedings and returns a guilty verdict.',

    'error.nokey': 'No OpenRouter key.',
    'error.timeout': 'The AI request took too long. Try again or choose another model.',
    'error.agent': 'The local agent did not answer ({detail}). Run python3 agent_server.py and open the game through http://127.0.0.1:8000.',
    'error.agentEmpty': 'The local agent returned an empty response.',
    'error.batch': 'A model with the :batch suffix does not answer in real time. Remove :batch from the model name.',
    'error.network': 'No connection to OpenRouter ({detail}). Check your internet connection, VPN/proxy and any ad blocker. If you opened index.html by double-clicking it, start a local server: python3 -m http.server 8000.',
    'error.status401': 'OpenRouter rejected the key (401). Check the key.',
    'error.status402': 'The OpenRouter key is out of credit (402).',
    'error.status429': 'OpenRouter asks you to wait: too many requests (429).',
    'error.http': 'OpenRouter {status}: {detail}',
    'error.provider': 'OpenRouter: {detail}',
    'error.refusal': 'The model refused to answer: {detail}',
    'error.filter': 'The provider blocked the response (content_filter). Rephrase the case theme.',
    'error.empty': 'The model returned an empty response{finish}{reasoning}. A reasoning model has probably spent the whole budget on hidden thinking. Choose a flash model or one without reasoning.',
    'error.noJson': 'the response contains no JSON',
    'error.case': 'The model could not assemble a case: {detail}',
    'error.verdict': 'the judge did not reach a verdict',
    'validation.empty': 'empty object',
    'validation.missing': 'title/charge/summary/truth are missing',
    'validation.evidence': 'expected {range}',
    'validation.witnesses': 'expected {range}',
    'validation.round': 'round {n} is incomplete',
    'validation.links': 'round {n} does not cite evidence from the list',
    'validation.rounds': 'expected {range}',

    'modal.photo': 'Photo',
    'modal.close': 'Close',
    'evidence.forensic.name': 'Forensic medical report',
    'evidence.forensic.description': 'A forensic medical examination recorded the victim’s condition and the time of the examination. The findings are in the case file.',
  },
};

function tIn(code, key, vars) {
  const pack = I18N[code] || I18N[DEFAULT_LANG];
  const value = pack[key] == null ? I18N[DEFAULT_LANG][key] : pack[key];
  if (value == null) return key;
  if (!vars) return value;
  return String(value).replace(/\{(\w+)\}/g, (match, name) => (
    vars[name] == null ? match : String(vars[name])
  ));
}

function t(key, vars) {
  return tIn(lang, key, vars);
}

function difficultyConfig(value) {
  return DIFFICULTIES[value] || DIFFICULTIES[DEFAULT_DIFFICULTY];
}

function difficultyLabel(value) {
  return t('diff.' + difficultyConfig(value).key + '.label');
}

function difficultyShort(value) {
  return t('diff.' + difficultyConfig(value).key + '.short');
}

function languageRule(value) {
  return value === 'en'
    ? 'Write every text value in British English (en-GB): British spelling and vocabulary (colour, realise, defence, lift, flat, police). Keep JSON keys and formatting exactly as instructed.'
    : 'Пиши по-русски.';
}

const app = document.getElementById('app');
const modal = document.getElementById('modal');
const toast = document.getElementById('toast');

// shortcut: no backend for the OpenRouter mode — the key and the case live in
// this browser's localStorage. ceiling: the key is readable in devtools, one
// case per browser. The optional agent_server.py bridge only proxies AI calls
// and keeps no game state. upgrade: proxy /api through a server that keeps the
// key in env and stores rooms in SQLite when this is hosted for other people.
let state = loadGame();
let busy = false;
let toastTimer = 0;
let reactingRound = -1;
let loadingKey = 'loading.judge';
let loadingTimer = 0;
let loadingStart = 0;
const evidencePositions = new Map();
const evidenceWindows = new Map();
let lastWindowPos = null;
let windowZ = 0;
let dragState = null;

function initialLang() {
  const saved = localStorage.getItem(LS_LANG);
  return LANGS.includes(saved) ? saved : DEFAULT_LANG;
}

let lang = initialLang();
document.documentElement.lang = LANG_TAG[lang];

function currentProvider() {
  const saved = localStorage.getItem(LS_PROVIDER);
  return PROVIDERS.includes(saved) ? saved : DEFAULT_PROVIDER;
}

function isAgentMode() {
  return currentProvider() === 'agent';
}

// The local agent is slower to start but recovers with a retry; the HTTP API
// gets the original, more generous limit.
function aiTimeout(agentSec, httpSec) {
  return isAgentMode() ? agentSec : httpSec;
}

function loadGame() {
  const empty = {
    case: null, round: 0, step: 'defense', transcript: [], images: {}, verdict: null,
    cred: MAX_CRED, misses: 0, hints: 0, pressed: [], hintRound: -1,
  };
  try {
    const raw = JSON.parse(localStorage.getItem(LS_GAME) || 'null');
    if (!raw || !raw.case || raw.case.version !== CASE_VERSION) return empty;
    const game = Object.assign(empty, raw, {
      images: raw.images || {},
      pressed: Array.isArray(raw.pressed) ? raw.pressed : [],
    });
    ensureForensicEvidence(game.case);
    return game;
  } catch (e) {
    return empty;
  }
}

function saveGame() {
  try {
    localStorage.setItem(LS_GAME, JSON.stringify(state));
  } catch (e) {}
}

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function stopLoadingTimer() {
  clearInterval(loadingTimer);
  loadingTimer = 0;
  loadingStart = 0;
}

function render() {
  if (busy) return;
  stopLoadingTimer();
  if (!state.case) return renderSetup();
  if (state.verdict) return renderVerdict();
  renderPlay();
}

function caseLang() {
  return (state.case && state.case.lang) || DEFAULT_LANG;
}

function langSelect() {
  const options = LANGS.map((code) => {
    const label = code === 'ru' ? 'Русский' : 'English (UK)';
    return `<option value="${code}"${code === lang ? ' selected' : ''}>${label}</option>`;
  }).join('');
  return `<select class="lang-select" data-lang aria-label="${esc(t('lang.label'))}">${options}</select>`;
}

function readSetupValues() {
  const form = document.querySelector('form[data-form="generate"]');
  if (!form) return null;
  const checked = document.querySelector('input[name="difficulty"]:checked');
  const provider = document.querySelector('input[name="provider"]:checked');
  return {
    key: (document.getElementById('key') || {}).value || '',
    model: (document.getElementById('model') || {}).value || '',
    theme: (document.getElementById('theme') || {}).value || '',
    difficulty: checked ? checked.value : '',
    provider: provider && PROVIDERS.includes(provider.value) ? provider.value : currentProvider(),
  };
}

function readTurnDraft() {
  const argument = document.getElementById('argument');
  if (!argument) return null;
  const evidence = document.getElementById('evidence');
  return { text: argument.value, evidence: evidence ? evidence.value : '' };
}

function applyTurnDraft(draft) {
  if (!draft) return;
  const argument = document.getElementById('argument');
  if (argument && draft.text) argument.value = draft.text;
  const evidence = document.getElementById('evidence');
  if (evidence && draft.evidence) evidence.value = draft.evidence;
}

function setLang(value) {
  if (!LANGS.includes(value) || value === lang) return;
  const setup = readSetupValues();
  const draft = readTurnDraft();
  lang = value;
  localStorage.setItem(LS_LANG, lang);
  document.documentElement.lang = LANG_TAG[lang];
  if (busy) {
    renderLoading(loadingKey);
    return;
  }
  if (!state.case || setup) {
    renderSetup(setup);
    refreshEvidenceWindows();
    return;
  }
  render();
  applyTurnDraft(draft);
  refreshEvidenceWindows();
}

/* ------------------------------------------------------------------ setup */

function renderSetup(keep) {
  document.body.dataset.screen = 'setup';
  const saved = keep || null;
  const provider = saved && PROVIDERS.includes(saved.provider) ? saved.provider : currentProvider();
  const key = saved && saved.key ? saved.key : (localStorage.getItem(LS_KEY) || '');
  const model = saved && saved.model ? saved.model : (localStorage.getItem(LS_MODEL) || DEFAULT_MODEL);
  const difficulty = difficultyConfig(
    (saved && saved.difficulty) || localStorage.getItem(LS_DIFFICULTY) || DEFAULT_DIFFICULTY
  ).key;
  const theme = saved ? saved.theme : '';
  const back = state.case
    ? `<button class="btn ghost" type="button" data-action="back">${t('setup.back')}</button>`
    : '';
  const providerCards = PROVIDERS.map((p) => `
    <label class="diff-card">
      <input type="radio" name="provider" value="${p}"${p === provider ? ' checked' : ''}>
      <span class="diff-text">
        <b>${t('provider.' + p + '.label')}</b>
        <span>${t('provider.' + p + '.short')}</span>
      </span>
    </label>`).join('');
  const difficultyCards = Object.values(DIFFICULTIES).map((d) => `
    <label class="diff-card">
      <input type="radio" name="difficulty" value="${d.key}"${d.key === difficulty ? ' checked' : ''}>
      <span class="diff-text">
        <b>${t('diff.' + d.key + '.label')}</b>
        <span>${t('diff.' + d.key + '.short')}</span>
      </span>
    </label>`).join('');
  const aiFields = provider === 'agent'
    ? `<p class="notice">${t('setup.agentNotice')}</p>
       <p class="hint">${t('setup.agentHint')}</p>
       <div class="actions"><button class="btn ghost" type="button" data-action="check-agent">${t('setup.checkAgent')}</button></div>`
    : `<label for="key">${t('setup.key')}</label>
       <input id="key" name="key" type="password" autocomplete="off" spellcheck="false" value="${esc(key)}" placeholder="sk-or-v1-...">
       <p class="notice">${t('setup.notice')}</p>`;
  const modelField = provider === 'agent' ? '' : `<div>
              <label for="model">${t('setup.model')}</label>
              <input id="model" name="model" list="model-list" value="${esc(model)}" spellcheck="false">
              <datalist id="model-list"></datalist>
            </div>`;
  app.innerHTML = `
    <div class="shell shell-narrow">
      <header class="topbar">
        <div class="brand">⚖ Ace Attorney <span>Offline</span><small>${t('brand.subtitle')}</small></div>
        <div class="actions">${langSelect()}</div>
      </header>
      <section class="panel">
        <h1 class="display">${t('setup.title')}</h1>
        <p class="lead">${t('setup.lead')}</p>
        <form data-form="generate">
          <fieldset class="difficulty">
            <legend>${t('setup.provider')}</legend>
            <div class="difficulty-grid">${providerCards}</div>
          </fieldset>
          ${aiFields}
          <div class="row${provider === 'agent' ? ' single' : ''}">
            ${modelField}
            <div>
              <label for="theme">${t('setup.theme')} <span class="muted">${t('setup.optional')}</span></label>
              <input id="theme" name="theme" value="${esc(theme)}" placeholder="${t('setup.themePlaceholder')}">
            </div>
          </div>
          <fieldset class="difficulty">
            <legend>${t('setup.difficulty')}</legend>
            <div class="difficulty-grid">${difficultyCards}</div>
          </fieldset>
          <div class="actions">
            <button class="btn primary" type="submit">${t('setup.generate')}</button>
            <button class="btn ghost" type="button" data-action="save-settings">${provider === 'agent' ? t('setup.saveAgent') : t('setup.save')}</button>
            ${back}
          </div>
        </form>
      </section>
      <p class="footer-note">${t('setup.footer')}</p>
    </div>`;
  if (provider === 'openrouter') loadModels();
}

let modelCatalog = null;

function getModelCatalog() {
  if (!modelCatalog) {
    // Metadata is only a hint for token budgets and reasoning effort. A slow
    // /models call must not hold up the actual case generation.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    modelCatalog = fetch('https://openrouter.ai/api/v1/models', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('models ' + res.status))))
      .then((data) => {
        const ids = [];
        const meta = {};
        for (const m of data.data || []) {
          if (!m || !m.id) continue;
          ids.push(m.id);
          const r = m.reasoning || null;
          meta[m.id] = {
            maxOut: Number(m.top_provider && m.top_provider.max_completion_tokens) || 0,
            reasoning: !!r,
            mandatory: !!(r && r.mandatory),
            efforts: r && Array.isArray(r.supported_efforts) ? r.supported_efforts : [],
          };
        }
        return { ids, meta };
      })
      .finally(() => clearTimeout(timer))
      .catch((e) => {
        modelCatalog = null;
        throw e;
      });
  }
  return modelCatalog;
}

async function loadModels() {
  if (isAgentMode()) return;
  const list = document.getElementById('model-list');
  if (!list) return;
  try {
    const catalog = await getModelCatalog();
    const ids = catalog.ids
      .filter((id) => !/:batch|^~|image|embed/i.test(id))
      .slice(0, 120);
    const frag = document.createDocumentFragment();
    for (const id of ids) {
      const opt = document.createElement('option');
      opt.value = id;
      frag.append(opt);
    }
    list.append(frag);
  } catch (e) {}
}

async function checkAgent() {
  try {
    const res = await fetch('/api/agent/health', { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok || !data || !data.ok) {
      throw new Error((data && data.error) || ('HTTP ' + res.status));
    }
    showToast(t('toast.agentOk', {
      agent: data.model ? (data.agent || 'opencode') + ' · ' + data.model : (data.agent || 'opencode'),
    }));
    return true;
  } catch (e) {
    showToast(t('toast.agentFail', { detail: e && e.message ? e.message : e }));
    return false;
  }
}

function setProvider(value) {
  const next = value === 'agent' ? 'agent' : 'openrouter';
  if (next === currentProvider()) return;
  const setup = readSetupValues() || {};
  localStorage.setItem(LS_PROVIDER, next);
  renderSetup(Object.assign({}, setup, { provider: next }));
  if (next === 'agent') checkAgent();
}

/* --------------------------------------------------------------- game view */

function renderPlay() {
  document.body.dataset.screen = 'play';
  const c = state.case;
  app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="brand">⚖ ${esc(c.title)}<small>${esc(c.charge)}</small></div>
        <div class="actions">
          <button class="btn ghost" data-action="settings">${t('action.settings')}</button>
          <button class="btn ghost" data-action="new-case">${t('action.newCase')}</button>
          ${langSelect()}
        </div>
      </header>
      ${metersPanel()}
      <div class="board">
        <section class="board-col">
          <h2 class="section-title">${t('play.evidence')} · ${c.evidence.length}</h2>
          <div class="evidence-grid">${c.evidence.map(evidenceCard).join('')}</div>
        </section>
        <section class="board-col">
          ${caseFile()}
          ${roundPanel()}
        </section>
      </div>
      ${protocolPanel()}
    </div>`;
}

function brokenRounds() {
  const done = new Set();
  for (const t of state.transcript) if (t.broken) done.add(t.round);
  return done;
}

function credLimit(rounds) {
  return Math.max(MAX_CRED, rounds.length + 2);
}

function credIcons() {
  const limit = credLimit(state.case.rounds);
  let out = '';
  for (let i = 0; i < limit; i++) {
    out += `<span class="bolt ${i < state.cred ? 'on' : 'off'}">⚡</span>`;
  }
  return out;
}

function metersPanel() {
  const broken = brokenRounds();
  const pips = state.case.rounds.map((r, i) => (
    `<span class="pip${broken.has(i) ? ' done' : ''}">${broken.has(i) ? '✓' : i + 1}</span>`
  )).join('');
  return `<div class="meters">
    <div class="meter">
      <span class="meter-label">${t('meters.cred')}</span>
      <span class="cred" id="cred-meter">${credIcons()}</span>
      <span class="small" id="cred-count">${state.cred} / ${credLimit(state.case.rounds)}</span>
    </div>
    <div class="meter">
      <span class="meter-label">${t('meters.broken')}</span>
      <span class="pips">${pips}</span>
    </div>
    <div class="meter">
      <span class="meter-label">${t('meters.misses')}</span> <b id="miss-count">${state.misses}</b>
      <span class="meter-label">${t('meters.hints')}</span> <b id="hint-count">${state.hints}</b>
    </div>
  </div>`;
}

function evidenceCard(e) {
  const img = state.images[e.id];
  const thumb = img
    ? `<img src="${esc(img.url)}" alt="${esc(e.name)}" loading="lazy" data-icon="${esc(e.icon)}">`
    : `<span class="fallback">${esc(e.icon)}</span>`;
  return `<button class="evidence" data-action="evidence" data-id="${esc(e.id)}" type="button">
    <div class="thumb">${thumb}</div>
    <div class="meta">
      <div class="name">${esc(e.name)}</div>
      <div class="desc">${esc(e.description)}</div>
    </div>
  </button>`;
}

function caseFile() {
  const c = state.case;
  const diff = c.difficulty ? difficultyConfig(c.difficulty).key : '';
  return `<article class="file">
    <div class="file-head">
      <span class="tag">${t('file.tag')}</span>
      <h1>${esc(c.title)}</h1>
    </div>
    <p class="charge">${esc(c.charge)}</p>
    <dl class="facts">
      <div><dt>${t('file.defendant')}</dt><dd><b>${esc(c.defendant.name)}</b> — ${esc(c.defendant.description)}</dd></div>
      <div><dt>${t('file.victim')}</dt><dd><b>${esc(c.victim.name)}</b> — ${esc(c.victim.description)}</dd></div>
      ${diff ? `<div><dt>${t('file.difficulty')}</dt><dd><b>${difficultyLabel(diff)}</b> — ${difficultyShort(diff)}</dd></div>` : ''}
    </dl>
    <p class="summary">${esc(c.summary)}</p>
    <details class="witnesses">
      <summary>${t('file.witnesses', { n: c.witnesses.length })}</summary>
      ${c.witnesses.map((w) => `<div class="witness"><b>${esc(w.name)}</b>${w.role ? `, ${esc(w.role)}` : ''}<p>${esc(w.testimony)}</p></div>`).join('')}
    </details>
  </article>`;
}

function roundPanel() {
  const c = state.case;
  const total = c.rounds.length;
  if (state.round >= total) {
    return `<div class="round cta">
      <h2 class="display">${t('round.ctaTitle')}</h2>
      <p class="muted">${t('round.ctaText')}</p>
      <button class="btn primary big" data-action="verdict">${t('round.verdictButton')}</button>
    </div>`;
  }
  const round = c.rounds[state.round];
  const said = state.transcript.filter((entry) => entry.round === state.round);
  const form = state.step === 'defense' ? defenseForm() : rebuttalForm();
  const pressed = state.pressed.includes(state.round);
  const broken = said.some((entry) => entry.broken);
  return `<div class="round">
    <div class="round-head">
      <span class="badge">${t('round.badge', { n: state.round + 1, total: total })}</span>
      <span class="turn">${state.step === 'defense' ? t('round.defence') : t('round.prosecution')}</span>
    </div>
    <div class="speech claim"><div class="who">${t('role.prosecution')}</div><p>${esc(round.claim)}</p></div>
    <div class="speech witness-box">
      <div class="who">${t('witness.who', { name: esc(round.witness) })}</div>
      <p>${esc(round.testimony)}</p>
      <div id="press-line">${pressed ? `<p class="press"><b>${t('press.reveal')}:</b> ${esc(round.press)}</p>` : ''}</div>
    </div>
    ${round.prosecutorAside ? `<div class="speech prosecution aside"><div class="who">${t('role.prosecution')}</div><p>${esc(round.prosecutorAside)}</p></div>` : ''}
    <div class="press-row">
      <button class="btn ghost small" type="button" data-action="press" data-round="${state.round}"${pressed ? ' disabled' : ''}>${pressed ? t('press.done') : t('press.button')}</button>
      <p class="hint">${t('press.hint')}</p>
    </div>
    ${said.map(entryHtml).join('')}
    ${reactingRound === state.round ? `<div class="speech witness-box typing" id="witness-typing"><div class="who">${t('witness.who', { name: esc(round.witness) })}</div><p>${t('witness.typing')}<span class="dots"></span></p></div>` : ''}
    ${broken ? `<div class="breakdown"><b>${t('breakdown.title')}</b> ${esc(round.breakdown)}</div>` : ''}
    ${form}
  </div>`;
}

function defenseForm() {
  const round = state.case.rounds[state.round];
  const hintNames = round ? round.challengeableBy.map(evidenceName).filter(Boolean) : [];
  const hintLine = state.hintRound === state.round && hintNames.length
    ? t('hint.line', { name: hintNames[0] })
    : '';
  return `<form data-form="defense" class="turn-form">
    <label for="argument">${t('form.argument')}</label>
    <textarea id="argument" name="argument" placeholder="${t('form.argumentPlaceholder')}" required></textarea>
    <div class="row">
      <div>
        <label for="evidence">${t('form.evidence')}</label>
        <select id="evidence" name="evidence"><option value="">${t('form.noEvidence')}</option>${evidenceOptions()}</select>
        <p class="hint miss-note" id="miss-note">${t('form.missNote')}</p>
      </div>
      <div class="hint-cell">
        <button class="btn ghost" type="button" data-action="hint" data-round="${state.round}">${t('hint.button')}</button>
        <p class="hint" id="hint-slot">${esc(hintLine)}</p>
      </div>
    </div>
    <div class="actions"><button class="btn primary big" type="submit">${t('form.objection')}</button></div>
  </form>`;
}

function rebuttalForm() {
  return `<form data-form="rebuttal" class="turn-form">
    <label for="argument">${t('form.rebuttal')} <span class="muted">${t('form.rebuttalOptional')}</span></label>
    <textarea id="argument" name="argument" placeholder="${t('form.rebuttalPlaceholder')}"></textarea>
    <div class="row">
      <div>
        <label for="evidence">${t('form.evidence')}</label>
        <select id="evidence" name="evidence"><option value="">${t('form.noEvidence')}</option>${evidenceOptions()}</select>
      </div>
      <div class="hint-cell">
        <p class="hint">${t('form.nextHint')}</p>
      </div>
    </div>
    <div class="actions"><button class="btn primary big" type="submit">${t('form.continue')}</button></div>
  </form>`;
}

function evidenceOptions() {
  return state.case.evidence
    .map((e) => `<option value="${esc(e.id)}">${esc(e.name)}</option>`)
    .join('');
}

function entryHtml(entry) {
  const evidence = entry.evidenceId ? state.case.evidence.find((x) => x.id === entry.evidenceId) : null;
  const sideClass = entry.side === 'witness' ? 'witness-box' : entry.side;
  const who = entry.side === 'defense'
    ? t('role.defence')
    : entry.side === 'witness'
      ? t('witness.who', { name: entry.witness || t('role.witness') })
      : t('role.prosecution');
  return `<div class="speech ${sideClass}${entry.broken ? ' broken' : ''}"${entry.side === 'witness' ? ' data-kind="reply"' : ''}>
    <div class="who">${who}</div>
    <p>${esc(entry.text)}</p>
    ${evidence ? `<p class="cited">${t('entry.evidence', { name: esc(evidence.name) })}${entry.broken ? t('entry.broken') : ''}</p>` : ''}
  </div>`;
}

function evidenceName(id) {
  const e = state.case.evidence.find((x) => x.id === id);
  return e ? e.name : '';
}

function protocolRow(entry) {
  const name = entry.evidenceId ? evidenceName(entry.evidenceId) : '';
  const side = entry.side === 'defense'
    ? t('role.defence')
    : entry.side === 'witness'
      ? t('role.witness')
      : t('role.prosecution');
  return `<li><span class="round-no">${t('protocol.roundShort', { n: entry.round + 1 })}</span> <b>${side}:</b> ${esc(entry.text)}${name ? ` <i>(${esc(name)}${entry.broken ? ' ✓' : ''})</i>` : ''}</li>`;
}

function protocolPanel(open) {
  if (!state.transcript.length) return '';
  const rows = state.transcript.map(protocolRow).join('');
  return `<details class="protocol"${open ? ' open' : ''}>
    <summary>${t('protocol.title', { n: state.transcript.length })}</summary>
    <ol>${rows}</ol>
  </details>`;
}

/* ----------------------------------------------------------------- verdict */

function renderVerdict() {
  document.body.dataset.screen = 'verdict';
  const c = state.case;
  const v = state.verdict;
  const decisive = c.evidence.find((e) => e.id === v.decisiveEvidenceId);
  app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="brand">⚖ ${esc(c.title)}<small>${t('verdict.stampLabel')}</small></div>
        <div class="actions">
          <button class="btn ghost" data-action="settings">${t('action.settings')}</button>
          <button class="btn ghost" data-action="new-case">${t('action.newCase')}</button>
          ${langSelect()}
        </div>
      </header>
      <section class="verdict ${v.verdict}">
        <div class="stamp">${v.verdict === 'guilty' ? t('verdict.guilty') : t('verdict.notGuilty')}</div>
        <h1>${esc(v.headline)}</h1>
        <p class="reasoning">${esc(v.reasoning)}</p>
        ${decisive ? `<p class="decisive">${t('verdict.decisive', { name: esc(decisive.name) })}</p>` : ''}
        <div class="stats">
          <div><b>${brokenRounds().size}</b><span>${t('verdict.statsBroken', { done: brokenRounds().size, total: c.rounds.length })}</span></div>
          <div><b>${state.misses}</b><span>${t('verdict.statsMisses')}</span></div>
          <div><b>${state.hints}</b><span>${t('verdict.statsHints')}</span></div>
        </div>
      </section>
      <section class="panel truth">
        <span class="tag dark">${t('verdict.truthTag')}</span>
        <h2 class="display">${t('verdict.truthTitle')}</h2>
        <p>${esc(c.truth)}</p>
        ${typeof c.defendantGuilty === 'boolean' ? `<p class="truth-note ${c.defendantGuilty ? 'guilty' : 'innocent'}">${c.defendantGuilty ? t('verdict.truthGuilty') : t('verdict.truthInnocent')}</p>` : ''}
        ${c.culprit ? `<p class="truth-culprit">${t('verdict.culprit', { name: esc(c.culprit) })}</p>` : ''}
      </section>
      ${protocolPanel(true)}
      <div class="actions center"><button class="btn primary big" data-action="new-case">${t('verdict.newCase')}</button></div>
    </div>`;
}

/* -------------------------------------------------------------------- AI */

function caseSystem(out) {
  return 'Ты — сценарист детективных игр в духе Ace Attorney. Придумываешь цельные судебные дела: запутанные, но логичные, с честными уликами и противоречиями, которые можно раскрыть в зале суда. Свидетели и прокурор — живые люди со своими мотивами: они отвечают друг другу, спорят и защищают свои интересы. Пишешь живо и с лёгким юмором, без жестоких подробностей и без реальных людей. Отвечаешь только JSON. ' + languageRule(out);
}

function rangeText(range, word) {
  return 'от ' + range[0] + ' до ' + range[1] + ' ' + word;
}

function casePrompt(theme, config, defendantGuilty) {
  const cfg = config || DIFFICULTIES[DEFAULT_DIFFICULTY];
  const culpritRule = defendantGuilty
    ? 'Подсудимый в этом деле действительно виновен. culprit — обязательно имя подсудимого, а truth прямо подтверждает его вину.'
    : 'Подсудимый в этом деле невиновен. culprit — имя настоящего виновника из числа свидетелей, потерпевшего или другого персонажа дела, но не подсудимого.';
  return `Придумай одно законченное дело для игры «Ace Attorney Offline».
Тема или зацепка от игроков: ${theme || 'выбери сам — неожиданную, но бытовую'}.
Сложность логики: ${difficultyLabel(cfg.key)}. ${t('diff.' + cfg.key + '.logic')}

Жёсткие правила:
- ${rangeText(cfg.evidence, 'улик')}. Улика — обычный физический предмет или документ. Никакой магии, сверхтехнологий и «улик из ниоткуда».
- Обязательно включи в улики судебно-медицинскую экспертизу (судмедэксперта): осмотр потерпевшего или тела, время и причина смерти, характер повреждений. Она входит в общее число улик и должна быть в списке evidence в любом деле, даже если это кража или мошенничество. Назови её «Заключение судмедэксперта» (в английском деле — «Forensic medical report»), а в описании укажи конкретные выводы эксперта.
- description — только наблюдаемые факты: что видно, что написано, откуда предмет. Без выводов вроде «доказывает вину».
- ${rangeText(cfg.rounds, 'раундов')}. В каждом:
  * claim — конкретное утверждение прокурора, опирающееся на показания;
  * witness — точное имя свидетеля из списка witnesses;
  * testimony — что свидетель говорит в этом раунде и как он отвечает именно на claim;
  * prosecutorAside — реакция прокурора на testimony: 1–2 предложения, где он давит, уличает или подхватывает слова свидетеля;
  * press — новый конкретный факт, который выясняется, если надавить на свидетеля (не пересказ claim);
  * challengeableBy — точные названия 1–2 улик из списка evidence, которые ломают claim;
  * breakdown — одно предложение: почему эта улика опровергает claim.
- ${rangeText(cfg.witnesses, 'свидетелей')}, у каждого своя роль, характер и причина свидетельствовать.
- ${culpritRule}
- Виновник не должен быть очевиден по роли, имени, поведению или первому показанию. Не делай свидетеля виновником по умолчанию. Если виновник — свидетель, его вина должна следовать только из сопоставления 2+ улик, а показания должны звучать правдоподобно.
- Минимум двое персонажей должны выглядеть подозрительно: у них есть мотив и шаткое алиби. Не делай так, чтобы кто-то оговаривал себя или вёл себя подозрительно без причины.
- Каждый раунд — новое утверждение прокурора; не повторяй предыдущие раунды. В раундах 2+ claim начинается с реакции на предыдущее показание или на довод, который могла бы привести защита.
- truth восстанавливается из улик и показаний; в раундах нельзя ссылаться на факты, которых нет в деле.
- Не добавляй новых людей, предметы и места после списков.
- У улик разные роли, они не дублируют друг друга. Каждая улика должна выглядеть нужной, но не обязана ломать раунд.
- Имена вымышленные. Юмор — в интонации, не в логике.
- imageQuery — короткая фраза на английском для поиска реального фото на Wikimedia Commons (например: "broken pocket watch");
- icon — один эмодзи.

Ответ — только JSON без markdown и пояснений:
{
  "title": "название дела",
  "charge": "формулировка обвинения",
  "defendant": {"name": "...", "description": "1 предложение"},
  "victim": {"name": "...", "description": "1 предложение"},
  "culprit": "имя настоящего виновника",
  "summary": "2-3 предложения: что известно публике",
  "truth": "3-5 предложений: что произошло на самом деле и кто виновен",
  "evidence": [
    {"name": "...", "description": "1-2 предложения наблюдаемых фактов", "imageQuery": "...", "icon": "🔎"}
  ],
  "witnesses": [
    {"name": "...", "role": "...", "testimony": "1-2 предложения фоновых показаний"}
  ],
  "rounds": [
    {
      "claim": "утверждение прокурора, 1-2 предложения",
      "witness": "точное имя из witnesses",
      "testimony": "показание свидетеля, которое отвечает на claim",
      "prosecutorAside": "реакция прокурора на testimony",
      "press": "что выясняется при нажатии",
      "challengeableBy": ["точное название улики"],
      "breakdown": "почему улика ломает утверждение"
    }
  ]
}`;
}

function editorSystem(out) {
  return 'Ты — редактор детективных дел. Проверяешь чужой черновик на логику, честность улик и связность диалогов. Ничего не выдумываешь сверх нужного для исправления. Отвечаешь только JSON. ' + languageRule(out);
}

function editorPrompt(draft, config, defendantGuilty) {
  const cfg = config || DIFFICULTIES[DEFAULT_DIFFICULTY];
  const culpritRule = defendantGuilty
    ? 'Подсудимый действительно виновен: culprit — его имя, truth подтверждает вину.'
    : 'Подсудимый невиновен: culprit — не подсудимый, а другой персонаж дела.';
  return `Черновик дела:
${JSON.stringify(draft, null, 2)}

Проверь по чек-листу и исправь ошибки:
1. ${rangeText(cfg.evidence, 'улик')}, ${rangeText(cfg.rounds, 'раундов')}, ${rangeText(cfg.witnesses, 'свидетелей')}, все поля заполнены.
2. В списке улик обязательно есть судебно-медицинская экспертиза (заключение судмедэксперта) с конкретными выводами: время, причина смерти или характер повреждений.
3. challengeableBy — точные названия улик из evidence, без выдуманных.
4. Улики физически возможны; description — наблюдаемые факты, без выводов.
5. claim каждого раунда действительно опровергается указанной уликой; breakdown объясняет логику одним предложением.
6. press добавляет новый конкретный факт, а не пересказывает claim или testimony.
7. witness в каждом раунде — имя из witnesses; testimony и press согласуются с характером свидетеля.
8. Диалог живой: testimony отвечает именно на claim, а prosecutorAside реагирует на testimony. В раундах 2+ claim реагирует на предыдущее показание или довод защиты.
9. ${culpritRule}
10. Виновник не очевиден по роли или поведению; минимум двое персонажей подозрительны, у них есть мотив и шаткое алиби.
11. truth согласуется со всеми уликами и показаниями; нет сущностей, которых нет в списках.
12. Улики не дублируют друг друга, у каждой своя роль.
13. Никаких новых людей, мест и предметов, если без них можно обойтись.

Сохрани замысел. Верни полный JSON по той же схеме, без markdown.`;
}

function judgeSystem(out) {
  return 'Ты — судья в судебной игре в духе Ace Attorney. Судишь строго по протоколу прений и по тому, что обвинение смогло доказать. Подсудимый может быть действительно виновен или невиновен — ты не обязан его оправдывать. Обвинение должно доказать вину вне разумных сомнений: если защита вскрыла противоречие и предложила правдоподобную альтернативу, вердикт — not_guilty, даже если по истине подсудимый виновен. Если защита только спорила, не предъявила улик и не сломала claims — вердикт guilty, даже если подсудимый невиновен. Пишешь торжественно и по делу. Отвечаешь только JSON. ' + languageRule(out);
}

function judgePrompt() {
  const c = state.case;
  const payload = {
    title: c.title,
    charge: c.charge,
    summary: c.summary,
    truth: c.truth,
    culprit: c.culprit,
    defendantGuilty: c.defendantGuilty,
    defendant: c.defendant,
    victim: c.victim,
    evidence: c.evidence.map((e) => ({ id: e.id, name: e.name, description: e.description })),
    witnesses: c.witnesses,
    rounds: c.rounds.map((r, i) => ({
      round: i + 1,
      claim: r.claim,
      testimony: r.testimony,
      prosecutorAside: r.prosecutorAside,
      challengeableBy: r.challengeableBy.map((id) => evidenceName(id)),
      breakdown: r.breakdown,
    })),
    transcript: state.transcript.map((t) => ({
      round: t.round + 1,
      side: t.side === 'defense' ? 'Защита' : t.side === 'witness' ? 'Свидетель' : 'Прокурор',
      witness: t.witness || '',
      text: t.text,
      evidence: evidenceName(t.evidenceId),
      broken: !!t.broken,
    })),
    defense: {
      credibilityLeft: state.cred,
      misses: state.misses,
      hintsUsed: state.hints,
    },
    pressures: state.pressed.map((i) => ({
      round: i + 1,
      witness: c.rounds[i] ? c.rounds[i].witness : '',
      fact: c.rounds[i] ? c.rounds[i].press : '',
    })),
  };
  return `Материалы дела и протокол прений:
${JSON.stringify(payload, null, 2)}

Вынеси вердикт. Правила:
- оценивай только то, что реально прозвучало в протоколе;
- truth и culprit — как было на самом деле; не используй их как автоматический приговор, но не игнорируй;
- если подсудимый действительно виновен, не оправдывай его только из симпатии: для not_guilty нужны вскрытые противоречия и правдоподобная альтернатива;
- если подсудимый невиновен, но защита ничего не доказала, вердикт всё равно может быть guilty — обвинение выиграло прения;
- broken: true значит, что утверждение прокурора опровергнуто предъявленной уликой — это сильный довод защиты;
- pressures — факты, которые защита выяснила при допросе свидетеля; учитывай их как показания;
- показания свидетеля в протоколе (side: Свидетель) — это его живые реакции; учитывай их;
- misses и hintsUsed показывают небрежность защиты, но сами по себе не решают дело;
- decisiveEvidenceId — id улики, решившей дело, или пустая строка;
- reasoning — 3-6 предложений, объясни решение.

Верни только JSON:
{"verdict": "guilty" | "not_guilty", "headline": "короткая фраза судьи", "reasoning": "...", "decisiveEvidenceId": "e2"}`;
}

async function postChat(body, key, timeoutMs) {
  let res = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      res = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + key,
          'Content-Type': 'application/json',
          'X-Title': 'Ace Attorney Offline',
        },
        body: JSON.stringify(body),
      }, timeoutMs || 180000);
      break;
    } catch (e) {
      if (e && e.name === 'AbortError') {
        console.error('[Ace Attorney] OpenRouter request timed out');
        throw new Error(t('error.timeout'));
      }
      // A dropped connection is often transient; one short retry usually
      // survives a flaky network without a second visible failure.
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        continue;
      }
      console.error('[Ace Attorney] OpenRouter request failed:', e);
      throw new Error(t('error.network', { detail: e && e.message ? e.message : e }));
    }
  }
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.text()).slice(0, 300); } catch (e) {}
    if (res.status === 401) throw new Error(t('error.status401'));
    if (res.status === 402) throw new Error(t('error.status402'));
    if (res.status === 429) throw new Error(t('error.status429'));
    throw new Error(t('error.http', { status: res.status, detail: detail }));
  }
  return res.json();
}

function messageText(data) {
  if (data && data.error) {
    const detail = data.error.message || data.error.code || 'provider error';
    throw new Error(t('error.provider', { detail: String(detail).slice(0, 240) }));
  }
  const choice = data && data.choices && data.choices[0];
  const message = choice && choice.message;
  if (!message) return '';
  let text = '';
  if (typeof message.content === 'string') {
    text = message.content;
  } else if (Array.isArray(message.content)) {
    text = message.content.map((part) => {
      if (typeof part === 'string') return part;
      if (!part) return '';
      return String(part.text || part.content || '');
    }).join('');
  }
  text = text.trim();
  if (!text && message.refusal) {
    throw new Error(t('error.refusal', { detail: String(message.refusal).slice(0, 200) }));
  }
  return text;
}

async function agentChat(messages, options) {
  const opts = options || {};
  const timeoutSec = opts.timeout || 0;
  const retry = opts.retry ? 1 : 0;
  let res = null;
  try {
    res = await fetchWithTimeout('/api/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages,
        max_tokens: opts.max_tokens || 8000,
        temperature: opts.temperature == null ? 0.8 : opts.temperature,
        timeout: timeoutSec,
        retry: retry,
      }),
    }, timeoutSec ? (timeoutSec * (retry + 1) + 30) * 1000 : 330000);
  } catch (e) {
    if (e && e.name === 'AbortError') throw new Error(t('error.timeout'));
    throw new Error(t('error.agent', { detail: e && e.message ? e.message : e }));
  }
  let data = null;
  try { data = await res.json(); } catch (e) {}
  if (!res.ok || !data || data.error) {
    const detail = (data && data.error) || ('HTTP ' + res.status);
    throw new Error(t('error.agent', { detail: detail }));
  }
  const text = String(data.text || '').trim();
  if (!text) throw new Error(t('error.agentEmpty'));
  return text;
}

async function chat(messages, options) {
  if (isAgentMode()) return agentChat(messages, options);
  const opts = options || {};
  const key = localStorage.getItem(LS_KEY);
  const model = (localStorage.getItem(LS_MODEL) || DEFAULT_MODEL).trim();
  if (!key) throw new Error(t('error.nokey'));
  if (/:batch$/i.test(model)) {
    throw new Error(t('error.batch'));
  }

  let meta = null;
  try {
    meta = (await getModelCatalog()).meta[model] || null;
  } catch (e) {}

  const timeoutMs = opts.timeout ? opts.timeout * 1000 : 180000;
  const requested = opts.max_tokens || 8000;
  const maxOut = meta && meta.maxOut ? meta.maxOut : 0;
  const budget = maxOut ? Math.max(1024, Math.min(requested, maxOut)) : requested;
  const body = {
    model: model,
    messages: messages,
    temperature: opts.temperature == null ? 0.8 : opts.temperature,
    max_tokens: budget,
  };

  // Reasoning models spend output tokens on hidden thinking. Low effort keeps
  // the budget for the JSON itself instead of letting the answer come back empty.
  if (meta && meta.reasoning && meta.efforts.includes('low')) {
    body.reasoning = { effort: 'low' };
  }

  let data = await postChat(body, key, timeoutMs);
  let text = messageText(data);
  if (text) return text;

  const first = data && data.choices && data.choices[0];
  if (first && first.finish_reason === 'content_filter') {
    throw new Error(t('error.filter'));
  }

  // Empty content usually means reasoning ate the whole budget. Retry once
  // with the model's full output limit and minimal reasoning.
  body.max_tokens = maxOut || Math.max(budget * 2, 16000);
  if (meta && meta.reasoning) {
    if (!meta.mandatory && meta.efforts.includes('none')) body.reasoning = { effort: 'none' };
    else if (meta.efforts.includes('low')) body.reasoning = { effort: 'low' };
    else delete body.reasoning;
  }
  data = await postChat(body, key, timeoutMs);
  text = messageText(data);
  if (text) return text;

  const choice = data && data.choices && data.choices[0];
  const finish = choice && choice.finish_reason;
  const hadReasoning = !!(choice && choice.message && choice.message.reasoning);
  const finishNote = finish ? ' (finish_reason: ' + finish + ')' : '';
  const reasoningNote = hadReasoning
    ? (lang === 'en' ? ': reasoning is present but there is no text' : ': reasoning есть, а текста нет')
    : '';
  throw new Error(t('error.empty', { finish: finishNote, reasoning: reasoningNote }));
}

function parseJson(text) {
  const clean = String(text).replace(/```json|```/gi, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error(t('error.noJson'));
  return JSON.parse(clean.slice(start, end + 1));
}

async function generateCase(theme, difficulty) {
  const config = difficultyConfig(difficulty);
  const out = lang;
  const defendantGuilty = Math.random() < 0.5;
  const messages = [
    { role: 'system', content: caseSystem(out) },
    { role: 'user', content: casePrompt(theme, config, defendantGuilty) },
  ];
  const finish = (raw) => {
    const fresh = normalizeCase(raw, config, defendantGuilty, out);
    fresh.lang = out;
    return fresh;
  };

  renderLoading('loading.writer');
  let draftText = await chat(messages, { max_tokens: 12000, temperature: 0.9, timeout: aiTimeout(240, 180), retry: true });
  let draft = null;
  try {
    draft = parseJson(draftText);
  } catch (e) {
    draftText = await chat(messages.concat([
      { role: 'assistant', content: draftText },
      { role: 'user', content: 'Ответ не был JSON: ' + e.message + '. Верни только исправленный JSON по схеме, без markdown.' },
    ]), { max_tokens: 12000, temperature: 0.5, timeout: aiTimeout(180, 180) });
    draft = parseJson(draftText);
  }

  // The editor is best-effort: a good draft must survive a failed audit.
  renderLoading('loading.editor');
  let edited = null;
  try {
    const editorText = await chat([
      { role: 'system', content: editorSystem(out) },
      { role: 'user', content: editorPrompt(draft, config, defendantGuilty) },
    ], { max_tokens: 12000, temperature: 0.3, timeout: aiTimeout(180, 180) });
    edited = parseJson(editorText);
  } catch (e) {}

  if (edited) {
    try { return finish(edited); } catch (e) {}
  }
  let draftError = null;
  try {
    return finish(draft);
  } catch (e) {
    draftError = e;
  }

  // Last resort: the writer gets the validation error and repairs its own draft.
  renderLoading('loading.repair');
  try {
    const fixedText = await chat(messages.concat([
      { role: 'assistant', content: draftText },
      { role: 'user', content: 'Дело не прошло проверку: ' + draftError.message + '. Верни только исправленный JSON по схеме, без markdown.' },
    ]), { max_tokens: 12000, temperature: 0.5, timeout: aiTimeout(180, 180) });
    return finish(parseJson(fixedText));
  } catch (e) {
    throw new Error(tIn(out, 'error.case', { detail: draftError.message }));
  }
}

function person(value, fallbackName) {
  const src = value && typeof value === 'object' ? value : {};
  const name = String(src.name || fallbackName).trim();
  const description = String(src.description || '').trim() || 'Без описания.';
  return { name: name, description: description };
}

function linkEvidence(name, evidence) {
  const lower = String(name || '').trim().toLowerCase();
  if (!lower) return '';
  const byId = evidence.find((e) => e.id === lower);
  if (byId) return byId.id;
  const exact = evidence.find((e) => e.name.toLowerCase() === lower);
  if (exact) return exact.id;
  const contained = evidence.find((e) => {
    const n = e.name.toLowerCase();
    return n.includes(lower) || lower.includes(n);
  });
  return contained ? contained.id : '';
}

const RANGE_WORDS = {
  ru: { evidence: 'улик', witnesses: 'свидетелей', rounds: 'раундов прений' },
  en: { evidence: 'pieces of evidence', witnesses: 'witnesses', rounds: 'rounds of argument' },
};

function rangeTextIn(out, range, kind) {
  const words = RANGE_WORDS[out] || RANGE_WORDS[DEFAULT_LANG];
  return out === 'en'
    ? range[0] + ' to ' + range[1] + ' ' + words[kind]
    : 'от ' + range[0] + ' до ' + range[1] + ' ' + words[kind];
}

// A forensic medical report is a required piece of evidence in every case.
// Detection is by the words a writer would use, not by an exact title.
function isForensicEvidence(item) {
  const text = String((item && item.name) || '') + ' ' + String((item && item.description) || '');
  return /судмед|судебно-мед|судебно-медицин|медэксперт|патолого|forensic medical|medical examiner|autops|post-mortem|patholog/i.test(text);
}

function forensicEvidence(code) {
  return {
    name: tIn(code, 'evidence.forensic.name'),
    description: tIn(code, 'evidence.forensic.description'),
    imageQuery: 'medical report document',
    icon: '🩺',
  };
}

function ensureForensicEvidence(caseObj, code) {
  if (!caseObj || !Array.isArray(caseObj.evidence)) return caseObj;
  if (caseObj.evidence.some(isForensicEvidence)) return caseObj;
  const langCode = code || caseObj.lang || DEFAULT_LANG;
  caseObj.evidence.push(Object.assign(forensicEvidence(langCode), {
    id: 'e' + (caseObj.evidence.length + 1),
  }));
  return caseObj;
}

function normalizeCase(raw, config, defendantGuilty, out) {
  const code = out || lang;
  if (!raw || typeof raw !== 'object') throw new Error(tIn(code, 'validation.empty'));
  const cfg = config || DIFFICULTIES[DEFAULT_DIFFICULTY];
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const title = str(raw.title);
  const charge = str(raw.charge);
  const summary = str(raw.summary);
  const truth = str(raw.truth);
  if (!title || !charge || !summary || !truth) throw new Error(tIn(code, 'validation.missing'));

  const defendant = person(raw.defendant, tIn(code, 'file.defendant'));
  const victim = person(raw.victim, tIn(code, 'file.victim'));

  const evidence = (Array.isArray(raw.evidence) ? raw.evidence : [])
    .map((e) => ({
      name: str(e && e.name),
      description: str(e && e.description),
      imageQuery: str(e && e.imageQuery),
      icon: str(e && e.icon) || '🔎',
    }))
    .filter((e) => e.name && e.description)
    .slice(0, cfg.evidence[1])
    .map((e, i) => Object.assign(e, { id: 'e' + (i + 1) }));
  if (evidence.length < cfg.evidence[0]) {
    throw new Error(tIn(code, 'validation.evidence', { range: rangeTextIn(code, cfg.evidence, 'evidence') }));
  }

  const witnesses = (Array.isArray(raw.witnesses) ? raw.witnesses : [])
    .map((w) => ({
      name: str(w && w.name),
      role: str(w && w.role) || tIn(code, 'role.witness').toLowerCase(),
      testimony: str(w && w.testimony),
    }))
    .filter((w) => w.name)
    .slice(0, cfg.witnesses[1]);
  if (witnesses.length < cfg.witnesses[0]) {
    throw new Error(tIn(code, 'validation.witnesses', { range: rangeTextIn(code, cfg.witnesses, 'witnesses') }));
  }

  const rounds = [];
  const rawRounds = Array.isArray(raw.rounds) ? raw.rounds.slice(0, cfg.rounds[1]) : [];
  for (let i = 0; i < rawRounds.length; i++) {
    const r = rawRounds[i] || {};
    const claim = str(r.claim);
    const testimony = str(r.testimony);
    const prosecutorAside = str(r.prosecutorAside);
    const press = str(r.press);
    const breakdown = str(r.breakdown);
    const witnessName = str(r.witness) || witnesses[0].name;
    if (!claim || !testimony || !prosecutorAside || !press || !breakdown) {
      throw new Error(tIn(code, 'validation.round', { n: i + 1 }));
    }
    const links = [...new Set((Array.isArray(r.challengeableBy) ? r.challengeableBy : [])
      .map((name) => linkEvidence(name, evidence))
      .filter(Boolean))];
    if (!links.length) throw new Error(tIn(code, 'validation.links', { n: i + 1 }));
    const known = witnesses.find((w) => w.name.toLowerCase() === witnessName.toLowerCase());
    if (!known) witnesses.push({ name: witnessName, role: tIn(code, 'role.witness').toLowerCase(), testimony: testimony });
    rounds.push({
      claim: claim,
      witness: known ? known.name : witnessName,
      testimony: testimony,
      prosecutorAside: prosecutorAside,
      press: press,
      challengeableBy: links,
      breakdown: breakdown,
    });
  }
  if (rounds.length < cfg.rounds[0]) {
    throw new Error(tIn(code, 'validation.rounds', { range: rangeTextIn(code, cfg.rounds, 'rounds') }));
  }

  // The culprit decides who actually did it. The random hint only guides the
  // writer; the draft's own culprit wins so the reveal never contradicts truth.
  const rawCulprit = str(raw.culprit);
  const guilty = rawCulprit
    ? rawCulprit.toLowerCase() === defendant.name.toLowerCase()
    : (typeof defendantGuilty === 'boolean' ? defendantGuilty : !!raw.defendantGuilty);
  const culprit = rawCulprit || (guilty ? defendant.name : '');

  const result = {
    version: CASE_VERSION,
    difficulty: cfg.key,
    defendantGuilty: guilty,
    culprit: culprit,
    title: title,
    charge: charge,
    defendant: defendant,
    victim: victim,
    summary: summary,
    truth: truth,
    evidence: evidence,
    witnesses: witnesses,
    rounds: rounds,
  };
  return ensureForensicEvidence(result, code);
}

function normalizeVerdict(raw) {
  const code = caseLang();
  const value = String((raw && raw.verdict) || '').toLowerCase().replace(/[\s_-]+/g, '');
  let verdict = '';
  if (value.includes('notguilt') || value.includes('невинов') || value.includes('оправдан')) verdict = 'not_guilty';
  else if (value.includes('guilt') || value.includes('винов') || value.includes('осужд')) verdict = 'guilty';
  if (!verdict) throw new Error(tIn(code, 'error.verdict'));

  let decisiveId = String((raw && raw.decisiveEvidenceId) || '').trim();
  if (decisiveId && !state.case.evidence.some((e) => e.id === decisiveId)) {
    const byName = state.case.evidence.find((e) => e.name.toLowerCase() === decisiveId.toLowerCase());
    decisiveId = byName ? byName.id : '';
  }

  return {
    verdict: verdict,
    headline: String((raw && raw.headline) || '').trim() ||
      tIn(code, verdict === 'guilty' ? 'verdict.defaultGuilty' : 'verdict.defaultNotGuilty'),
    reasoning: String((raw && raw.reasoning) || '').trim() || tIn(code, 'verdict.defaultReasoning'),
    decisiveEvidenceId: decisiveId,
  };
}

async function judgeCase() {
  const out = caseLang();
  const text = await chat([
    { role: 'system', content: judgeSystem(out) },
    { role: 'user', content: judgePrompt() },
  ], { max_tokens: 8000, temperature: 0.4, timeout: aiTimeout(180, 180), retry: true });
  return normalizeVerdict(parseJson(text));
}

function witnessSystem(out) {
  return 'Ты — свидетель в судебной игре в духе Ace Attorney. Отвечаешь в характере своего персонажа, живо. Ты не раскрываешь истину и не признаёшь вину. Отвечаешь только JSON. ' + languageRule(out);
}

function reactionPrompt(round, text, evidenceId, correct) {
  const c = state.case;
  const recent = state.transcript.slice(-6).map((entry) => ({
    side: entry.side === 'defense' ? 'Защита' : entry.side === 'witness' ? 'Свидетель' : 'Прокурор',
    text: entry.text,
  }));
  const presented = evidenceId ? evidenceName(evidenceId) : '';
  return `Материалы дела:
${JSON.stringify({
    title: c.title,
    charge: c.charge,
    summary: c.summary,
    defendant: c.defendant,
    victim: c.victim,
    evidence: c.evidence.map((e) => ({ name: e.name, description: e.description })),
    witnesses: c.witnesses,
  }, null, 2)}

Текущий раунд:
${JSON.stringify({
    claim: round.claim,
    witness: round.witness,
    testimony: round.testimony,
    prosecutorAside: round.prosecutorAside,
    press: round.press,
  }, null, 2)}

Последние реплики:
${JSON.stringify(recent, null, 2)}

Защита только что сказала: «${text}»
${presented ? 'Предъявленная улика: «' + presented + '».' : 'Улика не предъявлена.'}
${correct ? 'Эта улика действительно противоречит утверждению прокурора.' : 'Эта улика не относится к утверждению или защита говорит без улики.'}

Напиши реплику свидетеля (1–2 предложения), которая прямо отвечает на аргумент защиты. Если защита попала уликой — свидетель сбит с толку, злится или тянет время, но не признаёт вину. Если защита не попала — свидетель уверенно парирует. Не повторяй показание дословно и не раскрывай настоящего виновника.

Верни только JSON: {"reply": "..."}`;
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  // Keep a late rejection from becoming an unhandled promise error.
  promise.catch(() => {});
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function reactToDefense(round, text, evidenceId, correct) {
  const answer = await withTimeout(chat([
    { role: 'system', content: witnessSystem(caseLang()) },
    { role: 'user', content: reactionPrompt(round, text, evidenceId, correct) },
  ], { max_tokens: 600, temperature: 0.9, timeout: aiTimeout(90, 180) }), isAgentMode() ? 120000 : 15000);
  const raw = parseJson(answer);
  const reply = String((raw && (raw.reply || raw.text)) || '').trim();
  return reply.slice(0, 600);
}

/* ----------------------------------------------------------------- images */

async function fetchWithTimeout(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, Object.assign({}, options, { signal: controller.signal }));
  } finally {
    clearTimeout(timer);
  }
}

async function loadImages(evidence) {
  const images = {};
  await Promise.all(evidence.map(async (item) => {
    images[item.id] = item.imageQuery ? await findCommonsImage(item.imageQuery) : null;
  }));
  return images;
}

function applyImages(images, caseRef) {
  if (!caseRef || state.case !== caseRef) return;
  state.images = images;
  saveGame();
  for (const card of document.querySelectorAll('.evidence[data-id]')) {
    const id = card.dataset.id;
    if (!Object.prototype.hasOwnProperty.call(images, id)) continue;
    const item = state.case.evidence.find((e) => e.id === id);
    const thumb = card.querySelector('.thumb');
    if (!item || !thumb) continue;
    const img = images[id];
    thumb.innerHTML = img
      ? `<img src="${esc(img.url)}" alt="${esc(item.name)}" loading="lazy" data-icon="${esc(item.icon)}">`
      : `<span class="fallback">${esc(item.icon)}</span>`;
  }
  refreshEvidenceWindows();
}

// shortcut: one Wikimedia search per evidence (plus one retry without the
// bitmap filter). ceiling: odd evidence finds nothing or a loosely related
// photo, then the emoji fallback shows. upgrade: query Openverse or an image
// model when the search quality matters.
async function findCommonsImage(query) {
  for (const q of [query + ' filetype:bitmap', query]) {
    try {
      const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: q,
        gsrnamespace: '6',
        gsrlimit: '4',
        prop: 'imageinfo',
        iiprop: 'url',
        iiurlwidth: '500',
        format: 'json',
        formatversion: '2',
        origin: '*',
      });
      const res = await fetchWithTimeout('https://commons.wikimedia.org/w/api.php?' + params, {}, 6000);
      if (!res.ok) continue;
      const data = await res.json();
      const pages = ((data.query && data.query.pages) || []).slice()
        .sort((a, b) => (a.index || 0) - (b.index || 0));
      for (const page of pages) {
        if (/\.(pdf|svg|tiff?|djvu|webm|ogv)$/i.test(page.title || '')) continue;
        const info = page.imageinfo && page.imageinfo[0];
        const url = info && (info.thumburl || info.url);
        if (url && /\.(jpe?g|png|webp)(\?|$)/i.test(url)) {
          return { url: url, sourceUrl: info.descriptionurl || url };
        }
      }
    } catch (e) {}
  }
  return null;
}

/* ---------------------------------------------------------------- actions */

function saveSettings() {
  const providerInput = document.querySelector('input[name="provider"]:checked');
  const provider = providerInput && providerInput.value === 'agent' ? 'agent' : 'openrouter';
  localStorage.setItem(LS_PROVIDER, provider);
  const difficulty = document.querySelector('input[name="difficulty"]:checked');
  if (difficulty) localStorage.setItem(LS_DIFFICULTY, difficulty.value);
  if (provider === 'agent') {
    showToast(t('toast.agentSaved'));
    checkAgent();
    return;
  }
  const keyInput = document.getElementById('key');
  const modelInput = document.getElementById('model');
  if (!keyInput || !modelInput) return;
  const key = keyInput.value.trim();
  if (!key) {
    showToast(t('toast.key'));
    return;
  }
  localStorage.setItem(LS_KEY, key);
  localStorage.setItem(LS_MODEL, modelInput.value.trim() || DEFAULT_MODEL);
  showToast(t('toast.saved'));
}

async function onGenerate(form) {
  if (busy) return;
  const data = new FormData(form);
  const provider = String(data.get('provider') || '') === 'agent' ? 'agent' : 'openrouter';
  const key = String(data.get('key') || '').trim();
  const model = String(data.get('model') || '').trim() || DEFAULT_MODEL;
  const theme = String(data.get('theme') || '').trim();
  const difficulty = difficultyConfig(String(data.get('difficulty') || '')).key;
  if (provider === 'openrouter' && !key) {
    showToast(t('toast.key'));
    return;
  }
  localStorage.setItem(LS_PROVIDER, provider);
  if (provider === 'openrouter') {
    localStorage.setItem(LS_KEY, key);
    localStorage.setItem(LS_MODEL, model);
  }
  localStorage.setItem(LS_DIFFICULTY, difficulty);
  closeAllEvidenceWindows();
  reactingRound = -1;
  busy = true;
  renderLoading('loading.judge');
  try {
    const fresh = await generateCase(theme, difficulty);
    state = {
      case: fresh,
      round: 0,
      step: 'defense',
      transcript: [],
      images: {},
      verdict: null,
      cred: credLimit(fresh.rounds),
      misses: 0,
      hints: 0,
      pressed: [],
      hintRound: -1,
    };
    saveGame();
    busy = false;
    render();
    // Images are decorative: never hold the case hostage while Wikimedia is slow.
    loadImages(fresh.evidence)
      .then((images) => applyImages(images, fresh))
      .catch(() => {});
  } catch (e) {
    busy = false;
    render();
    showToast(e && e.message ? e.message : t('toast.generateFailed'));
  }
}

function loseCredibility() {
  state.cred = Math.max(0, state.cred - 1);
}

function updateCredMeter() {
  const meter = document.getElementById('cred-meter');
  if (meter) meter.innerHTML = credIcons();
  const count = document.getElementById('cred-count');
  if (count) count.textContent = state.cred + ' / ' + credLimit(state.case.rounds);
  const misses = document.getElementById('miss-count');
  if (misses) misses.textContent = String(state.misses);
  const hints = document.getElementById('hint-count');
  if (hints) hints.textContent = String(state.hints);
}

function collapseTrial() {
  const code = caseLang();
  state.verdict = {
    verdict: 'guilty',
    headline: tIn(code, 'collapse.headline'),
    reasoning: tIn(code, 'collapse.reasoning'),
    decisiveEvidenceId: '',
  };
  saveGame();
  render();
}

async function onDefense(form) {
  const data = new FormData(form);
  const text = String(data.get('argument') || '').trim();
  if (!text) {
    showToast(t('toast.argument'));
    return;
  }
  const evidenceId = String(data.get('evidence') || '');
  const round = state.case.rounds[state.round];
  const correct = !!evidenceId && round.challengeableBy.includes(evidenceId);

  if (evidenceId && !correct) {
    state.misses += 1;
    loseCredibility();
    saveGame();
    if (state.cred <= 0) {
      collapseTrial();
      return;
    }
    updateCredMeter();
    const note = document.getElementById('miss-note');
    if (note) note.textContent = t('form.missAfter');
    showToast(t('toast.miss'));
    return;
  }

  const roundIndex = state.round;
  const caseRef = state.case;
  state.transcript.push({
    round: roundIndex,
    side: 'defense',
    text: text,
    evidenceId: evidenceId,
    broken: correct,
  });
  state.step = 'rebuttal';
  reactingRound = roundIndex;
  saveGame();
  render();
  if (correct) showToast(t('toast.broken', { name: evidenceName(evidenceId) }));
  objection('defense');

  let reply = '';
  try {
    reply = await reactToDefense(round, text, evidenceId, correct);
  } catch (e) {
    console.error('[Ace Attorney] witness reaction failed:', e);
  }
  if (state.case !== caseRef || state.round !== roundIndex || state.step !== 'rebuttal') {
    if (reactingRound === roundIndex) reactingRound = -1;
    return;
  }
  reactingRound = -1;
  const typing = document.getElementById('witness-typing');
  if (typing) typing.remove();
  if (!reply) return;
  const entry = {
    round: roundIndex,
    side: 'witness',
    witness: round.witness,
    text: reply,
  };
  state.transcript.push(entry);
  saveGame();
  appendWitnessReply(entry);
}

function appendWitnessReply(entry) {
  const form = document.querySelector('.round .turn-form');
  if (!form) return;
  const holder = document.createElement('div');
  holder.innerHTML = entryHtml(entry);
  form.before(holder.firstElementChild);
  const list = document.querySelector('.protocol ol');
  if (list) {
    const row = document.createElement('div');
    row.innerHTML = protocolRow(entry);
    list.append(row.firstElementChild);
    const summary = document.querySelector('.protocol summary');
    if (summary) summary.textContent = t('protocol.title', { n: state.transcript.length });
  }
}

function onRebuttal(form) {
  const data = new FormData(form);
  const text = String(data.get('argument') || '').trim();
  const evidenceId = String(data.get('evidence') || '');
  if (text || evidenceId) {
    state.transcript.push({
      round: state.round,
      side: 'prosecution',
      text: text || t('entry.silentProsecution'),
      evidenceId: evidenceId,
    });
  }
  state.round += 1;
  state.step = 'defense';
  reactingRound = -1;
  saveGame();
  render();
}

async function onVerdict() {
  if (busy) return;
  busy = true;
  renderLoading('loading.verdict');
  try {
    const verdict = await judgeCase();
    state.verdict = verdict;
    saveGame();
    busy = false;
    render();
  } catch (e) {
    busy = false;
    render();
    showToast(e && e.message ? e.message : t('toast.verdictFailed'));
  }
}

function onNewCase() {
  if (!confirm(t('confirm.newCase'))) return;
  closeAllEvidenceWindows();
  reactingRound = -1;
  state = {
    case: null, round: 0, step: 'defense', transcript: [], images: {}, verdict: null,
    cred: MAX_CRED, misses: 0, hints: 0, pressed: [], hintRound: -1,
  };
  saveGame();
  renderSetup();
}

function showHint(button) {
  const slot = document.getElementById('hint-slot');
  if (!slot) return;
  const index = Number(button.dataset.round);
  if (state.hintRound === index) return;
  const round = state.case.rounds[index];
  const names = round ? round.challengeableBy.map(evidenceName).filter(Boolean) : [];
  if (!names.length) {
    slot.textContent = t('hint.silent');
    return;
  }
  state.hints += 1;
  state.hintRound = index;
  loseCredibility();
  saveGame();
  updateCredMeter();
  slot.dataset.round = String(index);
  slot.textContent = t('hint.line', { name: names[0] });
  if (state.cred <= 0) collapseTrial();
}

function pressWitness(button) {
  const index = Number(button.dataset.round);
  if (state.pressed.includes(index)) return;
  const round = state.case.rounds[index];
  if (!round) return;
  state.pressed.push(index);
  saveGame();
  button.disabled = true;
  button.textContent = t('press.done');
  const line = document.getElementById('press-line');
  const fact = document.createElement('p');
  fact.className = 'press';
  const label = document.createElement('b');
  label.textContent = t('press.reveal') + ': ';
  fact.append(label, document.createTextNode(round.press));
  if (line) line.replaceChildren(fact);
  showToast(t('toast.press'));
}

function evidenceWindowHtml(e) {
  const img = state.images[e.id];
  const picture = img
    ? `<img src="${esc(img.url)}" alt="${esc(e.name)}" data-icon="${esc(e.icon)}">`
    : `<div class="modal-fallback">${esc(e.icon)}</div>`;
  return `<div class="window-bar" data-drag>
      <span class="window-icon">${esc(e.icon)}</span>
      <span class="window-title">${esc(e.name)}</span>
      <button class="window-close" type="button" data-action="close-modal" aria-label="${esc(t('modal.close'))}" title="${esc(t('modal.close'))}">×</button>
    </div>
    <div class="window-body">
      ${picture}
      <p>${esc(e.description)}</p>
      ${img && img.sourceUrl ? `<p class="hint">${t('modal.photo')}: <a href="${esc(img.sourceUrl)}" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a></p>` : ''}
    </div>`;
}

function openEvidence(id) {
  const e = state.case.evidence.find((x) => x.id === id);
  if (!e) return;
  const open = evidenceWindows.get(id);
  if (open) {
    raiseWindow(open);
    return;
  }
  const win = document.createElement('div');
  win.className = 'window';
  win.dataset.evidence = id;
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', e.name);
  win.innerHTML = evidenceWindowHtml(e);
  modal.append(win);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  evidenceWindows.set(id, win);
  placeEvidenceWindow(win);
  raiseWindow(win);
}

function placeEvidenceWindow(win) {
  const margin = 8;
  const rect = win.getBoundingClientRect();
  const baseLeft = Math.max(margin, (innerWidth - rect.width) / 2);
  const baseTop = Math.max(margin, innerHeight * 0.1);
  const saved = evidencePositions.get(win.dataset.evidence);
  let left = saved ? saved.left : baseLeft;
  let top = saved ? saved.top : baseTop;
  if (!saved && lastWindowPos) {
    left = lastWindowPos.left + 26;
    top = lastWindowPos.top + 26;
    if (left + rect.width + margin > innerWidth || top + rect.height + margin > innerHeight) {
      left = baseLeft;
      top = baseTop;
    }
  }
  left = Math.min(Math.max(margin, left), Math.max(margin, innerWidth - rect.width - margin));
  top = Math.min(Math.max(margin, top), Math.max(margin, innerHeight - rect.height - margin));
  win.style.left = left + 'px';
  win.style.top = top + 'px';
  rememberWindowPos(win, left, top);
}

function rememberWindowPos(win, left, top) {
  const id = win.dataset.evidence;
  if (!id) return;
  evidencePositions.set(id, { left: left, top: top });
  lastWindowPos = { left: left, top: top };
}

function raiseWindow(win) {
  windowZ += 1;
  win.style.zIndex = String(windowZ);
}

function refreshEvidenceWindows() {
  if (!state.case) return;
  for (const [id, win] of evidenceWindows) {
    const e = state.case.evidence.find((x) => x.id === id);
    if (e) win.innerHTML = evidenceWindowHtml(e);
  }
}

function startDrag(ev) {
  if (ev.button != null && ev.button !== 0) return;
  const bar = ev.target.closest('.window-bar');
  if (!bar || ev.target.closest('button')) return;
  const win = bar.closest('.window');
  if (!win) return;
  raiseWindow(win);
  const rect = win.getBoundingClientRect();
  dragState = { win: win, dx: ev.clientX - rect.left, dy: ev.clientY - rect.top };
  document.addEventListener('pointermove', moveDrag);
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);
  document.body.classList.add('dragging');
  ev.preventDefault();
}

function moveDrag(ev) {
  if (!dragState) return;
  const win = dragState.win;
  const rect = win.getBoundingClientRect();
  const margin = 8;
  const left = Math.min(Math.max(margin, ev.clientX - dragState.dx), Math.max(margin, innerWidth - rect.width - margin));
  const top = Math.min(Math.max(margin, ev.clientY - dragState.dy), Math.max(margin, innerHeight - rect.height - margin));
  win.style.left = left + 'px';
  win.style.top = top + 'px';
  rememberWindowPos(win, left, top);
}

function endDrag() {
  dragState = null;
  document.removeEventListener('pointermove', moveDrag);
  document.removeEventListener('pointerup', endDrag);
  document.removeEventListener('pointercancel', endDrag);
  document.body.classList.remove('dragging');
}

function closeEvidence(win) {
  if (!win) return;
  if (dragState && dragState.win === win) endDrag();
  const id = win.dataset.evidence;
  win.remove();
  if (id) evidenceWindows.delete(id);
  if (!evidenceWindows.size) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    windowZ = 0;
  }
}

function closeAllEvidenceWindows() {
  endDrag();
  evidenceWindows.clear();
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  modal.replaceChildren();
  windowZ = 0;
}

function closeTopEvidenceWindow() {
  let top = null;
  for (const win of evidenceWindows.values()) {
    if (!top || Number(win.style.zIndex || 0) > Number(top.style.zIndex || 0)) top = win;
  }
  if (top) closeEvidence(top);
}

/* ------------------------------------------------------------------- ui */

function renderLoading(key) {
  document.body.dataset.screen = 'loading';
  loadingKey = key || 'loading.judge';
  if (!loadingStart) loadingStart = Date.now();
  clearInterval(loadingTimer);
  app.innerHTML = `<div class="shell">
    <header class="topbar">
      <div class="brand">⚖ Ace Attorney <span>Offline</span></div>
      <div class="actions">${langSelect()}</div>
    </header>
    <div class="loading">
      <div class="gavel">🔨</div>
      <h1>${esc(t(loadingKey))}<span class="dots"></span></h1>
      <p class="muted">${t(isAgentMode() ? 'loading.noteAgent' : 'loading.note')}</p>
      <p class="small" id="loading-elapsed"></p>
    </div>
  </div>`;
  const tick = () => {
    const el = document.getElementById('loading-elapsed');
    if (!el) return;
    el.textContent = t('loading.elapsed', { n: Math.round((Date.now() - loadingStart) / 1000) });
  };
  tick();
  loadingTimer = setInterval(tick, 1000);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 6000);
}

function objection(side) {
  const node = document.createElement('div');
  node.className = 'objection ' + side;
  const label = document.createElement('span');
  label.textContent = 'OBJECTION!';
  node.append(label);
  document.body.append(node);
  setTimeout(() => node.remove(), 1250);

  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = side === 'defense' ? 240 : 170;
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
    osc.onended = () => ctx.close();
  } catch (e) {}
}

/* --------------------------------------------------------------- wiring */

document.addEventListener('click', (ev) => {
  const target = ev.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'evidence') openEvidence(target.dataset.id);
  else if (action === 'settings') { closeAllEvidenceWindows(); renderSetup(); }
  else if (action === 'back') render();
  else if (action === 'new-case') onNewCase();
  else if (action === 'save-settings') saveSettings();
  else if (action === 'check-agent') checkAgent();
  else if (action === 'hint') showHint(target);
  else if (action === 'press') pressWitness(target);
  else if (action === 'verdict') onVerdict();
  else if (action === 'close-modal') closeEvidence(target.closest('.window'));
});

document.addEventListener('submit', (ev) => {
  const form = ev.target.closest('form[data-form]');
  if (!form) return;
  ev.preventDefault();
  const kind = form.dataset.form;
  if (kind === 'generate') onGenerate(form);
  else if (kind === 'defense') {
    onDefense(form).catch((e) => {
      console.error(e);
      showToast(e && e.message ? e.message : t('toast.continueFailed'));
    });
  } else if (kind === 'rebuttal') onRebuttal(form);
});

document.addEventListener('change', (ev) => {
  const provider = ev.target.closest('input[name="provider"]');
  if (provider) {
    setProvider(provider.value);
    return;
  }
  const select = ev.target.closest('select[data-lang]');
  if (!select) return;
  setLang(select.value);
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') closeTopEvidenceWindow();
});

document.addEventListener('pointerdown', startDrag);

// Broken Wikimedia thumbs turn into the same emoji fallback as a missing image.
document.addEventListener('error', (ev) => {
  const img = ev.target;
  if (!img || img.tagName !== 'IMG' || !img.dataset.icon) return;
  const fallback = document.createElement('span');
  fallback.className = 'fallback';
  fallback.textContent = img.dataset.icon;
  img.replaceWith(fallback);
}, true);

render();
