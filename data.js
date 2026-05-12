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
    name:        "Приклад події",
    category:    "Війна",
    date:        "давно",
    description: "Короткий опис події. Тут може бути одне-два речення.",
    link:        "locations/placeholder.html",
  },

  // ── Add events below ──────────────────────────────────────────────────────

];

// ── PERSONALITIES ─────────────────────────────────────────────────────────────

const PERSONALITIES = [

  {
    name:        "Приклад персонажа",
    category:    "NPC",
    role:        "Торговець",
    description: "Короткий опис персонажа. Одне-два речення про те, хто це.",
    link:        "locations/placeholder.html",
  },

  // ── Add personalities below ───────────────────────────────────────────────

];
