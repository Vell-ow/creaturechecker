// script.js (replace your current file with this)

// DOM refs
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-button');

const creatureName = document.getElementById('creature-name');
const creatureId = document.getElementById('creature-id');
const weight = document.getElementById('weight');
const height = document.getElementById('height');
const types = document.getElementById('types');

const hp = document.getElementById('hp');
const attack = document.getElementById('attack');
const defense = document.getElementById('defense');
const specialAttack = document.getElementById('special-attack');
const specialDefense = document.getElementById('special-defense');
const speed = document.getElementById('speed');

const spriteContainer = document.getElementById('sprite-container');

// Correct API host the tests expect
const API_BASE = 'https://rpg-creature-api.freecodecamp.rocks/api/creature';

// Helpers
const isIntegerId = (s) => /^[0-9]+$/.test(String(s).trim());

// Clear UI between searches (tests require types and sprite cleared)
function clearUI() {
  creatureName.textContent = '';
  creatureId.textContent = '';
  weight.textContent = '';
  height.textContent = '';
  hp.textContent = '';
  attack.textContent = '';
  defense.textContent = '';
  specialAttack.textContent = '';
  specialDefense.textContent = '';
  speed.textContent = '';
  types.innerHTML = '';
  spriteContainer.innerHTML = '';
}

// Robust type-name extractor supporting multiple shapes:
// - "fire"
// - { name: "fire" }
// - { type: { name: "fire" } }
// - { slot: 1, type: { name: "fire" } } (common pattern)
function extractTypeName(typeEntry) {
  if (!typeEntry) return '';
  // plain string
  if (typeof typeEntry === 'string') return typeEntry;
  // common nested pattern: { type: { name: 'fire' } }
  if (typeEntry.type && typeof typeEntry.type.name === 'string') {
    return typeEntry.type.name;
  }
  // flat object { name: 'fire' }
  if (typeof typeEntry.name === 'string') {
    return typeEntry.name;
  }
  // fallback: try to stringify gracefully
  try {
    const maybe = (typeEntry.type && typeEntry.type.name) || typeEntry.name;
    if (typeof maybe === 'string') return maybe;
  } catch (e) {}
  return '';
}

// Stats extractor for the stats array shape: [{name:'hp', base_stat:65}, ...]
function getStatValue(statsArray, name) {
  if (!Array.isArray(statsArray)) return '';
  const found = statsArray.find(s => s && (s.name === name || s.stat === name));
  return found ? (found.base_stat ?? found.value ?? '') : '';
}

// Fill UI with creature object returned by API
function fillUI(creature) {
  // Basic fields
  creatureName.textContent = (creature.name ?? '').toUpperCase();
  creatureId.textContent = `#${creature.id}`;
  weight.textContent = `Weight: ${creature.weight}`;
  height.textContent = `Height: ${creature.height}`;

  // Stats array handling
  const statsArray = Array.isArray(creature.stats) ? creature.stats : [];
  hp.textContent = getStatValue(statsArray, 'hp');
  attack.textContent = getStatValue(statsArray, 'attack');
  defense.textContent = getStatValue(statsArray, 'defense');
  specialAttack.textContent = getStatValue(statsArray, 'special-attack');
  specialDefense.textContent = getStatValue(statsArray, 'special-defense');
  speed.textContent = getStatValue(statsArray, 'speed');

  // Image (sprite)
  if (creature.image) {
    const img = document.createElement('img');
    img.src = creature.image;
    img.alt = creature.name || 'creature';
    img.id = 'sprite';
    spriteContainer.appendChild(img);
  }

  // Types — clear and then append exactly one element per type in order
  types.innerHTML = '';
  const rawTypes = Array.isArray(creature.types) ? creature.types : [];
  const typeNames = rawTypes.map(extractTypeName).filter(Boolean);
  // append spans exactly as expected by tests
  typeNames.forEach(tn => {
    const span = document.createElement('span');
    span.className = 'type-box';
    span.textContent = String(tn).toUpperCase();
    types.appendChild(span);
  });
}

// Main fetch + UI flow
async function getCreature() {
  const raw = (searchInput.value || '').trim();
  if (!raw) return;

  // Clear UI first (ensures types are cleared between searches even before fetch)
  clearUI();

  // Build query: numeric IDs left as-is; names -> lowercase
  const query = isIntegerId(raw) ? raw : raw.toLowerCase();
  const url = `${API_BASE}/${encodeURIComponent(query)}`;

  // Helpful console log for preview debugging
  console.log('Fetching creature from:', url);

  try {
    const res = await fetch(url);

    if (!res.ok) {
      alert('Creature not found');
      return;
    }

    const creature = await res.json();

    if (!creature || typeof creature !== 'object') {
      alert('Creature not found');
      return;
    }

    // Fill UI (this will append types spans correctly)
    fillUI(creature);

  } catch (err) {
    console.error('Fetch/network error:', err);
    alert('Creature not found');
  }
}

// Event listeners
searchBtn.addEventListener('click', getCreature);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') getCreature();
});
