'use strict';
// Moving progress between devices without a server:
//  - an animated series of QR codes (the progress is too big for one code), scanned by the other device's camera;
//  - sending the backup as a file through the system share menu (Telegram, e-mail…) or downloading it.
(function (A) {
  const U = A.U, h = U.h, St = A.Store;
  const T = A.Transfer = {};
  const CHUNK = 600;

  function toB64(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function fromB64(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function pipe(bytes, stream) {
    const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
    return new Uint8Array(await res.arrayBuffer());
  }

  // Compressed, base64-encoded backup ('z:' deflate, 'p:' plain when the browser cannot compress)
  T.pack = async function () {
    const bytes = new TextEncoder().encode(St.exportJSON());
    if (window.CompressionStream) return 'z:' + toB64(await pipe(bytes, new CompressionStream('deflate-raw')));
    return 'p:' + toB64(bytes);
  };
  T.unpack = async function (payload) {
    const kind = payload.slice(0, 2), bytes = fromB64(payload.slice(2));
    if (kind === 'z:') return new TextDecoder().decode(await pipe(bytes, new DecompressionStream('deflate-raw')));
    return new TextDecoder().decode(bytes);
  };

  T.canScan = () => 'BarcodeDetector' in window && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const inFrame = () => { try { return window.top !== window.self; } catch (e) { return true; } };

  // ---------- Sender ----------
  T.showQR = async function () {
    if (typeof window.qrcode !== 'function') { U.toast('QR-коды не поддерживаются'); return; }
    const payload = await T.pack();
    const id = Math.random().toString(36).slice(2, 6);
    const n = Math.ceil(payload.length / CHUNK);
    const frames = [];
    for (let i = 0; i < n; i++) {
      const qr = window.qrcode(0, 'L');
      qr.addData('EZ1/' + id + '/' + (i + 1) + '/' + n + '/' + payload.slice(i * CHUNK, (i + 1) * CHUNK));
      qr.make();
      frames.push(qr.createDataURL(4, 2));
    }
    const img = h('img', { class: 'qr-img', alt: 'QR-код с прогрессом', src: frames[0] });
    const label = h('div', { class: 'small muted' }, n > 1 ? 'Кадр 1 из ' + n : '');
    let i = 0;
    const timer = n > 1 ? setInterval(() => { i = (i + 1) % n; img.src = frames[i]; label.textContent = 'Кадр ' + (i + 1) + ' из ' + n; }, 450) : null;
    U.sheet(h('div', { class: 'stack', style: 'align-items:center;text-align:center' },
      h('h2', { class: 'h2' }, 'Покажите этот код другому устройству'),
      h('p', { class: 'muted small' }, 'На телефоне откройте Профиль → Перенос прогресса → «Сканировать QR-код» и наведите камеру на экран. Коды сменяются — держите камеру, пока не соберутся все.'),
      h('div', { class: 'qr-frame' }, img), label,
      h('button', { class: 'btn block', type: 'button', onclick: () => U.closeSheet() }, 'Готово')
    ), { onClose: () => clearInterval(timer) });
    // the sheet's own close button path
    const ov = document.getElementById('overlay');
    const stop = () => { if (ov.hidden) { clearInterval(timer); obs.disconnect(); } };
    const obs = new MutationObserver(stop);
    obs.observe(ov, { attributes: true, attributeFilter: ['hidden'] });
  };

  // ---------- Receiver ----------
  T.scan = async function () {
    if (!T.canScan()) {
      U.toast(inFrame() ? 'Камера недоступна в этой версии. Откройте установленное приложение.' : 'Этот браузер не умеет сканировать QR-коды. Используйте «Отправить файлом».', 4000);
      return;
    }
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }); }
    catch (e) { U.toast('Нет доступа к камере.'); return; }
    const video = h('video', { class: 'qr-video', playsinline: true, muted: true, autoplay: true });
    video.srcObject = stream;
    const status = h('div', { class: 'small' }, 'Наведите камеру на QR-код на другом экране');
    const bar = h('i');
    let stopped = false, got = {}, total = 0, session = '';
    const stopAll = () => { stopped = true; stream.getTracks().forEach(t => t.stop()); };
    U.sheet(h('div', { class: 'stack', style: 'align-items:center;text-align:center' },
      h('h2', { class: 'h2' }, 'Сканирование'),
      video, h('div', { class: 'progress', style: 'width:100%' }, bar), status,
      h('button', { class: 'btn block', type: 'button', onclick: () => U.closeSheet() }, 'Отмена')
    ), { onClose: stopAll });
    const ov = document.getElementById('overlay');
    const obs = new MutationObserver(() => { if (ov.hidden) { stopAll(); obs.disconnect(); } });
    obs.observe(ov, { attributes: true, attributeFilter: ['hidden'] });

    let detector;
    try { detector = new window.BarcodeDetector({ formats: ['qr_code'] }); } catch (e) { status.textContent = 'Сканер недоступен.'; return; }
    try { await video.play(); } catch (e) { /* autoplay attribute handles it */ }
    const tick = async () => {
      if (stopped) return;
      try {
        const codes = await detector.detect(video);
        codes.forEach(c => {
          const m = /^EZ1\/(\w+)\/(\d+)\/(\d+)\/(.*)$/s.exec(c.rawValue || '');
          if (!m) return;
          if (session && m[1] !== session) { got = {}; }
          session = m[1];
          total = +m[3];
          got[m[2]] = m[4];
        });
        const have = Object.keys(got).length;
        if (total) {
          bar.style.width = Math.round(have / total * 100) + '%';
          status.textContent = 'Получено ' + have + ' из ' + total;
        }
        if (total && have === total) {
          stopAll();
          obs.disconnect();
          let payload = '';
          for (let i = 1; i <= total; i++) payload += got[i];
          U.closeSheet();
          importText(await T.unpack(payload));
          return;
        }
      } catch (e) { /* frame not ready yet */ }
      setTimeout(tick, 160);
    };
    video.addEventListener('loadeddata', tick, { once: true });
  };

  async function importText(text) {
    let info = '';
    try { const s = JSON.parse(text).state; info = s ? (Object.keys(s.items || {}).length + ' слов и букв, ' + (s.stats ? s.stats.xp : 0) + ' XP') : ''; } catch (e) { /* shown below */ }
    const ok = await U.confirm({ title: 'Заменить прогресс?', text: 'Прогресс с другого устройства: ' + (info || 'получен') + '. Текущий прогресс на этом устройстве будет заменён.', ok: 'Заменить', danger: true });
    if (!ok) return;
    try { St.importJSON(text); A.App.applyTheme(); U.toast('Прогресс перенесён'); A.App.show('home'); }
    catch (e) { U.toast('Не получилось: ' + e.message); }
  }
  T.importText = importText;

  // ---------- File ----------
  T.shareFile = async function () {
    const name = 'english-zero-' + U.dayKey() + '.json';
    const file = new File([St.exportJSON()], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Прогресс: Английский с нуля' }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    if (inFrame()) { U.toast('Здесь файл сохранить нельзя — используйте «Копию текстом».', 3500); return; }
    const a = h('a', { href: URL.createObjectURL(file), download: name });
    document.body.append(a);
    a.click();
    a.remove();
  };
  T.pickFile = function () {
    const input = h('input', { type: 'file', accept: '.json,application/json,text/plain', hidden: true });
    input.onchange = () => {
      const f = input.files && input.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => importText(String(r.result));
      r.readAsText(f);
      input.remove();
    };
    document.body.append(input);
    input.click();
  };
})(window.A);
