
import {
  DEFAULT_GOODS, DEFAULT_FACILITIES, DEFAULT_ROUTES, DEFAULT_TOWNS,
  clone, slugify, FOOD_GOODS
} from './data.js';

const STORAGE_KEY = 'realm-economy-static-v2';

const state = loadState();

const els = {};
let selectedTownId = state.ui.selectedTownId || 'ashwick';
let activeTab = state.ui.activeTab || 'map';
let activeTownSubtab = state.ui.activeTownSubtab || 'overview';
let editorSection = state.ui.editorSection || 'goods';
let autoRun = !!state.ui.autoRun;
let speedMs = state.ui.speedMs || 2000;
let autoTimer = null;

const app = document.getElementById('app');

function loadState() {
  const fresh = {
    world: {
      goods: clone(DEFAULT_GOODS),
      facilities: clone(DEFAULT_FACILITIES),
      routes: clone(DEFAULT_ROUTES),
      towns: clone(DEFAULT_TOWNS),
    },
    sim: {
      week: 1,
      towns: clone(DEFAULT_TOWNS),
      caravans: [],
      log: []
    },
    ui: {
      selectedTownId: 'ashwick',
      activeTab: 'map',
      activeTownSubtab: 'overview',
      editorSection: 'goods',
      autoRun: false,
      speedMs: 2000,
      marketCategory: 'all',
      chainGoodId: ''
    }
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const parsed = JSON.parse(raw);
    return {
      world: {
        goods: Array.isArray(parsed.world?.goods) ? parsed.world.goods : fresh.world.goods,
        facilities: Array.isArray(parsed.world?.facilities) ? parsed.world.facilities : fresh.world.facilities,
        routes: Array.isArray(parsed.world?.routes) ? parsed.world.routes : fresh.world.routes,
        towns: Array.isArray(parsed.world?.towns) ? parsed.world.towns : fresh.world.towns,
      },
      sim: {
        week: Number.isFinite(parsed.sim?.week) ? parsed.sim.week : fresh.sim.week,
        towns: Array.isArray(parsed.sim?.towns) ? parsed.sim.towns : fresh.sim.towns,
        caravans: Array.isArray(parsed.sim?.caravans) ? parsed.sim.caravans : fresh.sim.caravans,
        log: Array.isArray(parsed.sim?.log) ? parsed.sim.log : fresh.sim.log,
      },
      ui: {
        ...fresh.ui,
        ...parsed.ui,
        marketCategory: parsed.ui?.marketCategory || fresh.ui.marketCategory,
        chainGoodId: parsed.ui?.chainGoodId || fresh.ui.chainGoodId
      }
    };
  } catch {
    return fresh;
  }
}

