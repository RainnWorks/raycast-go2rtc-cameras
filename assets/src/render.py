"""Rebuild the README artwork and icon with Python 3 and rsvg-convert (librsvg).

Run from anywhere: python3 assets/src/render.py

Only the fonts in assets/src/fonts are visible to the renderer, so the output
does not depend on the fonts installed on the computer.
"""
from pathlib import Path
import os
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent

BG = '#000000'
INK = '#FFFFFF'
DIM = '#8A8F8C'
LINE = '#3A3F3C'
PANEL = '#0E0F0E'
GREEN = '#37E7A2'
SANS = 'Instrument Sans'
MONO = 'IBM Plex Mono'


def esc(value):
    return value.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


def text(x, y, value, size=30, anchor='start', fill=INK, font=SANS, weight=400):
    return (f'<text x="{x}" y="{y}" font-family="{font}" font-size="{size}" font-weight="{weight}" '
            f'text-anchor="{anchor}" fill="{fill}">{esc(value)}</text>')


def rect(x, y, w, h, r, fill='none', stroke=INK, width=2.5):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'


def path(d, stroke=INK, width=2.5):
    return (f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="{width}" '
            'stroke-linecap="round" stroke-linejoin="round"/>')


def arrow(x1, y, x2, stroke=INK):
    return path(f'M{x1} {y} H{x2} M{x2-9} {y-7} L{x2} {y} L{x2-9} {y+7}', stroke)


def camera(x, y, s=1.0, stroke=INK, width=2.5):
    """The icon's video camera as line art, 44 by 28 at scale 1."""
    return (f'<g transform="translate({x} {y}) scale({s})">'
            + path('M0 5 Q0 0 5 0 H27 Q32 0 32 5 V23 Q32 28 27 28 H5 Q0 28 0 23 Z', stroke, width / s)
            + path('M32 10 L44 3 V25 L32 18', stroke, width / s)
            + f'<circle cx="15" cy="14" r="6" fill="none" stroke="{stroke}" stroke-width="{width / s}"/>'
            + '</g>')


def document(w, h, label, content):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
            f'role="img" aria-label="{esc(label)}"><title>{esc(label)}</title>\n'
            f'<rect width="100%" height="100%" fill="{BG}"/>\n{content}\n</svg>\n')


def hero():
    b = ''
    # Raycast Root Search, drawn as a plain window: the search text, then results.
    b += rect(80, 150, 860, 600, 22, PANEL, LINE, 2)
    b += text(130, 238, 'front', 40)
    b += path('M232 208 V246', GREEN, 3)
    b += path('M80 285 H940', LINE, 2)
    b += text(130, 335, 'Results', 22, fill=DIM)
    rows = [('Front Door Camera', True), ('Front Garden Camera', False)]
    for index, (name, selected) in enumerate(rows):
        top = 360 + index * 96
        if selected:
            b += rect(104, top, 812, 80, 12, '#12241C', GREEN, 2)
        b += camera(132, top + 26, 1.0, GREEN if selected else INK)
        b += text(204, top + 51, name, 30)
        b += text(540, top + 51, 'go2rtc Cameras', 24, fill=DIM)
    b += path('M80 680 H940', LINE, 2)
    b += text(850, 724, 'Open Command', 22, 'end', DIM)
    b += rect(862, 700, 30, 30, 6, 'none', DIM, 2)
    b += path('M883 707 V719 H870 M875 714 L870 719 L875 724', DIM, 2)

    b += arrow(975, 450, 1055)
    b += text(1015, 420, 'Return', 22, 'middle', DIM)

    # The go2rtc player: a video frame showing the front door.
    b += rect(1090, 250, 440, 400, 18, PANEL, LINE, 2)
    b += path('M1090 300 H1530', LINE, 2)
    for dot in range(3):
        b += f'<circle cx="{1120 + dot * 22}" cy="275" r="6" fill="{LINE}"/>'
    b += text(1310, 282, 'stream.html', 20, 'middle', DIM, MONO)
    b += path('M1245 600 V380 H1375 V600')
    b += path('M1270 600 V410 H1350 V600')
    b += f'<circle cx="1337" cy="505" r="5" fill="{INK}"/>'
    b += path('M1210 600 H1410 M1190 620 H1430')
    b += text(1310, 700, 'Front Door, live', 28, 'middle')
    return document(1600, 900,
                    'Raycast Root Search with "front" typed and Front Door Camera selected; '
                    'Return opens the camera live in the go2rtc player', b)


