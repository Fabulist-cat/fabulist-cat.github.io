
import { WORLD } from "./data.js";

const STORAGE_KEY = "ruimdal-economy-simulator-state-v1";
const MAX_TICK_HISTORY = 8;
const app = document.getElementById("app");

const clone = (value) => JSON.parse(JSON.stringify(value));
const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const qty = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const GOODS_BY_ID = Object.fromEntries(WORLD.goods.map((g) => [g.id, g]));
const LOCATIONS_BY_ID = Object.fromEntries(WORLD.locations.map((l) => [l.id, l]));
const ROUTES = WORLD.routes;

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((entry) => entry && typeof entry === "object" && entry.world?.locations)
    .slice(0, MAX_TICK_HISTORY)
    .map((entry) => {
      const snapshot = clone(entry);
      delete snapshot.history;
      return snapshot;
    });
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (!data?.world?.locations) return null;
    return {
      ...data,
      history: sanitizeHistory(data.history),
    };
  } catch {
    return null;
  }
}

function makeInitialState() {
  return {
    week: 1,
    world: clone(WORLD),
    selectedId: "dalfaros",
    log: [
      {
        week: 0,
        type: "setup",
        text: "Ruimdal loaded.",
        detail: WORLD.briefing,
      },
    ],
    history: [],
  };
}

function snapshotState() {
  const snapshot = clone(state);
  delete snapshot.history;
  return snapshot;
}

let state = loadState() ?? makeInitialState();

