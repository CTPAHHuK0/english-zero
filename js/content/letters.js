'use strict';
// Letters and letter combinations. Each sound is anchored to a key word with a picture,
// because speech synthesizers cannot reliably pronounce isolated sounds.
// twin: Latin letters that look like Cyrillic ones but sound different (a classic trap for Russian speakers).
(function (D) {
  const L = (ch, o) => {
    const id = 'L_' + ch;
    D.letters[id] = Object.assign({
      id, kind: 'letter', ch, uc: ch.toUpperCase(), single: ch.length === 1,
      en: ch, ru: o.keyRu, pos: 'start'
    }, o);
  };

  // ----- Single letters -----
  L('s', { say: 'ess', key: 'sun', keyRu: 'солнце', pic: '☀️', re: '^s(?!h)', hint: 'Звук <b>«с»</b>, как в русском слове «сок».' });
  L('a', { say: 'ay', key: 'apple', keyRu: 'яблоко', pic: '🍎', re: '^a', hint: 'Короткий звук между <b>«э»</b> и <b>«а»</b>: откройте рот широко, как для «а», и скажите «э». Так звучит <b>a</b> в словах cat, map, bag.' });
  L('t', { say: 'tee', key: 'tiger', keyRu: 'тигр', pic: '🐯', re: '^t(?!h)', hint: 'Почти русское <b>«т»</b>, но кончик языка касается бугорков за верхними зубами, а звук выходит с лёгким выдохом.' });
  L('p', { say: 'pee', key: 'pizza', keyRu: 'пицца', pic: '🍕', re: '^p(?!h)', snd: 'п', hint: 'Звук <b>«п»</b> с лёгким выдохом.',
    twin: { cyr: 'Р', wrong: 'р', note: 'Выглядит как русская «Р», но читается <b>«п»</b>. Английская «р» пишется буквой R.' } });
  L('i', { say: 'eye', key: 'insect', keyRu: 'насекомое', pic: '🐞', re: '^i', hint: 'Короткий звук — что-то среднее между <b>«и»</b> и <b>«ы»</b>. Так звучит <b>i</b> в sit, pin, big.' });
  L('n', { say: 'en', key: 'nose', keyRu: 'нос', pic: '👃', re: '^n', snd: 'н', hint: 'Звук <b>«н»</b>.',
    twin: { cyr: 'п', wrong: 'п', note: 'Маленькая <b>n</b> похожа на русскую «п», но читается <b>«н»</b>.' } });
  L('m', { say: 'em', key: 'moon', keyRu: 'луна', pic: '🌙', re: '^m', hint: 'Звук <b>«м»</b>. Буква-друг: выглядит и звучит как русская М.' });
  L('d', { say: 'dee', key: 'dog', keyRu: 'собака', pic: '🐶', re: '^d', hint: 'Почти русское <b>«д»</b>, но язык касается бугорков за верхними зубами.' });
  L('g', { say: 'gee', key: 'gift', keyRu: 'подарок', pic: '🎁', re: '^g', hint: 'Звук <b>«г»</b>, как в слове «гусь».' });
  L('o', { say: 'oh', key: 'octopus', keyRu: 'осьминог', pic: '🐙', re: '^o', hint: 'В американском английском — открытый звук, почти <b>«а»</b>: hot, dog, mom.' });
  L('c', { say: 'see', key: 'cat', keyRu: 'кошка', pic: '🐱', re: '^c(?!h)', snd: 'к', hint: 'Обычно звук <b>«к»</b> (cat, cup). Перед e, i, y читается «с» (city) — это позже.',
    twin: { cyr: 'С', wrong: 'с', note: 'Похожа на русскую «С», но в начале большинства слов читается <b>«к»</b>.' } });
  L('k', { say: 'kay', key: 'key', keyRu: 'ключ', pic: '🔑', re: '^k', hint: 'Звук <b>«к»</b> с лёгким выдохом.' });
  L('e', { say: 'E', key: 'egg', keyRu: 'яйцо', pic: '🥚', re: '^e', hint: 'Звук <b>«э»</b>, как в слове «это». Не «йэ»!' });
  L('u', { say: 'you', key: 'umbrella', keyRu: 'зонт', pic: '☂️', re: '^u', snd: 'а', hint: 'Короткий звук, похожий на безударное русское <b>«а»</b>: cup, sun, bus.',
    twin: { cyr: 'и', wrong: 'и', note: 'Маленькая <b>u</b> похожа на русскую «и», но в коротких словах звучит как <b>«а»</b>.' } });
  L('r', { say: 'are', key: 'rabbit', keyRu: 'кролик', pic: '🐰', re: '^r', snd: 'р', hint: 'Английский <b>R</b>: кончик языка загнут назад и <b>не касается</b> нёба, ничего не дрожит. В американском варианте R слышно всегда.',
    twin: { cyr: 'г', wrong: 'г', note: 'Маленькая <b>r</b> похожа на русскую «г», но это звук <b>«р»</b>.' } });
  L('h', { say: 'aitch', key: 'hat', keyRu: 'шляпа', pic: '🎩', re: '^h', snd: 'х', hint: 'Лёгкий выдох, как будто греете руки дыханием. Намного мягче русского «х».',
    twin: { cyr: 'Н', wrong: 'н', note: 'Похожа на русскую «Н», но это <b>выдох «х»</b>. Английская «н» — буква N.' } });
  L('b', { say: 'bee', key: 'ball', keyRu: 'мяч', pic: '⚽', re: '^b', snd: 'б', hint: 'Звук <b>«б»</b>.',
    twin: { cyr: 'В', wrong: 'в', note: 'Похожа на русскую «В», но читается <b>«б»</b>. Английская «в» — буква V.' } });
  L('f', { say: 'ef', key: 'fish', keyRu: 'рыба', pic: '🐟', re: '^f', hint: 'Звук <b>«ф»</b>.' });
  L('l', { say: 'el', key: 'lion', keyRu: 'лев', pic: '🦁', re: '^l', hint: 'Звук <b>«л»</b>: кончик языка на бугорках за верхними зубами.' });
  L('j', { say: 'jay', key: 'juice', keyRu: 'сок', pic: '🧃', re: '^j', hint: 'Звук <b>«дж»</b>, слитно — как в слове «джинсы».' });
  L('v', { say: 'vee', key: 'van', keyRu: 'фургон', pic: '🚐', re: '^v', hint: 'Звук <b>«в»</b>: верхние зубы касаются нижней губы.' });
  L('w', { say: 'double you', key: 'window', keyRu: 'окно', pic: '🪟', re: '^w(?!h)', hint: 'Губы вытянуты трубочкой, как для <b>«у»</b>, и сразу переход к следующему звуку. Это <b>не «в»</b>: зубы губу не трогают!' });
  L('x', { say: 'ex', key: 'fox', keyRu: 'лиса', pic: '🦊', pos: 'in', re: 'x', snd: 'кс', hint: 'Обычно два звука — <b>«кс»</b>: box, six, fox.',
    twin: { cyr: 'Х', wrong: 'х', note: 'Похожа на русскую «Х», но читается <b>«кс»</b>.' } });
  L('y', { say: 'why', key: 'yes', keyRu: 'да', pic: '✅', re: '^y', snd: 'й', hint: 'В начале слова — звук <b>«й»</b>: yes, yum. В конце слова y бывает гласной (my) — это позже.',
    twin: { cyr: 'У', wrong: 'у', note: 'Похожа на русскую «У», но в начале слова читается <b>«й»</b>.' } });
  L('z', { say: 'zee', key: 'zebra', keyRu: 'зебра', pic: '🦓', re: '^z', hint: 'Звук <b>«з»</b>.' });
  L('q', { say: 'queue', key: 'queen', keyRu: 'королева', pic: '👑', re: '^qu', hint: 'Почти всегда пишется вместе с u: <b>qu</b> = «к» + губы трубочкой (квин, но без «в» — через «у»).' });

  // ----- Letter combinations -----
  const G = (id, ch, o) => {
    D.letters['L_' + id] = Object.assign({ id: 'L_' + id, kind: 'letter', ch, uc: ch.toUpperCase(), single: false, en: ch, ru: o.keyRu, pos: 'in' }, o);
  };
  G('sh', 'sh', { key: 'ship', keyRu: 'корабль', pic: '🚢', pos: 'start', re: '^sh', hint: 'Две буквы — один звук, похожий на <b>«ш»</b>, но мягче; губы чуть вытянуты вперёд.' });
  G('ch', 'ch', { key: 'cheese', keyRu: 'сыр', pic: '🧀', pos: 'start', re: '^ch', hint: 'Звук <b>«ч»</b>, чуть твёрже русского.' });
  G('th', 'th', { key: 'think', keyRu: 'думать', pic: '🤔', pos: 'start', re: '^th', hint: 'Кончик языка <b>между зубами</b> и выдох. В think звук глухой (похож на «с»), в this — звонкий (похож на «з»). Не заменяйте его на «с», «з», «т» или «ф» — это главная ошибка русскоговорящих.' });
  G('ck', 'ck', { key: 'duck', keyRu: 'утка', pic: '🦆', re: 'ck', hint: 'Две буквы — один звук <b>«к»</b>. Пишется после короткой гласной: duck, sock, back.' });
  G('ng', 'ng', { key: 'ring', keyRu: 'кольцо', pic: '💍', re: 'ng$', hint: 'Носовой звук: как «н», но произносится задней частью языка. <b>«Г» в конце не звучит</b>: ring — не «ринг».' });
  G('a_e', 'a_e', { key: 'cake', keyRu: 'торт', pic: '🍰', re: 'a[^aeiou]e$', hint: '<b>Немая e</b> на конце сама не читается, но меняет гласную перед собой: a звучит как своё название — <b>«эй»</b>. hat → hate, cap → cape.' });
  G('i_e', 'i_e', { key: 'bike', keyRu: 'велосипед', pic: '🚲', re: 'i[^aeiou]e$', hint: 'С немой e буква i звучит как <b>«ай»</b>: bike, time, five.' });
  G('o_e', 'o_e', { key: 'home', keyRu: 'дом', pic: '🏠', re: 'o[^aeiou]e$', hint: 'С немой e буква o звучит как <b>«оу»</b>: home, nose, rose.' });
  G('u_e', 'u_e', { key: 'cute', keyRu: 'милый', pic: '🥰', re: 'u[^aeiou]e$', hint: 'С немой e буква u звучит как <b>«ю»</b>: cute, huge.' });
  G('ee', 'ee', { key: 'tree', keyRu: 'дерево', pic: '🌳', re: 'ee', hint: 'Долгое <b>«и-и»</b> — тяните звук: see, tree, sheep. Не путайте с коротким i: ship ≠ sheep!' });
  G('ea', 'ea', { key: 'tea', keyRu: 'чай', pic: '🍵', re: 'ea', hint: 'Чаще всего тоже долгое <b>«и-и»</b>: tea, eat, sea.' });
  G('oo', 'oo', { key: 'moon', keyRu: 'луна', pic: '🌙', re: 'oo', hint: 'Обычно долгое <b>«у-у»</b>: moon, food. В некоторых словах короткое «у»: book, look, good.' });
  G('ai', 'ai', { key: 'rain', keyRu: 'дождь', pic: '🌧️', re: 'ai', hint: 'Звук <b>«эй»</b>: rain, train, wait.' });
  G('ay', 'ay', { key: 'day', keyRu: 'день', pic: '📅', re: 'ay$', hint: 'Тоже <b>«эй»</b>, но в конце слова: day, play, say.' });
  G('oa', 'oa', { key: 'boat', keyRu: 'лодка', pic: '⛵', re: 'oa', hint: 'Звук <b>«оу»</b>: boat, coat, road.' });
  G('ow', 'ow', { key: 'snow', keyRu: 'снег', pic: '❄️', re: 'ow$', hint: 'В конце слова часто <b>«оу»</b>: snow, slow, window. (Но в cow — «ау», это на станции «ar or er ou».)' });
  G('igh', 'igh', { key: 'night', keyRu: 'ночь', pic: '🌃', re: 'igh', hint: 'Три буквы — звук <b>«ай»</b>: night, light, right. Буквы gh не читаются.' });
  G('y_end', 'y', { key: 'my', keyRu: 'мой', pic: '☝️', re: '^[^aeiou]+y$', hint: 'В конце коротких слов y звучит как <b>«ай»</b>: my, fly, why.' });
  G('ar', 'ar', { key: 'car', keyRu: 'машина', pic: '🚗', re: 'ar', hint: 'Долгое <b>«а-а»</b>, а в американском английском ещё и с R на конце: car, star.' });
  G('or', 'or', { key: 'fork', keyRu: 'вилка', pic: '🍴', re: 'or', hint: 'Долгое <b>«о-о»</b> с R: fork, horse, corn.' });
  G('er', 'er · ir · ur', { key: 'bird', keyRu: 'птица', pic: '🐦', re: '(er|ir|ur)', hint: 'Три написания — <b>один звук</b>: her, bird, turn. Похоже на «ё» в слове «мёд», но без «й», с R и не округляя губы.' });
  G('ou', 'ou', { key: 'house', keyRu: 'дом', pic: '🏡', re: 'ou', hint: 'Звук <b>«ау»</b>: house, out, mouse.' });
  G('ow2', 'ow', { key: 'cow', keyRu: 'корова', pic: '🐄', re: 'ow', hint: 'Здесь ow звучит как <b>«ау»</b>: cow, now, town. Сравните: snow — «оу».' });
})(A.DATA);
