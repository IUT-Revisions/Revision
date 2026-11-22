# Génère favicon.ico, PNG 48/192/512 et apple-touch-icon à partir du même dessin que favicon.svg.
from PIL import Image, ImageDraw
S = 2048; k = S / 512
im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
d.rounded_rectangle((0, 0, S - 1, S - 1), radius=112 * k, fill='#2f5fb3')
cx = cy = 256 * k; r = 140 * k; w = int(62 * k)
d.arc((cx - r, cy - r, cx + r, cy + r), start=0, end=320, fill='white', width=w)
d.rectangle((270 * k, 256 * k - w / 2 + 0, (256 + 140 + 31) * k, 256 * k + w / 2), fill='white')
d.ellipse((410 * k - 38 * k, 112 * k - 38 * k, 410 * k + 38 * k, 112 * k + 38 * k), fill='#f2b84b')
big = im
def out(px): return big.resize((px, px), Image.LANCZOS)
out(48).save('favicon-48.png'); out(192).save('icon-192.png'); out(512).save('icon-512.png')
bg = Image.new('RGBA', (180, 180), '#2f5fb3'); bg.alpha_composite(out(180)); bg.convert('RGB').save('apple-touch-icon.png')
out(256).save('favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
