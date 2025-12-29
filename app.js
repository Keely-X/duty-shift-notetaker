const ROUTES = {
  A: [
    "Academic Commons G",
    "Academic Commons 1",
    "Academic Commons 2",
    "Academic Commons 3",
    "Conservatory"
  ],
  B: [
    "Basement",
    "Ground",
    "Level 9",
    "Level 10"
  ]
};

let currentShift = loadShift();
let editingRoundIndex = null;
let editingLockoutIndex = null;

function loadShift() {
  const saved = localStorage.getItem("currentShift");
  if (saved) return JSON.parse(saved);

  return {
    rounds: [],
    lockouts: [],
    project100Notes: "",
    reports: { 1:false, 2:false, 3:false, 4:false, 5:false },
    startedAt: new Date().toISOString()
  };
}

function saveShift() {
  localStorage.setItem("currentShift", JSON.stringify(currentShift));
  render();
}

function addRound(location) {
  const roundTime = document.getElementById("roundTimeSelect").value;
  const route = document.getElementById("routeSelect").value;
  const inputId = `round-input-${location.replace(/\s/g, '-')}`;
  const roundNum = document.getElementById(inputId).value;

  if (!roundNum) {
    alert("Please enter a round number.");
    return;
  }

  currentShift.rounds.push({
    roundTime: roundTime,
    route: route,
    location: location,
    round: roundNum,
    time: new Date().toLocaleTimeString()
  });

  document.getElementById(inputId).value = "";
  saveShift();
}

function deleteRound(index) {
  if (!confirm("Are you sure you want to delete this round entry?")) return;
  
  currentShift.rounds.splice(index, 1);
  saveShift();
}

function editRound(index) {
  editingRoundIndex = index;
  const round = currentShift.rounds[index];
  
  document.getElementById("editRoundTime").value = round.roundTime;
  document.getElementById("editLocation").value = round.location;
  document.getElementById("editRoundNumber").value = round.round;
  
  openModal("editRoundModal");
}

function saveRoundEdit() {
  if (editingRoundIndex === null) return;
  
  const roundTime = document.getElementById("editRoundTime").value;
  const location = document.getElementById("editLocation").value;
  const roundNum = document.getElementById("editRoundNumber").value;
  
  if (!location || !roundNum) {
    alert("Please fill in all fields.");
    return;
  }
  
  currentShift.rounds[editingRoundIndex].roundTime = roundTime;
  currentShift.rounds[editingRoundIndex].location = location;
  currentShift.rounds[editingRoundIndex].round = roundNum;
  
  closeModalById("editRoundModal");
  editingRoundIndex = null;
  saveShift();
}

function deleteLockout(index) {
  if (!confirm("Are you sure you want to delete this lockout entry?")) return;
  
  currentShift.lockouts.splice(index, 1);
  saveShift();
}

function editLockout(index) {
  editingLockoutIndex = index;
  const lockout = currentShift.lockouts[index];
  
  document.getElementById("editLockoutName").value = lockout.name;
  document.getElementById("editLockoutRoom").value = lockout.room;
  
  openModal("editLockoutModal");
}

function saveLockoutEdit() {
  if (editingLockoutIndex === null) return;
  
  const name = document.getElementById("editLockoutName").value;
  const room = document.getElementById("editLockoutRoom").value;
  
  if (!name || !room) {
    alert("Please fill in all fields.");
    return;
  }
  
  currentShift.lockouts[editingLockoutIndex].name = name;
  currentShift.lockouts[editingLockoutIndex].room = room;
  
  closeModalById("editLockoutModal");
  editingLockoutIndex = null;
  saveShift();
}

function updateLocations() {
  const route = document.getElementById("routeSelect").value;
  const container = document.getElementById("locationsContainer");

  container.innerHTML = "";

  ROUTES[route].forEach(loc => {
    const inputId = `round-input-${loc.replace(/\s/g, '-')}`;
    
    const row = document.createElement("div");
    row.className = "location-row";
    
    row.innerHTML = `
      <span class="location-name">${loc}</span>
      <input
        id="${inputId}"
        type="number"
        placeholder="Round #"
      />
      <button onclick="addRound('${loc}')">Add</button>
    `;
    
    container.appendChild(row);
  });
}

