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

// SVG icon constants to avoid duplication
const SVG_ICONS = {
  edit: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>`,
  delete: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>`
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
    additionalNotes: "",
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
  const roundNumInput = document.getElementById(inputId).value;

  // Validate round number is provided
  if (!roundNumInput) {
    alert("Please enter a round number.");
    return;
  }

  // Validate round number is a positive integer
  const roundNum = parseInt(roundNumInput, 10);
  if (isNaN(roundNum) || roundNum <= 0 || roundNum !== parseFloat(roundNumInput)) {
    alert("Please enter a valid positive whole number (e.g., 1, 2, 3).");
    return;
  }

  // Check for duplicate rounds (same location, roundTime, and round number)
  const duplicate = currentShift.rounds.find(r => 
    r.location === location && 
    r.roundTime === roundTime && 
    r.round == roundNum
  );

  if (duplicate) {
    alert(`Round ${roundNum} for ${location} at ${roundTime} already exists. Please enter a different round number.`);
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
  
  closeModalById("editRoundModal", () => { editingRoundIndex = null; });
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
  
  closeModalById("editLockoutModal", () => { editingLockoutIndex = null; });
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

function updateAdditionalNotes() {
  currentShift.additionalNotes = document.getElementById("additionalNotes").value;
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

function copyAdditionalNotes() {
  const notes = document.getElementById("additionalNotes").value;

  if (!notes.trim()) {
    alert("No notes to copy!");
    return;
  }

  copyToClipboard(notes, "Additional notes copied to clipboard!");
}

// Unified copy to clipboard function
function copyToClipboard(text, successMessage) {
  navigator.clipboard.writeText(text).then(() => {
    alert(successMessage);
  }).catch(err => {
    alert("Failed to copy. Please try again.");
  });
}

function formatShiftDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = days[date.getDay()];
  const dayNum = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day} ${dayNum}/${month}/${year}`;
}

function viewShiftDetail(shift) {
  const dataContainer = document.getElementById("lastShiftData");
  
  const rounds8pm = shift.rounds.filter(r => r.roundTime === '8pm');
  const rounds10pm = shift.rounds.filter(r => r.roundTime === '10pm');

  // Format the shift date
  const shiftDate = shift.endedAt || shift.startedAt;
  const dateDisplay = shiftDate ? `<div class="shift-date">${formatShiftDate(shiftDate)}</div>` : '';

  let html = `
    <button class="back-btn" onclick="viewRecent()" style="margin-bottom: 15px;">← Back to Archives</button>
    ${dateDisplay}
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

    <h3>Additional Notes</h3>
    <div class="archive-notes">
      ${shift.additionalNotes ? `<p>${shift.additionalNotes}</p>` : '<p>No notes recorded</p>'}
    </div>
  `;

  dataContainer.innerHTML = html;
}

function viewRecent() {
  let archives = getShiftArchives();
  
  // Migrate old "lastShift" data if it exists and hasn't been migrated yet
  const lastShift = localStorage.getItem("lastShift");
  if (lastShift && archives.length === 0) {
    try {
      const oldShift = JSON.parse(lastShift);
      archives = [oldShift];
      saveShiftArchives(archives);
      localStorage.removeItem("lastShift"); // Remove old format
    } catch (e) {
      console.error("Error migrating old shift data:", e);
    }
  }
  
  if (archives.length === 0) {
    alert("No archived shifts found!");
    return;
  }

  const dataContainer = document.getElementById("lastShiftData");
  
  // Show list of archived shifts
  let html = `<h3>Archived Shifts (${archives.length})</h3>`;
  
  archives.forEach((shift, index) => {
    const shiftDate = shift.endedAt || shift.startedAt;
    const dateFormatted = shiftDate ? formatShiftDate(shiftDate) : 'Unknown date';
    const roundsCount = shift.rounds ? shift.rounds.length : 0;
    const lockoutsCount = shift.lockouts ? shift.lockouts.length : 0;
    
    html += `
      <div class="archive-item" onclick="viewShiftDetail(getShiftArchives()[${index}])" style="
        padding: 15px;
        margin-bottom: 10px;
        background: #f8f9fa;
        border-left: 4px solid #02c6a2;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
        display: flex;
        justify-content: space-between;
        align-items: center;
      " onmouseover="this.style.background='#eaf7f4'" onmouseout="this.style.background='#f8f9fa'">
        <div style="flex: 1;">
          <div style="font-weight: 600; color: #2b3e49; margin-bottom: 5px;">${dateFormatted}</div>
          <div style="font-size: 0.9em; color: #666;">
            ${roundsCount} rounds • ${lockoutsCount} lockouts
          </div>
        </div>
        <button class="icon-btn delete-btn" onclick="deleteArchiveShift(${index}, event)" title="Delete this shift" style="
          background: transparent;
          border: none;
          padding: 5px;
          cursor: pointer;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 10px;
        ">
          ${SVG_ICONS.delete}
        </button>
      </div>
    `;
  });

  dataContainer.innerHTML = html;
  openModal("lastShiftModal");
}

// Unified modal functions
function openModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function closeModalById(modalId, onClose = null) {
  document.getElementById(modalId).style.display = "none";
  if (onClose) onClose();
}

// Close last shift modal (for HTML onclick - kept simple name for compatibility)
function closeModal() {
  closeModalById("lastShiftModal");
}

function closeEditRoundModal() {
  closeModalById("editRoundModal", () => { editingRoundIndex = null; });
}

function closeEditLockoutModal() {
  closeModalById("editLockoutModal", () => { editingLockoutIndex = null; });
}

// Close modal when clicking outside
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = "none";
    editingRoundIndex = null;
    editingLockoutIndex = null;
  }
}

function getShiftArchives() {
  const archives = localStorage.getItem("shiftArchives");
  return archives ? JSON.parse(archives) : [];
}

function saveShiftArchives(archives) {
  localStorage.setItem("shiftArchives", JSON.stringify(archives));
}

function deleteArchiveShift(index, event) {
  if (event) {
    event.stopPropagation(); // Prevent triggering the archive item click
  }
  
  if (!confirm("WARNING: Are you sure you want to delete this archived shift? This cannot be undone.")) {
    return;
  }
  
  let archives = getShiftArchives();
  archives.splice(index, 1);
  saveShiftArchives(archives);
  
  // Refresh the archive list view
  viewRecent();
}

function resetShift() {
  if (!confirm("WARNING: Check if you have submitted the relevant forms.")) return;

  // Add current shift to archives
  const archivedShift = { ...currentShift, endedAt: new Date().toISOString() };
  let archives = getShiftArchives();
  
  // Add to beginning of array (most recent first)
  archives.unshift(archivedShift);
  
  // Keep only last 50 shifts to prevent unlimited storage
  const MAX_ARCHIVES = 50;
  if (archives.length > MAX_ARCHIVES) {
    archives = archives.slice(0, MAX_ARCHIVES);
  }
  
  saveShiftArchives(archives);

  localStorage.removeItem("currentShift");
  currentShift = loadShift();
  
  document.getElementById("routeSelect").value = "A";
  document.getElementById("roundTimeSelect").value = "8pm";
  updateLocations();
  
  render();
}

// Helper function to render list entries with edit/delete buttons
function renderEntry(content, editFn, deleteFn, index) {
  return `<li>
    <span class="entry-content">${content}</span>
    <div class="entry-actions">
      <button class="icon-btn edit-btn" onclick="${editFn}(${index})" title="Edit">
        ${SVG_ICONS.edit}
      </button>
      <button class="icon-btn delete-btn" onclick="${deleteFn}(${index})" title="Delete">
        ${SVG_ICONS.delete}
      </button>
    </div>
  </li>`;
}

function render() {
  document.getElementById("roundsList").innerHTML =
    currentShift.rounds.map((r, index) =>
      renderEntry(
        `<strong>[${r.roundTime}]</strong> ${r.location} - ${r.round}`,
        "editRound",
        "deleteRound",
        index
      )
    ).join("");

  document.getElementById("lockoutsList").innerHTML =
    currentShift.lockouts.map((l, index) =>
      renderEntry(
        `${l.time} - ${l.name} (${l.room})`,
        "editLockout",
        "deleteLockout",
        index
      )
    ).join("");

  document.getElementById("project100Notes").value = currentShift.project100Notes || "";
  document.getElementById("additionalNotes").value = currentShift.additionalNotes || "";

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

function toggleSection(sectionId, event) {
  
  // Prevent if clicking on a button
  if (event && event.target.closest('button')) {
    return;
  }
  
  const content = document.getElementById(sectionId);
  const toggleId = sectionId.replace('Content', 'Toggle');
  const icon = document.getElementById(toggleId);
  
  content.classList.toggle("collapsed");
  icon.textContent = content.classList.contains("collapsed") ? "+" : "−";
}

// Format and display current date
function displayCurrentDate() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = days[now.getDay()];
  const date = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  
  document.getElementById("currentDate").textContent = `${day} ${date}/${month}/${year}`;
}

// Dark mode functionality
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
}

function loadDarkMode() {
  const darkMode = localStorage.getItem('darkMode');
  if (darkMode === 'true') {
    document.body.classList.add('dark-mode');
  }
}

// Initialize sections to be collapsed
function initializeCollapsedSections() {
  const sectionsToCollapse = [
    { contentId: 'instructionsContent', toggleId: 'instructionsToggle' },
    { contentId: 'roundsContent', toggleId: 'roundsToggle' },
    { contentId: 'lockoutsContent', toggleId: 'lockoutsToggle' },
    { contentId: 'project100Content', toggleId: 'project100Toggle' },
    { contentId: 'additionalNotesContent', toggleId: 'additionalNotesToggle' }
  ];

  sectionsToCollapse.forEach(section => {
    const content = document.getElementById(section.contentId);
    const icon = document.getElementById(section.toggleId);
    if (content && icon) {
      content.classList.add('collapsed');
      icon.textContent = '+';
    }
  });
}

// Initialize on load
loadDarkMode();
displayCurrentDate();
initializeCollapsedSections();
document.getElementById("routeSelect").value = "A";
document.getElementById("roundTimeSelect").value = "8pm";
updateLocations();
render();

// Add event listeners for notes
document.getElementById("project100Notes").addEventListener("input", updateProject100Notes);
document.getElementById("additionalNotes").addEventListener("input", updateAdditionalNotes);