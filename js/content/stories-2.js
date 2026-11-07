'use strict';
// Stories 8–15 (past, future, comparisons) and dialogues d1–d6 (the learner plays Anna).
(function (D) {
  const story = (id, o) => { D.stories[id] = Object.assign({ id }, o); };
  const dialog = (id, o) => { D.stories[id] = Object.assign({ id, type: 'dialog', role: 'Anna' }, o); };

  story('st8', {
    title: 'Первый месяц', intro: 'Прошёл месяц. Анна пишет письмо подруге Ольге в Москву.',
    lines: [
      ['Anna', 'Hi, Olga! My first month in New York was great.', 'Привет, Ольга! Мой первый месяц в Нью-Йорке был отличным.'],
      ['Anna', 'I worked a lot, but I liked my job.', 'Я много работала, но мне понравилась моя работа.'],
      ['Anna', 'My colleagues were very nice.', 'Мои коллеги были очень приятными.'],
      ['Anna', 'On Saturday, I visited a museum with Ben.', 'В субботу я ходила в музей с Беном.'],
      ['Anna', 'We walked in the park and talked a lot.', 'Мы гуляли в парке и много разговаривали.'],
      ['Anna', 'In the evening, I cooked Russian food for Ben.', 'Вечером я приготовила русскую еду для Бена.'],
      ['Anna', 'He liked it! He wanted more.', 'Ему понравилось! Он хотел ещё.'],
      ['Anna', 'Tom was happy too. He watched the birds from the window.', 'Том тоже был счастлив. Он смотрел на птиц из окна.'],
      ['Anna', 'I miss you! Love, Anna.', 'Скучаю! С любовью, Анна.']
    ],
    questions: [
      ['Каким был первый месяц Анны?', 'Отличным', 'Скучным', 'Трудным'],
      ['Куда Анна ходила с Беном в субботу?', 'В музей', 'В кино', 'В аэропорт'],
      ['Что делал Том?', 'Смотрел на птиц', 'Спал в сумке', 'Ел пиццу']
    ]
  });

  story('st9', {
    title: 'Где Том?', intro: 'Однажды вечером Анна вернулась домой — а кота нет.',
    lines: [
      ['Anna', 'Tom! Where are you?', 'Том! Где ты?'],
      ['Anna', 'Ben, I can’t find Tom! Did you see him?', 'Бен, я не могу найти Тома! Ты его видел?'],
      ['Ben', 'No, I didn’t. When did you see him last?', 'Нет, не видел. Когда ты видела его в последний раз?'],
      ['Anna', 'This morning. I opened the window, and then I went to work.', 'Сегодня утром. Я открыла окно, а потом ушла на работу.'],
      ['Ben', 'Don’t worry. Let’s look in the park.', 'Не волнуйся. Давай поищем в парке.'],
      ['', 'They went to the park. They looked everywhere.', 'Они пошли в парк. Они искали везде.'],
      ['Ben', 'Look! A big orange cat in the tree!', 'Смотри! Большой рыжий кот на дереве!'],
      ['Anna', 'Tom! Come down, please!', 'Том! Слезай, пожалуйста!'],
      ['', 'Tom came down and ate his dinner at home.', 'Том слез и поужинал дома.'],
      ['Anna', 'Thank you, Ben! You’re a good friend.', 'Спасибо, Бен! Ты хороший друг.']
    ],
    questions: [
      ['Где был Том?', 'На дереве в парке', 'В магазине', 'У Бена дома'],
      ['Что Анна сделала утром?', 'Открыла окно', 'Позвонила маме', 'Купила корм'],
      ['Кто помог Анне?', 'Бен', 'Мама', 'Доктор']
    ]
  });

  story('st10', {
    title: 'Холодная суббота', intro: 'Понедельник. Анна рассказывает Бену о выходных.',
    lines: [
      ['Ben', 'Hi, Anna! How was your weekend?', 'Привет, Анна! Как прошли выходные?'],
      ['Anna', 'It was cold! I went to the store and bought a warm jacket.', 'Было холодно! Я пошла в магазин и купила тёплую куртку.'],
      ['Ben', 'Was it expensive?', 'Она была дорогая?'],
      ['Anna', 'No, there was a big sale. It was cheap!', 'Нет, была большая распродажа. Было дёшево!'],
      ['Anna', 'Then I had coffee in a small cafe.', 'Потом я выпила кофе в маленьком кафе.'],
      ['Ben', 'Did you go to the park?', 'Ты ходила в парк?'],
      ['Anna', 'No, I didn’t. It was too cold for me!', 'Нет. Для меня было слишком холодно!'],
      ['Ben', 'Too cold? But you’re from Moscow!', 'Слишком холодно? Но ты же из Москвы!'],
      ['Anna', 'Yes, but in Moscow I had a very warm coat!', 'Да, но в Москве у меня было очень тёплое пальто!']
    ],
    questions: [
      ['Что купила Анна?', 'Тёплую куртку', 'Новый телефон', 'Платье'],
      ['Почему куртка была дешёвой?', 'Была распродажа', 'Она маленькая', 'Бен помог'],
      ['Почему Анна не пошла в парк?', 'Было слишком холодно', 'Шёл дождь', 'Она работала']
    ]
  });

  story('st11', {
    title: 'Планы на выходные', intro: 'Пятница. Бен и Анна обсуждают планы.',
    lines: [
      ['Ben', 'What are you going to do this weekend?', 'Что ты собираешься делать на выходных?'],
      ['Anna', 'I’m going to clean my apartment. It’s a mess!', 'Я собираюсь убраться в квартире. Там беспорядок!'],
      ['Ben', 'Boring! I’m going to visit my sister in Boston. Do you want to come?', 'Скучно! Я собираюсь навестить сестру в Бостоне. Хочешь со мной?'],
      ['Anna', 'Boston? Yes! How are we going to get there?', 'В Бостон? Да! Как мы туда доберёмся?'],
      ['Ben', 'We’re going to take the train. It’s four hours.', 'Поедем на поезде. Это четыре часа.'],
      ['Anna', 'Great! I’m going to buy the tickets tonight.', 'Отлично! Я куплю билеты сегодня вечером.'],
      ['Ben', 'And Tom?', 'А Том?'],
      ['Anna', 'Tom is going to sleep. As always!', 'Том будет спать. Как всегда!']
    ],
    questions: [
      ['Что Анна собиралась делать сначала?', 'Убраться в квартире', 'Поехать в Бостон', 'Пойти в кино'],
      ['Кто живёт в Бостоне?', 'Сестра Бена', 'Мама Анны', 'Коллега Анны'],
      ['Как они поедут?', 'На поезде', 'На самолёте', 'На такси']
    ]
  });

  story('st12', {
    title: 'Звонок маме', intro: 'Анна звонит маме в Москву.',
    lines: [
      ['Mom', 'Hello? Anna! How are you, my dear?', 'Алло? Анна! Как ты, дорогая?'],
      ['Anna', 'Hi, Mom! I’m fine. I speak English every day now!', 'Привет, мама! Всё хорошо. Я теперь каждый день говорю по-английски!'],
      ['Mom', 'Great! What did you do last weekend?', 'Здорово! Что ты делала в прошлые выходные?'],
      ['Anna', 'I went to Boston with Ben. We saw the ocean!', 'Я ездила в Бостон с Беном. Мы видели океан!'],
      ['Mom', 'Will you come home for the holidays?', 'Ты приедешь домой на праздники?'],
      ['Anna', 'Yes! I’ll buy a ticket next week.', 'Да! Я куплю билет на следующей неделе.'],
      ['Mom', 'Wonderful! I’ll cook your favorite food.', 'Чудесно! Я приготовлю твою любимую еду.'],
      ['Anna', 'And I’ll bring presents for everyone!', 'А я привезу всем подарки!'],
      ['Mom', 'Don’t forget Tom!', 'Не забудь Тома!'],
      ['Anna', 'I won’t, Mom. I love you!', 'Не забуду, мама. Люблю тебя!']
    ],
    questions: [
      ['Что Анна видела в Бостоне?', 'Океан', 'Горы', 'Снег'],
      ['Что приготовит мама?', 'Любимую еду Анны', 'Торт для Бена', 'Ничего'],
      ['Что привезёт Анна?', 'Подарки', 'Кота Бена', 'Новую куртку']
    ]
  });

  story('st13', {
    title: 'Снег в Нью-Йорке', intro: 'Декабрь. В Нью-Йорке выпал снег.',
    lines: [
      ['', 'In December, it snowed in New York.', 'В декабре в Нью-Йорке пошёл снег.'],
      ['Ben', 'Wow! It’s so cold today!', 'Ого! Как сегодня холодно!'],
      ['Anna', 'Cold? In Moscow it’s colder. Much colder!', 'Холодно? В Москве холоднее. Намного холоднее!'],
      ['Ben', 'Is Moscow bigger than New York?', 'Москва больше Нью-Йорка?'],
      ['Anna', 'Maybe. But the subway in Moscow is more beautiful.', 'Может быть. Но метро в Москве красивее.'],
      ['Ben', 'And the pizza in New York is better!', 'А пицца в Нью-Йорке лучше!'],
      ['Anna', 'Yes, that’s true. Your pizza is the best.', 'Да, это правда. Ваша пицца самая лучшая.'],
      ['Ben', 'Let’s go to the park and play in the snow!', 'Пойдём в парк, поиграем в снегу!'],
      ['Anna', 'OK! But Tom will stay at home. It’s warmer there.', 'Хорошо! Но Том останется дома. Там теплее.']
    ],
    questions: [
      ['Где холоднее?', 'В Москве', 'В Нью-Йорке', 'В Бостоне'],
      ['Что, по словам Бена, лучше в Нью-Йорке?', 'Пицца', 'Метро', 'Погода'],
      ['Почему Том останется дома?', 'Там теплее', 'Он спит', 'Он болеет']
    ]
  });

  story('st14', {
    title: 'День рождения Бена', intro: 'У Бена день рождения. Анна идёт к нему с подарком.',
    lines: [
      ['Anna', 'Happy birthday, Ben! This is for you.', 'С днём рождения, Бен! Это тебе.'],
      ['Ben', 'Thank you! Wow, a book about Russia!', 'Спасибо! Ого, книга о России!'],
      ['Anna', 'Yes! Now you can learn some Russian words.', 'Да! Теперь ты можешь выучить немного русских слов.'],
      ['Ben', 'How do you say “thank you” in Russian?', 'Как сказать «спасибо» по-русски?'],
      ['Anna', 'Spasibo!', 'Спасибо!'],
      ['Ben', 'Spasibo, Anna! Come in, everyone is here.', 'Спасибо, Анна! Заходи, все уже здесь.'],
      ['', 'There was music, cake and a lot of people.', 'Была музыка, торт и много людей.'],
      ['Ben', 'Everyone, this is Anna. She is from Moscow, and she speaks English very well!', 'Знакомьтесь, это Анна. Она из Москвы и очень хорошо говорит по-английски!'],
      ['Anna', 'Thank you! A year ago, I didn’t know any English.', 'Спасибо! Год назад я совсем не знала английского.'],
      ['Ben', 'And now she talks more than me!', 'А теперь она говорит больше меня!']
    ],
    questions: [
      ['Что Анна подарила Бену?', 'Книгу о России', 'Торт', 'Куртку'],
      ['Какое русское слово выучил Бен?', 'Спасибо', 'Привет', 'Пока'],
      ['Когда Анна совсем не знала английского?', 'Год назад', 'Неделю назад', 'Вчера']
    ]
  });

  story('st15', {
    title: 'Домой на праздники', intro: 'Анна летит домой. Финал истории.',
    lines: [
      ['', 'Anna is on the plane to Moscow. Tom is in his bag.', 'Анна в самолёте, летит в Москву. Том в своей сумке.'],
      ['Anna', 'Tom, do you remember our first flight?', 'Том, помнишь наш первый полёт?'],
      ['Anna', 'I didn’t understand anything. I only knew “Hello” and “Thank you”.', 'Я ничего не понимала. Я знала только «Hello» и «Thank you».'],
      ['Anna', 'Now I can talk to people, read stories and watch movies in English.', 'А теперь я могу разговаривать с людьми, читать истории и смотреть фильмы на английском.'],
      ['Anna', 'Every day a little. That was the secret.', 'Каждый день понемногу. В этом и был секрет.'],
      ['', 'The plane landed. Mom and Dad were at the airport.', 'Самолёт приземлился. Мама и папа ждали в аэропорту.'],
      ['Mom', 'Anna! We missed you so much!', 'Анна! Мы так по тебе скучали!'],
      ['Dad', 'Say something in English!', 'Скажи что-нибудь по-английски!'],
      ['Anna', 'I’m home, and I’m very happy. Let’s go!', 'Я дома, и я очень счастлива. Поехали!']
    ],
    questions: [
      ['Что Анна знала во время первого полёта?', 'Только «Hello» и «Thank you»', 'Весь английский', 'Только цифры'],
      ['В чём, по словам Анны, был секрет?', 'Каждый день понемногу', 'Много часов раз в неделю', 'Только фильмы'],
      ['Кто встретил Анну?', 'Мама и папа', 'Бен', 'Коллеги']
    ]
  });

  // ---------- Dialogues: first listen, then play Anna's part ----------
  dialog('d1', {
    title: 'Заселение в отель', intro: 'Анна приехала в отель в Бостоне. Сначала послушайте разговор, потом сыграйте Анну.',
    lines: [
      ['Receptionist', 'Good evening! Welcome to the Park Hotel.', 'Добрый вечер! Добро пожаловать в отель «Парк».'],
      ['Anna', 'Hi! I have a reservation. My name is Anna Ivanova.', 'Здравствуйте! У меня бронь. Меня зовут Анна Иванова.'],
      ['Receptionist', 'Let me check. Yes, a single room for three nights.', 'Сейчас проверю. Да, одноместный номер на три ночи.'],
      ['Anna', 'That’s right.', 'Всё верно.'],
      ['Receptionist', 'Can I see your passport, please?', 'Можно ваш паспорт, пожалуйста?'],
      ['Anna', 'Sure. Here you are.', 'Конечно. Вот, пожалуйста.'],
      ['Receptionist', 'Thank you. Your room is on the fifth floor. Here is your key.', 'Спасибо. Ваш номер на пятом этаже. Вот ваш ключ.'],
      ['Anna', 'What time is breakfast?', 'Во сколько завтрак?'],
      ['Receptionist', 'From seven to ten. Enjoy your stay!', 'С семи до десяти. Приятного отдыха!'],
      ['Anna', 'Thank you very much!', 'Большое спасибо!']
    ],
    questions: [
      ['На сколько ночей бронь у Анны?', 'На три ночи', 'На одну ночь', 'На неделю'],
      ['На каком этаже номер?', 'На пятом', 'На первом', 'На десятом'],
      ['Во сколько завтрак?', 'С семи до десяти', 'С шести до девяти', 'В полдень']
    ]
  });

  dialog('d2', {
    title: 'В магазине одежды', intro: 'Анна покупает тёплую куртку.',
    lines: [
      ['Clerk', 'Hi there! Can I help you?', 'Здравствуйте! Вам помочь?'],
      ['Anna', 'Hi! I’m looking for a warm jacket.', 'Здравствуйте! Я ищу тёплую куртку.'],
      ['Clerk', 'What size are you?', 'Какой у вас размер?'],
      ['Anna', 'Small, I think.', 'Кажется, маленький.'],
      ['Clerk', 'How about this blue one?', 'Как вам вот эта синяя?'],
      ['Anna', 'It’s nice. Can I try it on?', 'Красивая. Можно примерить?'],
      ['Clerk', 'Of course. The fitting room is over there.', 'Конечно. Примерочная вон там.'],
      ['Anna', 'It’s perfect! How much is it?', 'Идеально! Сколько она стоит?'],
      ['Clerk', 'It’s eighty dollars, but today it’s on sale. Sixty dollars.', 'Восемьдесят долларов, но сегодня скидка. Шестьдесят долларов.'],
      ['Anna', 'Great! I’ll take it. Can I pay by card?', 'Отлично! Я возьму. Можно оплатить картой?']
    ],
    questions: [
      ['Что ищет Анна?', 'Тёплую куртку', 'Платье', 'Обувь'],
      ['Какого цвета куртка?', 'Синего', 'Красного', 'Чёрного'],
      ['Сколько куртка стоит сегодня?', '60 долларов', '80 долларов', '100 долларов']
    ]
  });

  dialog('d3', {
    title: 'Звонок в пиццерию', intro: 'Анна бронирует столик по телефону.',
    lines: [
      ['Host', 'Hello, Luigi’s Pizza. How can I help you?', 'Алло, пиццерия «Луиджи». Чем могу помочь?'],
      ['Anna', 'Hi! I’d like to book a table for Friday.', 'Здравствуйте! Я бы хотела забронировать столик на пятницу.'],
      ['Host', 'Sure. For how many people?', 'Конечно. На сколько человек?'],
      ['Anna', 'For two people, please.', 'На двоих, пожалуйста.'],
      ['Host', 'What time?', 'На какое время?'],
      ['Anna', 'At seven, if possible.', 'На семь, если можно.'],
      ['Host', 'Sorry, seven is full. Is eight OK?', 'Извините, на семь всё занято. Восемь подойдёт?'],
      ['Anna', 'Yes, eight is fine.', 'Да, восемь подходит.'],
      ['Host', 'Great. Can I have your name, please?', 'Отлично. Ваше имя, пожалуйста?'],
      ['Anna', 'Anna. A, N, N, A.', 'Анна. A, N, N, A.'],
      ['Host', 'Thank you, Anna. See you on Friday!', 'Спасибо, Анна. Ждём вас в пятницу!']
    ],
    questions: [
      ['Что хочет Анна?', 'Забронировать столик', 'Заказать пиццу домой', 'Найти работу'],
      ['На сколько человек столик?', 'На двоих', 'На четверых', 'На одного'],
      ['На какое время бронь?', 'На восемь', 'На семь', 'На шесть']
    ]
  });

  dialog('d4', {
    title: 'Собеседование', intro: 'Анна пришла на собеседование на новую должность.',
    lines: [
      ['Manager', 'Hello, Anna. Please, sit down.', 'Здравствуйте, Анна. Садитесь, пожалуйста.'],
      ['Anna', 'Thank you. Nice to meet you.', 'Спасибо. Приятно познакомиться.'],
      ['Manager', 'Tell me about yourself.', 'Расскажите о себе.'],
      ['Anna', 'I’m a programmer. I’m from Moscow, and now I live in New York.', 'Я программист. Я из Москвы, а сейчас живу в Нью-Йорке.'],
      ['Manager', 'How many years did you work in Moscow?', 'Сколько лет вы работали в Москве?'],
      ['Anna', 'Five years. I worked for a big company in Moscow.', 'Пять лет. Я работала в большой компании в Москве.'],
      ['Manager', 'Why do you want this job?', 'Почему вы хотите эту работу?'],
      ['Anna', 'I like your team, and I want to learn new things.', 'Мне нравится ваша команда, и я хочу учиться новому.'],
      ['Manager', 'Great. Do you have any questions?', 'Отлично. У вас есть вопросы?'],
      ['Anna', 'Yes. When can I start?', 'Да. Когда я могу начать?'],
      ['Manager', 'Next Monday!', 'В следующий понедельник!']
    ],
    questions: [
      ['Кем работает Анна?', 'Программистом', 'Врачом', 'Учителем'],
      ['Сколько лет она работала в Москве?', 'Пять лет', 'Два года', 'Десять лет'],
      ['Когда Анна может начать?', 'В следующий понедельник', 'Завтра', 'Через месяц']
    ]
  });

  dialog('d5', {
    title: 'Соседка', intro: 'Утро. Анна встречает соседку в лифте.',
    lines: [
      ['Mrs. Lee', 'Good morning! You’re the new neighbor, right?', 'Доброе утро! Вы новая соседка, да?'],
      ['Anna', 'Yes, I’m Anna. I live in 5B.', 'Да, я Анна. Я живу в квартире 5B.'],
      ['Mrs. Lee', 'I’m Mrs. Lee, from 5A. Welcome!', 'Я миссис Ли из 5A. Добро пожаловать!'],
      ['Anna', 'Thank you! Nice weather today, isn’t it?', 'Спасибо! Хорошая сегодня погода, правда?'],
      ['Mrs. Lee', 'Yes, it’s sunny. Is that your cat in the window?', 'Да, солнечно. Это ваш кот в окне?'],
      ['Anna', 'Yes, that’s Tom. I hope he isn’t too loud.', 'Да, это Том. Надеюсь, он не слишком шумит.'],
      ['Mrs. Lee', 'Not at all. I love cats! I have two.', 'Совсем нет. Я люблю кошек! У меня их две.'],
      ['Anna', 'Really? What are their names?', 'Правда? Как их зовут?'],
      ['Mrs. Lee', 'Milk and Cookie. Come for tea on Sunday!', 'Милк и Куки. Приходите на чай в воскресенье!'],
      ['Anna', 'I’d love to. See you on Sunday!', 'С удовольствием. До воскресенья!']
    ],
    questions: [
      ['Где живёт миссис Ли?', 'В квартире 5A', 'В квартире 5B', 'В Бостоне'],
      ['Сколько кошек у миссис Ли?', 'Две', 'Одна', 'Ни одной'],
      ['Куда миссис Ли пригласила Анну?', 'На чай в воскресенье', 'В кино', 'На работу']
    ]
  });

  dialog('d6', {
    title: 'Регистрация на рейс', intro: 'Анна летит домой на праздники и регистрируется на рейс.',
    lines: [
      ['Agent', 'Good afternoon. Where are you flying today?', 'Добрый день. Куда вы летите сегодня?'],
      ['Anna', 'To Moscow.', 'В Москву.'],
      ['Agent', 'May I have your passport and ticket, please?', 'Можно ваш паспорт и билет, пожалуйста?'],
      ['Anna', 'Here you are.', 'Вот, пожалуйста.'],
      ['Agent', 'Do you have any bags to check?', 'Будете сдавать багаж?'],
      ['Anna', 'Yes, one suitcase. And I have a cat with me.', 'Да, один чемодан. И со мной кот.'],
      ['Agent', 'No problem. The cat stays with you on the plane.', 'Без проблем. Кот летит с вами в салоне.'],
      ['Anna', 'Can I have a window seat, please?', 'Можно место у окна?'],
      ['Agent', 'Sure. Boarding is at gate twenty-two at three o’clock.', 'Конечно. Посадка у выхода двадцать два в три часа.'],
      ['Anna', 'Thank you! Have a nice day.', 'Спасибо! Хорошего дня.']
    ],
    questions: [
      ['Куда летит Анна?', 'В Москву', 'В Бостон', 'В Лондон'],
      ['Какое место попросила Анна?', 'У окна', 'У прохода', 'Рядом с Беном'],
      ['Где посадка?', 'У выхода 22', 'У выхода 14', 'У выхода 5']
    ]
  });

  // Translations for words that appear only in these stories and dialogues
  Object.assign(D.gloss, {
    olga: 'Ольга (имя)', month: 'месяц', first: 'первый', liked: 'понравилось (like)', walked: 'гуляли (walk)', talked: 'разговаривали (talk)',
    russian: 'русский; русский язык', miss: 'скучать', find: 'найти', last: 'последний; прошлый', opened: 'открыл(а) (open)', everywhere: 'везде',
    come: 'приходить; come down — спускаться', down: 'вниз', looked: 'смотрел(а), искал(а) (look)', his: 'его',
    store: 'магазин', warm: 'тёплый', cafe: 'кафе', too: 'тоже; слишком (too cold)', clean: 'убирать', mess: 'беспорядок',
    get: 'get up — вставать; get there — добраться', there: 'там, туда', hours: 'часы (hour — час)', as: 'как', always: 'всегда', sleep: 'спать',
    dear: 'дорогой, дорогая', holidays: 'праздники', next: 'следующий', wonderful: 'чудесный', favorite: 'любимый', bring: 'принести, привезти',
    presents: 'подарки', everyone: 'все', forget: 'забыть', december: 'декабрь', snowed: 'шёл снег', wow: 'ого!', much: 'много; намного',
    maybe: 'может быть', beautiful: 'красивый', true: 'правда', best: 'самый лучший', stay: 'оставаться; пребывание', warmer: 'теплее',
    birthday: 'день рождения', about: 'о, про', learn: 'учить, узнавать', some: 'немного, несколько', words: 'слова', say: 'сказать',
    spasibo: 'спасибо (по-русски)', people: 'люди', year: 'год', know: 'знать', any: 'какой-нибудь; (с not) никакой', talks: 'говорит (talk)',
    remember: 'помнить', our: 'наш', anything: 'что-нибудь; (с not) ничего', only: 'только', knew: 'знал(а) (know)', stories: 'истории',
    little: 'маленький; a little — немного', secret: 'секрет', landed: 'приземлился (land)', missed: 'скучали (miss)', something: 'что-нибудь',
    receptionist: 'администратор', ivanova: 'Иванова (фамилия)', let: 'let me — позвольте мне', check: 'проверить; счёт', single: 'одноместный',
    nights: 'ночи', sure: 'конечно', fifth: 'пятый', floor: 'этаж', enjoy: 'наслаждаться', clerk: 'продавец', looking: 'ищу; смотрю',
    think: 'думать', one: 'один; this one — вот этот', fitting: 'fitting room — примерочная', over: 'over there — вон там', perfect: 'идеальный',
    eighty: 'восемьдесят', dollars: 'доллары', sixty: 'шестьдесят', host: 'администратор (в ресторане)', "luigi's": 'Луиджи (название)',
    "i'd": 'я бы (I would)', book: 'книга; to book — бронировать', table: 'стол, столик', many: 'много; how many — сколько', possible: 'возможно',
    full: 'полный, занятый', name: 'имя', manager: 'руководитель', sit: 'сидеть; sit down — садиться', tell: 'рассказать', yourself: 'себя, о себе',
    years: 'годы', company: 'компания', team: 'команда', things: 'вещи', questions: 'вопросы', start: 'начинать', mrs: 'миссис',
    neighbor: 'сосед, соседка', weather: 'погода', "isn't": 'не (is not); isn’t it? — не так ли?', sunny: 'солнечно', hope: 'надеяться',
    loud: 'громкий, шумный', all: 'все; not at all — совсем нет', cats: 'кошки', really: 'правда, действительно', their: 'их', names: 'имена',
    milk: 'молоко (кличка)', cookie: 'печенье (кличка)', agent: 'сотрудник', afternoon: 'день (после полудня)', flying: 'летите (fly)',
    may: 'можно (вежливо)', bags: 'сумки, багаж', problem: 'проблема', stays: 'остаётся (stay)', seat: 'место, сиденье', boarding: 'посадка',
    gate: 'выход на посадку', "o'clock": 'часов (о времени)', "you're": 'ты, вы (you are)', "won't": 'не (will not)', "i'll": 'я (I will)',
    "we're": 'мы (we are)', "can't": 'не могу', "didn't": 'не (did not)', "don't": 'не (do not)', "i'm": 'я (I am)', "it's": 'это (it is)', "that's": 'это (that is)',
    snow: 'снег', ocean: 'океан', tickets: 'билеты', apartment: 'квартира', train: 'поезд', interview: 'собеседование',
    great: 'отличный; здорово', were: 'были (are в прошлом)', did: 'вспомогательное слово прошлого (do)', him: 'его, ему', worry: 'волноваться',
    dinner: 'ужин', cold: 'холодный; холодно', colder: 'холоднее', small: 'маленький', visit: 'навещать, посещать', buy: 'купить',
    speak: 'говорить', will: 'будет (будущее время)', week: 'неделя', understand: 'понимать', talk: 'разговаривать', reservation: 'бронь',
    breakfast: 'завтрак', help: 'помогать', try: 'пробовать; try on — примерить', if: 'если', n: 'буква N', live: 'жить', lee: 'Ли (фамилия)',
    '5a': 'квартира 5A', '5b': 'квартира 5B', 'twenty two': 'двадцать два'
  });
  Object.assign(D.voices.story, { Receptionist: 'af_bella', Clerk: 'am_puck', Host: 'am_puck', Manager: 'am_fenrir', 'Mrs. Lee': 'af_sarah', Agent: 'af_nicole' });
})(A.DATA);
