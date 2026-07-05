// ============================================================
// CONFIG
// ============================================================
const CONFIG = {
  API_URL: "http://localhost:3000/api/leaderboard",
  USE_MOCK_DATA: false,
  REFRESH_INTERVAL_MS: 30000,
  VISAGE_BASE_URL: "https://visage.surgeplay.com",
  RENDER_SIZE: 160, 
  FALLBACK_UUID: "8667ba71-b85a-4004-af54-457a9734eed7"
};

// ============================================================
// MOCK DATA WITH CORRESPONDING UUIDs FOR COPYING
// ============================================================
const MOCK_PLAYERS = [
  { username: "Juszzz",   kills: 4821, uuid: "069a79f4-44e9-4726-a5be-fca90e38aaf5", online: true  },
  { username: "Dream",         kills: 4390, uuid: "ec1375dca603425396627f11898e1cd3", online: true  },
  { username: "TommyInnit",    kills: 3982, uuid: "84ee09b1-21b0-4fe7-8a85-f6b92ec84013", online: false },
  { username: "xQc",           kills: 3510, uuid: "9b3cbf72-8874-49cf-9cfc-9824de13a1a6", online: true  },
  { username: "Notch",         kills: 2977, uuid: "06aa73b7-3055-4f78-a119-92a953b3f2f7", online: false },
  { username: "Skeppy",        kills: 2648, uuid: "f61c3732-cf77-4df3-bc39-a8be31e3ef96", online: true  },
  { username: "BadBoyHalo",    kills: 2201, uuid: "69dd5d45-56fa-49d7-bf41-cb123e75e927", online: false },
  { username: "Fundy",         kills: 1893, uuid: "0d9beaa5-bca0-47cb-b461-9257e937fae3", online: false },
  { username: "Tubbo",         kills: 1654, uuid: "42037905-2ed7-479e-b1fa-f463287661e5", online: true  },
  { username: "Wilbur",        kills: 1320, uuid: "058da200-880c-4fa4-a477-ed0b9b3aa5ca", online: false },
  { username: "GeorgeNotFound",kills: 1102, uuid: "8c94622b-585a-464a-bfcc-e97c9c0f9976", online: false },
  { username: "Sapnap",        kills: 947,  uuid: "0ae19097-f579-42b7-a3a2-273578bb71c2", online: true  },
];

// DYNAMIC COMBAT TITLES SYSTEM
function getPlayerTitle(points) {
  if (points >= 60000) return { name: "GRANDMASTER", color: "text-red-500 font-900" };
  if (points >= 50000) return { name: "GLADIATOR", color: "text-orange-400 font-900" };
  if (points >= 30000) return { name: "WARLORD", color: "text-violet-glow font-700" };
  if (points >= 15000) return { name: "VETERAN", color: "text-blue-400 font-700" };
  return { name: "HUNTER", color: "text-muted font-500" };
}

let players = [];
let searchTerm = "";
let selectedRowData = { name: "", uuid: "" };

const bodyEl = document.getElementById("leaderboard-body");
const emptyStateEl = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const playerCountEl = document.getElementById("player-count");
const liveCountEl = document.getElementById("live-count");
const customMenu = document.getElementById("custom-cm");

// ============================================================
// DATA FETCH LOADING
// ============================================================
async function loadPlayers() {
  if (CONFIG.USE_MOCK_DATA) {
    return [...MOCK_PLAYERS].sort((a, b) => b.kills - a.kills);
  }
  try {
    const res = await fetch(CONFIG.API_URL);
    if (!res.ok) throw new Error(`API error`);
    const data = await res.json();
    return data.sort((a, b) => b.kills - a.kills);
  } catch (err) {
    liveCountEl.textContent = "offline";
    return [...MOCK_PLAYERS].sort((a, b) => b.kills - a.kills);
  }
}

function bodyRenderUrl(username) {
  return `${CONFIG.VISAGE_BASE_URL}/full/${CONFIG.RENDER_SIZE}/${encodeURIComponent(username)}`;
}

