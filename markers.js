// ═══════════════════════════════════════════════════════════════════════════════
//  FANTASY MAP — LOCATIONS
//
//  ➜  To add a new location, copy any entry and fill in your values.
//  ➜  To find x/y coords: open the map, then SHIFT+CLICK any spot.
//     Coordinates appear bottom-left AND are copied to your clipboard.
//
// ───────────────────────────────────────────────────────────────────────────────
//  MARKER  (a pin on the map)
//    name           — display name
//    x, y           — pixel position (0,0 = top-left of the image)
//    icon           — path to icon file; omit for the built-in gold pin
//    iconSize       — [width, height] in px        (default: [32, 32])
//    iconAnchor     — icon pixel pinned to x,y      (default: [16, 32] = bottom-center)
//    description    — short popup text
//    link           — URL for "Read more" button; omit to hide the button
//    label          — false  → no hover label
//    labelPermanent — true   → always-visible label
//    labelDir       — 'top' | 'bottom' | 'left' | 'right'
//    labelOffset    — fine-tune in px, e.g. [0, -8]
//
// ───────────────────────────────────────────────────────────────────────────────
//  POLYGON  (a filled region: forest, ocean, desert, …)
//    type:   "polygon"
//    name, description, link, label*, labelPermanent*, labelDir*  — same as above
//    points         — array of [x, y] pixel pairs tracing the outline
//    color          — border colour         (default: '#c9922a')
//    weight         — border thickness px   (default: 1.5)
//    opacity        — border opacity 0–1    (default: 0.65)
//    fillColor      — fill colour           (default: same as color)
//    fillOpacity    — fill opacity 0–1      (default: 0.08)
//    glowColor      — glow colour on hover  (default: '#f5d070')
//
// ───────────────────────────────────────────────────────────────────────────────
//  POLYLINE  (a line: river, road, wall, …)
//    type:   "polyline"
//    name, description, link, label*        — same as above
//    points         — array of [x, y] pixel pairs along the line
//    color          — line colour           (default: '#4a8ab0')
//    weight         — line thickness px     (default: 2)
//    opacity        — opacity 0–1           (default: 0.65)
//    dashArray      — CSS dash pattern, e.g. '6 4' for dashed line
//    glowColor      — glow colour on hover  (default: '#88ccff')
//
// ═══════════════════════════════════════════════════════════════════════════════

