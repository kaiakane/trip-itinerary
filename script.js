const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSt2MSaQY53H0kBw0MRlgJVFE8FG-A0tMBmccKoGPBqvllIA_Mn4B45QQWYu5uZu2_-CZbfifKyOQjl/pub?output=csv";

// CSV parser that aligns with headers, even if cells are missing
function parseCSV(csvText) {
  const lines = csvText.split("\n").filter(line => line.trim() !== "");
  const headers = lines
    .shift()
    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    .map(h => h.replace(/^"|"$/g, ''));

  return lines.map(line => {
    let values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    values = values.map(v => v.replace(/^"|"$/g, '').trim());

    while (values.length < headers.length) values.push("");

    if (values.length > headers.length) {
      values = values
        .slice(0, headers.length - 1)
        .concat(values.slice(headers.length - 1).join(","));
    }

    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i] || "");
    return obj;
  });
}

// Combine Day + Date for homepage
function formatHomePageDate(day, date) {
  if (!day && !date) return "";
  if (!day) return date;
  if (!date) return day;
  return `${day}, ${date}`;
}

// Get URL query parameter
function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

// Populate homepage with day cards
async function populateDays() {
  const res = await fetch(csvUrl);
  const text = await res.text();
  const data = parseCSV(text);

  const daysContainer = document.getElementById("days-container");

  const uniqueDays = Array.from(
    new Map(data.map(d => [`${d.Day}|${d.Date}`, d])).values()
  );

  uniqueDays.forEach(dayData => {
    const card = document.createElement("div");
    card.className = "card day-card";
    card.innerText = formatHomePageDate(dayData.Day, dayData.Date);
    card.onclick = () => {
      window.location = `day.html?day=${encodeURIComponent(dayData.Day)}&date=${encodeURIComponent(dayData.Date)}`;
    };
    daysContainer.appendChild(card);
  });
}

// Populate activity cards for a specific day
async function populateActivities() {
  const res = await fetch(csvUrl);
  const text = await res.text();
  const data = parseCSV(text);

  const day = getQueryParam("day");
  const date = getQueryParam("date");

  const activities = data.filter(d => d.Day === day && d.Date === date);

  document.getElementById("day-title").innerText =
    formatHomePageDate(day, date) + " Itinerary";

  const container = document.getElementById("activities-container");

  activities.forEach(act => {
    console.log("Activity raw:", act);

    const card = document.createElement("div");
    card.className = "card";

    // Header
    const header = document.createElement("div");
    header.className = "card-header";
    const categoryIcon = getCategoryIcon(act.Category);
    header.innerHTML = `<span>${categoryIcon} ${act.Activity || "—"}</span><span>${act.Time || "—"}</span>`;
    card.appendChild(header);

    // Content
    const content = document.createElement("div");
    content.className = "card-content";

    // All fields except Notes
    const fields = [
      ["Category", act.Category],
      ["Neighborhood", act.Neighborhood],
      ["Address", act.Address],
      ["Website", act.Website ? `<a href="${act.Website}" target="_blank">${act.Website}</a>` : "—"`],
      ["Cost", act.Cost],
      ["Ticket", act.Ticket],
      ["Hours", act.Hours]
    ];

    fields.forEach(([label, value]) => {
      const p = document.createElement("p");
      if (label === "Website" && act.Website) {
        p.innerHTML = `<strong>${label}:</strong> ${value}`;
      } else {
        p.innerHTML = `<strong>${label}:</strong> ${value || "—"}`;
      }
      content.appendChild(p);
    });

    // Notes safely
    const notesPara = document.createElement("p");
    const notesStrong = document.createElement("strong");
    notesStrong.textContent = "Notes: ";
    notesPara.appendChild(notesStrong);
    notesPara.appendChild(document.createTextNode(act.Notes || "—"));
    content.appendChild(notesPara);

    card.appendChild(content);

    // Expand/collapse
    card.onclick = () => card.classList.toggle("expanded");

    container.appendChild(card);
  });
}

// Category icons
function getCategoryIcon(category) {
  switch (category?.toLowerCase()) {
    case "explore": return "🌍";
    case "activity": return "⚡";
    case "shopping": return "🛍️";
    case "museum": return "🏛️";
    case "food": return "🍴";
    case "travel": return "✈️";
    case "lodging": return "🏨";
    case "to-do": return "✅";
    default: return "📍";
  }
}

// Detect page
if (document.getElementById("days-container")) {
  populateDays();
} else if (document.getElementById("activities-container")) {
  populateActivities();
}
