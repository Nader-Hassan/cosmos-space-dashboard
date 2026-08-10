// ========================================== CONSTANTS & CONFIG ==========================================
const API_KEY = "RxdXMRwCwdwuFZcNDC9uC4JHkS2rEX5jfcg10O5e";
const APOD_BASE_URL = "https://api.nasa.gov/planetary/apod";
const PLANETS_URL =
  "https://solar-system-opendata-proxy.vercel.app/api/planets";
const LAUNCHES_URL =
  "https://lldev.thespacedevs.com/2.3.0/launches/upcoming/?limit=10";

// ========================================== DOM REFERENCES ==========================================
// Navigation
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".app-section");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");

// APOD Section
const apodImage = document.getElementById("apod-image");
const apodImageContainer = document.getElementById("apod-image-container");
const apodLoading = document.getElementById("apod-loading");
const apodTitle = document.getElementById("apod-title");
const apodExplanation = document.getElementById("apod-explanation");
const apodCopyright = document.getElementById("apod-copyright");
const apodDate = document.getElementById("apod-date");
const apodDateDetail = document.getElementById("apod-date-detail");
const apodDateInfo = document.getElementById("apod-date-info");
const apodMediaType = document.getElementById("apod-media-type");
const apodDateInput = document.getElementById("apod-date-input");
const loadDateBtn = document.getElementById("load-date-btn");
const todayApodBtn = document.getElementById("today-apod-btn");
const dateDisplaySpan = document.querySelector(".date-input-wrapper .text-sm");
const viewFullResBtn = document.querySelector("#apod-image-container button");
// APOD State
let currentApodHdUrl = "";
// PLANETS State
let planetsData = [];
let currentPlanetId = "earth";
// ========================================== LAUNCHES - DOM REFERENCES ==========================================
const featuredLaunch = document.getElementById("featured-launch");
const launchesGrid = document.getElementById("launches-grid");
const launchesCount = document.getElementById("launches-count");
const launchesCountMobile = document.getElementById("launches-count-mobile");
// ========================================== PLANETS - DOM REFERENCES ==========================================
const planetsGrid = document.getElementById("planets-grid");
const planetDetailImage = document.getElementById("planet-detail-image");
const planetDetailName = document.getElementById("planet-detail-name");
const planetDetailDescription = document.getElementById(
  "planet-detail-description",
);
const planetDistance = document.getElementById("planet-distance");
const planetRadius = document.getElementById("planet-radius");
const planetMass = document.getElementById("planet-mass");
const planetDensity = document.getElementById("planet-density");
const planetOrbitalPeriod = document.getElementById("planet-orbital-period");
const planetRotation = document.getElementById("planet-rotation");
const planetMoons = document.getElementById("planet-moons");
const planetGravity = document.getElementById("planet-gravity");
const planetDiscoverer = document.getElementById("planet-discoverer");
const planetDiscoveryDate = document.getElementById("planet-discovery-date");
const planetBodyType = document.getElementById("planet-body-type");
const planetVolume = document.getElementById("planet-volume");
const planetFacts = document.getElementById("planet-facts");
const planetPerihelion = document.getElementById("planet-perihelion");
const planetAphelion = document.getElementById("planet-aphelion");
const planetEccentricity = document.getElementById("planet-eccentricity");
const planetInclination = document.getElementById("planet-inclination");
const planetAxialTilt = document.getElementById("planet-axial-tilt");
const planetTemp = document.getElementById("planet-temp");
const planetEscape = document.getElementById("planet-escape");
const planetComparisonTbody = document.getElementById(
  "planet-comparison-tbody",
);
// ========================================== UTILITY FUNCTIONS ==========================================
function formatDate(dateStr) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateStr).toLocaleDateString("en-US", options);
}
function formatLaunchDate(isoDate, style = "short") {
  const date = new Date(isoDate);
  const options = { month: "short", day: "numeric", year: "numeric" };
  if (style === "full") {
    options.weekday = "long";
    options.month = "long";
  }
  return date.toLocaleDateString("en-US", options);
}
function formatLaunchTime(isoDate) {
  const date = new Date(isoDate);
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm} UTC`;
}
function getDaysUntilLaunch(isoDate) {
  const launchDate = new Date(isoDate);
  const now = new Date();
  const diffTime = launchDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}
function getStatusColorClass(status) {
  switch (status) {
    case "Go":
      return { bg: "bg-green-500/20", text: "text-green-400" };
    case "TBC":
      return { bg: "bg-yellow-500/20", text: "text-yellow-400" };
    case "TBD":
      return { bg: "bg-blue-500/20", text: "text-blue-400" };
    case "Hold":
      return { bg: "bg-red-500/20", text: "text-red-400" };
    default:
      return { bg: "bg-slate-500/20", text: "text-slate-400" };
  }
}
function truncateText(text, maxLength = 150) {
  if (!text) return "No description available.";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}
// ========================================== PLANETS - CONFIG & HELPERS ==========================================
const PLANET_ORDER = [
  "uranus",
  "neptune",
  "jupiter",
  "mars",
  "mercury",
  "saturn",
  "earth",
  "venus",
];
const PLANET_COLORS = {
  mercury: "#6b7280",
  venus: "#fb923c",
  earth: "#3b82f6",
  mars: "#ef4444",
  jupiter: "#fdba74",
  saturn: "#fde047",
  uranus: "#22d3ee",
  neptune: "#2563eb",
};

function formatLargeDistance(km) {
  if (km >= 1_000_000) return `${(km / 1_000_000).toFixed(1)}M km`;
  return `${km.toLocaleString()} km`;
}

function formatMass(massValue, massExponent) {
  return `${massValue.toFixed(2)} × 10^${massExponent} kg`;
}

function formatVolume(volValue, volExponent) {
  return `${volValue.toFixed(2)} × 10^${volExponent} km³`;
}

function formatTemp(kelvin) {
  return `${Math.round(kelvin - 273.15)}°C`;
}

function formatRotationPeriod(hours) {
  const isRetrograde = hours < 0;
  const absHours = Math.abs(hours);
  if (absHours >= 24) {
    return `${(absHours / 24).toFixed(1)} days${isRetrograde ? " (retrograde)" : ""}`;
  }
  return `${absHours.toFixed(2)} hours${isRetrograde ? " (retrograde)" : ""}`;
}

function formatComparisonOrbitalPeriod(days) {
  if (days >= 365) return `${(days / 365.25).toFixed(1)} years`;
  return `${Math.round(days)} days`;
}

function getPlanetBadgeStyle(type) {
  const map = {
    "Ice Giant": { bg: "#3b82f680", text: "#60a5fa" },
    "Gas Giant": { bg: "#a855f780", text: "#c084fc" },
    "Terrestrial": { bg: "#f9731680", text: "#fb923c" },
  };
  return map[type] || { bg: "#64748b80", text: "#94a3b8" };
}
// ========================================== NAVIGATION ==========================================
function showSection(sectionName) {
  sections.forEach((section) => {
    if (section.dataset.section === sectionName) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  });
}

function updateNavState(activeSection) {
  navLinks.forEach((link) => {
    if (link.dataset.section === activeSection) {
      link.classList.remove("text-slate-300", "hover:bg-slate-800");
      link.classList.add("bg-blue-500/10", "text-blue-400");
    } else {
      link.classList.remove("bg-blue-500/10", "text-blue-400");
      link.classList.add("text-slate-300", "hover:bg-slate-800");
    }
  });
}

function closeSidebar() {
  sidebar.classList.add("sidebar-mobile");
}

function toggleSidebar() {
  const isHidden = sidebar.classList.contains("sidebar-mobile");
  if (isHidden) {
    sidebar.classList.remove("sidebar-mobile");
  } else {
    closeSidebar();
  }
}

// ========================================== APOD - LOADING & ERROR STATES ==========================================
function showApodLoading() {
  const errorEl = document.getElementById("apod-image-error");
  if (errorEl) errorEl.classList.add("hidden");

  apodLoading.classList.remove("hidden");
  apodImage.classList.add("hidden");
}

function hideApodLoading() {
  apodLoading.classList.add("hidden");
  apodImage.classList.remove("hidden");
}

function showApodImageError(message = "Failed to load image") {
  apodLoading.classList.add("hidden");
  apodImage.classList.add("hidden");

  let errorEl = document.getElementById("apod-image-error");

  if (!errorEl) {
    errorEl = document.createElement("div");
    errorEl.id = "apod-image-error";
    errorEl.className = "flex flex-col items-center justify-center text-center";
    errorEl.innerHTML = `
      <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
      <p class="text-red-400 font-semibold mb-2">${message}</p>
      <p class="text-slate-400 text-sm">Please try again later</p>
    `;
    apodImageContainer.appendChild(errorEl);
  } else {
    errorEl.classList.remove("hidden");
  }
}

function hideApodImageError() {
  const errorEl = document.getElementById("apod-image-error");
  if (errorEl) errorEl.classList.add("hidden");
}

function resetApodToLoading() {
  apodTitle.textContent = "Loading title...";
  apodExplanation.textContent = "Loading description...";
  apodDate.textContent = "Astronomy Picture of the Day - Loading...";

  const icon = apodDateDetail.querySelector("i");
  apodDateDetail.innerHTML = "";
  if (icon) apodDateDetail.appendChild(icon);
  apodDateDetail.append(" Loading...");

  apodDateInfo.textContent = "Loading...";
  apodMediaType.textContent = "Loading...";
  apodCopyright.classList.add("hidden");
}

// ========================================== APOD - DATA FETCHING ==========================================
async function fetchApod(date) {
  const url = `${APOD_BASE_URL}?api_key=${API_KEY}&date=${date}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return await response.json();
}
// ========================================== LAUNCHES - FETCH ==========================================
async function fetchLaunches() {
  const response = await fetch(LAUNCHES_URL);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}
