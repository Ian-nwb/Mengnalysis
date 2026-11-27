"""Draws the app icon: the five cats smiling together on a warm sunset background.
Writes assets/icon.png, android-icon-foreground/background/monochrome.png. Needs inkscape."""
import os, subprocess, tempfile

PLUM = '#1B1420'; WHITE = '#FFFDF9'; ORANGE = '#F2A65A'; BLACK = '#2B2230'; DARK = '#26212B'; PINK = '#F5A9C0'
CATS = {
    'meng':     dict(fur=WHITE, earL=BLACK, earR=ORANGE, inner=WHITE, marks='calico', collar='#E5A2F2', iris='#D9B44A', nose=PINK, line=PLUM, ink=PLUM),
    'tuxedo':   dict(fur=DARK, earL=DARK, earR=DARK, inner=PINK, marks='tuxedo', collar='#4A90E2', iris='#B8D86A', nose=PINK, line=PLUM, ink=PLUM),
    'orangina': dict(fur=ORANGE, earL=ORANGE, earR=ORANGE, inner=PINK, marks='orange', collar=None, iris='#8FCB5A', nose=PINK, line=PLUM, ink=PLUM),
    'whitey':   dict(fur=WHITE, earL=WHITE, earR=WHITE, inner=PINK, marks='none', collar='#F6CF3E', iris='#7FB7FF', nose=PINK, line=PLUM, ink=PLUM),
    'dost':     dict(fur=DARK, earL=DARK, earR=DARK, inner='#6E4A5C', marks='none', collar=None, iris='#F2D14B', nose='#9A6276', line=PLUM, ink='#EDE6F2'),
}

def marks(c):
    m = c['marks']
    if m == 'calico':
        return (f'<ellipse cx="62" cy="80" rx="40" ry="42" fill="{ORANGE}"/><ellipse cx="138" cy="80" rx="40" ry="42" fill="{ORANGE}"/>'
                f'<path d="M90 44 L110 44 L122 104 L78 104 Z" fill="{WHITE}"/><ellipse cx="100" cy="120" rx="34" ry="22" fill="{WHITE}"/>'
                f'<ellipse cx="62" cy="136" rx="20" ry="14" fill="{WHITE}"/><ellipse cx="138" cy="136" rx="20" ry="14" fill="{WHITE}"/>'
                f'<path d="M84 44 Q100 36 116 44 Q108 56 100 66 Q92 56 84 44 Z" fill="{BLACK}"/><ellipse cx="120" cy="123" rx="11" ry="7" fill="{ORANGE}"/>')
    if m == 'tuxedo':
        return f'<path d="M100 76 L124 128 L76 128 Z" fill="{WHITE}"/><ellipse cx="100" cy="124" rx="30" ry="20" fill="{WHITE}"/><ellipse cx="100" cy="142" rx="22" ry="10" fill="{WHITE}"/>'
    if m == 'orange':
        st = 'stroke="#D9843A" stroke-width="4" fill="none" stroke-linecap="round"'
        return (f'<ellipse cx="100" cy="124" rx="28" ry="18" fill="{WHITE}"/>'
                f'<path d="M90 46 q2 10 0 18 M100 44 v20 M110 46 q-2 10 0 18" {st}/>'
                f'<path d="M46 84 q10 2 16 8 M44 98 q10 0 16 4 M154 84 q-10 2 -16 8 M156 98 q-10 0 -16 4" {st}/>')
    return ''

def face(name, cx, cy, k, uid):
    c = CATS[name]; L = c['line']; I = c['ink']
    eyes = ''.join(
        f'<ellipse cx="{x}" cy="94" rx="11" ry="12" fill="{c["iris"]}" stroke="{PLUM}" stroke-width="3"/>'
        f'<ellipse cx="{x}" cy="95" rx="5" ry="9" fill="{PLUM}"/><ellipse cx="{x+3}" cy="90" rx="3" ry="3.4" fill="{WHITE}"/>'
        for x in (78, 122))
    collar = (f'<path d="M66 132 q34 20 68 0" stroke="{c["collar"]}" stroke-width="9" fill="none" stroke-linecap="round"/>'
              f'<ellipse cx="100" cy="146" rx="7" ry="7" fill="{c["collar"]}" stroke="{PLUM}" stroke-width="3"/>') if c['collar'] else ''
    chest = f'<ellipse cx="100" cy="160" rx="24" ry="20" fill="{WHITE}"/>' if c['marks'] in ('tuxedo', 'orange', 'calico') else ''
    return f'''<g transform="translate({cx-100*k} {cy-92*k}) scale({k})">
  <ellipse cx="100" cy="150" rx="52" ry="36" fill="{c['fur']}" stroke="{L}" stroke-width="5"/>
  {chest}
  <polygon points="50,66 58,16 94,46" fill="{c['earL']}" stroke="{L}" stroke-width="5" stroke-linejoin="round"/>
  <polygon points="62,52 64,32 79,46" fill="{c['inner']}" opacity="0.9"/>
  <polygon points="150,66 142,16 106,46" fill="{c['earR']}" stroke="{L}" stroke-width="5" stroke-linejoin="round"/>
  <polygon points="138,52 136,32 121,46" fill="{c['inner']}" opacity="0.9"/>
  <clipPath id="h{uid}"><ellipse cx="100" cy="92" rx="56" ry="48"/></clipPath>
  <ellipse cx="100" cy="92" rx="56" ry="48" fill="{c['fur']}"/>
  <g clip-path="url(#h{uid})">{marks(c)}</g>
  <ellipse cx="100" cy="92" rx="56" ry="48" fill="none" stroke="{L}" stroke-width="5"/>
  <ellipse cx="64" cy="112" rx="9" ry="5" fill="#E5A2F2" opacity="0.8"/><ellipse cx="136" cy="112" rx="9" ry="5" fill="#E5A2F2" opacity="0.8"/>
  {eyes}
  <polygon points="94,108 106,108 100,115" fill="{c['nose']}" stroke="{I}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M86 117 q14 22 28 0 z" fill="#B4466A" stroke="{I}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M93 124 q7 6 14 0" fill="#F07A9A"/>
  <path d="M38 106 l22 3 M40 118 l21 -3 M162 106 l-22 3 M160 118 l-21 -3" stroke="{I}" stroke-width="2.5" stroke-linecap="round"/>
  {collar}
</g>'''

# back row first, Meng front and center
GROUP = [('tuxedo', 392, 400, 1.45), ('dost', 632, 400, 1.45), ('orangina', 292, 585, 1.5), ('whitey', 732, 585, 1.5), ('meng', 512, 600, 1.75)]
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
        out += (f'<g transform="translate({x-100*k} {y-92*k}) scale({k})" fill="#FFFFFF">'
                '<polygon points="50,66 58,16 94,46"/><polygon points="150,66 142,16 106,46"/>'
                '<ellipse cx="100" cy="92" rx="60" ry="52"/></g>')
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
