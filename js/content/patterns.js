'use strict';
// Grammar patterns: one rule, many sentences. Each time a pattern is practised it produces a new
// sentence (subject × phrase), so the learner trains the rule rather than memorising one sentence.
// Also: short explanations for wrong answers (D.why).
(function (D) {
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  // person: 1s I, 2s you, 3s he/she/it, 1p we, 3p they; gender for Russian past tense: m, f, p (plural), x (я/ты — «был(а)»)
  const S = {
    I: { en: 'I', ru: 'я', p: '1s', g: 'x' },
    you: { en: 'you', ru: 'ты', p: '2s', g: 'x' },
    he: { en: 'he', ru: 'он', p: '3s', g: 'm' },
    she: { en: 'she', ru: 'она', p: '3s', g: 'f' },
    we: { en: 'we', ru: 'мы', p: '1p', g: 'p' },
    they: { en: 'they', ru: 'они', p: '3p', g: 'p' },
    anna: { en: 'Anna', ru: 'Анна', p: '3s', g: 'f' },
    ben: { en: 'Ben', ru: 'Бен', p: '3s', g: 'm' },
    mom: { en: 'my mom', ru: 'моя мама', p: '3s', g: 'f' }
  };
  const be = s => s.p === '1s' ? 'am' : s.p === '3s' ? 'is' : 'are';
  const was = s => (s.p === '1s' || s.p === '3s') ? 'was' : 'were';
  const third = s => s.p === '3s';
  const enSubj = (s, first) => first ? cap(s.en) : s.en;
  // Russian past tense by gender: past(['работал', 'работала', 'работали'], s)
  const past = (f, s) => s.g === 'm' ? f[0] : s.g === 'f' ? f[1] : s.g === 'p' ? f[2] : f[0] + '(а)';
  // Russian present/future by person: pres({1s, 2s, 3s, 1p, 3p}, s)
  const pres = (f, s) => f[s.p];
  const all = list => list;

  const pats = {};
  const PAT = (key, o) => {
    const variants = o.build();
    const item = {
      id: 'pat:' + key, kind: 'pat', en: o.title, ru: o.ru, rule: o.rule,
      variants,
      gen() { return variants[Math.floor(Math.random() * variants.length)]; }
    };
    pats[key] = item;
    return item;
  };
  // A sentence with [gap]: returns the same shape as D.S() items
  const sent = (raw, ru, alts) => {
    const m = raw.match(/\[([^\]]+)\]/);
    return { en: raw.replace(/[[\]]/g, ''), ru, gap: m[1], gapAt: raw.indexOf('['), alts };
  };

  PAT('be', {
    title: 'am · is · are', ru: 'глагол «быть» в настоящем времени',
    rule: '<b>I am</b> · <b>he / she / it is</b> · <b>you / we / they are</b>. В русском глагол пропускают («Я дома»), в английском — никогда: I <b>am</b> at home.',
    build: () => {
      const places = [['at home', 'дома'], ['at work', 'на работе'], ['in New York', 'в Нью-Йорке'], ['from Russia', 'из России'], ['here', 'здесь'], ['in the park', 'в парке']];
      const out = [];
      [S.I, S.you, S.he, S.she, S.we, S.they, S.anna, S.mom].forEach(s => places.forEach(([en, ru]) => {
        const v = be(s);
        out.push(sent(`${enSubj(s, true)} [${v}] ${en}.`, `${cap(s.ru)} ${ru}.`, ['am', 'is', 'are'].filter(x => x !== v)));
      }));
      return out;
    }
  });

  PAT('ps', {
    title: 'I work · she works', ru: 'Present Simple: то, что бывает регулярно',
    rule: 'С <b>I, you, we, they</b> глагол без окончания: I <b>work</b>. С <b>he, she, it</b> и одним человеком — с <b>-s</b>: Anna <b>works</b>.',
    build: () => {
      const verbs = [
        ['work', 'works', 'every day', { '1s': 'работаю', '2s': 'работаешь', '3s': 'работает', '1p': 'работаем', '3p': 'работают' }, 'каждый день'],
        ['live', 'lives', 'in New York', { '1s': 'живу', '2s': 'живёшь', '3s': 'живёт', '1p': 'живём', '3p': 'живут' }, 'в Нью-Йорке'],
        ['drink', 'drinks', 'coffee every morning', { '1s': 'пью', '2s': 'пьёшь', '3s': 'пьёт', '1p': 'пьём', '3p': 'пьют' }, 'кофе каждое утро'],
        ['watch', 'watches', 'movies on Friday', { '1s': 'смотрю', '2s': 'смотришь', '3s': 'смотрит', '1p': 'смотрим', '3p': 'смотрят' }, 'фильмы по пятницам'],
        ['play', 'plays', 'video games', { '1s': 'играю', '2s': 'играешь', '3s': 'играет', '1p': 'играем', '3p': 'играют' }, 'в видеоигры']
      ];
      const out = [];
      [S.I, S.you, S.he, S.she, S.we, S.they, S.anna, S.ben].forEach(s => verbs.forEach(([b, s3, rest, ru, ruRest]) => {
        const v = third(s) ? s3 : b;
        out.push(sent(`${enSubj(s, true)} [${v}] ${rest}.`, `${cap(s.ru)} ${pres(ru, s)} ${ruRest}.`, [third(s) ? b : s3, b + 'ing']));
      }));
      return out;
    }
  });

  PAT('q', {
    title: 'Do you…? Does she…?', ru: 'вопросы в Present Simple',
    rule: 'Вопрос начинается с <b>Do</b> (I, you, we, they) или <b>Does</b> (he, she, it). После does у глагола уже нет -s: <b>Does</b> she <b>like</b>…?',
    build: () => {
      const verbs = [
        ['like coffee', { '2s': 'любишь', '3s': 'любит', '3p': 'любят' }, 'кофе'],
        ['speak English', { '2s': 'говоришь', '3s': 'говорит', '3p': 'говорят' }, 'по-английски'],
        ['work here', { '2s': 'работаешь', '3s': 'работает', '3p': 'работают' }, 'здесь'],
        ['live in Boston', { '2s': 'живёшь', '3s': 'живёт', '3p': 'живут' }, 'в Бостоне']
      ];
      const out = [];
      [S.you, S.he, S.she, S.they, S.anna, S.ben].forEach(s => verbs.forEach(([rest, ru, ruRest]) => {
        const aux = third(s) ? 'Does' : 'Do';
        out.push(sent(`[${aux}] ${s.en} ${rest}?`, `${cap(s.ru)} ${pres(ru, s)} ${ruRest}?`, third(s) ? ['Do', 'Is'] : ['Does', 'Are']));
      }));
      return out;
    }
  });

  PAT('was', {
    title: 'was · were', ru: 'глагол «быть» в прошлом',
    rule: '<b>I / he / she / it was</b> · <b>you / we / they were</b>. Это прошлое от am / is / are.',
    build: () => {
      const places = [['at home', 'дома'], ['at work', 'на работе'], ['in the park', 'в парке'], ['in Boston', 'в Бостоне']];
      const out = [];
      [S.I, S.you, S.he, S.she, S.we, S.they, S.anna, S.ben].forEach(s => places.forEach(([en, ru]) => {
        const v = was(s);
        out.push(sent(`${enSubj(s, true)} [${v}] ${en} yesterday.`, `Вчера ${s.ru} ${past(['был', 'была', 'были'], s)} ${ru}.`, v === 'was' ? ['were', 'is'] : ['was', 'are']));
      }));
      return out;
    }
  });

  PAT('ed', {
    title: 'worked, played', ru: 'прошедшее время правильных глаголов',
    rule: 'К глаголу добавляют <b>-ed</b>: work → <b>worked</b>. Форма одна для всех: I worked, she worked.',
    build: () => {
      const verbs = [
        ['worked', 'work', 'late', ['работал', 'работала', 'работали'], 'допоздна'],
        ['watched', 'watch', 'a movie', ['смотрел', 'смотрела', 'смотрели'], 'фильм'],
        ['cooked', 'cook', 'dinner', ['готовил', 'готовила', 'готовили'], 'ужин'],
        ['called', 'call', 'mom', ['звонил', 'звонила', 'звонили'], 'маме']
      ];
      const out = [];
      [S.I, S.you, S.he, S.she, S.we, S.they, S.anna, S.ben].forEach(s => verbs.forEach(([ed, b, rest, ru, ruRest]) => {
        out.push(sent(`${enSubj(s, true)} [${ed}] ${rest} yesterday.`, `Вчера ${s.ru} ${past(ru, s)} ${ruRest}.`, [b, b + 's']));
      }));
      return out;
    }
  });

  PAT('irr', {
    title: 'went, saw, ate', ru: 'неправильные глаголы в прошлом',
    rule: 'У частых глаголов прошлое особое: go → <b>went</b>, see → <b>saw</b>, eat → <b>ate</b>, buy → <b>bought</b>, drink → <b>drank</b>. Формы «goed» нет.',
    build: () => {
      const verbs = [
        ['went', 'go', 'goed', 'to the park', ['ходил', 'ходила', 'ходили'], 'в парк'],
        ['saw', 'see', 'seed', 'Tom', ['видел', 'видела', 'видели'], 'Тома'],
        ['ate', 'eat', 'eated', 'pizza', ['ел', 'ела', 'ели'], 'пиццу'],
        ['bought', 'buy', 'buyed', 'a coat', ['купил', 'купила', 'купили'], 'пальто'],
        ['drank', 'drink', 'drinked', 'tea', ['пил', 'пила', 'пили'], 'чай']
      ];
      const out = [];
      [S.I, S.you, S.he, S.she, S.we, S.they, S.anna, S.ben].forEach(s => verbs.forEach(([p, b, wrong, rest, ru, ruRest]) => {
        out.push(sent(`${enSubj(s, true)} [${p}] ${rest} yesterday.`, `Вчера ${s.ru} ${past(ru, s)} ${ruRest}.`, [b, wrong]));
      }));
      return out;
    }
  });

  PAT('did', {
    title: 'Did you…? I didn’t…', ru: 'вопросы и отрицания в прошлом',
    rule: 'Вопрос: <b>Did</b> you see…? Отрицание: I <b>didn’t</b> see… После did глагол в обычной форме: did you <b>see</b>, а не saw.',
    build: () => {
      const verbs = [
        ['see Tom', ['видел', 'видела', 'видели'], 'Тома'],
        ['call mom', ['звонил', 'звонила', 'звонили'], 'маме'],
        ['watch the movie', ['смотрел', 'смотрела', 'смотрели'], 'фильм'],
        ['eat breakfast', ['завтракал', 'завтракала', 'завтракали'], '']
      ];
      const out = [];
      [S.you, S.he, S.she, S.they, S.anna, S.ben].forEach(s => verbs.forEach(([rest, ru, ruRest]) => {
        out.push(sent(`[Did] ${s.en} ${rest} yesterday?`, `${cap(s.ru)} ${past(ru, s)}${ruRest ? ' ' + ruRest : ''} вчера?`, ['Do', 'Was']));
      }));
      [S.I, S.you, S.he, S.she, S.we, S.they, S.anna, S.ben].forEach(s => verbs.forEach(([rest, ru, ruRest]) => {
        out.push(sent(`${enSubj(s, true)} [didn’t] ${rest}.`, `${cap(s.ru)} не ${past(ru, s)}${ruRest ? ' ' + ruRest : ''}.`, ['don’t', 'wasn’t']));
      }));
      return out;
    }
  });

  PAT('going', {
    title: 'I’m going to…', ru: 'планы: собираюсь сделать',
    rule: '<b>am / is / are + going to</b> + глагол: I <b>am going to</b> call mom — я собираюсь позвонить маме.',
    build: () => {
      const verbs = [['call mom', 'позвонить маме'], ['cook dinner', 'приготовить ужин'], ['watch a movie', 'посмотреть фильм'], ['buy a coat', 'купить пальто'], ['visit Boston', 'съездить в Бостон']];
      const ru = { '1s': 'собираюсь', '2s': 'собираешься', '3s': 'собирается', '1p': 'собираемся', '3p': 'собираются' };
      const out = [];
      [S.I, S.you, S.he, S.she, S.we, S.they, S.anna, S.ben].forEach(s => verbs.forEach(([rest, ruRest]) => {
        const v = be(s);
        out.push(sent(`${enSubj(s, true)} [${v}] going to ${rest}.`, `${cap(s.ru)} ${ru[s.p]} ${ruRest}.`, ['am', 'is', 'are'].filter(x => x !== v)));
      }));
      return out;
    }
  });

  PAT('will', {
    title: 'will · won’t', ru: 'будущее: обещания и решения',
    rule: '<b>will</b> + глагол — «сделаю»: I <b>will</b> call you. <b>won’t</b> (will not) — «не сделаю»: I <b>won’t</b> be late. Форма одна для всех.',
    build: () => {
      const verbs = [
        [true, 'call mom tomorrow', { '1s': 'позвоню', '2s': 'позвонишь', '3s': 'позвонит', '1p': 'позвоним', '3p': 'позвонят' }, 'маме завтра'],
        [true, 'come tomorrow', { '1s': 'приду', '2s': 'придёшь', '3s': 'придёт', '1p': 'придём', '3p': 'придут' }, 'завтра'],
        [false, 'be late', { '1s': 'опоздаю', '2s': 'опоздаешь', '3s': 'опоздает', '1p': 'опоздаем', '3p': 'опоздают' }, ''],
        [false, 'forget', { '1s': 'забуду', '2s': 'забудешь', '3s': 'забудет', '1p': 'забудем', '3p': 'забудут' }, '']
      ];
      const out = [];
      [S.I, S.you, S.he, S.she, S.we, S.they, S.anna, S.ben].forEach(s => verbs.forEach(([pos, rest, ru, ruRest]) => {
        const w = pos ? 'will' : 'won’t';
        const ruText = `${cap(s.ru)} ${pos ? '' : 'не '}${pres(ru, s)}${ruRest ? ' ' + ruRest : ''}.`;
        out.push(sent(`${enSubj(s, true)} [${w}] ${rest}.`, ruText, pos ? ['won’t', 'is'] : ['will', 'don’t']));
      }));
      return out;
    }
  });

  PAT('cmp', {
    title: 'bigger than', ru: 'сравнение: больше, лучше, дороже',
    rule: 'Короткие слова: <b>-er + than</b> (big → bigger than). Длинные: <b>more</b> expensive. Исключения: good → <b>better</b>, bad → <b>worse</b>.',
    build: () => all([
      sent('New York is [bigger] than Boston.', 'Нью-Йорк больше Бостона.', ['big', 'more big']),
      sent('Moscow is [colder] than New York.', 'В Москве холоднее, чем в Нью-Йорке.', ['cold', 'more cold']),
      sent('Ben is [older] than Anna.', 'Бен старше Анны.', ['old', 'more old']),
      sent('My bag is [smaller] than your bag.', 'Моя сумка меньше твоей.', ['small', 'more small']),
      sent('This movie is [better] than that movie.', 'Этот фильм лучше того.', ['good', 'gooder']),
      sent('Pizza is [more] expensive than salad.', 'Пицца дороже салата.', ['most', 'much']),
      sent('The subway is [faster] than the bus.', 'Метро быстрее автобуса.', ['fast', 'more fast']),
      sent('Today is [hotter] than yesterday.', 'Сегодня жарче, чем вчера.', ['hot', 'more hot']),
      sent('My English is [better] now.', 'Мой английский теперь лучше.', ['good', 'more good']),
      sent('This hotel is [worse] than that hotel.', 'Этот отель хуже того.', ['bad', 'badder']),
      sent('A taxi is [more] expensive than the subway.', 'Такси дороже метро.', ['most', 'very'])
    ])
  });

  D.pats = pats;

  // Short explanations shown when a wrong word is chosen
  D.why = {
    am: '<b>am</b> — только с I: I am.',
    is: '<b>is</b> — с he, she, it и с одним человеком или предметом: she is, the coffee is.',
    are: '<b>are</b> — с you, we, they и с несколькими: they are, Anna and Ben are.',
    was: '<b>was</b> — прошлое от am и is: I was, she was.',
    were: '<b>were</b> — прошлое от are: you were, they were.',
    a: '<b>a</b> — «один, какой-то», перед согласным звуком: a cat, a taxi.',
    an: '<b>an</b> — то же, что a, но перед гласным звуком: an apple, an idea.',
    the: '<b>the</b> — «тот самый», когда понятно, о чём речь: open the door.',
    this: '<b>this</b> — «вот это», то, что рядом.',
    that: '<b>that</b> — «вон то», то, что далеко.',
    like: '<b>like</b> — нравится, люблю.',
    want: '<b>want</b> — хочу.',
    can: '<b>can</b> — могу, умею. После can глагол без to: I can swim.',
    'can’t': '<b>can’t</b> — не могу, не умею.',
    not: '<b>not</b> — «не», но перед глаголом одно оно не ставится: нужно can’t, don’t, isn’t.',
    to: '<b>to</b> ставится после want и going: I want to eat, I’m going to call.',
    do: '<b>do</b> — вспомогательное слово для вопросов с I, you, we, they.',
    does: '<b>does</b> — для вопросов с he, she, it. После него у глагола нет -s.',
    did: '<b>did</b> — для вопросов в прошлом с любым лицом: Did you…? Did she…?',
    'don’t': '<b>don’t</b> — «не» в настоящем с I, you, we, they: I don’t like.',
    'doesn’t': '<b>doesn’t</b> — «не» в настоящем с he, she, it: he doesn’t work.',
    'didn’t': '<b>didn’t</b> — «не» в прошлом с любым лицом: I didn’t see.',
    'isn’t': '<b>isn’t</b> — «не является» (is not). С обычными глаголами действия нужен don’t / doesn’t.',
    'wasn’t': '<b>wasn’t</b> — «не был» (was not). С глаголами действия в прошлом нужен didn’t.',
    'weren’t': '<b>weren’t</b> — «не были» (were not).',
    'am not': '<b>am not</b> — «я не являюсь». Для будущего «не сделаю» нужен won’t.',
    will: '<b>will</b> — «сделаю» в будущем: I will call.',
    'won’t': '<b>won’t</b> — «не сделаю» в будущем (will not).',
    going: '<b>going to</b> — «собираюсь»: I’m going to call.',
    go: '<b>go</b> — «идти» в обычной форме.',
    for: '<b>for</b> — «для». После going нужен to.',
    at: '<b>at</b> — «в, у» (место или время). После going нужен to.',
    where: '<b>where</b> — где.', what: '<b>what</b> — что.', when: '<b>when</b> — когда.', who: '<b>who</b> — кто.', why: '<b>why</b> — почему.', how: '<b>how</b> — как.',
    english: '<b>English</b> — английский язык.', england: '<b>England</b> — Англия (страна).', russia: '<b>Russia</b> — Россия (страна).',
    seven: '<b>seven</b> — семь.', seventh: '<b>seventh</b> — седьмой.', seventy: '<b>seventy</b> — семьдесят.',
    more: '<b>more</b> ставится перед длинными словами: more expensive. Короткие получают -er: bigger.',
    most: '<b>most</b> — «самый» (самый дорогой). Для сравнения двух вещей нужно more.',
    much: '<b>much</b> — «много». Для сравнения нужно more.',
    very: '<b>very</b> — «очень». Для сравнения нужно more.',
    than: '<b>than</b> — «чем».',
    gooder: 'Такого слова нет: good → <b>better</b>.',
    badder: 'Такого слова нет: bad → <b>worse</b>.',
    better: '<b>better</b> — лучше (от good).', worse: '<b>worse</b> — хуже (от bad).',
    good: '<b>good</b> — хороший. Для сравнения нужно better.', bad: '<b>bad</b> — плохой. Для сравнения нужно worse.',
    went: '<b>went</b> — прошедшее время от go.', saw: '<b>saw</b> — прошедшее время от see.', ate: '<b>ate</b> — прошедшее время от eat.',
    bought: '<b>bought</b> — прошедшее время от buy.', drank: '<b>drank</b> — прошедшее время от drink.',
    goed: 'Такой формы нет: у go прошедшее время — <b>went</b>.', seed: 'Такой формы нет: у see прошедшее время — <b>saw</b>.',
    eated: 'Такой формы нет: у eat прошедшее время — <b>ate</b>.', buyed: 'Такой формы нет: у buy прошедшее время — <b>bought</b>.',
    drinked: 'Такой формы нет: у drink прошедшее время — <b>drank</b>.',
    see: '<b>see</b> — «видеть», обычная форма (после did, will, can).', eat: '<b>eat</b> — «есть», обычная форма (после did, will, can).',
    buy: '<b>buy</b> — «покупать», обычная форма.', drink: '<b>drink</b> — «пить», обычная форма.',
    help: '<b>help</b> — обычная форма: после will, can, did глагол без окончаний.', call: '<b>call</b> — обычная форма: после will, can, did глагол без окончаний.'
  };
})(A.DATA);