// ========================================== APOD - RENDERING ==========================================
function renderApod(data) {
  currentApodHdUrl = data.hdurl || data.url;

  hideApodImageError();
  apodImage.classList.remove("hidden");
  apodImage.src = data.url;
  apodImage.alt = data.title;

  apodTitle.textContent = data.title;
  apodExplanation.textContent = data.explanation;

  if (data.copyright) {
    apodCopyright.textContent = `© ${data.copyright}`;
    apodCopyright.classList.remove("hidden");
  } else {
    apodCopyright.classList.add("hidden");
  }

  const formattedDate = formatDate(data.date);
  apodDate.textContent = `Astronomy Picture of the Day - ${formattedDate}`;

  const icon = apodDateDetail.querySelector("i");
  apodDateDetail.innerHTML = "";
  if (icon) apodDateDetail.appendChild(icon);
  apodDateDetail.append(" " + data.date);

  apodDateInfo.textContent = data.date;
  apodMediaType.textContent = data.media_type === "image" ? "Image" : "Video";
}

// ========================================== APOD - MAIN CONTROLLER ==========================================
async function loadApod(date) {
  try {
    resetApodToLoading();
    showApodLoading();
    const data = await fetchApod(date);
    renderApod(data);
    hideApodLoading();
  } catch (error) {
    console.error("Failed to load APOD:", error);
    apodTitle.textContent = "Error loading title..";
    apodExplanation.textContent =
      "Couldn't load the Astronomy Description of the Day. Please try again later.";
    apodDate.textContent = "Astronomy Picture of the Day";
    const icon = apodDateDetail.querySelector("i");
    apodDateDetail.innerHTML = "";
    if (icon) apodDateDetail.appendChild(icon);
    apodDateDetail.append(" Unavailable");
    apodDateInfo.textContent = "—";
    apodMediaType.textContent = "—";
    apodCopyright.classList.add("hidden");
    showApodImageError("Failed to load today's image");
  }
}

