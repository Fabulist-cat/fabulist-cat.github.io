// ═══════════════════════════════════════════════════════════════════════════════
//  FANTASY MAP — LOCATIONS
//
//  ➜  To add a new location, copy any entry and fill in your values.
//  ➜  To find x/y coords: open the map, then SHIFT+CLICK any spot.
//     Coordinates appear bottom-left AND are copied to your clipboard.
//
// ───────────────────────────────────────────────────────────────────────────────
//  COMMON LABEL FIELDS
//
//    label                  — false → no label
//    labelPermanent         — true → always visible
//
//    labelPos               — [x, y] absolute map position
//                              (if omitted, label attaches to object)
//
//    labelAnchor            — [x, y] pixel anchor inside label
//                              [0,0] = top-left of label
//
//    labelRotation          — degrees clockwise
//
//    labelSize              — font size in px
//
//    labelScaleWithMap      — true/false
//                              true  = scales with zoom
//                              false = screen-space size
//
// ───────────────────────────────────────────────────────────────────────────────
//  MARKER
//
//    name
//    x, y
//    icon
//    iconSize
//    iconAnchor
//    description
//    link
//
// ───────────────────────────────────────────────────────────────────────────────
//  POLYGON
//
//    type: "polygon"
//
//    points:
//
//      single polygon:
//        [[x,y], [x,y], ...]
//
//      multi-polygon:
//        [
//          [[x,y], [x,y], ...],
//          [[x,y], [x,y], ...],
//        ]
//
//    color
//    weight
//    glowColor
//
//    outlineScaleWithMap    — true/false
//
// ───────────────────────────────────────────────────────────────────────────────
//  POLYLINE
//
//    type: "polyline"
//
//    points:
//      [[x,y], [x,y], ...]
//
//    color
//    weight
//    glowColor
//
//    outlineScaleWithMap    — true/false
//
// ═══════════════════════════════════════════════════════════════════════════════

const MARKERS = [

  // ───────────────────────────────────────────────────────────────────────────
  // ТЕНЕМОР
  // ───────────────────────────────────────────────────────────────────────────

  {
    type: "polygon",

    name: "Тенемор",

    points: [
      [280, 169],
      [280, 151],
      [295, 143],
      [311, 149],
      [311, 167],
    ],

    color: "#2d7a3a",
    glowColor: "#f7ee34",

    description:
      "Величне, занурене у гірську ущелину місто. Значна частина населення – гноми.",

    link: "locations/placeholder.html",

    labelPermanent: true,

    // absolute label
    labelPos: [350, 152],

    // top-left anchor
    labelAnchor: [0, 0],

    // slight diagonal
    labelRotation: -8,

    // keep same screen size
    labelScaleWithMap: false,

    // line thickness changes with zoom
    outlineScaleWithMap: true,
  },


  // ───────────────────────────────────────────────────────────────────────────
  // ОЛЬТЕРНЕС
  // ───────────────────────────────────────────────────────────────────────────

  {
    type: "polygon",

    name: "Ольтернес",

    points: [
      [0, 366], [32, 416], [16, 411], [111, 627], [108, 638],
      [131, 705], [134, 757], [209, 940], [185, 937], [156, 908],
      [119, 831], [48, 755], [0, 694]
    ],

    color: "#2a4a7a",
    glowColor: "#4499ff",

    description:
      "Глибока, захищена від штормів та потвор морська затока.",

    link: "locations/placeholder.html",

    labelPermanent: true,

    labelPos: [140, 620],
    labelAnchor: [0, 0],
    labelRotation: 82,

    labelScaleWithMap: true,
    outlineScaleWithMap: true,
  },


  // ───────────────────────────────────────────────────────────────────────────
  // УВЕМОР
  // example of MULTI-POLYGON
  // ───────────────────────────────────────────────────────────────────────────

  {
    type: "polygon",

    name: "Увемор",

    points: [

      [
        [129, 205],
        [179, 184],
        [277, 167],
        [278, 149],
        [295, 138],
        [314, 148],
        [316, 164],
        [444, 156],
      ],

      [
        [569, 164],
        [742, 191],
        [753, 214],
        [758, 163],
        [728, 147],
        [637, 119],
        [619, 131],
        [577, 128],
        [569, 112],
      ],

    ],

    color: "#adad9c",
    glowColor: "#ebebc7",

    description:
      "Непрохідна, вертикальна і загрозлива гірська стіна. Кажуть, колись боги боролись тут з силами зла.",

    link: "locations/placeholder.html",

    labelPermanent: true,

    labelPos: [460, 95],
    labelAnchor: [0, 0],
    labelRotation: 0,

    labelScaleWithMap: false,
    outlineScaleWithMap: true,
  },


  // ───────────────────────────────────────────────────────────────────────────
  // Example marker
  // ───────────────────────────────────────────────────────────────────────────

  /*
  {
    name: "Місто",

    x: 470,
    y: 620,

    description: "...",

    labelPermanent: true,

    labelPos: [500, 620],
    labelRotation: 0,
  },
  */


  // ───────────────────────────────────────────────────────────────────────────
  // Example line
  // ───────────────────────────────────────────────────────────────────────────

  /*
  {
    type: "polyline",

    name: "Стара дорога",

    points: [
      [100, 1500],
      [200, 1300],
      [350, 1100],
    ],

    color: "#7a6040",

    outlineScaleWithMap: true,

    labelPos: [260, 1220],
    labelRotation: -35,
  },
  */

];