function addLockout() {
  const name = document.getElementById("nameInput").value;
  const room = document.getElementById("roomInput").value;

  if (!name || !room) {
    alert("Please enter both name and room number.");
    return;
  }

  currentShift.lockouts.push({
    name,
    room,
    time: new Date().toLocaleTimeString()
  });

  document.getElementById("nameInput").value = "";
  document.getElementById("roomInput").value = "";

  saveShift();
}

function updateProject100Notes() {
  currentShift.project100Notes = document.getElementById("project100Notes").value;
  saveShift();
}

function toggleReport(num) {
  currentShift.reports[num] = !currentShift.reports[num];
  saveShift();
}

function copyRounds(roundTime) {
  const filteredRounds = currentShift.rounds.filter(r => r.roundTime === roundTime);
  
  if (filteredRounds.length === 0) {
    alert(`No ${roundTime} rounds to copy!`);
    return;
  }

  const text = filteredRounds
    .map(r => `${r.location} - ${r.round}`)
    .join('\n');

  copyToClipboard(text, `${roundTime} rounds copied to clipboard!`);
}

function copyLockouts(type) {
  if (currentShift.lockouts.length === 0) {
    alert("No lockouts to copy!");
    return;
  }

  const text = type === 'names' 
    ? currentShift.lockouts.map(l => `${l.time} - ${l.name}`).join('\n')
    : currentShift.lockouts.map(l => l.room).join('\n');

  const message = type === 'names' 
    ? "Time and names copied to clipboard!" 
    : "Room numbers copied to clipboard!";

  copyToClipboard(text, message);
}

function copyLockoutsTimeAndName() {
  copyLockouts('names');
}

function copyLockoutsRooms() {
  copyLockouts('rooms');
}

function copyProject100() {
  const notes = document.getElementById("project100Notes").value;

  if (!notes.trim()) {
    alert("No notes to copy!");
    return;
  }

  copyToClipboard(notes, "Project 100 notes copied to clipboard!");
}

// Unified copy to clipboard function
function copyToClipboard(text, successMessage) {
  navigator.clipboard.writeText(text).then(() => {
    alert(successMessage);
  }).catch(err => {
    alert("Failed to copy. Please try again.");
  });
}

function viewRecent() {
  const lastShift = localStorage.getItem("lastShift");
  
  if (!lastShift) {
    alert("No archived shift found!");
    return;
  }

  const shift = JSON.parse(lastShift);
  const dataContainer = document.getElementById("lastShiftData");

  const rounds8pm = shift.rounds.filter(r => r.roundTime === '8pm');
  const rounds10pm = shift.rounds.filter(r => r.roundTime === '10pm');

  let html = `

    <h3>Reports Completed</h3>
    <ul class="archive-list">
      ${shift.reports[1] ? '<li>✓ 8pm Round</li>' : '<li>✗ 8pm Round</li>'}
      ${shift.reports[2] ? '<li>✓ U18 Curfew Check</li>' : '<li>✗ U18 Curfew Check</li>'}
      ${shift.reports[3] ? '<li>✓ 10pm Round</li>' : '<li>✗ 10pm Round</li>'}
      ${shift.reports[4] ? '<li>✓ Lockouts</li>' : '<li>✗ Lockouts</li>'}
      ${shift.reports[5] ? '<li>✓ Project 100</li>' : '<li>✗ Project 100</li>'}
    </ul>

    <h3>8pm Rounds (${rounds8pm.length})</h3>
    <ul class="archive-list">
      ${rounds8pm.length > 0 ? rounds8pm.map(r => `<li>${r.location} -  ${r.round}</li>`).join('') : '<li>No 8pm rounds recorded</li>'}
    </ul>

    <h3>10pm Rounds (${rounds10pm.length})</h3>
    <ul class="archive-list">
      ${rounds10pm.length > 0 ? rounds10pm.map(r => `<li>${r.location} - ${r.round}</li>`).join('') : '<li>No 10pm rounds recorded</li>'}
    </ul>

    <h3>Lockouts (${shift.lockouts.length})</h3>
    <ul class="archive-list">
      ${shift.lockouts.length > 0 ? shift.lockouts.map(l => `<li>${l.time} - ${l.name} (${l.room})</li>`).join('') : '<li>No lockouts recorded</li>'}
    </ul>

    <h3>Project 100 Notes</h3>
    <div class="archive-notes">
      ${shift.project100Notes ? `<p>${shift.project100Notes}</p>` : '<p>No notes recorded</p>'}
    </div>
  `;

  dataContainer.innerHTML = html;
  openModal("lastShiftModal");
}

