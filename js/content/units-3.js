'use strict';
// Zone 3: simple grammar through patterns, work, media, life abroad.
(function (D) {
  const { W, P, S } = D;

  D.unit({
    id: 'u23', zone: 3, line: 'gram', title: 'Я есть: am, is, are', sub: 'Глагол to be', glyph: 'am',
    tips: [
      { t: 'Глагол-связка обязателен', x: 'По-русски «Я врач», «Она дома». По-английски так нельзя — нужен глагол «быть»: <b>I am</b> a doctor. She <b>is</b> at home.' },
      { t: 'Кто — какая форма', x: '<b>I am</b> · <b>he / she / it is</b> · <b>you / we / they are</b>.', ex: ['I am', 'she is', 'they are'] },
      { t: 'Сокращения', x: 'В речи почти всегда сокращают: I’m, you’re, he’s, she’s, it’s, we’re, they’re.' },
      { t: 'Отрицание и вопрос', x: 'Отрицание — <b>not</b> после глагола: I am <b>not</b> tired. Вопрос — глагол вперёд: <b>Are</b> you OK?' }
    ],
    size: 3,
    items: [
      S('I [am] Anna.|Я Анна.', 'is,are'), S('You [are] my friend.|Ты мой друг.', 'am,is'), S('He [is] a doctor.|Он врач.', 'am,are'),
      S('She [is] from Moscow.|Она из Москвы.', 'am,are'), S('It [is] cold.|Холодно.', 'am,are'), S('We [are] at home.|Мы дома.', 'am,is'),
      S('They [are] happy.|Они счастливы.', 'am,is'), S('I [am] not tired.|Я не устал.', 'is,are'), S('[Are] you OK?|Ты в порядке?', 'Is,Am'),
      S('[Is] it far?|Это далеко?', 'Are,Am'), S('The coffee [is] hot.|Кофе горячий.', 'are,am'), S('My sister [is] a nurse.|Моя сестра — медсестра.', 'are,am'),
      D.pats.be
    ]
  });

  D.unit({ id: 'u24', zone: 3, line: 'story', title: 'Сосед Бен', sub: 'История', glyph: '4', story: 'st4' });

  D.unit({
    id: 'u25', zone: 3, line: 'talk', title: 'Работа', sub: 'Офис, встречи, письма', glyph: 'job',
    tips: [
      { t: 'Профессия с артиклем', x: 'По-английски перед профессией нужен <b>a/an</b>: I’m <b>a</b> programmer, she’s <b>an</b> engineer.' },
      { t: 'What do you do?', x: 'Дословно «Что вы делаете?», но это вопрос о профессии: «Кем вы работаете?»' }
    ],
    items: [
      W('job|работа (должность)|💼'), W('work|работать, работа|🧑‍💻'), W('office|офис|🏢'), W('boss|начальник|👔'), W('meeting|встреча, совещание|🗓️'),
      W('email|электронное письмо|📧'), W('computer|компьютер|💻'), W('colleague|коллега|🧑‍💼'), W('money|деньги|💵'), W('phone|телефон|📱'),
      P('What do you do?|Кем вы работаете?|💼'), P('I’m a programmer.|Я программист.|👩‍💻'), P('I work in an office.|Я работаю в офисе.|🏢'),
      P('I have a meeting at ten.|У меня встреча в десять.|🕙'), P('I’m busy now.|Я сейчас занят.|⏳'), P('Can we talk later?|Можем поговорить позже?|💬'),
      P('Send me an email, please.|Пришлите мне письмо, пожалуйста.|📧'), P('Let’s start.|Давайте начнём.|🚀')
    ]
  });

  D.unit({
    id: 'u26', zone: 3, line: 'gram', title: 'a, an, the', sub: 'Артикли · this и that', glyph: 'the',
    tips: [
      { t: 'a / an — «один, какой-то»', x: 'Когда говорим о предмете впервые или об одном из многих: <b>a</b> cat, <b>a</b> taxi. Перед гласным <b>звуком</b> — <b>an</b>: <b>an</b> apple, <b>an</b> idea.' },
      { t: 'the — «тот самый»', x: 'Когда понятно, о чём именно речь: Open <b>the</b> door (ту самую дверь, которая здесь).' },
      { t: 'this и that', x: '<b>this</b> — «вот это» (рядом), <b>that</b> — «вон то» (далеко).' }
    ],
    size: 3,
    items: [
      // where "the" would also be grammatical, only a / an are offered
      S('This is [a] cat.|Это кот.', 'an'), S('It is [an] apple.|Это яблоко.', 'a'), S('I have [an] idea!|У меня есть идея!', 'a,the'),
      S('That is [a] big dog.|Вон то — большая собака.', 'an'), S('[This] is my phone.|Вот это — мой телефон (он рядом).', 'That'),
      S('[That] is your car.|Вон то — твоя машина (она далеко).', 'This'), S('She is [an] actor.|Она актриса.', 'a'),
      S('Open [the] door, please.|Откройте дверь, пожалуйста.', 'a,an'), S('I need [a] taxi.|Мне нужно такси.', 'an')
    ]
  });

  D.unit({
    id: 'u27', zone: 3, line: 'gram', title: 'Люблю, хочу, могу', sub: 'like · want · can', glyph: 'can',
    tips: [
      { t: 'Три полезных глагола', x: '<b>like</b> — нравится, люблю. <b>want</b> — хочу. <b>can</b> — могу, умею.' },
      { t: 'to или без to', x: 'После <b>want</b> глагол идёт с <b>to</b>: I want <b>to</b> eat. После <b>can</b> — без to: I can swim.' },
      { t: 'Отрицание', x: 'I <b>don’t</b> like… — не люблю. I <b>can’t</b>… — не могу.' }
    ],
    size: 3,
    items: [
      S('I [like] coffee.|Я люблю кофе.', 'want,can'), S('I don’t [like] rain.|Я не люблю дождь.', 'can,am'), S('I [want] a ticket.|Я хочу билет.', 'can,am'),
      S('I want [to] eat.|Я хочу есть.', 'a,the'), S('Do you [like] music?|Тебе нравится музыка?', 'can,are'), S('I [can] swim.|Я умею плавать.', 'like,am'),
      S('I [can’t] swim.|Я не умею плавать.', 'not,am'), S('[Can] you help me?|Вы можете мне помочь?', 'Do,Are'), S('I can speak [English]!|Я умею говорить по-английски!', 'England,Russia')
    ]
  });

  D.unit({
    id: 'u28', zone: 3, line: 'gram', title: 'Каждый день', sub: 'Дни недели · Present Simple', glyph: 'Mon',
    tips: [
      { t: 'Present Simple', x: 'Время для того, что бывает регулярно: I <b>work</b> every day — я работаю каждый день.' },
      { t: 'he / she / it + s', x: 'Если действует он, она или оно — к глаголу добавляется <b>-s</b>: I work → she <b>works</b>, I drink → Anna <b>drinks</b>.' },
      { t: 'Отрицание', x: 'I <b>don’t</b> work, she <b>doesn’t</b> work. После doesn’t буква -s уже не нужна.' },
      { t: 'Дни недели', x: 'Пишутся с большой буквы: Monday, Tuesday… «В понедельник» — <b>on</b> Monday.' }
    ],
    lessons: [
      [W('Monday|понедельник|Пн'), W('Tuesday|вторник|Вт'), W('Wednesday|среда|Ср'), W('Thursday|четверг|Чт')],
      [W('Friday|пятница|Пт'), W('Saturday|суббота|Сб'), W('Sunday|воскресенье|Вс'), W('today|сегодня'), W('tomorrow|завтра')],
      [W('morning|утро|🌅'), W('evening|вечер|🌆'), P('What time is it?|Который час?|⌚'), P('See you tomorrow!|До завтра!|👋')],
      [S('I [work] every day.|Я работаю каждый день.', 'works,working'), S('She [works] on Monday.|Она работает в понедельник.', 'work,working'),
        S('He [doesn’t] work on Sunday.|Он не работает в воскресенье.', 'don’t,isn’t')],
      [S('We [watch] movies on Friday.|По пятницам мы смотрим фильмы.', 'watches,watching'), S('Anna [drinks] coffee every morning.|Анна пьёт кофе каждое утро.', 'drink,drinking'),
        S('I get up at [seven].|Я встаю в семь.', 'seventh,seventy'), D.pats.ps]
    ]
  });

  D.unit({ id: 'u29', zone: 3, line: 'story', title: 'Неделя Анны', sub: 'История', glyph: '5', story: 'st5' });

  D.unit({
    id: 'u30', zone: 3, line: 'talk', title: 'Кино, музыка, игры', sub: 'Фразы из фильмов и игр', glyph: 'Wow',
    tips: [
      { t: 'Живой английский', x: 'В фильмах и играх говорят коротко и эмоционально: <b>Let’s go!</b>, <b>No way!</b>, <b>Cool!</b> Эти фразы вы будете слышать постоянно.' },
      { t: 'movie', x: 'В США фильм — <b>movie</b>, сходить в кино — go to the movies.' }
    ],
    items: [
      W('movie|фильм|🎬'), W('music|музыка|🎼'), W('watch|смотреть|📺'), W('listen|слушать|🎧'), W('win|выигрывать|🏆'), W('lose|проигрывать|😞'),
      W('level|уровень|📶'), W('player|игрок|🕹️'), W('actor|актёр|🎭'), W('funny|смешной|😂'), W('scary|страшный|👻'), W('boring|скучный|🥱'),
      P('Let’s watch a movie!|Давай посмотрим фильм!|🍿'), P('I love this song!|Обожаю эту песню!|🎶'), P('Game over!|Игра окончена!|👾'),
      P('Level up!|Новый уровень!|🆙'), P('Let’s go!|Поехали! Вперёд!|🏁'), P('Are you ready?|Ты готов?|🚦'), P('No way!|Не может быть!|😲'),
      P('What’s up?|Как дела? Что нового? (разг.)|🤙'), P('That’s cool!|Круто!|😎')
    ]
  });

  D.unit({ id: 'u31', zone: 3, line: 'story', title: 'Вечер кино', sub: 'История', glyph: '6', story: 'st6' });

  D.unit({
    id: 'u32', zone: 3, line: 'gram', title: 'Вопросы', sub: 'do · does · what · where', glyph: '?',
    tips: [
      { t: 'Вопрос с do / does', x: 'В Present Simple вопрос начинается с <b>Do</b> (I, you, we, they) или <b>Does</b> (he, she, it): <b>Do</b> you speak English? <b>Does</b> he like coffee?' },
      { t: 'Вопросительные слова', x: '<b>what</b> — что, <b>where</b> — где, <b>when</b> — когда, <b>who</b> — кто, <b>why</b> — почему, <b>how</b> — как.' }
    ],
    size: 3,
    items: [
      S('[Do] you speak English?|Вы говорите по-английски?', 'Are,Does'), S('[Does] he like coffee?|Он любит кофе?', 'Do,Is'),
      S('[Where] do you live?|Где вы живёте?', 'What,Who'), S('[What] do you want?|Что вы хотите?', 'Where,When'),
      S('[When] does the shop open?|Когда открывается магазин?', 'Who,What'), S('[Who] is that?|Кто это?', 'What,Where'),
      S('[Why] are you sad?|Почему ты грустишь?', 'Who,What'), S('[How] are you today?|Как ты сегодня?', 'What,Who'), S('[Do] they work here?|Они здесь работают?', 'Does,Are'),
      D.pats.q
    ]
  });

  D.unit({
    id: 'u33', zone: 3, line: 'talk', title: 'Жизнь за границей', sub: 'Квартира, магазин, врач', glyph: 'rent',
    tips: [
      { t: 'I need…', x: '<b>I need</b> — «мне нужно». I need a doctor. I need a taxi.' },
      { t: 'Американские слова', x: 'Квартира — <b>apartment</b>, магазин — <b>store</b>, продукты — <b>groceries</b>.' }
    ],
    items: [
      W('apartment|квартира|🏢🛋️'), W('rent|аренда|📃'), W('neighbor|сосед|🙋‍♂️'), W('doctor|врач|🧑‍⚕️'), W('store|магазин|🏬'),
      W('sick|больной|🤒'), W('headache|головная боль|🤕'), W('medicine|лекарство|💉'), W('card|карта (банковская)|💳'), W('cash|наличные|💴'),
      P('I need a doctor.|Мне нужен врач.|🧑‍⚕️'), P('I have a headache.|У меня болит голова.|🤕'), P('I’m looking for an apartment.|Я ищу квартиру.|🔎'),
      P('How much is the rent?|Сколько стоит аренда?|💲'), P('Can I pay by card?|Можно оплатить картой?|💳'), P('Do you take cash?|Вы принимаете наличные?|💴'),
      P('I’m new here.|Я здесь недавно.|🆕'), P('Have a nice day!|Хорошего дня!|🌞')
    ]
  });

  D.unit({ id: 'u34', zone: 3, line: 'story', title: 'У врача', sub: 'История', glyph: '7', story: 'st7' });
})(A.DATA);
