#!/usr/bin/env python3
"""Replicate compose.ts card layout with PIL (demo fallback sample cards).

Downloads CC-licensed real photos from Wikimedia Commons, composes the same
"anime vs reality" card as the in-app canvas renderer, saves 3 samples to
public/samples/.
"""
import os, re, urllib.request
from PIL import Image, ImageDraw, ImageFont

FONT = "/tmp/fonts/NotoSansJP.otf"
ACCENT = (232, 69, 44)
W, PAD = 1080, 48
os.makedirs("public/samples", exist_ok=True)

f26 = ImageFont.truetype(FONT, 26)
f52 = ImageFont.truetype(FONT, 52)
ffact = ImageFont.truetype(FONT, 26)
f28 = ImageFont.truetype(FONT, 28)
f24 = ImageFont.truetype(FONT, 24)
f20 = ImageFont.truetype(FONT, 20)
f30 = ImageFont.truetype(FONT, 30)
f800 = ImageFont.truetype(FONT, 30)

def fetch(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": "seichi-camera-demo/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
        f.write(r.read())

def draw_cover(img, box):
    x, y, w, h = box
    s = max(w / img.width, h / img.height)
    sw, sh = w / s, h / s
    img = img.crop(((img.width - sw) // 2, (img.height - sh) // 2,
                    (img.width + sw) // 2, (img.height + sh) // 2)).resize((w, h))
    return img

def text_w(d, s, font):
    b = d.textbbox((0, 0), s, font=font)
    return b[2] - b[0]

def wrap(d, text, font, maxw, maxlines=3):
    lines, line = [], ""
    for ch in text:
        if d.textlength(line + ch, font=font) <= maxw or not line:
            line += ch
        else:
            lines.append(line); line = ch
        if len(lines) == maxlines: break
    if len(lines) < maxlines and line: lines.append(line)
    return lines

def badge(d, text, x, y, bg):
    w = text_w(d, text, f26) + 32
    d.rounded_rectangle([x, y, x + w, y + 46], 23, fill=bg)
    d.text((x + 16, y + 23), text, font=f26, fill=(255, 255, 255), anchor="lm")

def compose(sid, work_ja, title_ja, title_zh, year, area, credit, fact, real_url):
    frame = Image.open(f"public/scenes/{sid}/frame.jpg").convert("RGB")
    real_path = f"/tmp/real_{sid}.jpg"
    if not os.path.exists(real_path):
        fetch(real_url, real_path)
    real = Image.open(real_path).convert("RGB")

    imgW = W - PAD * 2
    imgH = round(imgW / (16 / 9))
    header, gap, footer = 170, 20, 170
    meas = ImageDraw.Draw(Image.new("RGB", (10, 10)))
    fact_lines = wrap(meas, fact, ffact, imgW - 48)
    factH = len(fact_lines) * 38 + 40 + gap if fact_lines else 0
    H = header + imgH * 2 + gap + factH + footer

    img = Image.new("RGB", (W, H), (17, 16, 20))
    d = ImageDraw.Draw(img)

    # header
    d.text((PAD, 70), f"聖地巡礼 · {work_ja}", font=f26, fill=ACCENT, anchor="ls")
    size = 52
    while text_w(d, f"{title_ja}  {title_zh}", ImageFont.truetype(FONT, size)) > imgW and size > 16:
        size -= 2
    d.text((PAD, 138), f"{title_ja}  {title_zh}", font=ImageFont.truetype(FONT, size), fill=(255, 255, 255), anchor="ls")

    # images (rounded)
    y1, y2 = header, header + imgH + gap
    mask = Image.new("L", (imgW, imgH), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, imgW, imgH], 18, fill=255)
    img.paste(draw_cover(frame, (0, 0, imgW, imgH)), (PAD, y1), mask)
    img.paste(draw_cover(real, (0, 0, imgW, imgH)), (PAD, y2), mask)
    badge(d, f"アニメ · {year}", PAD + 18, y1 + 18, (0, 0, 0))
    badge(d, "リアル · 2026", PAD + 18, y2 + 18, ACCENT)

    # fact box
    if fact_lines:
        fy0 = y2 + imgH + gap
        d.rounded_rectangle([PAD, fy0, PAD + imgW, fy0 + factH - gap], 14, fill=(59, 22, 17))
        for i, ln in enumerate(fact_lines):
            d.text((PAD + 24, fy0 + 48 + i * 38), ln, font=ffact, fill=(244, 241, 234))

    # footer
    fy = y2 + imgH + factH + 64
    d.text((PAD, fy), f"📍 {area}", font=f28, fill=(187, 187, 187), anchor="ls")
    d.text((PAD, fy + 42), "2026/10/26", font=f24, fill=(119, 119, 119), anchor="ls")
    d.text((PAD, fy + 78), credit, font=f20, fill=(102, 102, 102), anchor="ls")
    d.text((W - PAD, fy), "Seichi Camera", font=f800, fill=(255, 255, 255), anchor="rs")
    d.text((W - PAD, fy + 42), "#聖地巡礼 #Tokyo", font=f24, fill=ACCENT, anchor="rs")

    out = f"public/samples/{sid}.jpg"
    img.save(out, quality=90)
    print("saved", out, img.size)

# --- Hachiko: Wikimedia Commons CC images ---
compose(
    "shibuya-jujutsu",
    "呪術廻戦 渋谷事変", "ハチ公像", "涩谷站前忠犬八公像", 2023,
    "渋谷 · ハチ公口",
    "©芥見下々／集英社・呪術廻戦製作委員会",
    "第二代八公像由初代作者之子铸造，战后缺铜，他熔掉了父亲的另一件雕塑才完成。",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/The_Hachiko_statue_at_Shibuya%2C_Tokyo%2C_Japan.jpg/1280px-The_Hachiko_statue_at_Shibuya%2C_Tokyo%2C_Japan.jpg",
)
# --- Radio Kaikan ---
compose(
    "akiba-steinsgate",
    "シュタインズ・ゲート", "秋葉原ラジオ会館", "秋叶原收音机会馆", 2011,
    "秋葉原 · 電気街口",
    "©2011 5pb./Nitroplus 未来ガジェット研究所",
    "旧楼 2011 年拆除前，官方在楼顶外墙「嵌入」了一颗 600kg 的人造卫星，裂痕、焦痕全部重现第 1 集。",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/AKIHABARA_New_Radio_Kaikan.jpg/1280px-AKIHABARA_New_Radio_Kaikan.jpg",
)
# --- Hijiri bridge ---
compose(
    "ochanomizu-suzume",
    "すずめの戸締まり", "聖橋", "圣桥上俯瞰神田川", 2022,
    "御茶ノ水 · 聖橋",
    "©2022「すずめの戸締まり」製作委員会",
    "铃芽跳下的圣桥 2018–2021 年翻修过，现在桥面的颜色比电影里新很多。",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/JRE-Chuo-Line-Ochanomizu-Sta-Hijiribashi_2025.jpg/1280px-JRE-Chuo-Line-Ochanomizu-Sta-Hijiribashi_2025.jpg",
)
