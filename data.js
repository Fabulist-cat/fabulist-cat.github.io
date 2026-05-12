// ═══════════════════════════════════════════════════════════════════════════════
//  data.js  —  SOURCE OF TRUTH FOR INDEX PAGES
//
//  This file feeds the Locations, Events, and Personalities index pages.
//  markers.js is separate and feeds the interactive map.
//
//  Each entry shape:
//    name        — display name  (required)
//    category    — shown as a tag and used for filtering  (required)
//    description — one or two sentences shown in the list  (required)
//    link        — URL to the full page; omit to disable the link
//    date        — (events only) free-form date string, e.g. "3-й рік Тиші"
//    role        — (personalities only) short role/title under the name
//
// ═══════════════════════════════════════════════════════════════════════════════

// ── LOCATIONS ─────────────────────────────────────────────────────────────────

const LOCATIONS = [

  {
    name:        "Тенемор",
    category:    "Місто",
    description: "Величне, занурене у гірську ущелину місто. Значна частина населення — гноми.",
    link:        "locations/placeholder.html",
  },

  {
    name:        "Ольтернес",
    category:    "Водойма",
    description: "Глибока, захищена від штормів та потвор морська затока.",
    link:        "locations/placeholder.html",
  },

  // ── Add locations below ───────────────────────────────────────────────────

];

// ── EVENTS ────────────────────────────────────────────────────────────────────

const EVENTS = [
 
  {
    name:        "Заснування Тенемору",
    category:    "Заснування",
    date:        "1-й рік Нової Ери",
    description: "Гномський клан Дурін спустився в ущелину та заклав перші камені міста.",
    link:        "locations/placeholder.html",
  },
 
  {
    name:        "Велика Тиша",
    category:    "Криза",
    date:        "До початку літочислення",
    hiddenDate:  -9999,   // ← no number in date string; sort manually
    description: "Епоха, про яку збереглися лише уламки переказів.",
    link:        "locations/placeholder.html",
  },
 
  // ── Add events below ──────────────────────────────────────────────────────
 
];

// ── PERSONALITIES ─────────────────────────────────────────────────────────────

const PERSONALITIES = [
 
  {
    name:        "Каніс фон Доберманн",
    category:    "Торговець",
    role:        "Власник Собак фон Доберманна",
    family:      "фон Доберманн",
    description: "Короткий опис персонажа. Одне-два речення про те, хто це.",
    link:        "locations/placeholder.html",
  },
 
  // ── Add personalities below ───────────────────────────────────────────────
 
];
