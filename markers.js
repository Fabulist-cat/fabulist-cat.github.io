// ═══════════════════════════════════════════════════════════════════════════════
//  FANTASY MAP — LOCATIONS
//
//  ➜  To add a new location, copy any entry below and fill in your values.
//  ➜  To find x/y coords: open the map in your browser and click any spot.
//     The coordinates appear bottom-left AND are copied to your clipboard.
//
//  REQUIRED fields:
//    name          — display name shown in the popup and as a label
//    x, y          — pixel position on the map image (0,0 = top-left corner)
//
//  OPTIONAL fields:
//    icon          — path to your icon image  (default: img/icons/default.png)
//    iconSize      — [width, height] in px     (default: [32, 32])
//    iconAnchor    — which pixel of the icon is pinned to x,y
//                    [16, 32] = bottom-center (good for pin-style icons)
//                    [16, 16] = center        (good for circular icons)
//    description   — short text in the popup  (default: empty)
//    link          — URL for the "Read more" button; omit to hide the button
//    label         — set to false to hide the hover label entirely
//    labelPermanent — set to true to always show the label on the map
//    labelDir      — label placement: 'top' | 'bottom' | 'left' | 'right'
//    labelOffset   — fine-tune label position in px, e.g. [0, -8]
//
// ═══════════════════════════════════════════════════════════════════════════════

const MARKERS = [

  // ── CITIES & TOWNS ────────────────────────────────────────────────────────

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
    icon:        "img/icons/town.png",
    description: "A river trading post known for its weekly market and questionable ale.",
    link:        "locations/thornwick.html",
  },

  // ── DUNGEONS & RUINS ──────────────────────────────────────────────────────

  {
    name:        "The Sunken Keep",
    x:           610,
    y:           1200,
    icon:        "img/icons/dungeon.png",
    iconSize:    [28, 28],
    iconAnchor:  [14, 28],
    description: "Half submerged since the Shattering. Only the brave — or foolish — venture inside.",
    link:        "locations/sunken-keep.html",
    labelDir:    "bottom",
  },

  // ── LANDMARKS ─────────────────────────────────────────────────────────────

  {
    name:        "The Greywood",
    x:           750,
    y:           400,
    icon:        "img/icons/forest.png",
    description: "An ancient forest. Locals leave offerings at the treeline and do not enter after dusk.",
    link:        "locations/greywood.html",
    label:       false,       // No hover label — forest names look better as decorative map text
  },

  // ── Add your locations below ──────────────────────────────────────────────

];