function updateDateDisplay(dateStr) {
  if (dateDisplaySpan) {
    dateDisplaySpan.textContent = formatDate(dateStr);
  }
}
// ========================================== LAUNCHES - RENDER FEATURED LAUNCH ==========================================
function renderFeaturedLaunch(launch) {
  const statusColors = getStatusColorClass(launch.status.abbrev);
  const daysLeft = getDaysUntilLaunch(launch.net);
  const dateStr = formatLaunchDate(launch.net, "full");
  const timeStr = formatLaunchTime(launch.net);
  const description = truncateText(launch.mission?.description);
  const imageUrl = launch.image?.image_url || "";
  const company = launch.launch_service_provider?.name || "Unknown";
  const rocket = launch.rocket?.configuration?.name || "Unknown";
  const pad = launch.pad?.location?.name || "Unknown";
  const country = launch.pad?.country?.name || "Unknown";

  featuredLaunch.innerHTML = `
    <div class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
      <div class="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2">
                <i class="fas fa-star"></i>
                Featured Launch
              </span>
              <span class="px-4 py-1.5 ${statusColors.bg} ${statusColors.text} rounded-full text-sm font-semibold">
                ${launch.status.abbrev}
              </span>
            </div>
            <h3 class="text-3xl font-bold mb-3 leading-tight">${launch.name}</h3>
            <div class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400">
              <div class="flex items-center gap-2">
                <i class="fas fa-building"></i>
                <span>${company}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-rocket"></i>
                <span>${rocket}</span>
              </div>
            </div>
            ${
              daysLeft > 0
                ? `
            <div class="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-xl mb-6">
            <i class="fas fa-clock text-2xl text-blue-400"></i>
            <div>
            <p class="text-2xl font-bold text-blue-400">${daysLeft}</p>
            <p class="text-xs text-slate-400">Days Until Launch</p>
            </div>
            </div>`
                : ""
            }
            <div class="grid xl:grid-cols-2 gap-4 mb-6">
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-calendar"></i>
                  Launch Date
                </p>
                <p class="font-semibold">${dateStr}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-clock"></i>
                  Launch Time
                </p>
                <p class="font-semibold">${timeStr}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-map-marker-alt"></i>
                  Location
                </p>
                <p class="font-semibold text-sm">${pad}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-globe"></i>
                  Country
                </p>
                <p class="font-semibold">${country}</p>
              </div>
            </div>
            <p class="text-slate-300 leading-relaxed mb-6">${description}</p>
          </div>
          <div class="flex flex-col md:flex-row gap-3">
            <button class="flex-1 self-start md:self-center px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2">
              <i class="fas fa-info-circle"></i>
              View Full Details
            </button>
            <div class="icons self-end md:self-center">
              <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
                <i class="far fa-heart"></i>
              </button>
              <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
                <i class="fas fa-bell"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="relative">
          <div class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50">
            <img src="${imageUrl}" onerror="this.src='./assets/images/launch-placeholder.png'" alt="${launch.name}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}
// ========================================== LAUNCHES - RENDER GRID CARDS ==========================================
function renderGridCards(launches) {
  launchesGrid.innerHTML = "";
  const gridLaunches = launches.slice(1);

  gridLaunches.forEach((launch) => {
    const statusColors = getStatusColorClass(launch.status.abbrev);
    const dateStr = formatLaunchDate(launch.net);
    const timeStr = formatLaunchTime(launch.net);
    const company = launch.launch_service_provider?.name || "Unknown";
    const rocket = launch.rocket?.configuration?.name || "Unknown";
    const pad = launch.pad?.location?.name || "Unknown";
    const imageUrl = launch.image?.image_url || "";
    const status = launch.status.abbrev;

    const card = document.createElement("div");
    card.className =
      "bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer";

    card.innerHTML = `
      <div class="relative h-48 bg-slate-900/50 overflow-hidden">
       <img src="${imageUrl}" onerror="this.src='./assets/images/launch-placeholder.png'" alt="${launch.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div class="absolute top-3 right-3">
          <span class="px-3 py-1 ${statusColors.bg} ${statusColors.text} backdrop-blur-sm rounded-full text-xs font-semibold">
            ${status}
          </span>
        </div>
      </div>
      <div class="p-5">
        <div class="mb-3">
          <h4 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
            ${launch.name}
          </h4>
          <p class="text-sm text-slate-400 flex items-center gap-2">
            <i class="fas fa-building text-xs"></i>
            ${company}
          </p>
        </div>
        <div class="space-y-2 mb-4">
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-calendar text-slate-500 w-4"></i>
            <span class="text-slate-300">${dateStr}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-clock text-slate-500 w-4"></i>
            <span class="text-slate-300">${timeStr}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-rocket text-slate-500 w-4"></i>
            <span class="text-slate-300">${rocket}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="fas fa-map-marker-alt text-slate-500 w-4"></i>
            <span class="text-slate-300 line-clamp-1">${pad}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 pt-4 border-t border-slate-700">
          <button class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold">
            Details
          </button>
          <button class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            <i class="far fa-heart"></i>
          </button>
        </div>
      </div>
    `;

    launchesGrid.appendChild(card);
  });
}
// ========================================== LAUNCHES - LOADING & ERROR ==========================================
function showLaunchesLoading() {
  featuredLaunch.innerHTML = `
    <div class="flex flex-col items-center justify-center py-20 text-center">
      <i class="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
      <p class="text-slate-400">Loading upcoming launches...</p>
    </div>
  `;
  launchesGrid.innerHTML = "";
}

function showLaunchesError(message) {
  featuredLaunch.innerHTML = `
    <div class="flex flex-col items-center justify-center py-20 text-center">
      <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
      <p class="text-red-400 font-semibold mb-2">Failed to load launches</p>
      <p class="text-slate-400 text-sm">${message}</p>
    </div>
  `;
  launchesGrid.innerHTML = "";
}
function updateLaunchesCount(count) {
  if (launchesCount) {
    launchesCount.textContent = `${count} Launches`;
  }
  if (launchesCountMobile) {
    launchesCountMobile.textContent = count;
  }
}
// ========================================== LAUNCHES - MAIN CONTROLLER ==========================================
async function loadLaunches() {
  try {
    showLaunchesLoading();
    const launches = await fetchLaunches();

    if (launches.length === 0) {
      showLaunchesError("No upcoming launches found.");
      return;
    }

    renderFeaturedLaunch(launches[0]);
    renderGridCards(launches);
    updateLaunchesCount(launches.length);
  } catch (error) {
    console.error("Failed to load launches:", error);
    showLaunchesError("Could not load launch data. Please try again later.");
  }
}
// ========================================== PLANETS - FETCH ==========================================
async function fetchPlanets() {
  const response = await fetch(PLANETS_URL);
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  const data = await response.json();
  return data.bodies;
}

// ========================================== PLANETS - LOADING & ERROR ==========================================
function showPlanetsLoading() {
  if (!planetsGrid) return;
  planetsGrid.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <i class="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
      <p class="text-slate-400">Loading solar system data...</p>
    </div>
  `;
}

