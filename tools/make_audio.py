"""Records the app's audio with the Kokoro neural TTS (Apache-2.0) and writes audio packs.

Usage:
  node tools/audio-inventory.js > inventory.json
  python tools/make_audio.py --inventory inventory.json --model-dir <folder with kokoro-v1.0.onnx and voices-v1.0.bin>

Needs: pip install kokoro-onnx soundfile
Output: audio/<pack>.js, each calling A.Speech.addPack(id, {type, clips: {key: base64}}).
Generated clips are cached in --cache, so re-running only records new texts.
"""
import argparse
import base64
import hashlib
import io
import json
import os
import sys
import time

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Slightly slower than natural speech for a beginner; the app can change the tempo further
SPEED = {'letter': 0.85, 'word': 0.9, 'token': 0.9, 'phrase': 0.95, 'sent': 0.95, 'line': 0.95, 'slow': 0.65}


def trim(x, sr):
    """Cut leading/trailing silence so playback starts right away."""
    a = np.abs(x)
    peak = float(a.max()) if a.size else 0.0
    if peak <= 0:
        return x
    idx = np.where(a > peak * 0.02)[0]
    s = max(0, idx[0] - int(0.03 * sr))
    e = min(len(x), idx[-1] + int(0.09 * sr))
    return x[s:e]


def encode(x, sr, fmt, level):
    buf = io.BytesIO()
    x = np.clip(x / max(1e-6, float(np.abs(x).max())) * 0.9, -1, 1).astype(np.float32)  # even loudness
    if fmt == 'mp3':
        sf.write(buf, x, sr, format='MP3', subtype='MPEG_LAYER_III', compression_level=level)
    else:
        sf.write(buf, x, sr, format='OGG', subtype='OPUS', compression_level=level)
    return buf.getvalue()


# Single words the phonemizer reads the wrong way when they stand alone
SPELL_FIX = {'live': 'liv'}  # verb "to live" /lɪv/, not the adjective /laɪv/


def speakable(text):
    text = text.replace('’', "'").replace('‘', "'")
    return SPELL_FIX.get(text.lower(), text)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--inventory', required=True)
    ap.add_argument('--model-dir', required=True)
    ap.add_argument('--cache', default=os.path.join(ROOT, '.audio-cache'))
    ap.add_argument('--format', choices=['mp3', 'opus'], default='mp3')
    ap.add_argument('--level', type=float, default=0.8, help='compression level 0..1 (higher = smaller)')
    ap.add_argument('--out', default=os.path.join(ROOT, 'audio'))
    ap.add_argument('--limit', type=int, default=0, help='record only N clips (for a quick test)')
    args = ap.parse_args()

    with open(args.inventory, encoding='utf-8-sig') as f:
        inv = json.load(f)
    if args.limit:
        inv = inv[:args.limit]
    os.makedirs(args.cache, exist_ok=True)
    os.makedirs(args.out, exist_ok=True)

    kokoro = Kokoro(os.path.join(args.model_dir, 'kokoro-v1.0.onnx'), os.path.join(args.model_dir, 'voices-v1.0.bin'))
    mime = 'audio/mpeg' if args.format == 'mp3' else 'audio/ogg; codecs=opus'

    packs = {}
    total_bytes = 0
    t0 = time.time()
    for i, e in enumerate(inv):
        speed = SPEED.get(e['kind'], 0.95)
        h = hashlib.sha1(f"{e['voice']}|{speed}|{args.format}|{args.level}|{e['text']}".encode('utf-8')).hexdigest()
        path = os.path.join(args.cache, h + '.' + args.format)
        if os.path.exists(path):
            with open(path, 'rb') as f:
                data = f.read()
        else:
            samples, sr = kokoro.create(speakable(e['text']), voice=e['voice'], speed=speed, lang='en-us')
            data = encode(trim(np.asarray(samples, dtype=np.float32), sr), sr, args.format, args.level)
            with open(path, 'wb') as f:
                f.write(data)
        total_bytes += len(data)
        packs.setdefault(e['pack'], {})[e['key']] = base64.b64encode(data).decode('ascii')
        if (i + 1) % 50 == 0 or i + 1 == len(inv):
            print(f"{i + 1}/{len(inv)} clips, {total_bytes / 1024:.0f} KB, {time.time() - t0:.0f} s", flush=True)

    for pid, clips in packs.items():
        body = json.dumps({'type': mime, 'clips': clips}, separators=(',', ':'))
        with open(os.path.join(args.out, pid + '.js'), 'w', encoding='utf-8') as f:
            f.write('A.Speech.addPack("' + pid + '",' + body + ');\n')
        print(pid, len(clips), 'clips', round(len(body) / 1024), 'KB')


if __name__ == '__main__':
    sys.exit(main())
