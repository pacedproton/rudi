import random

base_color = "#e40913"

css = ""

# fur-1 to fur-31
furs = [
    (0, 3.8, 15, 81), (3.8, 2.8, 10, 62), (6.6, 4.8, 37, 100), (11.4, 4, 23, 100),
    (15.4, 4, 15, 86), (19.4, 2.5, 27, 89), (21.9, 4, 20, 100), (25.9, 2, 30, 100),
    (27.9, 4, 35, 95), (31.9, 3.5, 39, 95), (35.4, 2, 34, 95), (37.4, 2.6, 22, 95),
    (40, 6, 47, 100), (46, 2, 36, 100), (48, 5.5, 29, 100), (53.5, 3, 39, 95),
    (56.5, 4.1, 45, 100), (60.6, 2.4, 34, 100), (63, 4, 47, 100), (67, 1.5, 27, 95),
    (68.5, 2.8, 37, 100), (71.3, 2.3, 9, 100), (73.6, 2.2, 28, 92), (75.8, 1, 37, 100),
    (76.8, 2.1, 28, 100), (78.9, 4.1, 34, 100), (83, 2.5, 21, 100), (85.5, 4.5, 39, 100),
    (90, 2.8, 30, 100), (92.8, 3.5, 19, 100), (96.3, 3.7, 37, 100)
]

for i, (left, width, stop1, stop2) in enumerate(furs, 1):
    css += f""".fur-{i} {{
    left: {left}%;
    width: {width}%;
    background: linear-gradient(to bottom, {base_color} 0%, {base_color} {stop1}%, rgba(0, 0, 0, 0) {stop2}%, rgba(0, 0, 0, 0) 100%);
}}\n"""

# lamp-1 to lamp-28
lamps = [
    ("#ff0100", 0.7, 1, "lumieres-moving-left"), ("#ffde01", 2.2, 1.4, "lumieres-moving-right"),
    ("#ff00cc", 5.8, 2.1, "lumieres-moving-left"), ("#04fd8f", 10.1, 2, "lumieres-moving-right"),
    ("#ff0100", 12.9, 1.4, "lumieres-moving-left"), ("#ff9600", 15.3, 2.8, "lumieres-moving-right"),
    ("#0084ff", 21.2, 2.5, "lumieres-moving-left"), ("#f84006", 25, 2.5, "lumieres-moving-right"),
    ("#ffc601", 30.5, 3, "lumieres-moving-left"), ("#ff4800", 36.3, 3, "lumieres-moving-right"),
    ("#fd0100", 41, 2.2, "lumieres-moving-left"), ("#01ffff", 44.2, 2.6, "lumieres-moving-right"),
    ("#ffc601", 51.7, 0.5, "lumieres-moving-left"), ("#ffc601", 52.1, 1.8, "lumieres-moving-right"),
    ("#0078fe", 53.8, 2.3, "lumieres-moving-left"), ("#0080ff", 57.2, 2, "lumieres-moving-right"),
    ("#ffae01", 62.3, 2.9, "lumieres-moving-left"), ("#ff00bf", 65.8, 1.7, "lumieres-moving-right"),
    ("#a601f4", 72.8, 0.8, "lumieres-moving-left"), ("#f30b34", 74.3, 2, "lumieres-moving-right"),
    ("#ff00bf", 79.8, 2, "lumieres-moving-left"), ("#04fd8f", 78.2, 2, "lumieres-moving-right"),
    ("#01ffff", 78.5, 2, "lumieres-moving-left"), ("#a201ff", 85.3, 1.1, "lumieres-moving-right"),
    ("#ec0014", 86.9, 1.1, "lumieres-moving-left"), ("#0078fe", 88.8, 2, "lumieres-moving-right"),
    ("#ff0036", 92.4, 2.4, "lumieres-moving-left"), ("#06f98c", 96.2, 2.1, "lumieres-moving-right")
]

for i, (color, left, width, anim) in enumerate(lamps, 1):
    delay1 = random.randint(0, 200) / 100
    delay2 = random.randint(0, 200) / 100
    css += f""".lamp-{i} {{
    --color: {color};
    left: {left}%;
    width: {width}%;
    animation-delay: {delay1}s;
    animation-name: {anim};
    animation-duration: 2s; /* Simplified from SASS loop inheritance but adjusted for direct mapped animation */
    animation-fill-mode: forwards;
}}
.lamp-{i}::before {{
    left: {random.randint(0, 100)}%;
    animation-delay: {delay2}s;
    animation-name: {anim};
    animation-duration: 2.5s;
}}\n"""

print(css)
