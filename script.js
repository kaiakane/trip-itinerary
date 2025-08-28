const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSt2MSaQY53H0kBw0MRlgJVFE8FG-A0tMBmccKoGPBqvllIA_Mn4B45QQWYu5uZu2_-CZbfifKyOQjl/pub?output=csv";

// Simple CSV parser
function parseCSV(csvText) {
  const [headerLine, ...lines] = csvText.trim().split("\n");
  const headers = headerLine.split(",");
  return lines.map(line => {
    const values = line.split(",");
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i];
      return obj;
    }, {});
  });
}

// Get query parameter
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
  const uniqueDays = [...new Set(data.map(d => d.Day))];
  
  uniqueDays.forEach(day => {
    const dayData = data.find(d => d.Day === day);
    const card = document.createElement("div");
    card.className = "card day-card";
    card.innerText = `${dayData.Day} - ${dayData.Date}`;
    card.onclick = () => window.location = `day.html?day=${encodeURIComponent(day)}`;
    daysContainer.appendChild(card);
  });
}

// Populate activities for a day
async function populateActivities() {
  const res = await fetch(csvUrl);
  const text = await res.text();
  const data = parseCSV(text);
  
  const day = getQueryParam("day");
  const activities = data.filter(d => d.Day === day);
  document.getElementById("day-title").innerText = `${day} Itinerary`;
  
  const container = document.getElementById("activities-container");
  activities.forEach(act => {
    const card = document.createElement("div");
    card.className = "card";
    
    const header = document.createElement("div");
    header.className = "card-header";
    header.innerHTML = `<span>${act.Activity}</span><span>${act.Time}</span>`;
    card.appendChild(header);
    
    const content = document.createElement("div");
    content.className = "card-content";
    content.innerHTML = `
      <p><strong>Category:</strong> ${act.Category}</p>
      <p><strong>Neighborhood:</strong> ${act.Neighborhood}</p>
      <p><strong>Address:</strong> ${act.Address}</p>
      <p><strong>Website:</strong> <a href="${act.Website}" target="_blank">${act.Website}</a></p>
      <p><strong>Cost:</strong> ${act.Cost}</p>
      <p><strong>Ticket:</strong> ${act.Ticket}</p>
      <p><strong>Hours:</strong> ${act.Hours}</p>
      <p><strong>Notes:</strong> ${act.Notes}</p>
    `;
    card.appendChild(content);
    
    card.onclick = () => card.classList.toggle("expanded");
    container.appendChild(card);
  });
}

// Determine which page
if (document.getElementById("days-container")) {
  populateDays();
} else if (document.getElementById("activities-container")) {
  populateActivities();
}
