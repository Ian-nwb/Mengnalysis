"""Draws the app icon: the five cats smiling together on a warm sunset background.
Writes assets/icon.png, android-icon-foreground/background/monochrome.png. Needs inkscape."""
import os, subprocess, tempfile

PLUM = '#1B1420'; WHITE = '#FFFDF9'; ORANGE = '#F2A65A'; BLACK = '#2B2230'; DARK = '#26212B'; PINK = '#F5A9C0'
LINE = '#4A3550'; ORANGE = '#F6AE68'; DARK = '#2E2733'
CATS = {
    'meng':     dict(fur=WHITE, shade='#EADFEA', earL=DARK, earR=ORANGE, marks='calico', collar='#E5A2F2', iris='#E2B54A'),
    'tuxedo':   dict(fur=DARK, shade='#1E1922', earL=DARK, earR=DARK, marks='tux', collar='#5B9BEA', iris='#B9DA6E'),
    'orangina': dict(fur=ORANGE, shade='#E4924C', earL=ORANGE, earR=ORANGE, marks='orange', collar=None, iris='#93CF62'),
    'whitey':   dict(fur=WHITE, shade='#E6E0EE', earL=WHITE, earR=WHITE, marks='none', collar='#F6CF3E', iris='#82BBFF'),
    'dost':     dict(fur=DARK, shade='#1E1922', earL=DARK, earR=DARK, marks='none', collar=None, iris='#F4D350'),
}
HEAD = "M34 108 C34 68 62 50 100 50 C138 50 166 68 166 108 C166 142 138 158 100 158 C62 158 34 142 34 108Z"

def face(name, cx, cy, k, i):
    """Chibi cat (same drawing as src/components/Mascot.tsx), head centered at (cx, cy)."""
    c = CATS[name]; dark = c['fur'] == DARK
    m = ''
    if c['marks'] == 'calico':
        m = (f'<path d="M30 60 Q70 46 92 62 Q88 100 80 160 L20 160Z" fill="{ORANGE}"/>'
             f'<path d="M170 60 Q130 46 108 62 Q112 100 120 160 L180 160Z" fill="{ORANGE}"/>'
             f'<path d="M86 50 Q100 44 114 50 Q108 64 100 72 Q92 64 86 50Z" fill="{DARK}"/>')
    elif c['marks'] == 'tux':
        m = f'<path d="M100 84 Q122 120 136 160 L64 160 Q78 120 100 84Z" fill="{WHITE}"/>'
    elif c['marks'] == 'orange':
        m = (f'<ellipse cx="100" cy="138" rx="34" ry="22" fill="{WHITE}"/>'
             '<path d="M90 54 q2 9 0 16 M100 52 v19 M110 54 q-2 9 0 16" stroke="#DE8B45" stroke-width="5" fill="none" stroke-linecap="round"/>')
    line = '#8C7F99' if dark else LINE
    inner = '#6B4A5E' if dark else '#F7B3C6'
    ink = '#F3EAF6' if dark else LINE
    def eye(x):
        return (f'<ellipse cx="{x}" cy="108" rx="15" ry="17" fill="#2A1F2E" stroke="{line}" stroke-width="2"/>'
                f'<ellipse cx="{x}" cy="114" rx="12" ry="10" fill="{c["iris"]}" opacity="0.95"/>'
                f'<ellipse cx="{x}" cy="108" rx="8" ry="11" fill="#2A1F2E"/>'
                f'<circle cx="{x-5}" cy="101" r="5.5" fill="#fff"/><circle cx="{x+5}" cy="116" r="2.5" fill="#fff"/>')
    collar = (f'<path d="M62 152 Q100 172 138 152" stroke="{c["collar"]}" stroke-width="8" fill="none" stroke-linecap="round"/>'
              f'<circle cx="100" cy="166" r="7" fill="#F6CF3E" stroke="{line}" stroke-width="2.5"/><path d="M95 166 h10" stroke="{line}" stroke-width="2"/>') if c['collar'] else ''
    chest = f'<ellipse cx="100" cy="170" rx="24" ry="16" fill="{WHITE}"/>' if c['marks'] in ('tux', 'orange') else ''
    tail = c['earL'] if c['marks'] == 'calico' else c['fur']
    feet = WHITE if c['marks'] in ('tux', 'calico') else c['fur']
    tl = 'M140 186 Q182 184 176 150 Q172 136 160 142'
    parts = [
        f'<g transform="translate({cx-100*k} {cy-104*k}) scale({k})">',
        f'<defs><radialGradient id="g{i}" cx="0.45" cy="0.38" r="0.7"><stop offset="0.6" stop-color="{c["fur"]}"/><stop offset="1" stop-color="{c["shade"]}"/></radialGradient>',
        f'<clipPath id="c{i}"><path d="{HEAD}"/></clipPath></defs>',
        f'<path d="{tl}" fill="none" stroke="{line}" stroke-width="15" stroke-linecap="round"/>',
        f'<path d="{tl}" fill="none" stroke="{tail}" stroke-width="8" stroke-linecap="round"/>',
        f'<ellipse cx="100" cy="172" rx="50" ry="24" fill="url(#g{i})" stroke="{line}" stroke-width="4"/>{chest}',
        f'<path d="M46 78 Q40 30 58 24 Q74 28 94 54Z" fill="{c["earL"]}" stroke="{line}" stroke-width="4" stroke-linejoin="round"/>',
        f'<path d="M56 66 Q54 42 62 38 Q72 44 82 56Z" fill="{inner}"/>',
        f'<path d="M154 78 Q160 30 142 24 Q126 28 106 54Z" fill="{c["earR"]}" stroke="{line}" stroke-width="4" stroke-linejoin="round"/>',
        f'<path d="M144 66 Q146 42 138 38 Q128 44 118 56Z" fill="{inner}"/>',
        f'<path d="{HEAD}" fill="url(#g{i})"/><g clip-path="url(#c{i})">{m}</g>',
        f'<path d="M36 118 l-8 4 l9 3 M164 118 l8 4 l-9 3" stroke="{line}" stroke-width="3" fill="none" stroke-linejoin="round"/>',
        f'<path d="{HEAD}" fill="none" stroke="{line}" stroke-width="4"/>',
        eye(72), eye(128),
        '<ellipse cx="52" cy="130" rx="12" ry="7" fill="#F58BB0" opacity="0.5"/><ellipse cx="148" cy="130" rx="12" ry="7" fill="#F58BB0" opacity="0.5"/>',
        '<path d="M95 124 Q100 121 105 124 Q100 130 95 124Z" fill="#F58BA8"/>',
        f'<path d="M89 130 q11 16 22 0 q-11 4 -22 0 z" fill="#B4466A" stroke="{ink}" stroke-width="3" stroke-linejoin="round"/>',
        f'<path d="M26 124 l16 2 M28 134 l15 -3 M174 124 l-16 2 M172 134 l-15 -3" stroke="{ink}" stroke-width="2" stroke-linecap="round" opacity="0.8"/>',
        collar,
        f'<ellipse cx="80" cy="190" rx="14" ry="9" fill="{feet}" stroke="{line}" stroke-width="3.5"/>',
        f'<ellipse cx="120" cy="190" rx="14" ry="9" fill="{feet}" stroke="{line}" stroke-width="3.5"/>',
        f'<path d="M76 186 v5 M84 186 v5 M116 186 v5 M124 186 v5" stroke="{line}" stroke-width="2" stroke-linecap="round"/>',
        '</g>',
    ]
    return '\n'.join(parts)