def how_it_works():
    b = ''
    boxes = [
        (40, ['go2rtc'], '/api/streams', 'camera names'),
        (320, ['Sync Camera', 'Shortcuts'], None, 'every 5 minutes'),
        (600, ['Script folder'], 'root-search-', 'one per camera'),
        (880, ['Raycast', 'Root Search'], None, 'you press Return'),
        (1160, ['Open Camera'], None, 'reads your settings'),
    ]
    w, top, h = 230, 170, 170
    for index, (x, lines, mono, caption) in enumerate(boxes):
        cx = x + w / 2
        highlight = index == 2
        b += rect(x, top, w, h, 16, 'none', GREEN if highlight else INK)
        rows = len(lines) + (1 if mono else 0)
        first = top + h / 2 - (rows - 1) * 21 + 11
        for row, value in enumerate(lines):
            b += text(cx, first + row * 42, value, 30, 'middle')
        if mono:
            b += text(cx, first + len(lines) * 42, mono, 22, 'middle', DIM, MONO)
        b += text(cx, top + h + 52, caption, 24, 'middle', DIM)
        if index < len(boxes) - 1:
            b += arrow(x + w + 12, top + h / 2, x + 280 - 12)
    # The folder is named root-search-commands; split it over two lines to fit.
    b += text(600 + w / 2, top + h / 2 + 11 + 21 + 26, 'commands', 22, 'middle', DIM, MONO)

    # Open Camera hands off to the browser player or the preferred app.
    b += path('M1390 255 H1420 M1420 175 V335', INK)
    b += arrow(1420, 175, 1450) + arrow(1420, 335, 1450)
    for y, name, detail in ((120, 'go2rtc player', 'in your browser'), (280, 'Preferred app', 'MP4, HLS or RTSP')):
        b += rect(1460, y, 300, 110, 14)
        b += text(1610, y + 48, name, 30, 'middle')
        b += text(1610, y + 84, detail, 22, 'middle', DIM)

    b += text(900, 530, 'Each command holds a camera name and a Raycast deeplink. '
              'Never the go2rtc address, never a login.', 26, 'middle')
    return document(1800, 620,
                    'go2rtc /api/streams feeds Sync Camera Shortcuts every 5 minutes, which writes one '
                    'command per camera into a Script folder; Raycast Root Search runs one, and Open '
                    'Camera opens the go2rtc player or your preferred app', b)


def render(name, svg, width=None, height=None):
    source = ROOT / f'{name}.svg'
    source.write_text(svg)
    size = ['--width', str(width), '--height', str(height)] if width else []
    subprocess.run(['rsvg-convert', *size, str(source), '--output', str(OUT / f'{name}.png')],
                   check=True, env=ENV)


with tempfile.TemporaryDirectory() as cache:
    config = Path(cache) / 'fonts.conf'
    config.write_text(f'<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd">'
                      f'<fontconfig><dir>{ROOT / "fonts"}</dir><cachedir>{cache}</cachedir></fontconfig>')
    ENV = {**os.environ, 'FONTCONFIG_FILE': str(config)}
    render('hero', hero())
    render('how-it-works', how_it_works())
    # icon.svg is the hand-authored source. Raycast uses the 512px icon.png;
    # the README uses icon-1024.png.
    for name, size in (('icon', 512), ('icon-1024', 1024)):
        subprocess.run(['rsvg-convert', '--width', str(size), '--height', str(size),
                        str(ROOT / 'icon.svg'), '--output', str(OUT / f'{name}.png')], check=True, env=ENV)