function persist() {
  const toSave = { ...state, history: sanitizeHistory(state.history) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getLocation(id) {
  return state.world.locations.find((l) => l.id === id) ?? null;
}

function routeEndpoints(route) {
  return [getLocation(route.a), getLocation(route.b)];
}

function routeCountFor(id) {
  return ROUTES.filter((r) => r.a === id || r.b === id).length;
}

function facilityDef(id) {
  return state.world.facilities.find((f) => f.id === id) ?? null;
}

function allTradeGoods() {
  return state.world.goods;
}

function isFood(goodId) {
  return ["grain", "flour", "bread", "fish", "mutton", "dairy"].includes(goodId);
}

function isLuxury(goodId) {
  return [
    "gems",
    "crystals",
    "magical_items",
    "luxury_goods",
    "silk",
    "spices",
    "rare_goods",
    "artifacts",
  ].includes(goodId);
}

function populationDemandScale(loc) {
  if (loc.external) return 0;
  if (loc.kind === "breadbasket") return 0.9;
  if (loc.kind === "capital") return 1.35;
  if (loc.kind === "capital_port") return 1.2;
  if (loc.kind === "hub") return 1.18;
  if (loc.kind === "outpost") return 0.85;
  return 1;
}

function luxuryDemandScale(loc) {
  if (loc.external) return 0;
  if (loc.kind === "capital") return 2.4;
  if (loc.kind === "capital_port") return 1.9;
  if (loc.kind === "hub") return 1.7;
  if (loc.kind === "mountain_town") return 1.0;
  if (loc.kind === "breadbasket") return 0.25;
  return 0.7;
}

function foodPreferenceWeight(loc, goodId) {
  if (goodId === "bread") return loc.kind === "capital" || loc.kind === "hub" ? 1.2 : 1.0;
  if (goodId === "grain") return loc.kind === "breadbasket" ? 1.4 : 1.0;
  if (goodId === "fish") return loc.kind === "coastal_town" || loc.kind === "capital_port" ? 1.25 : 0.8;
  if (goodId === "mutton") return loc.kind === "ridge_town" || loc.kind === "outpost" ? 1.1 : 0.9;
  if (goodId === "dairy") return 0.9;
  return 1;
}

function luxuryPreferenceWeight(loc, goodId) {
  const weights = {
    silk: 1.0,
    spices: 1.0,
    rare_goods: 1.1,
    artifacts: 1.2,
    luxury_goods: 1.3,
    magical_items: 1.4,
    gems: 0.9,
    crystals: 0.95,
  };
  let weight = weights[goodId] ?? 0.6;
  if (loc.kind === "capital") weight *= 1.2;
  if (loc.kind === "capital_port") weight *= 1.1;
  if (loc.kind === "hub") weight *= 1.05;
  if (loc.kind === "breadbasket") weight *= 0.45;
  if (loc.kind === "outpost") weight *= 0.6;
  return weight;
}

function locationGoldPerCapita(loc) {
  if (loc.external || !loc.population) return 0;
  return loc.gold / loc.population;
}

function baseInflationMultiplier() {
  return Math.pow(1 + state.world.config.baseInflation, state.week - 1);
}

function localPriceMultiplier(loc, good) {
  let mult = 1 + (loc.pricePressure ?? 0);
  if (good.category === "luxury") mult *= 1 + (state.week - 1) * state.world.config.luxuryInflationBoost;
  if (loc.kind === "breadbasket" && good.category === "food") mult *= 0.92;
  if (loc.kind === "capital" && isLuxury(good.id)) mult *= 1.08;
  if (loc.kind === "capital_port" && good.id === "fish") mult *= 0.94;
  if (loc.kind === "outpost" && (good.id === "tools" || good.id === "metalware")) mult *= 1.05;
  return mult;
}

function facilityProduction(loc, goodId) {
  let total = 0;
  for (const slot of loc.facilities ?? []) {
    const def = facilityDef(slot.facilityId);
    if (!def) continue;
    for (const out of def.produces ?? []) {
      if (out.good === goodId) total += out.amount * slot.count;
    }
  }
  return total;
}

function facilityConsumption(loc, goodId) {
  let total = 0;
  for (const slot of loc.facilities ?? []) {
    const def = facilityDef(slot.facilityId);
    if (!def) continue;
    for (const input of def.consumes ?? []) {
      if (input.good === goodId) total += input.amount * slot.count;
    }
  }
  return total;
}

function weeklyDemand(loc, goodId) {
  if (loc.external) {
    const profile = loc.profile ?? {};
    const imports = profile.imports ?? {};
    const exports = profile.exports ?? {};
    if (imports[goodId]) return 800 + 80 * imports[goodId];
    if (exports[goodId]) return 40;
    return 0;
  }

  let demand = 0;

  if (isFood(goodId)) {
    demand += loc.population * state.world.config.foodNeedPerPop * foodPreferenceWeight(loc, goodId) * populationDemandScale(loc);
  }

  if (isLuxury(goodId)) {
    demand += loc.population * state.world.config.luxuryNeedPerPop * luxuryDemandScale(loc) * luxuryPreferenceWeight(loc, goodId);
  }

  demand += facilityConsumption(loc, goodId);

  if (loc.kind === "outpost" && (goodId === "tools" || goodId === "metalware")) {
    demand += loc.population * state.world.config.militaryNeedFloor * 0.8;
  }

  if (loc.kind === "capital" && goodId === "silk") demand += loc.population * 0.00015;
  if (loc.kind === "capital_port" && (goodId === "silk" || goodId === "spices")) demand += loc.population * 0.00012;
  if (loc.kind === "hub" && isLuxury(goodId)) demand += loc.population * 0.0002;

  return demand;
}

function weeklySupply(loc, goodId) {
  if (loc.external) {
    const profile = loc.profile ?? {};
    if (profile.exports?.[goodId]) {
      return (loc.inventory?.[goodId] ?? 0) + 5000;
    }
    return loc.inventory?.[goodId] ?? 0;
  }
  return (loc.inventory?.[goodId] ?? 0) + facilityProduction(loc, goodId);
}

function marketPrice(loc, goodId) {
  const good = GOODS_BY_ID[goodId];
  if (!good) return 0;
  const supply = Math.max(0.3, weeklySupply(loc, goodId));
  const demand = Math.max(0, weeklyDemand(loc, goodId));
  const ratio = demand === 0 ? (supply > 0 ? 0.55 : 1) : clamp(demand / supply, 0.35, 4.5);
  const inflation = baseInflationMultiplier();
  const localMult = localPriceMultiplier(loc, good);
  return Math.max(0.1, good.basePrice * ratio * inflation * localMult);
}

function marketLabel(loc, goodId) {
  const supply = weeklySupply(loc, goodId);
  const demand = weeklyDemand(loc, goodId);
  if (demand === 0) return "Idle";
  const ratio = demand / Math.max(0.1, supply);
  if (ratio < 0.75) return "Surplus";
  if (ratio < 1.05) return "Balanced";
  if (ratio < 1.45) return "Scarce";
  return "Critical";
}

function roleTitle(loc) {
  if (loc.external) return loc.kind === "external" ? "External partner" : "External partner";
  const kindMap = {
    capital: "Capital",
    capital_port: "Southern capital",
    hub: "Trade hub",
    mining_town: "Mining town",
    breadbasket: "Breadbasket",
    coastal_town: "Coastal town",
    druid_settlement: "Druid settlement",
    mountain_town: "Mountain town",
    ridge_town: "Ridge settlement",
    lumber_town: "Lumber town",
    outpost: "Outpost",
  };
  return kindMap[loc.kind] ?? loc.kind;
}

function routeCapacity(route, a, b) {
  let cap = state.world.config.routeTradeVolume;
  if (route.distance <= 2) cap += 3;
  if (route.distance >= 5) cap -= 1;
  if (a.tradeTaxRate || b.tradeTaxRate) cap += 1;
  if (a.kind === "capital" || b.kind === "capital") cap += 2;
  if (a.kind === "capital_port" || b.kind === "capital_port") cap += 2;
  if (a.kind === "hub" || b.kind === "hub") cap += 3;
  if (a.external || b.external) cap = state.world.config.externalTradeVolume;
  return Math.max(3, cap);
}

function foodPriority(loc) {
  if (loc.kind === "coastal_town" || loc.kind === "capital_port") return ["bread", "fish", "grain", "mutton", "dairy"];
  if (loc.kind === "breadbasket") return ["bread", "grain", "dairy", "mutton", "fish"];
  if (loc.kind === "outpost") return ["bread", "mutton", "grain", "fish", "dairy"];
  return ["bread", "grain", "fish", "mutton", "dairy"];
}

function consumeNeeds(loc, log) {
  if (loc.external) return;

  let need = loc.population * state.world.config.foodNeedPerPop;
  let unmet = need;
  for (const goodId of foodPriority(loc)) {
    if (unmet <= 0) break;
    const have = loc.inventory[goodId] ?? 0;
    const use = Math.min(have, unmet);
    if (use > 0) {
      loc.inventory[goodId] = have - use;
      unmet -= use;
    }
  }

  if (unmet > need * 0.15) {
    log.unshift({
      week: state.week,
      type: "shortage",
      text: `${loc.name} feels food pressure.`,
      detail: `${qty.format(unmet)} units of weekly food need remain uncovered.`,
    });
  }

  const eliteSnacks = [
    ["luxury_goods", 0.00035 * loc.population * luxuryDemandScale(loc)],
    ["magical_items", 0.00012 * loc.population * luxuryDemandScale(loc)],
    ["silk", 0.00010 * loc.population * luxuryDemandScale(loc)],
    ["spices", 0.00008 * loc.population * luxuryDemandScale(loc)],
  ];

  if (loc.kind === "breadbasket" || loc.kind === "ridge_town") return;

  for (const [goodId, amount] of eliteSnacks) {
    const have = loc.inventory[goodId] ?? 0;
    const use = Math.min(have, amount);
    loc.inventory[goodId] = have - use;
  }

  if (loc.kind === "outpost") {
    const toolUse = Math.min(loc.inventory.tools ?? 0, loc.population * 0.00008);
    loc.inventory.tools = (loc.inventory.tools ?? 0) - toolUse;
  }

  for (const [goodId, amount] of Object.entries(loc.inventory)) {
    if (amount < 0) loc.inventory[goodId] = 0;
  }
}

function replenishExternal(loc) {
  if (!loc.external) return;
  const profile = loc.profile ?? {};
  const exports = profile.exports ?? {};
  for (const [goodId, weight] of Object.entries(exports)) {
    const target = 2500 + weight * 700;
    if ((loc.inventory[goodId] ?? 0) < target) loc.inventory[goodId] = target;
  }
  if (loc.inventory.gold == null) loc.inventory.gold = loc.gold ?? 0;
}

function produceGoods(loc) {
  if (loc.external) return;
  const nextInventory = { ...loc.inventory };

  for (const slot of loc.facilities ?? []) {
    const def = facilityDef(slot.facilityId);
    if (!def) continue;

    const canRun = (def.consumes ?? []).every((input) => (nextInventory[input.good] ?? 0) >= input.amount * slot.count);
    if (!canRun) continue;

    for (const input of def.consumes ?? []) {
      nextInventory[input.good] = (nextInventory[input.good] ?? 0) - input.amount * slot.count;
    }
    for (const out of def.produces ?? []) {
      nextInventory[out.good] = (nextInventory[out.good] ?? 0) + out.amount * slot.count;
    }
  }

  loc.inventory = nextInventory;
}

function moveMoney(payer, receiver, amount) {
  const paid = Math.min(payer.gold ?? 0, amount);
  payer.gold = (payer.gold ?? 0) - paid;
  receiver.gold = (receiver.gold ?? 0) + paid;
  return paid;
}

function applyTax(route, source, value) {
  const ta = source.tradeTaxRate ?? 0;
  const tb = 0;
  const tax = value * (ta + tb);
  if (tax > 0) source.gold = (source.gold ?? 0) + tax;
}

function routeTradeInternal(a, b, route, log) {
  const volume = routeCapacity(route, a, b);
  const goods = allTradeGoods();
  for (const good of goods) {
    const priceA = marketPrice(a, good.id);
    const priceB = marketPrice(b, good.id);

    const spread = priceB - priceA;
    const absSpread = Math.abs(spread);
    const threshold = Math.max(priceA, priceB) * 0.14;
    if (absSpread <= threshold) continue;

    let source = a;
    let target = b;
    let sourcePrice = priceA;
    let targetPrice = priceB;

    if (priceB < priceA) {
      source = b;
      target = a;
      sourcePrice = priceB;
      targetPrice = priceA;
    }

    const sourceStock = source.inventory[good.id] ?? 0;
    const tradePrice = (sourcePrice * 0.8) + (targetPrice * 0.2);
    const affordable = Math.floor((target.gold ?? 0) / Math.max(0.1, tradePrice));
    const amount = Math.max(1, Math.min(volume, Math.floor(sourceStock / 10), affordable));
    if (amount <= 0) continue;

    const transferValue = tradePrice * amount;
    const paid = moveMoney(target, source, transferValue);
    const actualAmount = Math.min(amount, Math.floor(paid / Math.max(0.1, tradePrice)));
    if (actualAmount <= 0) continue;

    source.inventory[good.id] = sourceStock - actualAmount;
    target.inventory[good.id] = (target.inventory[good.id] ?? 0) + actualAmount;

    const actualValue = tradePrice * actualAmount;
    if (source.tradeTaxRate || target.tradeTaxRate) {
      const taxSource = actualValue * (source.tradeTaxRate ?? 0);
      const taxTarget = actualValue * (target.tradeTaxRate ?? 0);
      source.gold = (source.gold ?? 0) + taxSource;
      target.gold = (target.gold ?? 0) + taxTarget;
      source.gold = Math.max(0, source.gold);
      target.gold = Math.max(0, target.gold);
    }

    log.unshift({
      week: state.week,
      type: "trade",
      text: `${actualAmount}× ${good.icon} ${good.name}: ${source.name} → ${target.name}`,
      detail: `avg ${qty.format(tradePrice)}g, value ${money.format(actualValue)}g`,
    });
  }
}

function externalSellPrice(ext, goodId) {
  const profile = ext.profile ?? {};
  const exports = profile.exports ?? {};
  const weight = exports[goodId];
  if (!weight) return null;
  return GOODS_BY_ID[goodId].basePrice * (1.35 + weight * 0.5);
}

function externalBuyPrice(ext, goodId) {
  const profile = ext.profile ?? {};
  const imports = profile.imports ?? {};
  const weight = imports[goodId];
  if (!weight) return null;
  return GOODS_BY_ID[goodId].basePrice * (1.10 + weight * 0.7);
}

function routeTradeExternal(internal, external, route, log) {
  const volume = routeCapacity(route, internal, external);
  const goods = allTradeGoods();

  for (const good of goods) {
    const localPrice = marketPrice(internal, good.id);
    const localStock = internal.inventory[good.id] ?? 0;
    const demand = weeklyDemand(internal, good.id);

    const extSell = externalSellPrice(external, good.id);
    if (extSell != null) {
      if (localPrice > extSell * 1.08 || localStock < demand * 0.5) {
        const extStock = external.inventory[good.id] ?? 0;
        const affordable = Math.floor((internal.gold ?? 0) / Math.max(0.1, extSell));
        const amount = Math.max(1, Math.min(volume, Math.floor(extStock / 15), affordable));
        if (amount > 0) {
          const value = extSell * amount;
          const paid = moveMoney(internal, external, value);
          const actualAmount = Math.min(amount, Math.floor(paid / Math.max(0.1, extSell)));
          if (actualAmount > 0) {
            external.inventory[good.id] = extStock - actualAmount;
            internal.inventory[good.id] = (internal.inventory[good.id] ?? 0) + actualAmount;
            log.unshift({
              week: state.week,
              type: "import",
              text: `${actualAmount}× ${good.icon} ${good.name}: ${external.name} → ${internal.name}`,
              detail: `bought from ${external.name} at ${qty.format(extSell)}g`,
            });
          }
        }
      }
    }

    const extBuy = externalBuyPrice(external, good.id);
    if (extBuy != null) {
      if (localPrice < extBuy * 0.95 || localStock > demand * 1.15) {
        const affordable = Math.floor((external.gold ?? 0) / Math.max(0.1, extBuy));
        const amount = Math.max(1, Math.min(volume, Math.floor(localStock / 12), affordable));
        if (amount > 0) {
          const value = extBuy * amount;
          const paid = moveMoney(external, internal, value);
          const actualAmount = Math.min(amount, Math.floor(paid / Math.max(0.1, extBuy)));
          if (actualAmount > 0) {
            internal.inventory[good.id] = localStock - actualAmount;
            external.inventory[good.id] = (external.inventory[good.id] ?? 0) + actualAmount;
            log.unshift({
              week: state.week,
              type: "export",
              text: `${actualAmount}× ${good.icon} ${good.name}: ${internal.name} → ${external.name}`,
              detail: `sold to ${external.name} at ${qty.format(extBuy)}g`,
            });
          }
        }
      }
    }
  }
}

function simulateWeek() {
  state.history = [snapshotState(), ...(state.history ?? [])].slice(0, MAX_TICK_HISTORY);

  const world = state.world;
  const log = [...state.log];
  const locations = world.locations.map((loc) => clone(loc));
  const byId = Object.fromEntries(locations.map((loc) => [loc.id, loc]));

  for (const loc of locations) {
    produceGoods(loc);
  }

  for (const loc of locations) {
    replenishExternal(loc);
    consumeNeeds(loc, log);
  }

  for (const route of world.routes) {
    const a = byId[route.a];
    const b = byId[route.b];
    if (!a || !b) continue;
    if (a.external || b.external) {
      const internal = a.external ? b : a;
      const external = a.external ? a : b;
      routeTradeExternal(internal, external, route, log);
    } else {
      routeTradeInternal(a, b, route, log);
    }
  }

  for (const loc of locations) {
    if (loc.external) continue;
    loc.gold = Math.max(0, loc.gold ?? 0);
    for (const [goodId, amount] of Object.entries(loc.inventory)) {
      if (amount < 0 || Number.isNaN(amount)) loc.inventory[goodId] = 0;
      loc.inventory[goodId] = Math.round(loc.inventory[goodId] * 10) / 10;
    }
  }

  for (const loc of locations) {
    if (!loc.external) continue;
    for (const [goodId, amount] of Object.entries(loc.inventory)) {
      if (amount < 0 || Number.isNaN(amount)) loc.inventory[goodId] = 0;
    }
  }

  state = {
    ...state,
    week: state.week + 1,
    world: { ...world, locations },
    log: log.slice(0, 200),
    history: state.history ?? [],
  };

  persist();
  render();
}

function restoreTicks(count = 1) {
  const history = Array.isArray(state.history) ? state.history : [];
  const steps = Math.max(1, Math.min(count, history.length));
  if (!steps) return false;

  const restored = clone(history[steps - 1]);
  restored.history = history.slice(steps);
  state = restored;
  persist();
  render();
  return true;
}

function resetState() {
  if (!confirm("Reset Ruimdal to its starting state?")) return;
  state = makeInitialState();
  persist();
  render();
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ruimdal-state.json";
  a.click();
  URL.revokeObjectURL(url);
}

function exportWorld() {
  const blob = new Blob([JSON.stringify(state.world, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ruimdal-world.json";
  a.click();
  URL.revokeObjectURL(url);
}

async function importJson(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (data?.world?.locations) {
    state = {
      ...data,
      history: sanitizeHistory(data.history),
    };
  } else if (data?.locations && data?.goods && data?.facilities) {
    state = {
      week: data.week ?? 1,
      world: data,
      selectedId: data.selectedId ?? "dalfaros",
      log: data.log ?? [],
      history: [],
    };
  } else {
    throw new Error("Unknown JSON shape.");
  }
  persist();
  render();
}

function summaryCards() {
  const internal = state.world.locations.filter((l) => !l.external);
  const totalPopulation = internal.reduce((sum, l) => sum + (l.population ?? 0), 0);
  const totalGold = internal.reduce((sum, l) => sum + (l.gold ?? 0), 0);
  const totalRoutes = state.world.routes.length;
  const hubRoutes = state.world.routes.filter((r) => ["dalfaros", "iselnes", "dalwart"].includes(r.a) || ["dalfaros", "iselnes", "dalwart"].includes(r.b)).length;
  const eliteGold = [...internal].sort((a, b) => (b.gold ?? 0) - (a.gold ?? 0)).slice(0, 3).reduce((s, l) => s + (l.gold ?? 0), 0);
  const foodBuffer = internal.reduce((sum, loc) => {
    const stock = ["grain", "flour", "bread", "fish", "mutton", "dairy"].reduce((s, gid) => s + (loc.inventory[gid] ?? 0), 0);
    return sum + stock / Math.max(1, loc.population * state.world.config.foodNeedPerPop * 7);
  }, 0) / internal.length;
  const avgInflation = (Math.pow(1 + state.world.config.baseInflation, state.week - 1) - 1) * 100;

  return `
    <div class="card-grid">
      <section class="card stat">
        <div class="kicker">Kingdom</div>
        <div class="stat-value">${money.format(totalPopulation)}</div>
        <div class="stat-label">permanent population</div>
      </section>
      <section class="card stat">
        <div class="kicker">Gold</div>
        <div class="stat-value">${money.format(totalGold)}</div>
        <div class="stat-label">liquid wealth inside Ruimdal</div>
      </section>
      <section class="card stat">
        <div class="kicker">Trade core</div>
        <div class="stat-value">${money.format(Math.round((hubRoutes / totalRoutes) * 100))}%</div>
        <div class="stat-label">routes touching the big three</div>
      </section>
      <section class="card stat">
        <div class="kicker">Price creep</div>
        <div class="stat-value">+${qty.format(avgInflation)}%</div>
        <div class="stat-label">since week 1</div>
      </section>
      <section class="card stat">
        <div class="kicker">Food buffer</div>
        <div class="stat-value">${qty.format(foodBuffer)}×</div>
        <div class="stat-label">weekly internal need</div>
      </section>
      <section class="card stat">
        <div class="kicker">Gold gap</div>
        <div class="stat-value">${money.format(eliteGold / Math.max(1, totalGold) * 100)}%</div>
        <div class="stat-label">held by the top three towns</div>
      </section>
    </div>
  `;
}

function overviewNarrative() {
  return `
    <section class="card">
      <div class="section-title">Ruimdal</div>
      <p class="lede">${WORLD.briefing}</p>
      <div class="note-row">
        ${WORLD.notes.map((note) => `<article class="note"><strong>${note.title}</strong><span>${note.text}</span></article>`).join("")}
      </div>
    </section>
  `;
}

function locationList() {
  const locations = [...state.world.locations].filter((l) => !l.external);
  locations.sort((a, b) => routeCountFor(b.id) - routeCountFor(a.id) || (b.population ?? 0) - (a.population ?? 0));
  return `
    <section class="card">
      <div class="section-title">Towns</div>
      <div class="town-list">
        ${locations
          .map((loc) => {
            const active = loc.id === state.selectedId ? "active" : "";
            const foodNeed = loc.population * state.world.config.foodNeedPerPop;
            const foodStock = ["grain", "flour", "bread", "fish", "mutton", "dairy"].reduce((sum, gid) => sum + (loc.inventory[gid] ?? 0), 0);
            const buffer = foodStock / Math.max(1, foodNeed * 7);
            return `
              <button class="town-row ${active}" data-select-town="${loc.id}">
                <span class="town-name">${loc.name}</span>
                <span class="town-meta">${roleTitle(loc)}</span>
                <span class="town-meta">${money.format(loc.population ?? 0)} pop · ${routeCountFor(loc.id)} routes · ${qty.format(buffer)}× food</span>
              </button>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function mapSvg() {
  const lines = state.world.routes
    .map((route) => {
      const a = getLocation(route.a);
      const b = getLocation(route.b);
      if (!a || !b) return "";
      const isExternal = a.external || b.external;
      const stroke = isExternal ? "#6aa8ff" : route.danger < 0.1 ? "#3bc97f" : route.danger < 0.18 ? "#d9a53d" : "#d96b4b";
      const dash = isExternal ? "4 2" : route.danger >= 0.18 ? "3 2" : "";
      const width = isExternal ? 0.65 : 0.5;
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${stroke}" stroke-width="${width}" stroke-dasharray="${dash}" opacity="0.85" />`;
    })
    .join("");

  const nodes = state.world.locations
    .map((loc) => {
      const selected = loc.id === state.selectedId;
      const r = loc.external ? 1.9 : 2.4 + Math.min(routeCountFor(loc.id) * 0.12, 1.5);
      const fill = selected ? "#d8b15c" : loc.external ? "#6e8cff" : "#241f18";
      const stroke = selected ? "#f2d68b" : loc.external ? "#8eb0ff" : "#786549";
      const label = loc.external ? `${loc.name} (ext)` : loc.name;
      return `
        <g class="map-node" data-select-town="${loc.id}">
          ${selected ? `<circle cx="${loc.x}" cy="${loc.y}" r="${r + 2.2}" fill="none" stroke="#f2d68b" stroke-width="0.5" opacity="0.8" />` : ""}
          <circle cx="${loc.x}" cy="${loc.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="0.45" />
          <text x="${loc.x}" y="${loc.y - r - 1.3}" text-anchor="middle" font-size="2.6" fill="${selected ? "#f2d68b" : "#ccbfa0"}" font-family="serif">${label}</text>
        </g>
      `;
    })
    .join("");

  return `
    <section class="card map-card">
      <div class="section-title">Map</div>
      <svg viewBox="0 0 100 100" class="map">
        ${lines}
        ${nodes}
      </svg>
      <div class="legend">
        <span><i class="legend-line safe"></i> Safe</span>
        <span><i class="legend-line mid"></i> Moderate</span>
        <span><i class="legend-line danger"></i> Risky</span>
        <span><i class="legend-line external"></i> External route</span>
      </div>
    </section>
  `;
}

function routeList() {
  return `
    <section class="card">
      <div class="section-title">Routes</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Dist</th>
            <th>Risk</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          ${state.world.routes
            .map((route) => {
              const a = getLocation(route.a);
              const b = getLocation(route.b);
              const type = a?.external || b?.external ? "External" : "Internal";
              return `
                <tr>
                  <td>${a?.name ?? route.a}</td>
                  <td>${b?.name ?? route.b}</td>
                  <td>${route.distance} wk</td>
                  <td>${Math.round(route.danger * 100)}%</td>
                  <td>${type}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </section>
  `;
}

function selectedLocationPanel() {
  const loc = getLocation(state.selectedId) ?? state.world.locations[0];
  const topGoods = state.world.goods
    .map((good) => ({
      ...good,
      stock: loc.inventory?.[good.id] ?? 0,
      price: marketPrice(loc, good.id),
      demand: weeklyDemand(loc, good.id),
      supply: weeklySupply(loc, good.id),
    }))
    .filter((g) => g.stock > 0 || g.demand > 0 || g.supply > 0)
    .sort((a, b) => b.price - a.price)
    .slice(0, 12);

  const connected = state.world.routes
    .filter((r) => r.a === loc.id || r.b === loc.id)
    .map((r) => {
      const other = getLocation(r.a === loc.id ? r.b : r.a);
      return { route: r, other };
    })
    .filter((x) => x.other);

  const avgPrice = topGoods.length ? topGoods.reduce((s, g) => s + g.price, 0) / topGoods.length : 0;
  const foodStock = ["grain", "flour", "bread", "fish", "mutton", "dairy"].reduce((s, gid) => s + (loc.inventory?.[gid] ?? 0), 0);
  const foodNeed = loc.external ? 0 : loc.population * state.world.config.foodNeedPerPop;
  const foodBuffer = loc.external ? 0 : foodStock / Math.max(1, foodNeed * 7);
  const goldPerCapita = locationGoldPerCapita(loc);
  const hubScore = routeCountFor(loc.id) + (loc.tradeTaxRate ? 2 : 0) + (loc.external ? 0 : 1);

  return `
    <section class="card detail-card">
      <div class="section-title">${loc.name}</div>
      <div class="detail-subtitle">${roleTitle(loc)}</div>
      <p class="detail-text">${loc.description}</p>

      <div class="detail-kpis">
        <div><span>Population</span><strong>${money.format(loc.population ?? 0)}</strong></div>
        <div><span>Gold</span><strong>${money.format(loc.gold ?? 0)}g</strong></div>
        <div><span>Trade links</span><strong>${routeCountFor(loc.id)}</strong></div>
        <div><span>Food buffer</span><strong>${loc.external ? "—" : `${qty.format(foodBuffer)}×`}</strong></div>
        <div><span>Gold / cap.</span><strong>${loc.external ? "—" : `${qty.format(goldPerCapita)}g`}</strong></div>
        <div><span>Hub score</span><strong>${hubScore}</strong></div>
      </div>

      <div class="pill-row">
        ${(loc.tags ?? []).map((tag) => `<span class="pill">${tag}</span>`).join("")}
      </div>

      <div class="subgrid">
        <section class="subcard">
          <div class="subhead">Facilities</div>
          <div class="facility-list">
            ${(loc.facilities ?? [])
              .map((slot) => {
                const def = facilityDef(slot.facilityId);
                if (!def) return "";
                return `
                  <div class="facility-row">
                    <span>${def.icon} ${def.name}</span>
                    <strong>×${slot.count}</strong>
                  </div>
                `;
              })
              .join("") || `<div class="muted">No facilities listed.</div>`}
          </div>
        </section>

        <section class="subcard">
          <div class="subhead">Routes</div>
          <div class="route-list">
            ${connected
              .map(({ route, other }) => `
                <div class="facility-row">
                  <span>${other.name}</span>
                  <strong>${route.distance}wk · ${Math.round(route.danger * 100)}%</strong>
                </div>
              `)
              .join("")}
          </div>
        </section>
      </div>

      <section class="subcard">
        <div class="subhead">Economy snapshot</div>
        <div class="data-strip">
          <div><span>Avg market price</span><strong>${qty.format(avgPrice)}g</strong></div>
          <div><span>Inequality</span><strong>${loc.external ? "—" : `${Math.round((loc.inequality ?? 0) * 100)}%`}</strong></div>
          <div><span>Price pressure</span><strong>${loc.external ? "—" : `${Math.round((loc.pricePressure ?? 0) * 100)}%`}</strong></div>
          <div><span>Trade tax</span><strong>${loc.external ? "—" : `${Math.round((loc.tradeTaxRate ?? 0) * 100)}%`}</strong></div>
        </div>
      </section>

      <section class="subcard">
        <div class="subhead">Goods</div>
        <table class="data-table small">
          <thead>
            <tr>
              <th>Good</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${topGoods
              .map((good) => `
                <tr>
                  <td>${good.icon} ${good.name}</td>
                  <td>${qty.format(good.stock)}</td>
                  <td>${qty.format(good.price)}g</td>
                  <td><span class="status ${marketLabel(loc, good.id).toLowerCase()}">${marketLabel(loc, good.id)}</span></td>
                </tr>
              `)
              .join("")}
          </tbody>
        </table>
      </section>
    </section>
  `;
}

function logPanel() {
  const items = state.log.slice(0, 24);
  return `
    <section class="card log-card">
      <div class="section-title">Trade log</div>
      <div class="log-list">
        ${items
          .map(
            (entry) => `
              <article class="log-item ${entry.type}">
                <strong>W${entry.week}</strong>
                <span>${entry.text}</span>
                <em>${entry.detail ?? ""}</em>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function header() {
  return `
    <header class="topbar">
      <div>
        <div class="title">${WORLD.title}</div>
        <div class="subtitle">${WORLD.subtitle}</div>
      </div>
      <div class="toolbar">
        <span class="week-chip">Week ${state.week}</span>
        <button id="tick-btn" class="primary">Advance week</button>
        <button id="undo-btn" ${state.history?.length ? "" : "disabled"}>Back 1 week</button>
        <button id="undo-3-btn" ${state.history?.length >= 3 ? "" : "disabled"}>Back 3 weeks</button>
        <button id="reset-btn">Reset</button>
        <button id="export-state-btn">Export state</button>
        <button id="export-world-btn">Export world</button>
        <label class="file-btn">
          Import JSON
          <input id="import-input" type="file" accept=".json" hidden />
        </label>
      </div>
    </header>
  `;
}

function mainLayout() {
  return `
    <div class="layout">
      <aside class="sidebar">
        ${overviewNarrative()}
        ${summaryCards()}
        ${locationList()}
      </aside>

      <main class="content">
        ${mapSvg()}
        ${routeList()}
        ${logPanel()}
      </main>

      <aside class="sidebar detail">
        ${selectedLocationPanel()}
      </aside>
    </div>
  `;
}

function render() {
  app.innerHTML = header() + mainLayout();
  bindEvents();
}

function bindEvents() {
  const tickBtn = document.getElementById("tick-btn");
  if (tickBtn) tickBtn.addEventListener("click", simulateWeek);

  const undoBtn = document.getElementById("undo-btn");
  if (undoBtn) undoBtn.addEventListener("click", () => restoreTicks(1));

  const undo3Btn = document.getElementById("undo-3-btn");
  if (undo3Btn) undo3Btn.addEventListener("click", () => restoreTicks(3));

  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) resetBtn.addEventListener("click", resetState);

  const exportStateBtn = document.getElementById("export-state-btn");
  if (exportStateBtn) exportStateBtn.addEventListener("click", exportState);

  const exportWorldBtn = document.getElementById("export-world-btn");
  if (exportWorldBtn) exportWorldBtn.addEventListener("click", exportWorld);

  const importInput = document.getElementById("import-input");
  if (importInput) {
    importInput.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        await importJson(file);
      } catch (error) {
        alert(`Import failed: ${error.message}`);
      } finally {
        importInput.value = "";
      }
    });
  }

  document.querySelectorAll("[data-select-town]").forEach((el) => {
    el.addEventListener("click", () => {
      state.selectedId = el.getAttribute("data-select-town");
      persist();
      render();
    });
  });
}

render();
