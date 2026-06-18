
export const DEFAULT_GOODS = [
  { id:"wheat", name:"Wheat", type:"resource", basePrice:2, category:"food", icon:"🌾" },
  { id:"iron_ore", name:"Iron Ore", type:"resource", basePrice:5, category:"mineral", icon:"🪨" },
  { id:"wood", name:"Wood", type:"resource", basePrice:3, category:"material", icon:"🪵" },
  { id:"stone", name:"Stone", type:"resource", basePrice:2, category:"material", icon:"⛰️" },
  { id:"fish", name:"Fish", type:"resource", basePrice:3, category:"food", icon:"🐟" },
  { id:"herbs", name:"Herbs", type:"resource", basePrice:8, category:"alchemical", icon:"🌿" },
  { id:"coal", name:"Coal", type:"resource", basePrice:4, category:"mineral", icon:"◼️" },
  { id:"hides", name:"Hides", type:"resource", basePrice:6, category:"material", icon:"🦌" },
  { id:"hemp", name:"Hemp", type:"resource", basePrice:4, category:"material", icon:"🌱" },
  { id:"salt", name:"Salt", type:"resource", basePrice:5, category:"mineral", icon:"🧂" },

  { id:"flour", name:"Flour", type:"produce", basePrice:5, category:"food", icon:"🧴", recipe:[{good:"wheat",amount:2}], output:1 },
  { id:"bread", name:"Bread", type:"produce", basePrice:8, category:"food", icon:"🍞", recipe:[{good:"flour",amount:1}], output:2 },
  { id:"ale", name:"Ale", type:"produce", basePrice:10, category:"food", icon:"🍺", recipe:[{good:"wheat",amount:3}], output:1 },
  { id:"salted_fish", name:"Salted Fish", type:"produce", basePrice:7, category:"food", icon:"🥫", recipe:[{good:"fish",amount:3},{good:"salt",amount:1}], output:2 },

  { id:"iron_bars", name:"Iron Bars", type:"produce", basePrice:12, category:"metal", icon:"🔩", recipe:[{good:"iron_ore",amount:2},{good:"coal",amount:1}], output:1 },
  { id:"steel", name:"Steel", type:"produce", basePrice:25, category:"metal", icon:"⚙️", recipe:[{good:"iron_bars",amount:2},{good:"coal",amount:2}], output:1 },

  { id:"lumber", name:"Lumber", type:"produce", basePrice:7, category:"material", icon:"🪚", recipe:[{good:"wood",amount:2}], output:3 },
  { id:"rope", name:"Rope", type:"produce", basePrice:9, category:"material", icon:"🧵", recipe:[{good:"hemp",amount:2}], output:1 },
  { id:"leather", name:"Leather", type:"produce", basePrice:14, category:"material", icon:"🟫", recipe:[{good:"hides",amount:2},{good:"salt",amount:1}], output:2 },

  { id:"potions", name:"Potions", type:"produce", basePrice:40, category:"alchemical", icon:"⚗️", recipe:[{good:"herbs",amount:3}], output:1 },
  { id:"weapons", name:"Weapons", type:"produce", basePrice:50, category:"arms", icon:"⚔️", recipe:[{good:"iron_bars",amount:3},{good:"wood",amount:1}], output:1 },
  { id:"armor", name:"Armor", type:"produce", basePrice:80, category:"arms", icon:"🛡️", recipe:[{good:"steel",amount:2},{good:"leather",amount:2}], output:1 },
  { id:"furniture", name:"Furniture", type:"produce", basePrice:30, category:"goods", icon:"🪑", recipe:[{good:"lumber",amount:4}], output:1 },
  { id:"wagons", name:"Wagons", type:"produce", basePrice:120, category:"goods", icon:"🛒", recipe:[{good:"lumber",amount:6},{good:"iron_bars",amount:2}], output:1 },
];

