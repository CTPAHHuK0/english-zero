'use strict';
// Zone 2: letter combinations, reading real words, everyday vocabulary.
(function (D) {
  const { W, P, MP, LT, REF } = D;

  D.unit({
    id: 'u11', zone: 2, line: 'read', title: 'Сочетания букв', sub: 'sh · ch · th · ck · ng', glyph: 'ship',
    tips: [
      { t: 'Две буквы — один звук', x: 'Некоторые пары букв читаются как один звук: <b>sh</b> («ш»), <b>ch</b> («ч»), <b>ck</b> («к»), <b>ng</b> (носовое «н»).' },
      { t: 'Звук th', x: 'Кончик языка между зубами — и выдох. Его нет в русском, поэтому хочется сказать «с», «з» или «ф». Не бойтесь высунуть язык: так и надо!' }
    ],
    lessons: [
      { title: 'sh, ch', items: [...LT('sh', 'ch'), W('ship|корабль|🚢'), W('shop|магазин|🏪'), W('fish|рыба|🐟'), W('chat|болтать, чат|💬'), W('lunch|обед|🍱'), W('rich|богатый|💰')] },
      { title: 'th', items: [...LT('th'), W('this|это, этот|👉'), W('that|то, тот|👈'), W('math|математика|➗'), W('bath|ванна|🛁'), W('thin|тонкий|🥢'), W('think|думать|🤔'),
        MP('think|думать|🤔', 'sink|раковина|🚰', '<b>th</b> — язык между зубами. <b>s</b> — язык за зубами.'),
        MP('thin|тонкий|🥢', 'tin|консервная банка|🥫', '<b>th</b> — выдох через язык между зубами. <b>t</b> — короткий удар языка.')] },
      { title: 'ck, ng', items: [...LT('ck', 'ng'), W('duck|утка|🦆'), W('sock|носок|🧦'), W('back|назад, спина|🔙'), W('ring|кольцо|💍'), W('king|король|🤴'), W('song|песня|🎵'), W('long|длинный|📏')] }
    ]
  });

  D.unit({
    id: 'u12', zone: 2, line: 'talk', title: 'Семья', sub: 'Родные и близкие', glyph: 'mom',
    tips: [
      { t: 'I have = у меня есть', x: 'По-русски «у меня есть брат», а по-английски «я имею брата»: <b>I have a brother</b>.' },
      { t: 'my, your', x: '<b>my</b> — мой, моя, моё, мои. <b>your</b> — твой, ваш. Одно слово на все роды!' }
    ],
    items: [
      W('family|семья|👨‍👩‍👧‍👦'), W('mother|мать, мама|🤱'), W('father|отец, папа|🧔'), W('sister|сестра|👭'), W('brother|брат|👬'),
      W('wife|жена|👰'), W('husband|муж|🤵'), W('baby|малыш|👶'), W('friend|друг|🧑‍🤝‍🧑'), W('man|мужчина|👨'), W('woman|женщина|👩'),
      P('This is my wife.|Это моя жена.|👰'), P('I have a brother.|У меня есть брат.|👬'), P('I’m married.|Я женат / замужем.|💍'), P('I have two kids.|У меня двое детей.|👧')
    ]
  });

  D.unit({ id: 'u13', zone: 2, line: 'story', title: 'Большая новость', sub: 'История', glyph: '2', story: 'st2' });

  D.unit({
    id: 'u14', zone: 2, line: 'read', title: 'Немая e', sub: 'cake · bike · home · cute', glyph: 'cake',
    tips: [
      { t: 'Волшебная e', x: 'Если слово кончается на <b>e</b>, а перед ней одна согласная, то e молчит, но заставляет гласную звучать как своё название: <b>hat</b> (шляпа) → <b>hate</b> (ненавидеть), <b>kit</b> → <b>kite</b>.' }
    ],
    lessons: [
      { title: 'a_e', items: [...LT('a_e'), W('cake|торт|🍰'), W('name|имя|📛'), W('game|игра|🎮'), W('lake|озеро|🏞️')] },
      { title: 'i_e', items: [...LT('i_e'), W('bike|велосипед|🚲'), W('time|время|⏰'), ...REF('w:five', 'w:nine'),
        MP('kit|набор|🧰', 'kite|воздушный змей|🪁', 'Без e — короткое «и». С немой e — «ай».')] },
      { title: 'o_e, u_e', items: [...LT('o_e', 'u_e'), W('home|дом|🏠'), W('nose|нос|👃'), W('rose|роза|🌹'), W('cute|милый|🥰'), W('huge|огромный|🏔️'),
        MP('hat|шляпа|🎩', 'hate|ненавидеть|😠', 'Немая e превращает a в «эй».')] }
    ]
  });

  D.unit({
    id: 'u15', zone: 2, line: 'talk', title: 'Еда и кафе', sub: 'Заказываем в кафе', glyph: 'tea',
    tips: [
      { t: 'Can I have…?', x: 'Вежливая просьба в кафе и магазине: <b>Can I have a coffee, please?</b> — «Можно мне кофе?»' },
      { t: 'Счёт — check', x: 'В США счёт в кафе — <b>check</b>. А «здесь или с собой?» — <b>For here or to go?</b>' }
    ],
    items: [
      W('water|вода|💧'), W('coffee|кофе|☕'), W('tea|чай|🍵'), W('milk|молоко|🥛'), W('juice|сок|🧃'), W('bread|хлеб|🍞'),
      W('egg|яйцо|🥚'), W('apple|яблоко|🍎'), W('banana|банан|🍌'), W('pizza|пицца|🍕'), W('chicken|курица (еда)|🍗'), W('salad|салат|🥗'),
      P('Can I have a coffee, please?|Можно мне кофе, пожалуйста?|☕'), P('A table for two, please.|Столик на двоих, пожалуйста.|🍽️'),
      P('The menu, please.|Меню, пожалуйста.|📋'), P('The check, please.|Счёт, пожалуйста.|🧾'), P('For here or to go?|Здесь или с собой?|🥡'),
      P('I’m hungry.|Я голоден.|🤤'), P('It’s delicious!|Очень вкусно!|😋'), P('How much is it?|Сколько это стоит?|💵')
    ]
  });

  D.unit({
    id: 'u16', zone: 2, line: 'read', title: 'Долгие звуки', sub: 'ee · ea · oo', glyph: 'tree',
    tips: [
      { t: 'Длина звука важна', x: 'В русском длина гласной не меняет смысл, а в английском меняет: <b>ship</b> (корабль) и <b>sheep</b> (овца), <b>sit</b> (сидеть) и <b>seat</b> (место). Долгие звуки тяните!' }
    ],
    lessons: [
      { title: 'ee', items: [...LT('ee'), W('see|видеть|👀'), W('tree|дерево|🌳'), W('bee|пчела|🐝'), W('sheep|овца|🐑'), W('feet|ступни|🦶'), ...REF('w:three', 'w:green'),
        MP('ship|корабль|🚢', 'sheep|овца|🐑', '<b>i</b> — короткое, почти «ы». <b>ee</b> — долгое «и-и».')] },
      { title: 'ea', items: [...LT('ea'), ...REF('w:tea'), W('eat|есть, кушать|🍽️'), W('sea|море|🌊'), W('read|читать|📖'), W('meat|мясо|🥩'),
        MP('sit|сидеть|🪑', 'seat|место, сиденье|💺', 'Короткое <b>i</b> против долгого <b>ea</b>.')] },
      { title: 'oo', items: [...LT('oo'), W('moon|луна|🌙'), W('food|еда|🍝'), W('zoo|зоопарк|🦒'), W('room|комната|🛋️'), W('book|книга|📕'), W('look|смотреть|🔍'), W('good|хороший|👍'), W('cook|готовить|👨‍🍳'),
        MP('three|три|3️⃣', 'tree|дерево|🌳', '<b>th</b> — язык между зубами. <b>t</b> — за зубами.')] }
    ]
  });

  D.unit({
    id: 'u17', zone: 2, line: 'talk', title: 'Путешествие', sub: 'Аэропорт, отель, такси', glyph: 'taxi',
    tips: [
      { t: 'vacation', x: 'В США отпуск — <b>vacation</b> (в Британии — holiday).' },
      { t: 'Here is…', x: '<b>Here is my passport</b> — «Вот мой паспорт». Удобно, когда что-то протягиваете.' }
    ],
    items: [
      W('airport|аэропорт|🛫'), W('plane|самолёт|🛩️'), W('ticket|билет|🎫'), W('passport|паспорт|🛂'), W('suitcase|чемодан|🧳'),
      W('hotel|отель|🏨'), W('key|ключ|🔑'), W('taxi|такси|🚕'), W('station|станция, вокзал|🚉'), W('flight|рейс|🛬'),
      P('Where is the airport?|Где аэропорт?|🛫'), P('I have a reservation.|У меня бронь.|📝'), P('Here is my passport.|Вот мой паспорт.|🛂'),
      P('One ticket to Boston, please.|Один билет до Бостона, пожалуйста.|🎫'), P('I’m here on vacation.|Я здесь в отпуске.|🏖️'),
      P('I’m here for work.|Я здесь по работе.|💼'), P('I lost my bag.|Я потерял сумку.|😟'), P('Taxi to the hotel, please.|Такси до отеля, пожалуйста.|🚕')
    ]
  });

  D.unit({ id: 'u18', zone: 2, line: 'story', title: 'В аэропорту', sub: 'История', glyph: '3', story: 'st3' });

  D.unit({
    id: 'u19', zone: 2, line: 'read', title: 'Звуки «эй», «оу», «ай»', sub: 'ai · ay · oa · ow · igh · y', glyph: 'rain',
    tips: [
      { t: 'Разные буквы — один звук', x: '«эй» пишут как <b>ai</b> (rain) или <b>ay</b> (day). «оу» — <b>oa</b> (boat) или <b>ow</b> (snow). «ай» — <b>igh</b> (night) или <b>y</b> на конце (my).' }
    ],
    lessons: [
      { title: 'ai, ay', items: [...LT('ai', 'ay'), W('rain|дождь|🌧️'), W('train|поезд|🚆'), W('mail|почта|📬'), W('wait|ждать|⏳'), W('day|день|📅'), W('play|играть|▶️'), W('say|сказать|🗣️')] },
      { title: 'oa, ow', items: [...LT('oa', 'ow'), W('boat|лодка|⛵'), W('coat|пальто|🧥'), W('road|дорога|🛣️'), W('snow|снег|❄️'), W('slow|медленный|🐢'), W('window|окно|🪟')] },
      { title: 'igh, y', items: [...LT('igh', 'y_end'), W('night|ночь|🌃'), W('light|свет|💡'), W('right|правый, верно|➡️'), W('fly|летать|🕊️'), W('my|мой|☝️'), W('why|почему|🤷')] }
    ]
  });

  D.unit({
    id: 'u20', zone: 2, line: 'talk', title: 'В городе', sub: 'Где это? Как пройти?', glyph: 'left',
    tips: [
      { t: 'Американские слова', x: 'Туалет — <b>restroom</b>, метро — <b>subway</b>, аптека — <b>pharmacy</b>.' },
      { t: 'Turn left / Turn right', x: '<b>Turn left</b> — поверните налево, <b>turn right</b> — направо, <b>go straight</b> — идите прямо.' }
    ],
    items: [
      W('street|улица|🏙️'), W('left|налево, левый|⬅️'), ...REF('w:right'), W('bank|банк|🏦'), W('hospital|больница|🏥'), W('pharmacy|аптека|💊'),
      W('supermarket|супермаркет|🛒'), W('museum|музей|🏛️'), W('restroom|туалет|🚻'), W('subway|метро|🚇'), W('park|парк|⛲'),
      P('Excuse me, where is the subway?|Простите, где метро?|🚇'), P('Where is the restroom?|Где туалет?|🚻'), P('Go straight.|Идите прямо.|⬆️'),
      P('Turn left.|Поверните налево.|⬅️'), P('Turn right.|Поверните направо.|➡️'), P('It’s near here.|Это рядом.|📍'), P('It’s far.|Это далеко.|🔭'),
      P('Can you show me on the map?|Покажете на карте?|🗺️')
    ]
  });

  D.unit({
    id: 'u21', zone: 2, line: 'read', title: 'Звуки с R и «ау»', sub: 'ar · or · er · ir · ur · ou · ow', glyph: 'car',
    tips: [
      { t: 'R после гласной', x: 'В американском английском R после гласной произносится: <b>car</b>, <b>fork</b>, <b>bird</b>. Язык загнут назад и ничего не касается.' },
      { t: 'ow бывает разным', x: '<b>snow</b> — «оу», <b>cow</b> — «ау». Если сомневаетесь — слушайте.' }
    ],
    lessons: [
      { title: 'ar, or', items: [...LT('ar', 'or'), W('car|машина|🚗'), W('star|звезда|⭐'), W('farm|ферма|🚜'), W('fork|вилка|🍴'), W('horse|лошадь|🐴'), W('corn|кукуруза|🌽')] },
      { title: 'er, ir, ur', items: [...LT('er'), W('her|её, ей|💁‍♀️'), W('bird|птица|🐦'), W('girl|девочка|👧'), W('shirt|рубашка|👕'), W('turn|поворачивать|↩️'), W('nurse|медсестра|👩‍⚕️')] },
      { title: 'ou, ow', items: [...LT('ou', 'ow2'), W('house|дом|🏡'), W('mouse|мышь|🐭'), W('out|наружу, вон|🚪'), W('cow|корова|🐄'), W('now|сейчас|⏱️'), W('down|вниз|⬇️'), W('town|городок|🏘️'), ...REF('w:brown')] }
    ]
  });

  D.unit({
    id: 'u22', zone: 2, line: 'read', title: 'Слова-исключения', sub: 'the · was · said · of', glyph: 'the',
    tips: [
      { t: 'Читаются не по правилам', x: 'Самые частые слова английского часто читаются не по правилам: <b>the</b>, <b>was</b>, <b>said</b>, <b>of</b>. Их просто запоминают «в лицо» — они встречаются в каждом тексте.' },
      { t: 'Артикли', x: '<b>a</b> / <b>an</b> — «один, какой-то». <b>the</b> — «тот самый». В русском артиклей нет, поэтому разберём их подробно на станции «a, an, the».' }
    ],
    lessons: [
      [W('the|определённый артикль («тот самый»)'), W('a|неопределённый артикль («один, какой-то»)'), W('an|артикль a перед гласным звуком'), W('I|я'), W('you|ты, вы')],
      [W('he|он'), W('she|она'), W('we|мы'), W('they|они'), W('it|оно, это')],
      [W('is|есть (он, она, оно)'), W('are|есть (ты, вы, мы, они)'), W('was|был, была'), W('be|быть'), W('do|делать')],
      [W('to|к, в, до'), W('of|из, о (связка)'), W('and|и'), W('said|сказал'), W('have|иметь')],
      [W('what|что'), W('who|кто'), W('where|где'), W('here|здесь'), W('there|там')]
    ]
  });
})(A.DATA);
