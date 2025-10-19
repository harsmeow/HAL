document.addEventListener("DOMContentLoaded", () => {
  const inputBox = document.querySelector(".input_box");
  const saveBtn = document.querySelector(".save_button");
  const notesContainer = document.querySelector(".notes_container");
  const noNotesMsg = document.querySelector(".no_notes");
  const showMoreBtn = document.querySelector(".show_more_btn");
  const settingsBtn = document.querySelector(".settings");

  // 🗂 Load notes from localStorage
  let notes = JSON.parse(localStorage.getItem("notesData")) || [];
  let showAll = false;
  let editIndex = null;
  let noteCounter = notes.length;

  // Remove demo examples
  document.querySelectorAll(".n1, .n2").forEach((el) => el.parentElement.remove());

  // 💾 Save to localStorage helper
  function saveToLocal() {
    localStorage.setItem("notesData", JSON.stringify(notes));
  }

  // 📝 Render notes on screen
  function renderNotes() {
    notesContainer.querySelectorAll(".notes").forEach((el) => el.remove());

    // Sort pinned → unpinned (latest pinned first)
    const pinned = notes.filter((n) => n.pinned).sort((a, b) => b.pinnedAt - a.pinnedAt);
    const unpinned = notes.filter((n) => !n.pinned).sort((a, b) => a.originalIndex - b.originalIndex);
    const allNotes = [...pinned, ...unpinned];

    if (allNotes.length === 0) {
      noNotesMsg.style.display = "block";
      showMoreBtn.style.display = "none";
      return;
    }

    noNotesMsg.style.display = "none";
    const visibleNotes = showAll ? allNotes : allNotes.slice(0, 4);

    visibleNotes.forEach((note) => {
      const noteDiv = document.createElement("div");
      noteDiv.className = "notes";
      if (note.pinned) noteDiv.classList.add("pinned");

      const pinIcon = note.pinned
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             class="icon icon-tabler icons-tabler-outline icon-tabler-pinned-off">
             <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
             <path d="M3 3l18 18" />
             <path d="M15 4.5l-3.249 3.249m-2.57 1.433l-2.181 .818l-1.5 1.5l7 7l1.5 -1.5l.82 -2.186m1.43 -2.563l3.25 -3.251" />
             <path d="M9 15l-4.5 4.5" />
             <path d="M14.5 4l5.5 5.5" />
           </svg>`
        : `<svg class="pin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
             stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pin">
             <path stroke="none" d="M0 0h24v24H0z" fill="none" />
             <path d="M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4" />
             <path d="M9 15l-4.5 4.5" />
             <path d="M14.5 4l5.5 5.5" />
           </svg>`;

      noteDiv.innerHTML = `
        <span class="note_text">${note.pinned ? "📌 " : ""}${note.text}</span>
        <div class="notes_actions">
          <span class="note_date">${note.date}</span>
          <button class="edit_btn" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" color="#000000">
              <path d="M6 15H3.75C2.7835 15 2 15.7835 2 16.75C2 17.7165 2.7835 18.5 3.75 18.5H13.25C14.2165 18.5 15 19.2835 15 20.25C15 21.2165 14.2165 22 13.25 22H11"
                stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M9 15V13.1569C9 12.096 9.42143 11.0786 10.1716 10.3284L17.7929 2.70711C18.1834 2.31658 18.8166 2.31658 19.2071 2.70711L21.2929 4.79289C21.6834 5.18342 21.6834 5.81658 21.2929 6.20711L13.6716 13.8284C12.9214 14.5786 11.904 15 10.8431 15H9Z"
                stroke="#000000" stroke-width="1.5" stroke-linejoin="round"></path>
            </svg>
          </button>
          <button class="delete_btn" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" color="#000000">
              <path d="M9 11.5H15" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M10.5 15.5H13.5" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M19.5 5.5L18.6139 20.121C18.5499 21.1766 17.6751 22 16.6175 22H7.38246C6.32488 22 5.4501 21.1766 5.38612 20.121L4.5 5.5"
                stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M3 5.5H8M21 5.5H16M16 5.5L14.7597 2.60608C14.6022 2.2384 14.2406 2 13.8406 2H10.1594C9.75937 2 9.39783 2.2384 9.24025 2.60608L8 5.5M16 5.5H8"
                stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </button>
          <button class="pin_btn" title="Pin">${pinIcon}</button>
        </div>
      `;

      // ✏️ Edit note
      noteDiv.querySelector(".edit_btn").addEventListener("click", () => {
        inputBox.value = note.text;
        inputBox.focus();
        editIndex = notes.indexOf(note);
      });

      // 🗑 Delete note
      noteDiv.querySelector(".delete_btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this note?")) {
          notes.splice(notes.indexOf(note), 1);
          saveToLocal();
          renderNotes();
        }
      });

      // 📌 Pin / Unpin note
      noteDiv.querySelector(".pin_btn").addEventListener("click", () => {
        if (!note.pinned) {
          note.pinned = true;
          note.pinnedAt = Date.now();
        } else {
          note.pinned = false;
          delete note.pinnedAt;
        }
        saveToLocal();
        renderNotes();
      });

      // ✂️ Truncate long text and show popup
      const textElement = noteDiv.querySelector(".note_text");
      const tempSpan = document.createElement("span");
      tempSpan.style.visibility = "hidden";
      tempSpan.style.position = "absolute";
      tempSpan.style.whiteSpace = "nowrap";
      tempSpan.textContent = textElement.textContent;
      document.body.appendChild(tempSpan);
      const isMultiline = tempSpan.offsetWidth > textElement.offsetWidth;
      document.body.removeChild(tempSpan);

      if (isMultiline) {
        textElement.style.display = "-webkit-box";
        textElement.style.webkitLineClamp = "1";
        textElement.style.webkitBoxOrient = "vertical";
        textElement.style.overflow = "hidden";
        textElement.style.textOverflow = "ellipsis";
        textElement.style.cursor = "pointer";

        textElement.addEventListener("click", () => {
          const overlay = document.createElement("div");
          overlay.className = "note_popup_overlay";
          const popup = document.createElement("div");
          popup.className = "note_popup_box";
          popup.innerHTML = `<p>${note.text.replace(/\n/g, "<br>")}</p>`;
          overlay.appendChild(popup);
          document.body.appendChild(overlay);

          overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.remove();
          });
        });
      }

      notesContainer.insertBefore(noteDiv, showMoreBtn);
    });

    showMoreBtn.style.display = notes.length > 4 ? "block" : "none";
    showMoreBtn.textContent = showAll ? "Hide Entries" : "View All Entries";
    notesContainer.classList.toggle("fade_notes", !showAll && notes.length > 4);
  }

  // 💬 Save / Update Note
  function saveNote() {
    const text = inputBox.value.trim();
    if (text === "") return alert("Please write something before saving!");
    const date = new Date().toLocaleDateString();

    if (editIndex !== null) {
      notes[editIndex].text = text;
      notes[editIndex].date = date;
      editIndex = null;
    } else {
      notes.unshift({
        text,
        pinned: false,
        date,
        originalIndex: noteCounter++,
      });
    }

    inputBox.value = "";
    saveToLocal();
    renderNotes();
  }

  saveBtn.addEventListener("click", saveNote);
  showMoreBtn.addEventListener("click", () => {
    showAll = !showAll;
    renderNotes();
  });

  renderNotes();

  // ⚙️ SETTINGS POPUP FEATURE
  const settingsPopup = document.createElement("div");
  settingsPopup.className = "settings_popup hidden";
  settingsPopup.innerHTML = `
    <div class="settings_box">
      <h2>Settings</h2>
      <button id="export_notes">Export Notes (.txt)</button>
      <button id="clear_notes">Clear All Notes</button>
    </div>
  `;
  document.body.appendChild(settingsPopup);

  const style = document.createElement("style");
  style.textContent = `
    .settings_popup {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.45);
      display: flex; justify-content: center; align-items: center;
      z-index: 2000;
    }
    .settings_box {
      background: #fff;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      text-align: center;
    }
    .settings_box button {
      padding: 0.7rem 1.2rem;
      border: none;
      border-radius: 8px;
      background: #cb997e;
      color: black;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .settings_box button:hover { transform: scale(1.05); background: #ddbea9; }
    .hidden { display: none; }

    /* Popup styles for full note view */
    .note_popup_overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 3000;
    }
    .note_popup_box {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      max-width: 500px;
      width: 85%;
      max-height: 60vh;
      overflow-y: auto;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      font-family: "Montserrat", sans-serif;
      line-height: 1.6;
      color: #222;
    }
  `;
  document.head.appendChild(style);

  // ⚙️ Open / Close Settings
  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsPopup.classList.remove("hidden");
  });

  settingsPopup.addEventListener("click", (e) => {
    if (e.target === settingsPopup) settingsPopup.classList.add("hidden");
  });

  const exportBtn = settingsPopup.querySelector("#export_notes");
  const clearBtn = settingsPopup.querySelector("#clear_notes");

  // 📤 Export Notes (.txt)
  exportBtn.addEventListener("click", () => {
    if (notes.length === 0) return alert("No notes to export!");

    let textData = "📝 Your Notes / Journal Entries:\n\n";
    notes.forEach((n, i) => {
      textData += `${i + 1}. [${n.date}] ${n.text}\n\n`;
    });

    const blob = new Blob([textData], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "my_notes.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  });

  // 🗑️ Clear All Notes
  clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all notes? This cannot be undone.")) {
      notes = [];
      saveToLocal();
      renderNotes();
      settingsPopup.classList.add("hidden");
    }
  });
});

// ⌨️ Auto-focus textarea when typing
document.addEventListener("keydown", (e) => {
  if (
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    ["Shift", "Control", "Alt", "Tab", "Escape"].includes(e.key)
  )
    return;

  const inputBox = document.querySelector(".input_box");
  const active = document.activeElement;
  if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) return;

  inputBox.focus();
  if (inputBox.value.trim() === "") {
    inputBox.placeholder = "What are you thinking...";
  }
  const len = inputBox.value.length;
  inputBox.setSelectionRange(len, len);
});

// === 📱 Mobile Menu Script (updated for Notes page) ===
document.addEventListener("DOMContentLoaded", () => {
  const menuImg = document.querySelector(".menu_logo");
  const menuTrigger = menuImg ? (menuImg.closest("a") || menuImg) : null;
  const mobileMenu = document.querySelector(".mobile_menu");
  const closeMenuBtn = document.querySelector(".close_menu");
  const overlay = document.querySelector(".menu_overlay");
  const settingsMobileBtn = document.querySelector(".settings_mobile");
  const settingsPopup = document.querySelector(".settings_popup");

  if (!menuTrigger || !mobileMenu || !closeMenuBtn || !overlay) return;

  function openMenu() {
    mobileMenu.classList.add("show");
    mobileMenu.classList.remove("hidden");
    overlay.classList.add("show");
    overlay.classList.remove("hidden");
  }

  function closeMenu() {
    mobileMenu.classList.remove("show");
    mobileMenu.classList.add("hidden");
    overlay.classList.remove("show");
    overlay.classList.add("hidden");
  }

  // open sidebar menu
  menuTrigger.addEventListener("click", (e) => {
    e.preventDefault();
    openMenu();
  });

  // close on X or overlay click
  closeMenuBtn.addEventListener("click", closeMenu);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeMenu();
  });

  // close menu when a nav link is clicked
  mobileMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", closeMenu);
  });

  // close with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // ⚙️ Open Settings Popup from mobile menu
  if (settingsMobileBtn && settingsPopup) {
    settingsMobileBtn.addEventListener("click", () => {
      closeMenu();
      settingsPopup.classList.remove("hidden");
    });
  }
});
