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

  // ── MARKERS (pins) ────────────────────────────────────────────────────────

  /*
  {
    name:        "Ashenveil",
    x:           470,
    y:           620,
    icon:        "img/icons/city.png",
    description: "The capital of the northern reaches. Its spires vanish into perpetual mist.",
    link:        "locations/ashenveil.html",
    labelPermanent: true,
    labelDir:    "right",
  },

  {
    name:        "Thornwick",
    x:           280,
    y:           940,
    icon:        "img/icons/default.png",
    description: "A river trading post known for its weekly market and questionable ale.",
    link:        "locations/thornwick.html",
  },

  {
    name:        "The Sunken Keep",
    x:           610,
    y:           1200,
    // no icon → uses the built-in gold pin; never shows a broken-image icon
    description: "Half submerged since the Shattering. Only the brave — or foolish — venture inside.",
    link:        "locations/sunken-keep.html",
    labelDir:    "bottom",
  },
  */

  // ── POLYGONS (regions) ────────────────────────────────────────────────────

  {
    type:        "polygon",
    name:        "Тенемор",
    points: [
      [280, 169], [280, 151], [295, 143],
      [311, 149], [311, 167],
    ],
    color:       "#2d7a3a",
    fillColor:   "#1a4a20",
    fillOpacity: 0.18,
    glowColor:   "#f7ee34",
    description: "Величне, занурене у гірську ущелину місто. Значна частина населення – гноми ",
    link:        "locations/placeholder.html",
    labelPermanent: true,
    labelDir:    "right",
    labelOffset: [35, 0]
  },

  {
    type:        "polygon",
    name:        "Ольтернес",
    points: [
     [0, 366], [32, 416], [16, 411], [111, 627], [108, 638],
     [131, 705], [134, 757], [209, 940], [185, 937], [156, 908],
     [119, 831], [48, 755], [0, 694]
    ],
    color:       "#2a4a7a",
    fillColor:   "#0e1e3a",
    fillOpacity: 0.35,
    opacity:     0.5,
    glowColor:   "#4499ff",
    description: "Глибока, захищена від штормів та потвор морська затока.",
    link:        "locations/placeholder.html",
    label:       true,
    labelPermanent: true,
    labelDir:    "center",
  },
  
  {
    type:        "polygon",
    name:        "Увемор",
    points: [
        [129, 205], [179, 184], [277, 167], [278, 149], [295, 138], [314, 148], [316, 164],
        [444, 156], [569, 164], [742, 191], [753, 214], [758, 163], [728, 147], [637, 119],
        [619, 131], [577, 128], [569, 112], [301, 120], [207, 145], [142, 179],
    ],
    color:       "#adad9c",
    fillColor:   "#0e1e3a",
    fillOpacity: 0.35,
    opacity:     0.5,
    glowColor:   "#4499ff",
    description: "Непрохідна, вертикальна і загрозлива гірська стіна. Кажуть, колись боги боролись тут з силами зла.",
    link:        "locations/placeholder.html",
    label:       true,
    labelPermanent: true,
    labelDir:    "top",
  },
  

  // ── POLYLINES (rivers, roads, …) ──────────────────────────────────────────
  /*

  {
    type:        "polyline",
    name:        "The Greymere River",
    points: [
      [300, 200], [320, 350], [290, 500],
      [270, 680], [250, 820], [230, 960],
    ],
    color:       "#3a6a90",
    weight:      3,
    glowColor:   "#66aadd",
    description: "Runs cold all year. Fishermen say it flows from somewhere that has no name.",
    link:        "locations/greymere-river.html",
    labelDir:    "right",
  },

  {
    type:        "polyline",
    name:        "The Old King's Road",
    points: [
      [100, 1500], [200, 1300], [350, 1100],
      [470, 900],  [500, 700],  [490, 600],
    ],
    color:       "#7a6040",
    weight:      2,
    dashArray:   "6 3",
    glowColor:   "#c9a060",
    description: "A pre-Shattering trade road. Still passable in dry season.",
    label:       false,
  },
  */

  // ── Add your locations below ──────────────────────────────────────────────

];
