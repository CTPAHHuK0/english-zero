'use strict';
// Compact helpers for writing course content.
//   W('cat|кот|🐱')                 word
//   P('Thank you!|Спасибо!|🙏')      phrase (learned as a whole chunk)
//   S('She [is] a doctor.|Она врач.', 'am,are')   sentence; [..] marks the gap, then wrong options
//   MP('ship|корабль|🚢', 'sheep|овца|🐑', 'note')  minimal pair for listening
//   LT('s', 'a')                      letters / letter combinations from letters.js
//   N('abc')                          letter names (alphabet)
//   REF('w:cat')                      reuse an item introduced earlier
window.A = window.A || {};
A.DATA = { letters: {}, units: [], stories: {}, gloss: {}, zones: {} };

(function (D) {
  const slug = s => s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]/g, '').trim().replace(/\s+/g, '_');
  const split = s => s.split('|').map(x => x.trim());

  D.W = (s, x) => {
    const [en, ru, pic] = split(s);
    return Object.assign({ id: 'w:' + en.toLowerCase(), kind: 'word', en, ru, pic: pic || '' }, x);
  };
  D.P = (s, x) => {
    const [en, ru, pic] = split(s);
    return Object.assign({ id: 'p:' + slug(en), kind: 'phrase', en, ru, pic: pic || '' }, x);
  };
  D.S = (s, alts, x) => {
    const [raw, ru, pic] = split(s);
    const m = raw.match(/\[([^\]]+)\]/);
    const en = raw.replace(/[[\]]/g, '');
    return Object.assign({
      id: 's:' + slug(en), kind: 'sent', en, ru, pic: pic || '',
      gap: m ? m[1] : null, gapAt: m ? raw.indexOf('[') : -1,
      alts: alts ? alts.split(',').map(a => a.trim()) : []
    }, x);
  };
  D.MP = (a, b, note) => {
    const pa = split(a), pb = split(b);
    return {
      id: 'mp:' + pa[0] + '-' + pb[0], kind: 'pair',
      a: { en: pa[0], ru: pa[1], pic: pa[2] || '' },
      b: { en: pb[0], ru: pb[1], pic: pb[2] || '' },
      en: pa[0] + ' / ' + pb[0], ru: pa[1] + ' / ' + pb[1], note: note || ''
    };
  };
  D.LT = (...ids) => ids.map(id => ({ ref: 'L_' + id }));
  D.N = chars => chars.split('').map(c => ({ ref: 'L_' + c, asName: true }));
  D.REF = (...ids) => ids.map(id => ({ refId: id }));
  D.unit = u => D.units.push(u);
})(A.DATA);
