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

// ========================================== UTILITY FUNCTIONS ==========================================

function formatDate(dateStr) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateStr).toLocaleDateString("en-US", options);
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
});