const MARKERS = [

  {
    type:        "polygon",
    name:        "Морморас",
    points: [
      [144, 211],
      [155, 249],
      [270, 343],
      [507, 408],
      [610, 374],
      [727, 237],
      [700, 187],
      [619, 172],
      [227, 174],
    ],
    glowColor:   "#37703b",
    description: "Озерний край, що перемежовується болотяними трясовинами. Ті, хто тут сходить з дороги, може знайти цінні трави, зубатих потвор і вірну смерть.",
    link:        "locations/placeholder.html",
    label:       false,
    labelPermanent: false
  },

  {
    type:        "polygon",
    name:        "Годенбос",
    points: [
      [864, 376],
      [719, 404],
      [573, 563],
      [763, 531],
      [797, 493],
      [831, 508],
      [801, 554],
      [585, 599],
      [683, 725],
      [784, 725],
      [845, 680],
      [893, 513],
    ],
    glowColor:   "#1b8722",
    description: "Густий, непрохідний ліс, населений дивними тваринами і ще дивнішими друїдами. Спроби видобувати тут деревину завжди закінчувались криваво.",
    link:        "locations/placeholder.html",
    label:       false,
    labelPermanent: false
  },

  {
    type:        "polygon",
    name:        "Ольтернес",
    points: [
      [0, 354],
      [0, 697],
      [108, 818],
      [148, 906],
      [201, 937],
      [132, 745],
      [114, 621],
      [11, 419],
      [30, 404],
    ],
    glowColor:   "#1b7087",
    description: "Глибока і тиха, захищена від штормів морська затока. Джерело риби, солі і торгових шляхів.",
    link:        "locations/placeholder.html",
    label:       false,
    labelPermanent: false
  },

  {
    type:        "polygon",
    name:        "Увемор",
    points: [
      [761, 195],
      [743, 154],
      [599, 131],
      [281, 122],
      [121, 201],
      [258, 170],
      [285, 139],
      [322, 167],
      [595, 165],
      [720, 185],
      [751, 213],
    ],
    glowColor:   "#3a4a43",
    description: "Величезна, прямовисна гранітна стіна, що обмежує Руймдаль з заходу. Серафи кажуть, що це наслідок прадавньої битви богів.",
    link:        "locations/placeholder.html",
    label:       false,
    labelPermanent: false
  },

   {
    type:        "polygon",
    name:        "Бовемор",
    points: [
      [603, 129],
      [628, 117],
      [625, 100],
      [617, 83],
      [595, 103],
      [589, 121],
      [597, 127],
    ],
    glowColor:   "#eaed39",
    description: "Ізольоване гірське поселення, населене хоробрими та гордими мисливцями. Пустеля, що простягнулась на захід від Увемору просто кишить потворами, а частини їх тіл завжди в ціні.",
    link:        "locations/placeholder.html",
    label:       false,
    labelPermanent: false
  },

  {
    type:        "polygon",
    name:        "Айселнес",
    points: [
      [169, 976],
      [172, 999],
      [191, 1010],
      [202, 1009],
      [207, 998],
      [244, 998],
      [263, 987],
      [262, 977],
      [248, 961],
      [222, 959],
      [205, 941],
      [185, 944],
      [181, 949],
      [181, 964],
    ],
    glowColor:   "#eaed39",
    description: "Найбільший морський порт Руймдалю, розташування Магічної Академії Айселнесу. Завзяте, шумне і пропахле рибою.",
    link:        "locations/placeholder.html",
    label:       false,
    labelPermanent: false
  },

  {
    type:        "polygon",
    name:        "Далфарос",
    points: [
      [730, 852],
      [724, 860],
      [727, 902],
      [742, 906],
      [752, 920],
      [765, 919],
      [778, 893],
      [797, 877],
      [801, 858],
      [795, 854],
    ],
    glowColor:   "#eaed39",
    description: "Столиця Руймдалю. Вкрита розкішною позолотою, забарвлена королівськими регаліями і презирством до приїжджих.",
    link:        "locations/placeholder.html",
    label:       false,
    labelPermanent: false
  },

  {
    type:        "polygon",
    name:        "Зауторм",
    points: [
      [87, 522],
      [84, 536],
      [95, 554],
      [93, 568],
      [104, 581],
      [132, 581],
      [139, 578],
      [145, 570],
      [147, 530],
      [100, 521],
    ],
    glowColor:   "#eaed39",
    description: "Просолене і пропахле рибою містечко, мало чим відоме, окрім як рибою, сіллю і морськими прогулянками.",
    link:        "locations/placeholder.html",
    label:       false,
    labelPermanent: false
  },

  {
    type:        "polygon",
    name:        "Далварт",
    points: [
      [504, 482],
      [482, 480],
      [453, 482],
      [449, 485],
      [448, 495],
      [460, 516],
      [460, 535],
      [468, 543],
      [483, 546],
      [491, 540],
      [491, 506],
      [511, 494],
      [510, 486],
    ],
    glowColor:   "#eaed39",
    description: "Центральне торгове місто Руймдалю. Заможне і розгульне – принаймні для тих, хто може це собі дозволити.",
    link:        "locations/placeholder.html",
    label:       false,
    labelPermanent: false
  },

  {
    type:        "polygon",
    name:        "Едельстон",
    points: [
      [940, 717],
      [924, 713],
      [908, 731],
      [908, 750],
      [850, 750],
      [846, 759],
      [850, 763],
      [915, 762],
      [934, 768],
      [940, 763],
    ],
    glowColor:   "#eaed39",
    description: "Самотнє шахтарське місто у передгір'ях, відоме своїми самоцвітами, ювелірами та високими цінами на харчі.",
    link:        "locations/placeholder.html",
    label:       false,
    labelPermanent: false
  },

  {
    type:        "polygon",
    name:        "Годенбос",
    points: [
      [812, 500],
      [800, 497],
      [792, 503],
      [786, 512],
      [786, 518],
      [775, 531],
      [775, 538],
      [780, 544],
      [803, 545],
      [826, 527],
      [826, 514],
    ],
    glowColor:   "#eaed39",
    description: "Загублене в лісах місто друїдів. Дорога до нього добре відома, але не всіх місцеві мешканці раді бачити в своєму місті.",
    link:        "locations/placeholder.html",
    label:       false,
    labelPermanent: false
  },

  {
    type:        "polygon",
    name:        "Вахтаддер",
    points: [
      [906, 808],
      [906, 800],
      [898, 792],
      [889, 792],
      [879, 799],
      [856, 799],
      [839, 795],
      [830, 795],
      [826, 799],
      [826, 804],
      [830, 808],
      [852, 812],
      [884, 812],
      [896, 816],
    ],
    glowColor:   "#de9910",
    description: "Невеличке поселення дорогою до Едельстона, сконцентроване навколо однойменної академії.",
    link:        "locations/placeholder.html",
    label:       false,
    labelPermanent: false
  },

  {
    type:        "polygon",
    name:        "Тенемор",
    points: [
      [276, 158],
      [276, 165],
      [280, 169],
      [302, 169],
      [313, 164],
      [314, 151],
      [310, 147],
      [288, 143],
      [281, 149],
    ],
    glowColor:   "#eaed39",
    description: "Занурене в гірську розколину шахтарське і ковальське місто. Значна частина населення – гноми.",
    link:        "locations/placeholder.html",
    label:       false,
    labelPermanent: false
  },

  {
    type:        "polygon",
    name:        "Увекам",
    points: [
      [537, 533],
      [538, 538],
      [544, 542],
      [550, 541],
      [553, 538],
      [588, 540],
      [592, 536],
      [592, 531],
      [588, 527],
      [570, 527],
      [565, 525],
      [541, 527],
    ],
    glowColor:   "#de9910",
    description: "Невеличке поселення на околицях Далварту. Зручна зупинка для тих, хто не може дозволити собі міські ціни.",
    link:        "locations/placeholder.html",
    label:       false,
    labelPermanent: false
  },

  {
    type:        "polygon",
    name:        "Вайм",
    points: [
      [183, 656],
      [187, 660],
      [192, 660],
      [195, 658],
      [197, 653],
      [218, 654],
      [222, 650],
      [222, 645],
      [218, 641],
      [190, 639],
      [186, 643],
      [186, 647],
      [183, 651],
    ],
    glowColor:   "#de9910",
    description: "TBD",
    link:        "locations/placeholder.html",
    label:       false,
    labelPermanent: false
  },

];