function showPlanetsError(message) {
  if (!planetsGrid) return;
  planetsGrid.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
      <p class="text-red-400 font-semibold mb-2">Failed to load planets</p>
      <p class="text-slate-400 text-sm">${message}</p>
    </div>
  `;
}

// ========================================== PLANETS - RENDER CARDS ==========================================
function renderPlanetCards(planets) {
  if (!planetsGrid) return;
  planetsGrid.innerHTML = "";

  planets.forEach((planet) => {
    const id = planet.englishName.toLowerCase();
    const color = PLANET_COLORS[id] || "#3b82f6";
    const distanceAU = (planet.semimajorAxis / 149597870.7).toFixed(2);
    const isActive = id === currentPlanetId;

    const card = document.createElement("div");
    card.className =
      "planet-card bg-slate-800/50 border border-slate-700 rounded-2xl p-4 transition-all cursor-pointer group";
    card.dataset.planetId = id;
    card.style.setProperty("--planet-color", color);
    if (isActive) {
      card.classList.add("ring-2", "ring-blue-500");
      card.style.borderColor = color + "80";
    }

    card.innerHTML = `
      <div class="relative mb-3 h-24 flex items-center justify-center">
        <img class="w-20 h-20 object-contain group-hover:scale-110 transition-transform"
          src="${planet.image}" alt="${planet.englishName}"
          onerror="this.src='./assets/images/launch-placeholder.png'" />
      </div>
      <h4 class="font-semibold text-center text-sm">${planet.englishName}</h4>
      <p class="text-xs text-slate-400 text-center">${distanceAU} AU</p>
    `;

    card.addEventListener("mouseenter", () => {
      if (id !== currentPlanetId) card.style.borderColor = color + "80";
    });
    card.addEventListener("mouseleave", () => {
      if (id !== currentPlanetId) card.style.borderColor = "#334155";
    });
    card.addEventListener("click", () => selectPlanet(id));

    planetsGrid.appendChild(card);
  });
}

// ========================================== PLANETS - RENDER DETAIL PANEL ==========================================
function renderPlanetDetail(planet) {
  if (!planet) return;
  const id = planet.englishName.toLowerCase();
  currentPlanetId = id;

  // Update active card visual state
  document.querySelectorAll(".planet-card").forEach((card) => {
    const cardId = card.dataset.planetId;
    const color = PLANET_COLORS[cardId] || "#3b82f6";
    if (cardId === id) {
      card.classList.add("ring-2", "ring-blue-500");
      card.style.borderColor = color + "80";
    } else {
      card.classList.remove("ring-2", "ring-blue-500");
      card.style.borderColor = "#334155";
    }
  });

  if (planetDetailImage) {
    planetDetailImage.src = planet.image;
    planetDetailImage.alt = planet.englishName;
  }
  if (planetDetailName) planetDetailName.textContent = planet.englishName;
  if (planetDetailDescription)
    planetDetailDescription.textContent =
      planet.description || "No description available.";
  if (planetDistance)
    planetDistance.textContent = formatLargeDistance(planet.semimajorAxis);
  if (planetRadius)
    planetRadius.textContent = `${Math.round(planet.meanRadius)} km`;
  if (planetMass)
    planetMass.textContent = `${planet.mass.massValue} × 10^${planet.mass.massExponent} kg`;
  if (planetDensity)
    planetDensity.textContent = `${planet.density.toFixed(2)} g/cm³`;
  if (planetOrbitalPeriod)
    planetOrbitalPeriod.textContent = `${planet.sideralOrbit.toFixed(2)} days`;
  if (planetRotation)
    planetRotation.textContent = formatRotationPeriod(planet.sideralRotation);
  if (planetMoons)
    planetMoons.textContent = planet.moons ? planet.moons.length : 0;
  if (planetGravity)
    planetGravity.textContent = `${planet.gravity.toFixed(2)} m/s²`;
  if (planetDiscoverer)
    planetDiscoverer.textContent =
      planet.discoveredBy || "Known since antiquity";
  if (planetDiscoveryDate)
    planetDiscoveryDate.textContent = planet.discoveryDate || "Ancient times";
  if (planetBodyType) planetBodyType.textContent = planet.bodyType || "Planet";
  if (planetVolume)
    planetVolume.textContent = planet.vol
      ? `${planet.vol.volValue} × 10^${planet.vol.volExponent} km³`
      : "N/A";
  if (planetPerihelion)
    planetPerihelion.textContent = formatLargeDistance(planet.perihelion);
  if (planetAphelion)
    planetAphelion.textContent = formatLargeDistance(planet.aphelion);
  if (planetEccentricity)
    planetEccentricity.textContent = planet.eccentricity.toFixed(5);
  if (planetInclination)
    planetInclination.textContent =
      planet.inclination === 0 ? "N/A" : `${planet.inclination.toFixed(2)}°`;
  if (planetAxialTilt)
    planetAxialTilt.textContent = `${planet.axialTilt.toFixed(2)}°`;
  if (planetTemp) planetTemp.textContent = `${planet.avgTemp}°C`;
  if (planetEscape)
    planetEscape.textContent = `${(planet.escape / 1000).toFixed(2)} km/s`;

  renderPlanetFacts(planet);
}

// ========================================== PLANETS - RENDER QUICK FACTS ==========================================
function renderPlanetFacts(planet) {
  if (!planetFacts) return;
  const facts = [
    `Mass: ${planet.mass.massValue} × 10^${planet.mass.massExponent} kg`,
    `Surface gravity: ${planet.gravity} m/s²`,
    `Density: ${planet.density} g/cm³`,
    `Axial tilt: ${parseFloat(planet.axialTilt.toFixed(4))}°`,
  ];
  planetFacts.innerHTML = facts
    .map(
      (f) => `
    <li class="flex items-start">
      <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
      <span class="text-slate-300">${f}</span>
    </li>
  `,
    )
    .join("");
}

// ========================================== PLANETS - RENDER COMPARISON TABLE ==========================================
function renderComparisonTable(planets) {
  if (!planetComparisonTbody) return;

  const earth = planets.find((p) => p.englishName.toLowerCase() === "earth");
  const earthMass = earth
    ? earth.mass.massValue * Math.pow(10, earth.mass.massExponent)
    : 5.97237e24;

  planetComparisonTbody.innerHTML = "";

  planets.forEach((planet) => {
    const id = planet.englishName.toLowerCase();
    const color = PLANET_COLORS[id] || "#3b82f6";
    const distanceAU = (planet.semimajorAxis / 149597870.7).toFixed(2);
    const diameter = Math.round(planet.meanRadius * 2).toLocaleString();
    const relativeMass =
      (planet.mass.massValue * Math.pow(10, planet.mass.massExponent)) /
      earthMass;
    const massDisplay = relativeMass.toFixed(3);
    const orbitalPeriod = formatComparisonOrbitalPeriod(planet.sideralOrbit);
    const moonCount = planet.moons ? planet.moons.length : 0;
    const type = planet.type || "Unknown";
    const badgeStyle = getPlanetBadgeStyle(type);
    const isEarth = id === "earth";

    const row = document.createElement("tr");
    row.className = `hover:bg-slate-800/30 transition-colors ${isEarth ? "bg-blue-500/5" : ""}`;
    row.innerHTML = `
      <td class="px-4 md:px-6 py-3 md:py-4 sticky left-0 bg-slate-800 z-10">
        <div class="flex items-center space-x-2 md:space-x-3">
          <div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0" style="background-color: ${color}"></div>
          <span class="font-semibold text-sm md:text-base whitespace-nowrap">${planet.englishName}</span>
        </div>
      </td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${distanceAU}</td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${diameter}</td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${massDisplay}</td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${orbitalPeriod}</td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${moonCount}</td>
      <td class="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
        <span class="px-2 py-1 rounded text-xs" style="background-color: ${badgeStyle.bg}; color: ${badgeStyle.text};">${type}</span>
      </td>
    `;
    planetComparisonTbody.appendChild(row);
  });
}

// ========================================== PLANETS - SELECTION ==========================================
function selectPlanet(planetId) {
  const planet = planetsData.find(
    (p) => p.englishName.toLowerCase() === planetId,
  );
  if (planet) renderPlanetDetail(planet);
}

// ========================================== PLANETS - MAIN CONTROLLER ==========================================
async function loadPlanets() {
  try {
    showPlanetsLoading();
    const bodies = await fetchPlanets();

    const allPlanets = bodies.filter((b) => b.isPlanet);
    planetsData = PLANET_ORDER.map((id) =>
      allPlanets.find((p) => p.englishName.toLowerCase() === id),
    ).filter(Boolean);

    if (planetsData.length === 0) {
      showPlanetsError("No planet data found.");
      return;
    }

    renderPlanetCards(planetsData);
    renderPlanetDetail(
      planetsData.find((p) => p.englishName.toLowerCase() === "earth") ||
        planetsData[0],
    );
    renderComparisonTable(planetsData);
  } catch (error) {
    console.error("Failed to load planets:", error);
    showPlanetsError("Could not load planet data. Please try again later.");
  }
}
// ========================================== EVENT LISTENERS ==========================================

// --- Navigation ---
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetSection = link.dataset.section;
    showSection(targetSection);
    updateNavState(targetSection);

    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  });
});

if (sidebarToggle) {
  sidebarToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSidebar();
  });
}

document.addEventListener("click", (e) => {
  if (window.innerWidth >= 1024) return;

  const clickedInsideSidebar = sidebar.contains(e.target);
  if (!clickedInsideSidebar) {
    closeSidebar();
  }
});

// --- APOD: Date Picker ---
if (apodDateInput) {
  apodDateInput.addEventListener("input", () => {
    updateDateDisplay(apodDateInput.value);
  });
}

// --- APOD: Load Button ---
if (loadDateBtn && apodDateInput) {
  loadDateBtn.addEventListener("click", () => {
    const selectedDate = apodDateInput.value;
    if (selectedDate) {
      loadApod(selectedDate);
    }
  });
}

// --- APOD: Today Button ---
if (todayApodBtn) {
  todayApodBtn.addEventListener("click", () => {
    const today = new Date().toISOString().split("T")[0];
    apodDateInput.value = today;
    updateDateDisplay(today);
    loadApod(today);
  });
}

// --- APOD: Image Load Error ---
apodImage.addEventListener("error", () => {
  showApodImageError("Failed to load today's image");
});

// --- APOD: View Full Resolution ---
if (viewFullResBtn) {
  viewFullResBtn.addEventListener("click", () => {
    if (currentApodHdUrl) {
      window.open(currentApodHdUrl, "_blank");
    }
  });
}
// ========================================== INITIALIZATION ==========================================
document.addEventListener("DOMContentLoaded", () => {
  showSection("today-in-space");
  updateNavState("today-in-space");

  const today = new Date().toISOString().split("T")[0];

  if (apodDateInput) {
    apodDateInput.max = today;
    apodDateInput.value = today;
  }

  updateDateDisplay(today);
  loadApod(today);
  loadLaunches();
  loadPlanets();
});
