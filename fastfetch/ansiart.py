import sys
from PIL import Image, ImageEnhance

RESET = "\x1b[0m"

def build(im, cols, thresh=26, sat=1.4, con=1.12, gamma=0.92):
    im = ImageEnhance.Color(im).enhance(sat)
    im = ImageEnhance.Contrast(im).enhance(con)
    w, h = im.size
    rows = max(1, round(cols * h / w / 2))
    im = im.resize((cols, rows * 2), Image.LANCZOS)
    px = im.load()
    lum = lambda c: 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2]
    def lift(c):
        return tuple(min(255, int((v/255.0)**gamma * 255)) for v in c)
    lines = []
    for r in range(rows):
        out = []
        cur_fg = cur_bg = None
        for x in range(cols):
            top = px[x, r*2]; bot = px[x, r*2+1]
            t_on = lum(top) > thresh; b_on = lum(bot) > thresh
            if not t_on and not b_on:
                if cur_fg is not None or cur_bg is not None:
                    out.append(RESET); cur_fg = cur_bg = None
                out.append(" "); continue
            if t_on and not b_on:
                ch, fg, bg = "▀", lift(top), None
            elif b_on and not t_on:
                ch, fg, bg = "▄", lift(bot), None
            else:
                ch, fg, bg = "▀", lift(top), lift(bot)
            seq = ""
            if bg is None and cur_bg is not None:
                seq += RESET; cur_fg = cur_bg = None
            if fg != cur_fg:
                seq += "\x1b[38;2;%d;%d;%dm" % fg; cur_fg = fg
            if bg is not None and bg != cur_bg:
                seq += "\x1b[48;2;%d;%d;%dm" % bg; cur_bg = bg
            out.append(seq + ch)
        out.append(RESET)
        lines.append("".join(out))
    return lines, rows

if __name__ == "__main__":
    src = Image.open("godzilla_clean.png").convert("RGB")
    import json
    for name, box, cols in json.load(open("jobs.json")):
        im = src.crop(tuple(box))
        lines, rows = build(im, cols)
        open(name + ".ans", "w", encoding="utf-8", newline="\n").write("\n".join(lines) + "\n")
        print(name, cols, "x", rows)
