import unicodedata

MAG = "\x1b[38;2;255;0;135m"
CYAN = "\x1b[38;2;0;240;255m"
SLATE = "\x1b[38;2;73;84;112m"
YEL = "\x1b[38;2;255;230;0m"
R = "\x1b[0m"


def dw(s):
    return sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in s)


def compose(src, dst, width):
    art = open(src, encoding="utf-8").read().rstrip("\n").split("\n")
    rule = SLATE + "─" * width + R
    left_txt = "ゴジラ"                 # ゴジラ
    right_txt = "⚡ KAIJU PROTOCOL 01"
    left = MAG + left_txt + R
    right = YEL + "⚡ " + MAG + "KAIJU PROTOCOL 01" + R
    gap = width - dw(left_txt) - dw(right_txt)
    caption = left + " " * max(1, gap) + right
    open(dst, "w", encoding="utf-8", newline="\n").write("\n".join(art + [rule, caption]) + "\n")
    print(dst, len(art) + 2, "lines,", width, "cols")


compose("godzilla-bust.ans", "logo-bust.ans", 66)
compose("godzilla-full.ans", "logo-full.ans", 60)
