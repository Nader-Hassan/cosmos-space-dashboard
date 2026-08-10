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
// ========================================== LAUNCHES - DOM REFERENCES ==========================================
const featuredLaunch = document.getElementById("featured-launch");
const launchesGrid = document.getElementById("launches-grid");
const launchesCount = document.getElementById("launches-count");
const launchesCountMobile = document.getElementById("launches-count-mobile");
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
            </div>`: ""}
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
});