// Unified modal functions
function openModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function closeModalById(modalId) {
  document.getElementById(modalId).style.display = "none";
}

function closeModal() {
  closeModalById("lastShiftModal");
}

function closeEditRoundModal() {
  closeModalById("editRoundModal");
  editingRoundIndex = null;
}

function closeEditLockoutModal() {
  closeModalById("editLockoutModal");
  editingLockoutIndex = null;
}

// Close modal when clicking outside
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = "none";
    editingRoundIndex = null;
    editingLockoutIndex = null;
  }
}

function resetShift() {
  if (!confirm("WARNING: Check if you have submitted the relevant forms.")) return;

  localStorage.setItem(
    "lastShift",
    JSON.stringify({ ...currentShift, endedAt: new Date().toISOString() })
  );

  localStorage.removeItem("currentShift");
  currentShift = loadShift();
  
  document.getElementById("routeSelect").value = "A";
  document.getElementById("roundTimeSelect").value = "8pm";
  updateLocations();
  
  render();
}

function render() {
  document.getElementById("roundsList").innerHTML =
    currentShift.rounds.map((r, index) =>
      `<li>
        <span class="entry-content"><strong>[${r.roundTime}]</strong> ${r.location} - ${r.round}</span>
        <div class="entry-actions">
          <button class="icon-btn edit-btn" onclick="editRound(${index})" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="icon-btn delete-btn" onclick="deleteRound(${index})" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </li>`
    ).join("");

  document.getElementById("lockoutsList").innerHTML =
    currentShift.lockouts.map((l, index) =>
      `<li>
        <span class="entry-content">${l.time} - ${l.name} (${l.room})</span>
        <div class="entry-actions">
          <button class="icon-btn edit-btn" onclick="editLockout(${index})" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="icon-btn delete-btn" onclick="deleteLockout(${index})" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </li>`
    ).join("");

  document.getElementById("project100Notes").value = currentShift.project100Notes || "";

  for (let i = 1; i <= 5; i++) {
    document.querySelector(`input[onchange="toggleReport(${i})"]`).checked =
      currentShift.reports[i];
  }
}

function toggleInstructions() {
  const content = document.getElementById("instructionsContent");
  const icon = document.getElementById("instructionsToggle");
  
  content.classList.toggle("collapsed");
  icon.textContent = content.classList.contains("collapsed") ? "+" : "−";
}

function toggleSection(sectionId) {
  const content = document.getElementById(sectionId);
  const toggleId = sectionId.replace('Content', 'Toggle');
  const icon = document.getElementById(toggleId);
  
  content.classList.toggle("collapsed");
  icon.textContent = content.classList.contains("collapsed") ? "+" : "−";
}

// Initialize on load
document.getElementById("routeSelect").value = "A";
document.getElementById("roundTimeSelect").value = "8pm";
updateLocations();
render();

// Add event listener for Project 100 notes
document.getElementById("project100Notes").addEventListener("input", updateProject100Notes);