export const DEFAULT_FACILITIES = [
  { id:"farm", name:"Farm", icon:"🌾", produces:[{good:"wheat",amount:8}], consumes:[] },
  { id:"mine", name:"Mine", icon:"⛏️", produces:[{good:"iron_ore",amount:6},{good:"coal",amount:4}], consumes:[] },
  { id:"lumber_mill", name:"Lumber Mill", icon:"🌲", produces:[{good:"wood",amount:8}], consumes:[] },
  { id:"quarry", name:"Quarry", icon:"⛰️", produces:[{good:"stone",amount:10}], consumes:[] },
  { id:"fishery", name:"Fishery", icon:"🎣", produces:[{good:"fish",amount:10}], consumes:[] },
  { id:"herb_garden", name:"Herb Garden", icon:"🌿", produces:[{good:"herbs",amount:4}], consumes:[] },
  { id:"salt_works", name:"Salt Works", icon:"🧂", produces:[{good:"salt",amount:8}], consumes:[] },
  { id:"hunters_post", name:"Hunter's Post", icon:"🏹", produces:[{good:"hides",amount:5}], consumes:[] },
  { id:"hemp_field", name:"Hemp Fields", icon:"🌱", produces:[{good:"hemp",amount:6}], consumes:[] },

  { id:"mill", name:"Mill", icon:"⚙️", produces:[{good:"flour",amount:4}], consumes:[{good:"wheat",amount:2}] },
  { id:"bakery", name:"Bakery", icon:"🍞", produces:[{good:"bread",amount:6}], consumes:[{good:"flour",amount:1}] },
  { id:"brewery", name:"Brewery", icon:"🍺", produces:[{good:"ale",amount:3}], consumes:[{good:"wheat",amount:3}] },
  { id:"smelter", name:"Smelter", icon:"🔥", produces:[{good:"iron_bars",amount:3}], consumes:[{good:"iron_ore",amount:2},{good:"coal",amount:1}] },
  { id:"forge", name:"Forge", icon:"🔨", produces:[{good:"steel",amount:2}], consumes:[{good:"iron_bars",amount:2},{good:"coal",amount:2}] },
  { id:"sawmill", name:"Sawmill", icon:"🪚", produces:[{good:"lumber",amount:6}], consumes:[{good:"wood",amount:2}] },
  { id:"ropery", name:"Ropery", icon:"🧵", produces:[{good:"rope",amount:3}], consumes:[{good:"hemp",amount:2}] },
  { id:"tannery", name:"Tannery", icon:"🟫", produces:[{good:"leather",amount:4}], consumes:[{good:"hides",amount:2},{good:"salt",amount:1}] },
  { id:"alchemist", name:"Alchemist's Lab", icon:"⚗️", produces:[{good:"potions",amount:2}], consumes:[{good:"herbs",amount:3}] },
  { id:"blacksmith", name:"Blacksmith", icon:"⚔️", produces:[{good:"weapons",amount:2}], consumes:[{good:"iron_bars",amount:3},{good:"wood",amount:1}] },
  { id:"armorsmith", name:"Armorsmith", icon:"🛡️", produces:[{good:"armor",amount:1}], consumes:[{good:"steel",amount:2},{good:"leather",amount:2}] },
  { id:"carpenter", name:"Carpenter", icon:"🪑", produces:[{good:"furniture",amount:2}], consumes:[{good:"lumber",amount:4}] },
  { id:"wagon_maker", name:"Wagon Maker", icon:"🛒", produces:[{good:"wagons",amount:1}], consumes:[{good:"lumber",amount:6},{good:"iron_bars",amount:2}] },
  { id:"salting_house", name:"Salting House", icon:"🥫", produces:[{good:"salted_fish",amount:4}], consumes:[{good:"fish",amount:3},{good:"salt",amount:1}] },

  { id:"market", name:"Market", icon:"🏪", produces:[], consumes:[], special:"trade" },
  { id:"barracks", name:"Barracks", icon:"🗡️", produces:[], consumes:[{good:"weapons",amount:1},{good:"bread",amount:2}], special:"defense" },
  { id:"temple", name:"Temple", icon:"⛪", produces:[], consumes:[{good:"potions",amount:1},{good:"herbs",amount:1}], special:"happiness" },
];

