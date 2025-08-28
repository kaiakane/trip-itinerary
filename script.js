const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSt2MSaQY53H0kBw0MRlgJVFE8FG-A0tMBmccKoGPBqvllIA_Mn4B45QQWYu5uZu2_-CZbfifKyOQjl/pub?output=csv";

// Improved CSV parser (handles quoted commas)
function parseCSV(csvText) {
  const rows = csvText.trim().split("\n");
  const headers = rows.shift().split(",");
  return rows.map(row => {
    const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i]?.replace(/^"|"$/g, '') || '';
      return obj;
    }, {});
  });
}

// Get query param
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Populate homepage
async function populateDays() {
  const res = await fetch(csvUrl);
  const text = await res.text();
  const data = parseCSV(text);

  const daysContainer = document.getElementById("days-container");

  // Unique Day + Date combinations
  const uniqueDays = Array.from(
    new Map(data.map(d => [`${d.Day}|${d.Date}`, d])).values()
  );

  uniqueDays.forEach(dayData => {
    const card = document.createElement("div");
    card.className = "card day-card";
    card.innerText = `${dayData.Day} - ${dayData.Date}`;
    card.onclick = () => window.location = `day.html?day=${encodeURIComponent(dayData.Day)}&date=${encodeURIComponent(dayData.Date)}`;
    daysContainer.appendChild(card);
  });
}

// Populate activities for a specific day
async function populateActivities() {
  const res = await fetch(csvUrl);
  const text = await res.text();
  const data = parseCSV(text);

  const day = getQueryParam("day");
  const date = getQueryParam("date");

  const activities = data.filter(d => d.Day === day && d.Date === date);

  document.getElementById("day-title").innerText = `${day} - ${date} Itinerary`;

  const container = document.getElementById("activities-container");

  activities.forEach(act => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";
    const categoryIcon = getCategoryIcon(act.Category);
    header.innerHTML = `<span>${categoryIcon} ${act.Activity || "—"}</span><span>${act.Time || "—"}</span>`;
    card.appendChild(header);

    const content = document.createElement("div");
    content.className = "card-content";
    content.innerHTML = `
      <p><strong>Category:</strong> ${act.Category || "—"}</p>
      <p><strong>Neighborhood:</strong> ${act.Neighborhood || "—"}</p>
      <p><strong>Address:</strong> ${act.Address || "—"}</p>
      <p><strong>Website:</strong> ${act.Website ? `<a href="${act.Website}" target="_blank">${act.Website}</a>` : "—"}</p>
      <p><strong>Cost:</strong> ${act.Cost || "—"}</p>
      <p><strong>Ticket:</strong> ${act.Ticket || "—"}</p>
      <p><strong>Hours:</strong> ${act.Hours || "—"}</p>
      <p><strong>Notes:</strong> ${act.Notes || "—"}</p>
    `;
    card.appendChild(content);

    card.onclick = () => card.classList.toggle("expanded");
    container.appendChild(card);
  });
}

// Simple category-to-icon mapping
function getCategoryIcon(category) {
  switch (category.toLowerCase()) {
    case "food": return "🍴";
    case "museum": return "🏛️";
    case "shopping": return "🛍️";
    case "tour": return "🎡";
    case "opera": return "🎭";
    default: return "📍";
  }
}

// Determine which page
if (document.getElementById("days-container")) {
  populateDays();
} else if (document.getElementById("activities-container")) {
  populateActivities();
}
