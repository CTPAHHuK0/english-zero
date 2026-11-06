'use strict';
// Zones 4–5: past, future, comparisons, shopping, phone calls, feelings, dialogues.
(function (D) {
  const { W, P, S } = D;
  D.zones[4] = 'Рассказываю о прошлом';
  D.zones[5] = 'Планы и живые разговоры';

  // ---------- Zone 4 ----------
  D.unit({
    id: 'u35', zone: 4, line: 'gram', title: 'Было: was, were', sub: 'Прошедшее время глагола «быть»', glyph: 'was',
    tips: [
      { t: 'was и were', x: 'Прошлое от am / is / are. <b>I, he, she, it — was</b>; <b>you, we, they — were</b>.', ex: ['I was', 'she was', 'they were'] },
      { t: 'Вопрос и отрицание', x: 'Вопрос — was / were вперёд: <b>Was</b> it good? Отрицание — <b>wasn’t</b>, <b>weren’t</b>.' }
    ],
    size: 3,
    items: [
      S('I [was] at home yesterday.|Вчера я был(а) дома.', 'were,am'), S('It [was] a good day.|Это был хороший день.', 'were,is'),
      S('We [were] in Boston.|Мы были в Бостоне.', 'was,are'), S('[Was] the movie good?|Фильм был хороший?', 'Were,Is'),
      S('They [were] very tired.|Они очень устали.', 'was,are'), S('I [wasn’t] at work.|Я не был(а) на работе.', 'weren’t,isn’t'),
      D.pats.was
    ]
  });

  D.unit({
    id: 'u36', zone: 4, line: 'talk', title: 'Когда это было?', sub: 'yesterday · last week · ago', glyph: 'ago',
    tips: [
      { t: 'last и ago', x: '<b>last</b> — «прошлый»: last week, last night. <b>ago</b> ставится после срока: two days <b>ago</b> — два дня назад.' }
    ],
    items: [
      W('yesterday|вчера|⏪'), W('last night|вчера вечером|🌉'), W('last week|на прошлой неделе'), W('ago|назад'),
      W('before|до, раньше'), W('after|после'), W('later|позже'), W('early|рано|🌄'), W('late|поздно|🕚'), W('weekend|выходные|🧺'),
      P('Two days ago.|Два дня назад.|📆'), P('What did you do yesterday?|Что ты делал(а) вчера?|❓'), P('How was your weekend?|Как прошли выходные?|🙂'),
      P('It was great!|Было здорово!|🤩'), P('Long time no see!|Сто лет не виделись!|👋')
    ]
  });

  D.unit({
    id: 'u37', zone: 4, line: 'gram', title: 'Прошлое: -ed', sub: 'worked · played · watched', glyph: '-ed',
    tips: [
      { t: 'Правильные глаголы', x: 'О прошлом говорят, добавляя <b>-ed</b>: work → worked, play → played. Форма одна для всех: I worked, she worked.' },
      { t: 'Как читать -ed', x: 'После глухих звуков — «т» (worked, watched), после звонких — «д» (played, called), после t и d — «ид» (wanted, visited).', ex: ['worked', 'played', 'wanted'] }
    ],
    lessons: [
      [W('worked|работал(а) (work)'), W('played|играл(а) (play)'), W('watched|смотрел(а) (watch)'), W('cooked|готовил(а) (cook)')],
      [W('called|звонил(а) (call)'), W('wanted|хотел(а) (want)'), W('visited|навещал(а), посетил(а) (visit)'), W('lived|жил(а) (live)')],
      [S('I [worked] late yesterday.|Вчера я работал(а) допоздна.', 'work,works'), S('She [called] me last night.|Она звонила мне вчера вечером.', 'calls,call'), D.pats.ed]
    ]
  });

  D.unit({ id: 'u38', zone: 4, line: 'story', title: 'Первый месяц', sub: 'История', glyph: '8', story: 'st8' });
  D.unit({ id: 'u39', zone: 4, line: 'dial', title: 'Заселение в отель', sub: 'Диалог: вы — Анна', glyph: '⇄', story: 'd1' });

  D.unit({
    id: 'u40', zone: 4, line: 'gram', title: 'Неправильные глаголы', sub: 'went · saw · ate · bought', glyph: 'went',
    tips: [
      { t: 'Особое прошлое', x: 'У самых частых глаголов прошлое особое: go → <b>went</b>, see → <b>saw</b>, eat → <b>ate</b>. Их немного, а встречаются они постоянно — просто запоминаем.' }
    ],
    lessons: [
      [W('went|пошёл, ходил (go)'), W('saw|видел (see)'), W('ate|ел (eat)'), W('drank|пил (drink)')],
      [W('bought|купил (buy)'), W('had|имел; у меня был (have)'), W('got|получил; добрался (get)'), W('made|сделал (make)')],
      [W('came|пришёл (come)'), W('took|взял (take)'), S('We [went] to the park.|Мы ходили в парк.', 'go,goed'), S('I [saw] a big dog.|Я видел(а) большую собаку.', 'see,seed')],
      [S('She [bought] a new phone.|Она купила новый телефон.', 'buy,buyed'), D.pats.irr]
    ]
  });

  D.unit({
    id: 'u41', zone: 4, line: 'gram', title: 'Did you…? I didn’t…', sub: 'Вопросы и отрицания в прошлом', glyph: 'did',
    tips: [
      { t: 'did', x: 'Вопрос в прошлом: <b>Did</b> you see Tom? Отрицание: I <b>didn’t</b> see Tom. После did глагол в обычной форме: did you <b>see</b>, а не saw.' }
    ],
    size: 3,
    items: [
      S('[Did] you see Tom?|Ты видел(а) Тома?', 'Do,Was'), S('I [didn’t] see him.|Я его не видел(а).', 'don’t,wasn’t'),
      S('[Did] she call you?|Она тебе звонила?', 'Does,Was'), S('We [didn’t] go out.|Мы никуда не ходили.', 'don’t,weren’t'),
      S('Did you [eat] breakfast?|Ты завтракал(а)?', 'ate,eats'), S('What [did] you do?|Что ты делал(а)?', 'do,was'),
      D.pats.did
    ]
  });

  D.unit({ id: 'u42', zone: 4, line: 'story', title: 'Где Том?', sub: 'История', glyph: '9', story: 'st9' });

  D.unit({
    id: 'u43', zone: 4, line: 'talk', title: 'Покупки и одежда', sub: 'Размер, цена, примерка', glyph: 'size',
    tips: [
      { t: 'Полезные фразы', x: '<b>I’m just looking</b> — «я просто смотрю», когда продавец предлагает помощь. <b>Can I try it on?</b> — «можно примерить?»' }
    ],
    items: [
      W('clothes|одежда|👚'), W('jacket|куртка|🧥'), W('dress|платье|👗'), W('shoes|обувь, туфли|👟'), W('size|размер|📐'),
      W('price|цена|🏷️'), W('cheap|дешёвый|🪙'), W('expensive|дорогой|💎'), W('sale|распродажа, скидка|🔖'),
      P('Can I try it on?|Можно примерить?|🪞'), P('Do you have a smaller size?|У вас есть размер поменьше?|📐'), P('I’m just looking.|Я просто смотрю.|👀'),
      P('How much is this jacket?|Сколько стоит эта куртка?|🏷️'), P('It’s too expensive.|Это слишком дорого.|💸'), P('I’ll take it.|Я возьму это.|👍'),
      P('Can I get a receipt?|Можно чек?|🧾')
    ]
  });

  D.unit({ id: 'u44', zone: 4, line: 'dial', title: 'В магазине одежды', sub: 'Диалог: вы — Анна', glyph: '⇄', story: 'd2' });
  D.unit({ id: 'u45', zone: 4, line: 'story', title: 'Холодная суббота', sub: 'История', glyph: '10', story: 'st10' });

  // ---------- Zone 5 ----------
  D.unit({
    id: 'u46', zone: 5, line: 'gram', title: 'Собираюсь: going to', sub: 'Планы на будущее', glyph: 'going',
    tips: [
      { t: 'going to', x: 'Когда уже решили что-то сделать: I’m <b>going to</b> call mom — я собираюсь позвонить маме. Перед going to нужен am / is / are.' }
    ],
    size: 3,
    items: [
      S('I’m [going] to call mom.|Я собираюсь позвонить маме.', 'go,will'), S('She [is] going to cook dinner.|Она собирается приготовить ужин.', 'are,am'),
      S('We are going [to] watch a movie.|Мы собираемся посмотреть фильм.', 'for,at'), S('[Are] you going to come?|Ты собираешься прийти?', 'Is,Do'),
      S('It’s [going] to rain.|Сейчас пойдёт дождь.', 'go,will'), D.pats.going
    ]
  });

  D.unit({ id: 'u47', zone: 5, line: 'story', title: 'Планы на выходные', sub: 'История', glyph: '11', story: 'st11' });

  D.unit({
    id: 'u48', zone: 5, line: 'talk', title: 'Телефон и встречи', sub: 'Звонки, сообщения, планы', glyph: 'call',
    tips: [
      { t: 'По телефону', x: 'Отвечая на звонок, говорят <b>Hello?</b> Попросить подождать — <b>Hold on, please</b>. Перезвонить — <b>call back</b>.' }
    ],
    items: [
      W('message|сообщение|✉️'), W('text|писать сообщение|📲'), W('free|свободный|🆓'), W('meet|встречаться|🤝'), W('tonight|сегодня вечером|🌇'),
      P('Can you call me back?|Можете мне перезвонить?|📞'), P('I’ll text you.|Я тебе напишу.|📲'), P('Let’s meet at six.|Давай встретимся в шесть.|🕕'),
      P('Sorry, I’m late.|Извините, я опоздал(а).|⏰'), P('Are you free tomorrow?|Ты завтра свободен?|🗓️'), P('What are you doing tonight?|Что ты делаешь сегодня вечером?|🌙'),
      P('See you soon!|До скорого!|👋'), P('Hold on, please.|Подождите, пожалуйста.|✋')
    ]
  });

  D.unit({ id: 'u49', zone: 5, line: 'dial', title: 'Звонок в пиццерию', sub: 'Диалог: вы — Анна', glyph: '⇄', story: 'd3' });

  D.unit({
    id: 'u50', zone: 5, line: 'gram', title: 'Будущее: will', sub: 'will · won’t', glyph: 'will',
    tips: [
      { t: 'will', x: 'Обещание, решение прямо сейчас или прогноз: I’ll help you. It <b>will</b> be cold. Отрицание — <b>won’t</b> (will not).' },
      { t: 'I’ll = I will', x: 'В речи почти всегда сокращают: I’ll, you’ll, she’ll, we’ll.' }
    ],
    size: 3,
    items: [
      S('I’ll [help] you.|Я тебе помогу.', 'helps,helping'), S('It [will] be cold tomorrow.|Завтра будет холодно.', 'is,was'),
      S('I [won’t] be late.|Я не опоздаю.', 'don’t,am not'), S('[Will] you come?|Ты придёшь?', 'Do,Are'),
      S('She will [call] you later.|Она позвонит тебе позже.', 'calls,called'), D.pats.will
    ]
  });

  D.unit({ id: 'u51', zone: 5, line: 'story', title: 'Звонок маме', sub: 'История', glyph: '12', story: 'st12' });

  D.unit({
    id: 'u52', zone: 5, line: 'talk', title: 'Чувства', sub: 'Как вы себя чувствуете?', glyph: ':)',
    tips: [
      { t: 'I feel…', x: 'О чувствах говорят через am / is: I’m <b>tired</b>, she’s <b>happy</b>. Или: I <b>feel</b> great.' }
    ],
    items: [
      W('happy|счастливый, радостный|😄'), W('sad|грустный|😢'), W('angry|злой, сердитый|😡'), W('tired|уставший|😩'), W('bored|скучающий|😑'),
      W('excited|в восторге|🤩'), W('worried|обеспокоенный|😟'), W('nervous|нервный|😬'), W('scared|напуганный|😨'), W('surprised|удивлённый|😮'),
      P('How do you feel?|Как ты себя чувствуешь?|🙂'), P('I feel great!|Я чувствую себя отлично!|💪'), P('I’m so excited!|Я в восторге!|🥳'),
      P('Don’t worry.|Не волнуйся.|🤗'), P('What’s wrong?|Что случилось?|❓')
    ]
  });

  D.unit({
    id: 'u53', zone: 5, line: 'gram', title: 'Сравнения', sub: 'bigger · better · more expensive', glyph: '-er',
    tips: [
      { t: 'Больше, лучше, дороже', x: 'Короткие слова получают <b>-er</b> и <b>than</b> («чем»): big → bigger than. Длинные — со словом <b>more</b>: more expensive. Исключения: good → <b>better</b>, bad → <b>worse</b>.' }
    ],
    lessons: [
      [W('bigger|больше'), W('smaller|меньше'), W('better|лучше'), W('worse|хуже'), W('than|чем')],
      [S('Tea is [cheaper] than coffee.|Чай дешевле кофе.', 'cheap,more cheap'), S('This is [better] than that.|Это лучше, чем то.', 'good,gooder'), D.pats.cmp]
    ]
  });

  D.unit({ id: 'u54', zone: 5, line: 'story', title: 'Снег в Нью-Йорке', sub: 'История', glyph: '13', story: 'st13' });
  D.unit({ id: 'u55', zone: 5, line: 'dial', title: 'Собеседование', sub: 'Диалог: вы — Анна', glyph: '⇄', story: 'd4' });
  D.unit({ id: 'u56', zone: 5, line: 'dial', title: 'Соседка', sub: 'Диалог: вы — Анна', glyph: '⇄', story: 'd5' });
  D.unit({ id: 'u57', zone: 5, line: 'story', title: 'День рождения Бена', sub: 'История', glyph: '14', story: 'st14' });
  D.unit({ id: 'u58', zone: 5, line: 'dial', title: 'Регистрация на рейс', sub: 'Диалог: вы — Анна', glyph: '⇄', story: 'd6' });
  D.unit({ id: 'u59', zone: 5, line: 'story', title: 'Домой на праздники', sub: 'Финал истории Анны', glyph: '15', story: 'st15' });
})(A.DATA);
