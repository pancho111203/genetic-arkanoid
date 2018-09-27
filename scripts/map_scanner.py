import png
import math
import json


# Each level is perfectly aligned at 192 pixels wide by 232 pixels tall. 
# The top, left and right edges are 8 pixels. 
# Each brick is 16 pixels wide by 8 pixels tall. 
# The background can support exactly 11 brick tiles wide by 28 tall.

COLOR_MAP = {
    (252, 252, 252): 1,  # white
    (252, 116, 96): 2,  # orange
    (60, 188, 252): 3,  # light blue
    (128, 208, 16): 4,  # green
    (216, 40, 0): 5,  # red
    (0, 112, 236): 6,  # blue
    (252, 116, 180): 7,  # pink
    (252, 152, 56): 8,  # yellow
    (188, 188, 188): 9,  # silver
    (240, 188, 60): 10  # gold
}

reader = png.Reader('dist/images/arkanoid_levels.png')
rgb = reader.asRGB()
pixels = list(rgb[2])


def get_brick_type(px, py, w=16, h=8):
    colors = [0] * (len(COLOR_MAP) + 1)
    for x in range(0, w):
        for y in range(0, h):
            pix = (pixels[py + y][(px + x) * 3 + 0], pixels[py + y][(px + x) * 3 + 1], pixels[py + y][(px + x) * 3 + 2])
            if pix in COLOR_MAP:
                color = COLOR_MAP[pix]
            else:
                color = 0
            colors[color] += 1

    limit = w*h * 0.6
    (index, amount) = max(enumerate(colors), key=lambda t: t[1])
    if amount > limit:
        return index
    else:
        return 0

levels = []
for level in range(0, 35):
    lx = level % 5
    ly = math.floor(level / 5)
    levels.append([])
    for brick in range(0, 307):
        bx = brick % 11
        by = math.floor(brick / 11)

        px = (lx * 192) + (bx * 16) + 8
        py = (ly * 232) + (by * 8) + 8
        brickType = get_brick_type(px, py)
        levels[level].append(brickType)

    print('Completed level {}'.format(level))

with open('dist/images/arkanoid_levels.json', 'a+') as f:
    json.dump(levels, f)