# back row first, Meng front and center
GROUP = [('tuxedo', 395, 380, 1.3), ('dost', 629, 380, 1.3), ('orangina', 278, 560, 1.32), ('whitey', 746, 560, 1.32), ('meng', 512, 590, 1.55)]
def group():
    return ''.join(face(n, x, y, k, i) for i, (n, x, y, k) in enumerate(GROUP))

BG = '''<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#FFD8A8"/><stop offset="0.5" stop-color="#F7B6CF"/><stop offset="1" stop-color="#C99AF0"/></linearGradient></defs>
<rect width="1024" height="1024" fill="url(#sky)"/>
<circle cx="512" cy="470" r="330" fill="#FFF3E6" opacity="0.45"/>
<g fill="#FFFDF9" opacity="0.9">
  <path d="M170 210 l12 30 l30 12 l-30 12 l-12 30 l-12 -30 l-30 -12 l30 -12 z"/>
  <path d="M850 190 l9 22 l22 9 l-22 9 l-9 22 l-9 -22 l-22 -9 l22 -9 z"/>
  <path d="M860 820 l8 20 l20 8 l-20 8 l-8 20 l-8 -20 l-20 -8 l20 -8 z"/>
  <path d="M150 820 l8 20 l20 8 l-20 8 l-8 20 l-8 -20 l-20 -8 l20 -8 z"/>
</g>'''
# a big soft hill they sit on
HILL = '<ellipse cx="512" cy="900" rx="560" ry="190" fill="#9C6BD6" opacity="0.55"/>'

def svg(body): return f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">{body}</svg>'

def mono():
    # single-color silhouettes of the five heads + ears
    out = ''
    for n, x, y, k in GROUP:
        out += (f'<g transform="translate({x-100*k} {y-104*k}) scale({k})" fill="#FFFFFF">'
                '<path d="M46 78 Q40 30 58 24 Q74 28 94 54Z"/><path d="M154 78 Q160 30 142 24 Q126 28 106 54Z"/>'
                f'<path d="{HEAD}"/><ellipse cx="100" cy="172" rx="50" ry="24"/></g>')
    return out

def render(markup, out, size=1024):
    with tempfile.NamedTemporaryFile('w', suffix='.svg', delete=False, dir=os.environ.get('TMPDIR')) as f:
        f.write(markup); p = f.name
    subprocess.run(['inkscape', p, '--export-type=png', f'--export-filename={out}', f'--export-width={size}', f'--export-height={size}'], check=True, capture_output=True)
    os.unlink(p)

A = os.path.join(os.path.dirname(__file__), '..', 'assets')
# adaptive foreground: shrink the group into the safe zone (center ~66%)
render(svg(f'<g transform="translate(512 512) scale(0.9) translate(-512 -530)">{group()}</g>'), f'{A}/android-icon-foreground.png')
render(svg(BG + HILL), f'{A}/android-icon-background.png')
render(svg(f'<g transform="translate(512 512) scale(0.9) translate(-512 -530)">{mono()}</g>'), f'{A}/android-icon-monochrome.png')
render(svg(BG + HILL + f'<g transform="translate(512 512) scale(0.92) translate(-512 -530)">{group()}</g>'), f'{A}/icon.png')
print('icons written')

# splash: Meng alone on a transparent background (the splash color is the plum theme)
render(svg(face('meng', 512, 500, 3.4, 99)), f'{A}/splash-icon.png')
print('splash written')
