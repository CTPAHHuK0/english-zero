'use strict';
// Story line: Anna from Moscow gets a job in New York and moves there with her cat Tom.
// Each line: [speaker, English, Russian]. Speaker '' = narrator. Anna's lines are on the right.
// Questions: [question, correct answer, wrong, wrong].
(function (D) {
  const story = (id, o) => { D.stories[id] = Object.assign({ id }, o); };

  story('st1', {
    title: 'Анна и Том', intro: 'Знакомьтесь: Анна из Москвы и её кот.',
    lines: [
      ['Anna', 'Hi! I’m Anna.', 'Привет! Я Анна.'],
      ['Anna', 'I’m from Moscow.', 'Я из Москвы.'],
      ['Anna', 'This is my cat, Tom.', 'Это мой кот Том.'],
      ['Anna', 'Tom is big and red.', 'Том большой и рыжий.'],
      ['Anna', 'Tom has a hat!', 'У Тома есть шляпа!'],
      ['Anna', 'The hat is red, too.', 'Шляпа тоже красная.'],
      ['Anna', 'Tom can sit in a bag.', 'Том умеет сидеть в сумке.'],
      ['Anna', 'Tom, get in the bag! We have a big trip!', 'Том, залезай в сумку! У нас большая поездка!']
    ],
    questions: [
      ['Откуда Анна?', 'Из Москвы', 'Из Лондона', 'Из Нью-Йорка'],
      ['Какой Том?', 'Большой и рыжий', 'Маленький и чёрный', 'Большой и белый'],
      ['Где может сидеть Том?', 'В сумке', 'В автобусе', 'В шляпе']
    ]
  });

  story('st2', {
    title: 'Большая новость', intro: 'Анна звонит родителям.',
    lines: [
      ['Anna', 'Mom! Dad! I have big news!', 'Мама! Папа! У меня большая новость!'],
      ['Mom', 'What is it?', 'Что такое?'],
      ['Anna', 'I have a new job!', 'У меня новая работа!'],
      ['Anna', 'The job is in New York.', 'Работа в Нью-Йорке.'],
      ['Dad', 'New York? That is far!', 'Нью-Йорк? Это далеко!'],
      ['Mom', 'Is it a good job?', 'Это хорошая работа?'],
      ['Anna', 'Yes! It is a very good job.', 'Да! Очень хорошая работа.'],
      ['Dad', 'And Tom?', 'А Том?'],
      ['Anna', 'Tom is in the bag. He can go with me!', 'Том в сумке. Он поедет со мной!'],
      ['Mom', 'Then this is a happy day!', 'Тогда это счастливый день!']
    ],
    questions: [
      ['Где новая работа Анны?', 'В Нью-Йорке', 'В Москве', 'В Лондоне'],
      ['Что папа говорит о Нью-Йорке?', 'Это далеко', 'Это рядом', 'Это скучно'],
      ['Кто поедет с Анной?', 'Кот Том', 'Мама', 'Папа']
    ]
  });

  story('st3', {
    title: 'В аэропорту', intro: 'Анна прилетела в Нью-Йорк. Паспортный контроль.',
    lines: [
      ['Officer', 'Hello! Your passport, please.', 'Здравствуйте! Ваш паспорт, пожалуйста.'],
      ['Anna', 'Here is my passport.', 'Вот мой паспорт.'],
      ['Officer', 'Are you here on vacation?', 'Вы здесь в отпуске?'],
      ['Anna', 'No, I’m here for work.', 'Нет, я здесь по работе.'],
      ['Officer', 'And who is this?', 'А это кто?'],
      ['Anna', 'This is Tom. He is my cat.', 'Это Том. Он мой кот.'],
      ['Officer', 'Hi, Tom! Welcome to America!', 'Привет, Том! Добро пожаловать в Америку!'],
      ['Anna', 'Thank you! Where is the taxi?', 'Спасибо! Где такси?'],
      ['Officer', 'It’s near the door.', 'Рядом с дверью.'],
      ['Anna', 'Taxi to the hotel, please!', 'Такси до отеля, пожалуйста!']
    ],
    questions: [
      ['Зачем Анна приехала?', 'По работе', 'В отпуск', 'В гости к маме'],
      ['Что офицер попросил сначала?', 'Паспорт', 'Билет', 'Сумку'],
      ['Куда Анна едет на такси?', 'В отель', 'В офис', 'В аэропорт']
    ]
  });

  story('st4', {
    title: 'Сосед Бен', intro: 'Анна переехала в квартиру. В дверь стучат.',
    lines: [
      ['Ben', 'Hi! I’m Ben. I’m your neighbor.', 'Привет! Я Бен. Я ваш сосед.'],
      ['Anna', 'Nice to meet you, Ben! I’m Anna.', 'Приятно познакомиться, Бен! Я Анна.'],
      ['Ben', 'Are you new here?', 'Вы здесь недавно?'],
      ['Anna', 'Yes, I am. I am from Moscow.', 'Да. Я из Москвы.'],
      ['Ben', 'Cool! Is that your cat?', 'Круто! Это ваш кот?'],
      ['Anna', 'Yes, he is. His name is Tom.', 'Да. Его зовут Том.'],
      ['Ben', 'He is very big!', 'Он очень большой!'],
      ['Anna', 'He is big, but he is a good cat.', 'Он большой, но он хороший кот.'],
      ['Ben', 'I am a teacher. And you?', 'Я учитель. А вы?'],
      ['Anna', 'I am a programmer. My office is near here.', 'Я программист. Мой офис рядом.']
    ],
    questions: [
      ['Кто такой Бен?', 'Сосед Анны', 'Её начальник', 'Её брат'],
      ['Кем работает Бен?', 'Учителем', 'Врачом', 'Программистом'],
      ['Что Бен говорит о Томе?', 'Он очень большой', 'Он маленький', 'Он злой']
    ]
  });

  story('st5', {
    title: 'Неделя Анны', intro: 'Анна рассказывает о своей неделе.',
    lines: [
      ['Anna', 'I work every day from Monday to Friday.', 'Я работаю каждый день с понедельника по пятницу.'],
      ['Anna', 'I get up at seven.', 'Я встаю в семь.'],
      ['Anna', 'I drink coffee and eat an egg.', 'Я пью кофе и ем яйцо.'],
      ['Anna', 'I take the subway to work.', 'Я езжу на работу на метро.'],
      ['Anna', 'At work, I have a lot of meetings.', 'На работе у меня много встреч.'],
      ['Anna', 'My boss is nice, and my colleagues are funny.', 'Мой начальник приятный, а коллеги весёлые.'],
      ['Anna', 'On Friday, Ben and I watch movies.', 'По пятницам мы с Беном смотрим фильмы.'],
      ['Anna', 'On Saturday, I sleep a lot!', 'В субботу я много сплю!'],
      ['Anna', 'Tom sleeps every day. He doesn’t work!', 'Том спит каждый день. Он не работает!']
    ],
    questions: [
      ['Во сколько встаёт Анна?', 'В семь', 'В шесть', 'В десять'],
      ['Как Анна ездит на работу?', 'На метро', 'На такси', 'На автобусе'],
      ['Что Том делает каждый день?', 'Спит', 'Работает', 'Смотрит фильмы']
    ]
  });

  story('st6', {
    title: 'Вечер кино', intro: 'Пятница. Бен заходит к Анне.',
    lines: [
      ['Ben', 'What’s up, Anna?', 'Как дела, Анна?'],
      ['Anna', 'Hi, Ben! Let’s watch a movie!', 'Привет, Бен! Давай посмотрим фильм!'],
      ['Ben', 'Cool! A funny movie or a scary movie?', 'Круто! Смешной фильм или страшный?'],
      ['Anna', 'A funny movie, please. Scary movies are not for me.', 'Смешной, пожалуйста. Страшные фильмы не для меня.'],
      ['Ben', 'OK. Do you want popcorn?', 'Хорошо. Хочешь попкорн?'],
      ['Anna', 'Yes, please!', 'Да, пожалуйста!'],
      ['Ben', 'Do you like the movie?', 'Тебе нравится фильм?'],
      ['Anna', 'I love it! The actor is so funny!', 'Обожаю! Актёр такой смешной!'],
      ['Ben', 'After the movie, let’s play a game!', 'После фильма давай поиграем в игру!'],
      ['Anna', 'OK, but I always win!', 'Хорошо, но я всегда выигрываю!']
    ],
    questions: [
      ['Какой фильм выбрала Анна?', 'Смешной', 'Страшный', 'Скучный'],
      ['Что предлагает Бен?', 'Попкорн', 'Пиццу', 'Салат'],
      ['Что они будут делать после фильма?', 'Играть в игру', 'Спать', 'Работать']
    ]
  });

  story('st7', {
    title: 'У врача', intro: 'Анна много работает и плохо себя чувствует.',
    lines: [
      ['Doctor', 'Hello, Anna. How are you today?', 'Здравствуйте, Анна. Как вы сегодня?'],
      ['Anna', 'Not good. I have a headache.', 'Не очень. У меня болит голова.'],
      ['Doctor', 'Do you sleep well?', 'Вы хорошо спите?'],
      ['Anna', 'No. I work a lot, and I’m very tired.', 'Нет. Я много работаю и очень устала.'],
      ['Doctor', 'Do you drink water?', 'Вы пьёте воду?'],
      ['Anna', 'Not much. I drink a lot of coffee!', 'Мало. Я пью много кофе!'],
      ['Doctor', 'OK. Drink water, sleep more, and take this medicine.', 'Хорошо. Пейте воду, больше спите и принимайте это лекарство.'],
      ['Anna', 'Thank you, doctor! Can I pay by card?', 'Спасибо, доктор! Можно оплатить картой?'],
      ['Doctor', 'Yes, of course. Have a nice day!', 'Да, конечно. Хорошего дня!']
    ],
    questions: [
      ['Что болит у Анны?', 'Голова', 'Нога', 'Спина'],
      ['Что Анна пьёт много?', 'Кофе', 'Воду', 'Чай'],
      ['Как Анна платит?', 'Картой', 'Наличными', 'Не платит']
    ]
  });

  // Words that appear in stories but are not course items (function words, names, extras)
  Object.assign(D.gloss, {
    a: 'артикль «один, какой-то»', an: 'артикль (перед гласной)', the: 'артикль «тот самый»', and: 'и', but: 'но', or: 'или', too: 'тоже',
    in: 'в', on: 'на; в (день недели)', at: 'в, у', to: 'к, в, до', from: 'из, от', with: 'с', for: 'для; по', of: 'из, о (связка)', after: 'после', near: 'рядом',
    my: 'мой', your: 'твой, ваш', his: 'его', her: 'её', me: 'меня, мне', it: 'это, оно', this: 'это, этот', that: 'то, тот',
    i: 'я', you: 'ты, вы', he: 'он', she: 'она', we: 'мы', they: 'они',
    is: 'есть (он, она, оно)', am: 'есть (я)', are: 'есть (ты, вы, мы, они)', be: 'быть', was: 'был',
    have: 'иметь; у меня есть', has: 'имеет; у него есть', do: 'делать (и вспомогательное слово для вопросов)', does: 'вспомогательное слово (он, она)',
    "don't": 'не (do not)', "doesn't": 'не (does not)', not: 'не', no: 'нет', yes: 'да', can: 'могу, умею', "can't": 'не могу',
    "i'm": 'я (I am)', "it's": 'это (it is)', "that's": 'это (that is)', "what's": 'что (what is)', "let's": 'давай(те)',
    very: 'очень', so: 'так, такой', lot: 'a lot — много', much: 'много', more: 'больше', well: 'хорошо', always: 'всегда', every: 'каждый',
    big: 'большой', new: 'новый', good: 'хороший', happy: 'счастливый', nice: 'приятный, хороший', tired: 'уставший', cool: 'круто, классный',
    get: 'get up — вставать; get in — залезать', up: 'вверх', go: 'идти, ехать', take: 'брать; ехать на (транспорте)', drink: 'пить', sleep: 'спать', sleeps: 'спит',
    love: 'любить, обожать', want: 'хотеть', like: 'нравиться, любить', pay: 'платить', by: 'by card — картой', play: 'играть',
    news: 'новость, новости', trip: 'поездка', then: 'тогда', far: 'далеко', door: 'дверь', welcome: 'welcome to — добро пожаловать в',
    officer: 'офицер, сотрудник', teacher: 'учитель', programmer: 'программист', popcorn: 'попкорн', course: 'of course — конечно',
    who: 'кто', what: 'что', where: 'где', how: 'как', when: 'когда', why: 'почему', here: 'здесь', there: 'там', today: 'сегодня',
    anna: 'Анна (имя)', tom: 'Том (имя кота)', ben: 'Бен (имя)', moscow: 'Москва', 'new york': 'Нью-Йорк', york: 'New York — Нью-Йорк', america: 'Америка',
    hi: 'привет', hello: 'здравствуйте, привет', please: 'пожалуйста', thank: 'thank you — спасибо', thanks: 'спасибо', ok: 'хорошо, ладно',
    meet: 'встречать; nice to meet you — приятно познакомиться', vacation: 'отпуск', fine: 'хорошо', sorry: 'извините',
    boston: 'Бостон', russia: 'Россия', english: 'английский язык', mom: 'мама', dad: 'папа', doctor: 'врач, доктор', red: 'красный; о кошке — рыжий'
  });
})(A.DATA);