// ============================================================
// ROW ENGINE GENERATION
// ============================================================
function renderRow(player, rank, isMatch) {
  const points = player.kills * 15; 
  const title = getPlayerTitle(points);
  
  // DYNAMIC BACKGROUND & OUTLINE CLASSIFICATION ENGINE
  let frameBgClass = "avatar-frame-default";
  let wrapperOutlineClass = "wrap-default";
  
  if (rank === 1) {
    frameBgClass = "avatar-frame-top1";
    wrapperOutlineClass = "wrap-top1";
  } else if (rank === 2) {
    frameBgClass = "avatar-frame-top2";
    wrapperOutlineClass = "wrap-top2";
  } else if (rank === 3) {
    frameBgClass = "avatar-frame-top3";
    wrapperOutlineClass = "wrap-top3";
  }

  const row = document.createElement("div");
  row.className = `leaderboard-row grid grid-cols-[70px_1fr_100px_100px] sm:grid-cols-[90px_1fr_150px_130px_100px] items-center px-5 sm:px-7 py-2 row-enter ${isMatch ? "row-highlight" : ""}`;
  row.style.animationDelay = `${Math.min(rank * 25, 250)}ms`;

  row.innerHTML = `
    <span class="rank-badge ${rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : 'rank-default'}">
      #${rank}
    </span>

    <div class="flex items-center gap-4 min-w-0">
      <div class="avatar-frame-wrapper ${wrapperOutlineClass}">
        <div class="avatar-frame is-loading ${frameBgClass}">
          <img src="${bodyRenderUrl(player.username)}" alt="${player.username}" loading="lazy" onload="this.parentElement.classList.remove('is-loading')" onerror="this.src='${CONFIG.VISAGE_BASE_URL}/full/${CONFIG.RENDER_SIZE}/${CONFIG.FALLBACK_UUID}'" />
        </div>
      </div>
      
      <div class="flex flex-col gap-0.5 min-w-0">
        <span class="font-700 text-base text-slate-100 truncate tracking-wide">${player.username}</span>
        
        <div class="flex items-center gap-1.5">
          <img src="https://placehold.co/14x14/17152b/c0a5ff?text=★" alt="Icon" class="w-3.5 h-3.5 object-contain opacity-80" />
          <span class="text-[11px] tracking-widest font-900 uppercase ${title.color}">${title.name}</span>
        </div>
      </div>
    </div>

    <span class="font-mono font-700 text-sm text-violet-glow text-right sm:text-left">${points.toLocaleString()}</span>

    <div class="flex items-center justify-end sm:justify-start gap-2">
      <img src="https://placehold.co/16x16/17152b/c6f24e?text=⚔" alt="Kill Icon" class="w-4 h-4 object-contain" />
      <span class="font-mono font-900 text-[15px] text-lime">${player.kills.toLocaleString()}</span>
    </div>

    <span class="hidden sm:flex items-center gap-2.5 justify-end text-xs font-mono font-700 uppercase tracking-wider">
      <span class="status-dot ${player.online ? "status-online" : "status-offline"}"></span>
      <span class="${player.online ? "text-lime" : "text-muted"}">${player.online ? "Online" : "Offline"}</span>
    </span>
  `;

  // Custom Context Menu Right Click Interceptor
  row.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    selectedRowData.name = player.username;
    selectedRowData.uuid = player.uuid || "NO-UUID-STORED";
    
    customMenu.style.top = `${e.clientY}px`;
    customMenu.style.left = `${e.clientX}px`;
    customMenu.classList.remove("hidden");
  });

  return row;
}

// ============================================================
// IDENTITY DATA CLIPBOARD COPIER
// ============================================================
window.copyData = function(type) {
  const textToCopy = type === 'name' ? selectedRowData.name : selectedRowData.uuid;
  navigator.clipboard.writeText(textToCopy).then(() => {
    alert(`Copied ${type.toUpperCase()}: ${textToCopy}`);
  });
  customMenu.classList.add("hidden");
};

document.addEventListener("click", () => {
  customMenu.classList.add("hidden");
});

function render() {
  const term = searchTerm.trim().toLowerCase();
  const filtered = term ? players.filter(p => p.username.toLowerCase().includes(term)) : players;

  bodyEl.innerHTML = "";
  playerCountEl.textContent = players.length;

  if (filtered.length === 0) {
    emptyStateEl.classList.remove("hidden");
  } else {
    emptyStateEl.classList.add("hidden");
    filtered.forEach(player => {
      const rank = players.findIndex(p => p.username === player.username) + 1;
      const isExactMatch = term && player.username.toLowerCase() === term;
      bodyEl.appendChild(renderRow(player, rank, isExactMatch));
    });
  }
}

searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  render();
});

async function init() {
  players = await loadPlayers();
  liveCountEl.textContent = CONFIG.USE_MOCK_DATA ? "MOCK RUNNING" : "LIVE CONNECTED";
  render();
}

init();