export const DEFAULT_ROUTES = [
  { a:"verdania", b:"ironhaven", distance:2, danger:0.10 },
  { a:"verdania", b:"millford", distance:2, danger:0.05 },
  { a:"verdania", b:"ashwick", distance:2, danger:0.10 },
  { a:"ironhaven", b:"ashwick", distance:2, danger:0.20 },
  { a:"ironhaven", b:"duskhollow", distance:2, danger:0.35 },
  { a:"ironhaven", b:"stonekeep", distance:2, danger:0.15 },
  { a:"millford", b:"saltmere", distance:1, danger:0.05 },
  { a:"millford", b:"ashwick", distance:2, danger:0.05 },
  { a:"millford", b:"thalport", distance:3, danger:0.10 },
  { a:"saltmere", b:"thalport", distance:2, danger:0.05 },
  { a:"thalport", b:"ashwick", distance:3, danger:0.15 },
  { a:"ashwick", b:"stonekeep", distance:2, danger:0.10 },
  { a:"ashwick", b:"duskhollow", distance:3, danger:0.25 },
  { a:"stonekeep", b:"duskhollow", distance:2, danger:0.30 },
];

export const DEFAULT_TOWNS = [
  { id:"ironhaven", name:"Ironhaven", x:65, y:12, population:800, gold:500, description:"A rugged mining settlement in the Iron Mountains",
    facilities:[{facilityId:"mine",count:3},{facilityId:"smelter",count:2},{facilityId:"blacksmith",count:1},{facilityId:"barracks",count:1},{facilityId:"bakery",count:1}],
    inventory:{ wheat:5, iron_ore:20, coal:15, iron_bars:8, bread:4, weapons:3 } },
  { id:"millford", name:"Millford", x:22, y:42, population:1200, gold:600, description:"A prosperous farming community in the Golden Valley",
    facilities:[{facilityId:"farm",count:4},{facilityId:"mill",count:2},{facilityId:"bakery",count:2},{facilityId:"brewery",count:1},{facilityId:"market",count:1}],
    inventory:{ wheat:30, flour:15, bread:20, ale:8 } },
  { id:"thalport", name:"Thalport", x:5, y:75, population:950, gold:800, description:"A busy coastal port city on the Amber Sea",
    facilities:[{facilityId:"fishery",count:3},{facilityId:"salt_works",count:1},{facilityId:"salting_house",count:2},{facilityId:"ropery",count:1},{facilityId:"market",count:2}],
    inventory:{ fish:25, salt:10, salted_fish:15, rope:6, hemp:4 } },
  { id:"stonekeep", name:"Stonekeep", x:68, y:58, population:2000, gold:1500, description:"A fortified city and regional capital of the Eastern Marches",
    facilities:[{facilityId:"quarry",count:2},{facilityId:"barracks",count:2},{facilityId:"market",count:2},{facilityId:"bakery",count:2},{facilityId:"temple",count:1},{facilityId:"armorsmith",count:1}],
    inventory:{ stone:30, bread:10, weapons:5, armor:2, potions:3 } },
  { id:"verdania", name:"Verdania", x:28, y:14, population:600, gold:350, description:"A quiet woodland village of foresters and herbalists",
    facilities:[{facilityId:"lumber_mill",count:2},{facilityId:"sawmill",count:1},{facilityId:"herb_garden",count:2},{facilityId:"carpenter",count:1},{facilityId:"hunters_post",count:1}],
    inventory:{ wood:20, lumber:10, herbs:12, furniture:4, hides:8 } },
  { id:"ashwick", name:"Ashwick", x:44, y:44, population:1500, gold:2000, description:"A central trading hub at the Great Crossroads",
    facilities:[{facilityId:"market",count:3},{facilityId:"bakery",count:1},{facilityId:"brewery",count:1},{facilityId:"wagon_maker",count:1},{facilityId:"tannery",count:1}],
    inventory:{ bread:8, ale:10, wagons:2, leather:6, hides:5, lumber:4 } },
  { id:"duskhollow", name:"Duskhollow", x:83, y:28, population:400, gold:400, description:"A mysterious village in the Whispering Woods",
    facilities:[{facilityId:"herb_garden",count:3},{facilityId:"alchemist",count:2},{facilityId:"temple",count:2}],
    inventory:{ herbs:20, potions:8 } },
  { id:"saltmere", name:"Saltmere", x:6, y:52, population:700, gold:450, description:"A salt-harvesting town on the brackish shore",
    facilities:[{facilityId:"salt_works",count:3},{facilityId:"fishery",count:2},{facilityId:"hemp_field",count:1}],
    inventory:{ salt:30, fish:15, hemp:8 } },
];

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export const FOOD_GOODS = ["bread", "salted_fish", "fish", "ale", "wheat"];