function saveState() {
  const payload = {
    world: state.world,
    sim: state.sim,
    ui: {
      selectedTownId,
      activeTab,
      activeTownSubtab,
      editorSection,
      autoRun,
      speedMs,
      marketCategory: state.ui.marketCategory || 'all',
      chainGoodId: state.ui.chainGoodId || ''
    }
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function money(n) {
  return `${Math.round(n * 10) / 10}g`;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function routeKey(a, b) {
  return [a, b].sort().join('::');
}

function getRoute(a, b) {
  return state.world.routes.find(r => (r.a === a && r.b === b) || (r.a === b && r.b === a)) || null;
}

function connectedTownIds(id) {
  return state.world.routes
    .filter(r => r.a === id || r.b === id)
    .map(r => (r.a === id ? r.b : r.a));
}

function goodsMap() {
  return Object.fromEntries(state.world.goods.map(g => [g.id, g]));
}

function facMap() {
  return Object.fromEntries(state.world.facilities.map(f => [f.id, f]));
}

function getTown(id) {
  return state.sim.towns.find(t => t.id === id) || null;
}

function getWeeklyProduction(town, goodId) {
  const fm = facMap();
  let total = 0;
  for (const fac of town.facilities || []) {
    const def = fm[fac.facilityId];
    if (!def) continue;
    const prod = (def.produces || []).find(p => p.good === goodId);
    if (prod) total += prod.amount * fac.count;
  }
  return total;
}

function getWeeklyDemand(town, goodId) {
  const gm = goodsMap();
  const fm = facMap();
  const good = gm[goodId];
  if (!good) return 0;

  let demand = 0;

  if (FOOD_GOODS.includes(goodId)) {
    demand += town.population * 0.004;
  }

  if (['material', 'mineral', 'metal', 'arms', 'alchemical', 'goods'].includes(good.category)) {
    demand += town.population * 0.00035;
  }

  for (const fac of town.facilities || []) {
    const def = fm[fac.facilityId];
    if (!def) continue;
    const used = (def.consumes || []).find(c => c.good === goodId);
    if (used) demand += used.amount * fac.count;
  }

  if (good.category === 'food' && town.population > 1200) {
    demand += town.population * 0.0012;
  }

  return demand;
}

function getGoodStatus(town, goodId) {
  const gm = goodsMap();
  const good = gm[goodId];
  if (!good) return { price: 0, ratio: 1, stock: 0, demand: 0, production: 0, target: 0 };

  const stock = Number(town.inventory?.[goodId] || 0);
  const production = getWeeklyProduction(town, goodId);
  const demand = getWeeklyDemand(town, goodId);

  const reserveWeeks = good.type === 'resource' ? 1.0 : 1.8;
  const target = Math.max(0.5, demand * reserveWeeks + production * 0.25);

  const supplyPressure = stock + production * 0.5;
  const ratio = clamp(target / Math.max(0.5, supplyPressure), 0.35, 4.0);
  const price = Math.round(good.basePrice * ratio * 10) / 10;

  return { price, ratio, stock, demand, production, target };
}

function importPrice(localPrice, route) {
  const markup = 1 + route.distance * 0.12 + route.danger * 0.45;
  return Math.round(localPrice * markup * 10) / 10;
}

function tierForRatio(r) {
  if (r < 0.6) return ['good', 'Surplus'];
  if (r < 0.9) return ['good', 'Adequate'];
  if (r < 1.15) return ['warn', 'Balanced'];
  if (r < 1.8) return ['warn', 'Scarce'];
  return ['bad', 'Critical'];
}

function dangerColor(d) {
  if (d < 0.1) return '#4ade80';
  if (d < 0.2) return '#facc15';
  return '#f87171';
}

function safeParseJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('JSON must be an object');
  return parsed;
}

function pushLog(type, text, detail = '') {
  state.sim.log.unshift({
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    week: state.sim.week,
    type,
    text,
    detail
  });
  state.sim.log = state.sim.log.slice(0, 200);
}

function findRoute(a, b) {
  return state.world.routes.find(r => (r.a === a && r.b === b) || (r.a === b && r.b === a)) || null;
}

function advanceCaravans() {
  const gm = goodsMap();
  const next = [];
  for (const caravan of state.sim.caravans) {
    const route = findRoute(caravan.origin, caravan.destination);
    if (!route) {
      pushLog('warn', `Route disappeared for caravan to ${caravan.destination}`, 'The caravan was removed.');
      continue;
    }

    const risk = clamp(route.danger * 0.08, 0, 0.75);
    const lost = Math.random() < risk;

    caravan.weeksLeft -= 1;
    if (caravan.weeksLeft > 0) {
      next.push(caravan);
      continue;
    }

    const origin = getTown(caravan.origin);
    const destination = getTown(caravan.destination);
    const good = gm[caravan.goodId];

    if (!origin || !destination || !good) continue;

    if (lost) {
      const salvage = caravan.payment * 0.5;
      destination.gold += salvage;
      pushLog(
        'warn',
        `Caravan lost: ${caravan.amount}× ${good.icon} ${good.name} on the road to ${destination.name}`,
        `Salvage returned ${money(salvage)} to ${destination.name}.`
      );
      continue;
    }

    destination.inventory[caravan.goodId] = (destination.inventory[caravan.goodId] || 0) + caravan.amount;
    origin.gold += caravan.payment;
    pushLog(
      'caravan',
      `Arrived: ${caravan.amount}× ${good.icon} ${good.name} to ${destination.name}`,
      `${origin.name} received ${money(caravan.payment)}`
    );
  }
  state.sim.caravans = next;
}

function runWeek() {
  const gm = goodsMap();
  const fm = facMap();
  const towns = deepClone(state.sim.towns);

  const townById = Object.fromEntries(towns.map(t => [t.id, t]));

  // Production step
  for (const town of towns) {
    town.inventory = town.inventory || {};
    town.facilities = town.facilities || [];

    for (const fac of town.facilities) {
      const def = fm[fac.facilityId];
      if (!def) continue;
      const maxCycles = Math.max(1, fac.count || 1);

      for (let cycle = 0; cycle < maxCycles; cycle++) {
        const canRun = (def.consumes || []).every(c => (town.inventory[c.good] || 0) >= c.amount);
        if (!canRun) break;

        for (const c of def.consumes || []) {
          town.inventory[c.good] = (town.inventory[c.good] || 0) - c.amount;
        }
        for (const p of def.produces || []) {
          town.inventory[p.good] = (town.inventory[p.good] || 0) + p.amount;
        }
      }
    }

    // Food consumption and demographic pressure
    const foodNeed = town.population * 0.0035;
    let eaten = 0;
    for (const goodId of ['bread', 'salted_fish', 'fish', 'ale', 'flour', 'wheat']) {
      if (eaten >= foodNeed) break;
      const available = town.inventory[goodId] || 0;
      const take = Math.min(available, foodNeed - eaten);
      if (take > 0) {
        town.inventory[goodId] = available - take;
        eaten += take;
      }
    }

    const coverage = foodNeed > 0 ? eaten / foodNeed : 1;
    if (coverage < 0.75) {
      town.population = Math.max(10, Math.floor(town.population * (1 - (0.03 + (0.75 - coverage) * 0.06))));
      town.gold = Math.max(0, Math.floor(town.gold * (1 - (0.01 + (0.75 - coverage) * 0.03))));
      pushLog('bad', `${town.name} is underfed`, `Food coverage ${Math.round(coverage * 100)}%`);
    } else if (coverage > 1.05) {
      town.population = Math.floor(town.population * (1 + Math.min(0.012, (coverage - 1.05) * 0.01)));
      town.gold += Math.round(town.population * 0.01);
    }

    // Maintenance / baseline upkeep
    const upkeep = Math.round(town.population * 0.002);
    town.gold = Math.max(0, town.gold - upkeep);

    for (const key of Object.keys(town.inventory)) {
      town.inventory[key] = Math.max(0, Math.floor(town.inventory[key]));
    }
  }

  state.sim.towns = towns;

  // Automated trade: move surplus from cheaper towns to scarcer towns on connected routes.
  for (const route of state.world.routes) {
    const a = townById[route.a];
    const b = townById[route.b];
    if (!a || !b) continue;

    for (const good of state.world.goods) {
      const sa = getGoodStatus(a, good.id);
      const sb = getGoodStatus(b, good.id);
      const localA = sa.price;
      const localB = sb.price;

      const diff = localB - localA;
      const markup = good.basePrice * (route.distance * 0.12 + route.danger * 0.45);

      const sendTrade = (from, to, fromPrice, toPrice) => {
        const fromStatus = from === a ? sa : sb;
        const toStatus = to === a ? sa : sb;
        const sourceStock = from.inventory[good.id] || 0;
        const destGold = to.gold || 0;
        if (sourceStock < 6) return;
        if (toPrice - fromPrice <= markup * 1.15) return;

        const amount = Math.max(1, Math.min(8, Math.floor(sourceStock * 0.35)));
        const payment = Math.round(toPrice * amount * 10) / 10;
        if (payment > destGold) return;

        from.inventory[good.id] -= amount;
        to.gold -= payment;
        state.sim.caravans.push({
          id: `c_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          origin: from.id,
          destination: to.id,
          goodId: good.id,
          amount,
          payment,
          weeksLeft: route.distance
        });
        pushLog(
          'auto',
          `${amount}× ${good.icon} ${good.name} dispatched: ${from.name} → ${to.name}`,
          `Expected payment ${money(payment)}`
        );
      };

      if (diff > 0) {
        sendTrade(a, b, localA, localB);
      } else if (diff < 0) {
        sendTrade(b, a, localB, localA);
      }
    }
  }

  advanceCaravans();

  state.sim.week += 1;
  saveState();
  render();
}

function resetToDefaults() {
  const fresh = {
    week: 1,
    towns: clone(DEFAULT_TOWNS),
    caravans: [],
    log: []
  };
  state.world = {
    goods: clone(DEFAULT_GOODS),
    facilities: clone(DEFAULT_FACILITIES),
    routes: clone(DEFAULT_ROUTES),
    towns: clone(DEFAULT_TOWNS),
  };
  state.sim = fresh;
  selectedTownId = 'ashwick';
  activeTab = 'map';
  activeTownSubtab = 'overview';
  editorSection = 'goods';
  autoRun = false;
  speedMs = 2000;
  stopAuto();
  saveState();
  render();
}

function downloadFile(filename, content, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setWorldFromJSON(payload) {
  const world = {
    goods: Array.isArray(payload.goods) ? payload.goods : state.world.goods,
    facilities: Array.isArray(payload.facilities) ? payload.facilities : state.world.facilities,
    routes: Array.isArray(payload.routes) ? payload.routes : state.world.routes,
    towns: Array.isArray(payload.towns) ? payload.towns : state.world.towns,
  };
  state.world = world;
  if (Array.isArray(payload.towns)) {
    state.sim.towns = clone(payload.towns);
  }
  saveState();
  render();
}

function normalizeWorldData() {
  state.world.goods = state.world.goods.map(g => ({
    ...g,
    id: slugify(g.id || g.name || 'good')
  }));
  state.world.facilities = state.world.facilities.map(f => ({
    ...f,
    id: slugify(f.id || f.name || 'facility')
  }));
  state.world.routes = state.world.routes.filter(r => r.a && r.b && r.a !== r.b);
  saveState();
  render();
}

function setSelectedTown(id) {
  selectedTownId = id;
  activeTab = 'town';
  saveState();
  render();
}

function setTab(tab) {
  activeTab = tab;
  saveState();
  render();
}

function setTownSubtab(subtab) {
  activeTownSubtab = subtab;
  saveState();
  render();
}

function setEditorSection(section) {
  editorSection = section;
  saveState();
  render();
}

function stopAuto() {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = null;
}

function startAuto() {
  stopAuto();
  autoTimer = setInterval(runWeek, speedMs);
}

function toggleAuto(force) {
  autoRun = typeof force === 'boolean' ? force : !autoRun;
  if (autoRun) startAuto(); else stopAuto();
  saveState();
  render();
}

function setSpeed(ms) {
  speedMs = ms;
  if (autoRun) startAuto();
  saveState();
  render();
}

function createCaravan(originId, destinationId, goodId, amount) {
  const origin = getTown(originId);
  const destination = getTown(destinationId);
  const good = goodsMap()[goodId];
  const route = getRoute(originId, destinationId);
  if (!origin || !destination || !good || !route) return { ok: false, error: 'Route or town not found' };

  amount = Math.floor(Number(amount) || 0);
  if (amount <= 0) return { ok: false, error: 'Amount must be positive' };

  const stock = origin.inventory[goodId] || 0;
  if (stock < amount) return { ok: false, error: 'Not enough stock in origin' };

  const localPrice = getGoodStatus(destination, goodId).price;
  const payment = Math.round(importPrice(localPrice, route) * amount * 10) / 10;
  if ((destination.gold || 0) < payment) return { ok: false, error: 'Destination lacks gold' };

  origin.inventory[goodId] -= amount;
  destination.gold -= payment;
  state.sim.caravans.push({
    id: `c_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    origin: originId,
    destination: destinationId,
    goodId,
    amount,
    payment,
    weeksLeft: route.distance
  });
  pushLog('caravan', `${amount}× ${good.icon} ${good.name} sent to ${destination.name}`, `Expected payment ${money(payment)}`);
  saveState();
  render();
  return { ok: true };
}

function createAutoTradeControls(town) {
  const destinations = connectedTownIds(town.id).map(id => getTown(id)).filter(Boolean);
  const options = state.world.goods.filter(g => (town.inventory[g.id] || 0) > 0);
  const routeMap = destinations.map(t => {
    const route = getRoute(town.id, t.id);
    const cheap = options
      .map(g => ({
        g,
        src: getGoodStatus(town, g.id),
        dst: getGoodStatus(t, g.id)
      }))
      .filter(x => x.dst.price > x.src.price)
      .sort((a, b) => (b.dst.price - b.src.price) - (a.dst.price - a.src.price))[0];
    return { town: t, route, cheap };
  }).filter(x => x.route);
  return routeMap;
}

function renderHeader() {
  const header = document.createElement('div');
  header.className = 'header';

  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = 'Realm Economics';
  header.append(title);

  const weekBadge = document.createElement('div');
  weekBadge.className = 'badge';
  weekBadge.textContent = `Week ${state.sim.week}`;
  header.append(weekBadge);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn primary';
  nextBtn.textContent = 'Next Week';
  nextBtn.onclick = runWeek;
  header.append(nextBtn);

  const autoBtn = document.createElement('button');
  autoBtn.className = 'btn';
  autoBtn.textContent = autoRun ? 'Stop Auto' : 'Auto';
  autoBtn.onclick = () => toggleAuto();
  if (autoRun) autoBtn.style.background = '#3a1a1a', autoBtn.style.color = 'var(--red)', autoBtn.style.borderColor = '#8b1a1a';
  header.append(autoBtn);

  const speed = document.createElement('select');
  speed.className = 'select';
  const speeds = [
    [500, '0.5 s'],
    [1000, '1 s'],
    [2000, '2 s'],
    [5000, '5 s']
  ];
  for (const [ms, label] of speeds) {
    const opt = document.createElement('option');
    opt.value = String(ms);
    opt.textContent = label;
    if (speedMs === ms) opt.selected = true;
    speed.append(opt);
  }
  speed.onchange = () => setSpeed(Number(speed.value));
  header.append(speed);

  const status = document.createElement('div');
  status.className = 'muted small';
  status.textContent = `${state.sim.caravans.length} caravan${state.sim.caravans.length === 1 ? '' : 's'} in transit`;
  header.append(status);

  return header;
}

function renderSidebar() {
  const aside = document.createElement('aside');
  aside.className = 'sidebar';

  const h = document.createElement('h3');
  h.textContent = `Towns (${state.sim.towns.length})`;
  aside.append(h);

  for (const town of state.sim.towns) {
    const item = document.createElement('div');
    item.className = `town-item${town.id === selectedTownId ? ' active' : ''}`;
    const foodRatio = FOOD_GOODS.reduce((best, gid) => Math.min(best, getGoodStatus(town, gid).ratio), 2);
    const [tier, label] = tierForRatio(foodRatio);
    item.innerHTML = `
      <div class="town-name">${town.name}</div>
      <div class="town-meta"><span>${town.population.toLocaleString()} pop</span><span class="health ${tier}">${label}</span></div>
      <div class="town-meta"><span>${money(town.gold)}</span><span>${connectedTownIds(town.id).length} routes</span></div>
    `;
    item.onclick = () => setSelectedTown(town.id);
    aside.append(item);
  }

  return aside;
}

function renderTabs() {
  const tabs = [
    ['map', 'Map'],
    ['town', 'Town'],
    ['market', 'Market'],
    ['chains', 'Chains'],
    ['caravans', 'Caravans'],
    ['log', 'Log'],
    ['editor', 'World Editor'],
  ];
  const bar = document.createElement('div');
  bar.className = 'tabs';

  for (const [id, label] of tabs) {
    const btn = document.createElement('button');
    btn.className = `tab${activeTab === id ? ' active' : ''}`;
    btn.textContent = label;
    btn.onclick = () => setTab(id);
    bar.append(btn);
  }
  return bar;
}

function renderMap() {
  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <div class="card-title">World Map</div>
    <div class="map-box">
      <svg viewBox="0 0 100 90" width="100%" style="display:block;max-height:500px">
        ${[20, 40, 60, 80].map(v => `
          <line x1="${v}" y1="0" x2="${v}" y2="90" stroke="#1e1a14" stroke-width=".25"></line>
          <line x1="0" y1="${v}" x2="100" y2="${v}" stroke="#1e1a14" stroke-width=".25"></line>
        `).join('')}
      </svg>
    </div>
    <div class="map-legend">
      <span style="color:#4ade80">Safe</span>
      <span style="color:#facc15">Moderate</span>
      <span style="color:#f87171">Dangerous</span>
      <span style="color:var(--gold)">Caravan</span>
    </div>
  `;

  const svg = card.querySelector('svg');
  const routes = state.world.routes;
  for (const r of routes) {
    const a = getTown(r.a);
    const b = getTown(r.b);
    if (!a || !b) continue;
    const running = state.sim.caravans.some(c => (c.origin === r.a && c.destination === r.b) || (c.origin === r.b && c.destination === r.a));
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', a.x);
    line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x);
    line.setAttribute('y2', b.y);
    line.setAttribute('stroke', dangerColor(r.danger));
    line.setAttribute('stroke-opacity', '0.65');
    line.setAttribute('stroke-width', running ? '0.7' : '0.35');
    if (r.danger > 0.2) line.setAttribute('stroke-dasharray', '1.5,1');
    svg.append(line);

    if (running) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', (a.x + b.x) / 2);
      c.setAttribute('cy', (a.y + b.y) / 2);
      c.setAttribute('r', '0.9');
      c.setAttribute('fill', '#c9a84c');
      svg.append(c);
    }
  }

  for (const t of state.sim.towns) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    node.style.cursor = 'pointer';
    node.addEventListener('click', () => setSelectedTown(t.id));

    const r = 1.8 + Math.min((t.facilities || []).reduce((sum, f) => sum + f.count, 0) * 0.14, 1.4);
    const selected = t.id === selectedTownId;

    if (selected) {
      const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      halo.setAttribute('cx', t.x);
      halo.setAttribute('cy', t.y);
      halo.setAttribute('r', String(r + 2));
      halo.setAttribute('fill', 'none');
      halo.setAttribute('stroke', '#c9a84c');
      halo.setAttribute('stroke-width', '.45');
      halo.setAttribute('opacity', '.8');
      node.append(halo);
    }

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', t.x);
    circle.setAttribute('cy', t.y);
    circle.setAttribute('r', String(r));
    circle.setAttribute('fill', selected ? 'var(--gold)' : '#2e2820');
    circle.setAttribute('stroke', selected ? 'var(--gold)' : '#6b5a3e');
    circle.setAttribute('stroke-width', '.45');
    node.append(circle);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.textContent = t.name;
    label.setAttribute('x', t.x);
    label.setAttribute('y', t.y - r - 1);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '2.6');
    label.setAttribute('fill', selected ? 'var(--gold)' : '#c8b89a');
    label.setAttribute('font-weight', selected ? '700' : '400');
    node.append(label);

    svg.append(node);
  }

  const tableCard = document.createElement('div');
  tableCard.className = 'card';
  tableCard.innerHTML = `
    <div class="card-title">Trade Routes (${routes.length})</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>From</th><th>To</th><th>Dist</th><th>Danger</th><th>Markup</th></tr></thead>
        <tbody>
          ${routes.map(r => {
            const a = getTown(r.a);
            const b = getTown(r.b);
            return `
              <tr>
                <td>${a?.name || r.a}</td>
                <td>${b?.name || r.b}</td>
                <td>${r.distance} wk</td>
                <td style="color:${dangerColor(r.danger)}">${Math.round(r.danger * 100)}%</td>
                <td style="color:var(--amber)">+${Math.round((r.distance * .12 + r.danger * .45) * 100)}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  const wrap = document.createElement('div');
  wrap.append(card, tableCard);
  return wrap;
}

function renderTownView(town) {
  const wrap = document.createElement('div');

  const header = document.createElement('div');
  header.className = 'card';
  header.innerHTML = `
    <div class="row space">
      <div>
        <div class="big">${town.name}</div>
        <div class="small muted" style="margin-top:4px">${town.description || ''}</div>
      </div>
      <div class="row" style="gap:18px;text-align:right">
        <div><div class="small muted">Population</div><div class="big" style="font-size:16px;color:var(--text)">${town.population.toLocaleString()}</div></div>
        <div><div class="small muted">Gold</div><div class="big" style="font-size:16px">${money(town.gold)}</div></div>
      </div>
    </div>
  `;

  const tabs = document.createElement('div');
  tabs.className = 'subtabs';
  for (const id of ['overview','facilities','goods','trade']) {
    const btn = document.createElement('button');
    btn.className = `subtab${activeTownSubtab === id ? ' active' : ''}`;
    btn.textContent = id[0].toUpperCase() + id.slice(1);
    btn.onclick = () => setTownSubtab(id);
    tabs.append(btn);
  }
  header.append(tabs);
  wrap.append(header);

  if (activeTownSubtab === 'overview') {
    const left = document.createElement('div');
    left.className = 'card';
    left.innerHTML = `<div class="card-title">Facilities</div>` + (town.facilities || []).map(f => {
      const def = facMap()[f.facilityId];
      if (!def) return '';
      return `
        <div class="row space" style="padding:4px 0;border-bottom:1px solid var(--line)">
          <div>${def.icon} ${def.name}</div>
          <div style="color:var(--gold);font-weight:700">×${f.count}</div>
        </div>
      `;
    }).join('') || '<div class="muted small">No facilities.</div>';

    const right = document.createElement('div');
    right.className = 'card';
    const goods = state.world.goods.map(g => {
      const s = getGoodStatus(town, g.id);
      if (s.stock <= 0 && s.production <= 0 && s.demand <= 0) return null;
      return `
        <div class="row space" style="padding:4px 0;border-bottom:1px solid var(--line)">
          <div>${g.icon} ${g.name}</div>
          <div style="color:${s.ratio < 0.9 ? 'var(--green)' : s.ratio < 1.8 ? 'var(--amber)' : 'var(--red)'}">${Math.round(s.stock)} · ${money(s.price)}</div>
        </div>
      `;
    }).filter(Boolean).join('') || '<div class="muted small">No market activity.</div>';

    right.innerHTML = `<div class="card-title">Economy</div>${goods}`;

    const split = document.createElement('div');
    split.className = 'grid-2';
    split.append(left, right);
    wrap.append(split);
  }

  if (activeTownSubtab === 'facilities') {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-title">Facilities and Production</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Facility</th><th>×</th><th>Produces / week</th><th>Consumes / week</th><th>Status</th></tr></thead>
          <tbody>
            ${(town.facilities || []).map((f, idx) => {
              const def = facMap()[f.facilityId];
              if (!def) return '';
              const ok = (def.consumes || []).every(c => (town.inventory[c.good] || 0) >= c.amount);
              return `
                <tr>
                  <td>${def.icon} ${def.name}</td>
                  <td style="color:var(--gold)">${f.count}</td>
                  <td style="color:var(--green)">${(def.produces || []).map(p => `${p.amount * f.count} ${goodsMap()[p.good]?.name || p.good}`).join(', ') || '—'}</td>
                  <td style="color:var(--red)">${(def.consumes || []).map(c => `${c.amount * f.count} ${goodsMap()[c.good]?.name || c.good}`).join(', ') || '—'}</td>
                  <td>${def.produces?.length || def.consumes?.length
                    ? `<span class="tag ${ok ? 'good' : 'bad'}">${ok ? 'Running' : 'Stalled'}</span>`
                    : `<span class="tag info">${def.special || '—'}</span>`}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    wrap.append(card);
  }

  if (activeTownSubtab === 'goods') {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-title">Goods</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Good</th><th>Stock</th><th>Demand</th><th>Production</th><th>Price</th></tr></thead>
          <tbody>
            ${state.world.goods.map(g => {
              const s = getGoodStatus(town, g.id);
              if (s.stock <= 0 && s.production <= 0 && s.demand <= 0) return '';
              return `
                <tr>
                  <td>${g.icon} ${g.name}</td>
                  <td>${Math.round(s.stock)}</td>
                  <td>${s.demand.toFixed(1)}</td>
                  <td>${s.production.toFixed(1)}</td>
                  <td style="color:${s.ratio < 0.9 ? 'var(--green)' : s.ratio < 1.8 ? 'var(--amber)' : 'var(--red)'}">${money(s.price)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    wrap.append(card);
  }

  if (activeTownSubtab === 'trade') {
    const connected = connectedTownIds(town.id).map(getTown).filter(Boolean);
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-title">Trade</div>
      <div class="notice">Connected towns can receive manual caravans. The dispatch price is based on the destination's local market plus route markup.</div>
      <hr class="sep">
      <div class="form-grid">
        <div class="field">
          <label>Destination</label>
          <select id="manualDest" class="select">${connected.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}</select>
        </div>
        <div class="field">
          <label>Good</label>
          <select id="manualGood" class="select">${state.world.goods.filter(g => (town.inventory[g.id] || 0) > 0).map(g => `<option value="${g.id}">${g.icon} ${g.name}</option>`).join('')}</select>
        </div>
        <div class="field">
          <label>Amount</label>
          <input id="manualAmount" type="number" min="1" value="4">
        </div>
        <div class="field">
          <label>Action</label>
          <button id="manualSend" class="btn primary" style="width:100%">Send Caravan</button>
        </div>
      </div>
      <div id="manualTradeResult" class="help" style="margin-top:8px"></div>
      <hr class="sep">
      <div class="card-title" style="margin-top:0">Active Caravans</div>
      ${state.sim.caravans.filter(c => c.origin === town.id || c.destination === town.id).map(c => {
        const good = goodsMap()[c.goodId];
        const dest = getTown(c.destination);
        const origin = getTown(c.origin);
        return `
          <div class="row space" style="padding:6px 0;border-bottom:1px solid var(--line);font-size:13px">
            <div>${c.amount}× ${good?.icon || ''} ${good?.name || c.goodId}</div>
            <div class="muted">${c.origin === town.id ? `→ ${dest?.name || c.destination}` : `← ${origin?.name || c.origin}`}</div>
            <div style="color:var(--gold)">${c.weeksLeft} wk</div>
          </div>
        `;
      }).join('') || '<div class="muted small">No caravans linked to this town.</div>'}
    `;
    wrap.append(card);

    queueMicrotask(() => {
      const btn = document.getElementById('manualSend');
      if (!btn) return;
      btn.onclick = () => {
        const dest = document.getElementById('manualDest').value;
        const good = document.getElementById('manualGood').value;
        const amount = document.getElementById('manualAmount').value;
        const result = document.getElementById('manualTradeResult');
        const out = createCaravan(town.id, dest, good, amount);
        result.textContent = out.ok ? 'Caravan sent.' : `Cannot send caravan: ${out.error}`;
        result.style.color = out.ok ? 'var(--green)' : 'var(--red)';
      };
    });
  }

  return wrap;
}

function renderMarketView() {
  const card = document.createElement('div');
  card.className = 'card';

  const categories = ['all', ...new Set(state.world.goods.map(g => g.category))];
  const select = document.createElement('select');
  select.className = 'select';
  select.style.width = 'auto';
  const saved = state.ui.marketCategory || 'all';
  select.innerHTML = categories.map(c => `<option value="${c}">${c[0].toUpperCase() + c.slice(1)}</option>`).join('');
  select.value = saved;
  select.onchange = () => {
    state.ui.marketCategory = select.value;
    saveState();
    render();
  };

  const filtered = state.world.goods.filter(g => saved === 'all' || g.category === saved);

  card.innerHTML = `
    <div class="row space" style="margin-bottom:10px">
      <div class="card-title" style="margin:0">Regional Market</div>
      <div id="marketSelectMount"></div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="position:sticky;left:0;background:var(--panel);z-index:1">Good</th>
            <th>Base</th>
            ${state.sim.towns.map(t => `<th>${t.name}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${filtered.map((g, i) => `
            <tr>
              <td style="position:sticky;left:0;background:${i % 2 ? '#161210' : 'var(--panel)'};z-index:1">${g.icon} ${g.name} <span class="muted" style="font-size:11px">(${g.type})</span></td>
              <td>${money(g.basePrice)}</td>
              ${state.sim.towns.map(t => {
                const s = getGoodStatus(t, g.id);
                return `<td>
                  <div style="color:${s.ratio < 0.9 ? 'var(--green)' : s.ratio < 1.8 ? 'var(--amber)' : 'var(--red)'}">${money(s.price)}</div>
                  <div class="muted" style="font-size:11px">stock ${Math.round(s.stock)} · prod ${s.production.toFixed(1)}</div>
                </td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  queueMicrotask(() => {
    const mount = card.querySelector('#marketSelectMount');
    mount.append(select);
  });

  return card;
}

function buildChainTree(goodId, seen = new Set(), depth = 0) {
  const good = goodsMap()[goodId];
  if (!good) return null;
  const node = { good, kids: [] };
  if (seen.has(goodId) || depth > 8) return node;
  seen.add(goodId);

  if (good.recipe?.length) {
    node.kids = good.recipe.map(req => ({
      req: req.amount,
      ...buildChainTree(req.good, new Set(seen), depth + 1)
    }));
  }
  return node;
}

function renderChainView() {
  const card = document.createElement('div');
  card.className = 'card';

  const crafted = state.world.goods.filter(g => g.type === 'produce');
  const chosen = state.ui.chainGoodId || crafted[0]?.id || '';
  const select = document.createElement('select');
  select.className = 'select';
  select.style.width = 'auto';
  select.innerHTML = crafted.map(g => `<option value="${g.id}">${g.icon} ${g.name}</option>`).join('');
  select.value = chosen;
  select.onchange = () => {
    state.ui.chainGoodId = select.value;
    saveState();
    render();
  };

  function renderNode(node) {
    if (!node?.good) return '';
    const isRes = node.good.type === 'resource';
    return `
      <div style="margin:6px 0 0 ${node.req ? 18 : 0}px">
        <div class="row wrap" style="gap:6px;align-items:center">
          <span>${node.good.icon} ${node.good.name}</span>
          ${node.req ? `<span class="tag warn">×${node.req}</span>` : ''}
          <span class="tag ${isRes ? 'good' : 'info'}">${isRes ? 'Resource' : 'Crafted'}</span>
          <span class="muted">${money(node.good.basePrice)}</span>
        </div>
        ${node.kids?.length ? `<div style="margin-left:12px">${node.kids.map(k => renderNode(k)).join('')}</div>` : ''}
      </div>
    `;
  }

  const tree = buildChainTree(chosen);
  card.innerHTML = `
    <div class="row space" style="margin-bottom:10px">
      <div class="card-title" style="margin:0">Production Chains</div>
      <div id="chainSelectMount"></div>
    </div>
    <div>${renderNode(tree) || '<div class="muted small">No chain available.</div>'}</div>
  `;

  queueMicrotask(() => card.querySelector('#chainSelectMount')?.append(select));
  return card;
}

function renderCaravansView() {
  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <div class="card-title">Caravans</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Goods</th><th>Route</th><th>Payment</th><th>Weeks left</th><th>Risk</th></tr></thead>
        <tbody>
          ${state.sim.caravans.map(c => {
            const g = goodsMap()[c.goodId];
            const route = getRoute(c.origin, c.destination);
            const from = getTown(c.origin);
            const to = getTown(c.destination);
            return `
              <tr>
                <td>${g?.icon || ''} ${c.amount}× ${g?.name || c.goodId}</td>
                <td>${from?.name || c.origin} → ${to?.name || c.destination}</td>
                <td>${money(c.payment)}</td>
                <td>${c.weeksLeft}</td>
                <td style="color:${route ? dangerColor(route.danger) : 'var(--muted)'}">${route ? Math.round(route.danger * 100) + '%' : '—'}</td>
              </tr>
            `;
          }).join('') || '<tr><td colspan="5" class="muted">No caravans in transit.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
  return card;
}

function renderLogView() {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-title">Trade Log</div>
    ${state.sim.log.map(entry => `
      <div style="padding:8px 0;border-bottom:1px solid var(--line)">
        <div class="row space">
          <div><strong>${entry.week ? `W${entry.week}` : ''}</strong> ${entry.text}</div>
          <div class="muted small">${entry.type}</div>
        </div>
        ${entry.detail ? `<div class="muted small" style="margin-top:2px">${entry.detail}</div>` : ''}
      </div>
    `).join('') || '<div class="muted">No log entries yet.</div>'}
  `;
  return card;
}

function jsonEditorControls(section, dataTextArea, statusEl, parser) {
  const wrap = document.createElement('div');
  wrap.className = 'row wrap';
  wrap.style.marginBottom = '10px';

  const apply = document.createElement('button');
  apply.className = 'btn primary';
  apply.textContent = 'Apply';
  apply.onclick = () => {
    try {
      parser();
      statusEl.textContent = 'Saved.';
      statusEl.style.color = 'var(--green)';
      saveState();
      render();
    } catch (err) {
      statusEl.textContent = err.message;
      statusEl.style.color = 'var(--red)';
    }
  };

  const format = document.createElement('button');
  format.className = 'btn';
  format.textContent = 'Format';
  format.onclick = () => {
    try {
      dataTextArea.value = JSON.stringify(JSON.parse(dataTextArea.value), null, 2);
      statusEl.textContent = 'Formatted.';
      statusEl.style.color = 'var(--green)';
    } catch (err) {
      statusEl.textContent = err.message;
      statusEl.style.color = 'var(--red)';
    }
  };

  const reset = document.createElement('button');
  reset.className = 'btn danger';
  reset.textContent = 'Reset Section';
  reset.onclick = () => {
    if (!confirm(`Reset ${section} to defaults?`)) return;
    if (section === 'goods') state.world.goods = clone(DEFAULT_GOODS);
    if (section === 'facilities') state.world.facilities = clone(DEFAULT_FACILITIES);
    if (section === 'routes') state.world.routes = clone(DEFAULT_ROUTES);
    if (section === 'towns') {
      state.world.towns = clone(DEFAULT_TOWNS);
      state.sim.towns = clone(DEFAULT_TOWNS);
    }
    saveState();
    render();
  };

  wrap.append(apply, format, reset);
  return wrap;
}

function renderEditorView() {
  const wrap = document.createElement('div');

  const menu = document.createElement('div');
  menu.className = 'subtabs';
  for (const id of ['goods', 'facilities', 'routes', 'towns', 'io']) {
    const btn = document.createElement('button');
    btn.className = `subtab${editorSection === id ? ' active' : ''}`;
    btn.textContent = id[0].toUpperCase() + id.slice(1);
    btn.onclick = () => setEditorSection(id);
    menu.append(btn);
  }

  const card = document.createElement('div');
  card.className = 'card';

  if (editorSection === 'io') {
    card.innerHTML = `
      <div class="card-title">Import / Export</div>
      <p class="help">Download the current world as JSON, import a saved file, or reset everything to defaults.</p>
      <div class="row wrap" style="margin-top:10px">
        <button id="exportWorld" class="btn primary">Download World JSON</button>
        <label class="btn" style="display:inline-flex;align-items:center;gap:8px">
          Import JSON
          <input id="importWorld" type="file" accept=".json" class="hidden">
        </label>
        <button id="resetWorld" class="btn danger">Reset Entire World</button>
        <button id="normalizeWorld" class="btn">Normalize IDs</button>
      </div>
      <hr class="sep">
      <div class="notice">The importer accepts the same structure as this simulator uses: goods, facilities, routes, towns.</div>
    `;
    queueMicrotask(() => {
      card.querySelector('#exportWorld').onclick = () => {
        downloadFile('realm-world.json', JSON.stringify({ ...state.world }, null, 2));
      };
      card.querySelector('#importWorld').onchange = e => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const payload = safeParseJSON(String(reader.result || ''));
            setWorldFromJSON(payload);
          } catch (err) {
            alert(`Import failed: ${err.message}`);
          }
        };
        reader.readAsText(file);
      };
      card.querySelector('#resetWorld').onclick = () => {
        if (confirm('Reset entire world to defaults?')) resetToDefaults();
      };
      card.querySelector('#normalizeWorld').onclick = () => {
        normalizeWorldData();
      };
    });

    wrap.append(menu, card);
    return wrap;
  }

  let sectionData = state.world[editorSection];
  let text = JSON.stringify(sectionData, null, 2);
  if (editorSection === 'towns') text = JSON.stringify(state.sim.towns, null, 2);
  const area = document.createElement('textarea');
  area.className = 'json';
  area.value = text;

  const status = document.createElement('div');
  status.className = 'help';
  status.textContent = 'Edit the JSON directly, then press Apply.';

  const parser = () => {
    const parsed = safeParseJSON(area.value);
    if (editorSection === 'goods') state.world.goods = parsed;
    else if (editorSection === 'facilities') state.world.facilities = parsed;
    else if (editorSection === 'routes') state.world.routes = parsed;
    else if (editorSection === 'towns') {
      state.world.towns = parsed;
      state.sim.towns = parsed;
    } else {
      throw new Error('Unknown editor section');
    }
  };

  card.innerHTML = `
    <div class="card-title">${editorSection[0].toUpperCase() + editorSection.slice(1)} JSON</div>
    <p class="help">This editor is intentionally plain so it works cleanly on GitHub Pages without a build step.</p>
  `;
  card.append(jsonEditorControls(editorSection, area, status, parser), area, status);

  wrap.append(menu, card);
  return wrap;
}

function renderMainContent() {
  const main = document.createElement('main');
  main.className = 'main';
  main.append(renderTabs());

  const content = document.createElement('div');
  content.className = 'content';

  const selectedTown = getTown(selectedTownId) || state.sim.towns[0];

  if (activeTab === 'map') content.append(renderMap());
  else if (activeTab === 'town') content.append(renderTownView(selectedTown));
  else if (activeTab === 'market') content.append(renderMarketView());
  else if (activeTab === 'chains') content.append(renderChainView());
  else if (activeTab === 'caravans') content.append(renderCaravansView());
  else if (activeTab === 'log') content.append(renderLogView());
  else if (activeTab === 'editor') content.append(renderEditorView());

  main.append(content);
  return main;
}

function render() {
  app.innerHTML = '';
  app.append(renderHeader());

  const layout = document.createElement('div');
  layout.className = 'layout';
  layout.append(renderSidebar(), renderMainContent());
  app.append(layout);

  saveState();
  queueMicrotask(() => {
    if (autoRun && !autoTimer) startAuto();
    if (!autoRun && autoTimer) stopAuto();
  });
}

window.addEventListener('beforeunload', saveState);

document.addEventListener('keydown', (ev) => {
  if (ev.ctrlKey && ev.key === 'Enter') {
    runWeek();
  }
  if (ev.key === 'Escape' && autoRun) {
    toggleAuto(false);
  }
});

render();

if (autoRun) startAuto();
