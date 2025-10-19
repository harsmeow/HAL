document.addEventListener("DOMContentLoaded", () => {
    const inputBox = document.querySelector(".input_box");
    const addBtn = document.querySelector(".add_button");
    const habitsContainer = document.querySelector(".habits_container");
    const noHabitsMsg = document.querySelector(".no_habits");
    const showMoreBtn = document.querySelector(".show_more_btn");
    const settingsBtn = document.querySelector(".settings");
    const insightBtn = document.querySelector(".streak_insight");

    let habits = JSON.parse(localStorage.getItem("habitsData")) || [];
    let editIndex = null;
    let showAll = false;
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    // Remove demo H1/H2
    document.querySelectorAll(".habit_item").forEach(el => el.remove());

    // 💾 Save habits
    const saveToLocal = () => localStorage.setItem("habitsData", JSON.stringify(habits));

    // 🔄 Reset daily checkboxes at midnight
    function resetDailyCheckboxes() {
        const now = new Date();
        const today = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

        habits.forEach(habit => {
            const lastCompleted = habit.lastCompletedDate;
            if (lastCompleted !== today) {
                habit.completed = false;
            }
        });
        saveToLocal();
    }

    // Check and reset on page load
    resetDailyCheckboxes();

    // Set interval to check every minute for midnight
    setInterval(() => {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            resetDailyCheckboxes();
            renderHabits();
        }
    }, 60000);

    // 📅 Scroll to calendar on Insight button click
    insightBtn.addEventListener("click", () => {
        const calendar = document.querySelector(".calendar_container");
        if (calendar) {
            calendar.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });

    // 🗓️ Enhanced Calendar with navigation
    function renderCalendar() {
        const oldCal = document.querySelector(".calendar_container");
        if (oldCal) oldCal.remove();

        const cal = document.createElement("div");
        cal.className = "calendar_container";

        const header = document.createElement("div");
        header.className = "calendar_header";

        const leftBtn = document.createElement("button");
        leftBtn.className = "calendar_prev";
        leftBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b85e5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 20l-3 -8l3 -8" /></svg>`;

        const rightBtn = document.createElement("button");
        rightBtn.className = "calendar_next";
        rightBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b85e5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11 4l3 8l-3 8" /></svg>`;

        const title = document.createElement("h3");
        title.className = "calendar_title";

        const nav = document.createElement("div");
        nav.className = "calendar_nav";
        nav.appendChild(leftBtn);
        nav.appendChild(title);
        nav.appendChild(rightBtn);

        header.appendChild(nav);
        cal.appendChild(header);

        const weekdaysRow = document.createElement("div");
        weekdaysRow.className = "weekdays_row";
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => {
            const weekday = document.createElement("div");
            weekday.className = "weekday";
            weekday.textContent = day;
            weekdaysRow.appendChild(weekday);
        });
        cal.appendChild(weekdaysRow);

        const grid = document.createElement("div");
        grid.className = "calendar_grid";
        cal.appendChild(grid);

        function updateCalendarDisplay() {
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];

            title.textContent = `${monthNames[currentMonth]} ${currentYear}`;

            grid.innerHTML = '';

            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const today = new Date();
            const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

            for (let i = 0; i < firstDay; i++) {
                const emptyDay = document.createElement("div");
                emptyDay.className = "calendar_day empty";
                grid.appendChild(emptyDay);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dayDiv = document.createElement("div");
                dayDiv.className = "calendar_day";
                dayDiv.textContent = day;

                const dateKey = `${currentYear}-${currentMonth}-${day}`;

                let habitCreatedOnThisDay = false;
                let habitCompletedOnThisDay = false;

                habits.forEach(habit => {
                    if (habit.createdDateKey === dateKey) {
                        habitCreatedOnThisDay = true;
                    }

                    if (habit.completedDates && habit.completedDates.includes(dateKey)) {
                        habitCompletedOnThisDay = true;
                    }
                });

                if (habitCompletedOnThisDay) {
                    dayDiv.classList.add("habit_completed");
                } else if (habitCreatedOnThisDay) {
                    dayDiv.classList.add("habit_exists");
                }

                if (isCurrentMonth && day === today.getDate()) {
                    dayDiv.classList.add("today");
                }

                if (habitCreatedOnThisDay || habitCompletedOnThisDay) {
                    dayDiv.classList.add("clickable");
                    dayDiv.style.cursor = "pointer";

                    dayDiv.addEventListener("click", () => {
                        showDateDetails(dateKey, `${monthNames[currentMonth]} ${day}, ${currentYear}`);
                    });
                }

                grid.appendChild(dayDiv);
            }
        }

        leftBtn.addEventListener("click", () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            if (currentYear < 2025 || (currentYear === 2025 && currentMonth < 0)) {
                currentYear = 2025;
                currentMonth = 0;
            }
            updateCalendarDisplay();
        });

        rightBtn.addEventListener("click", () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            if (currentYear > 2099) {
                currentYear = 2099;
                currentMonth = 11;
            }
            updateCalendarDisplay();
        });

        updateCalendarDisplay();
        habitsContainer.after(cal);
    }

    // 📊 Show date details popup
    function showDateDetails(dateKey, dateString) {
        const existingPopup = document.querySelector(".date_details_popup");
        if (existingPopup) existingPopup.remove();

        const popup = document.createElement("div");
        popup.className = "date_details_popup";

        const habitsOnDate = habits.filter(h => h.createdDateKey === dateKey);
        const completedOnDate = habits.filter(h =>
            h.completedDates && h.completedDates.includes(dateKey)
        );

        let content = `<h3>${dateString}</h3>`;

        if (habitsOnDate.length > 0) {
            content += `<p><strong>Habits Created:</strong></p><ul>`;
            habitsOnDate.forEach(h => {
                content += `<li>${h.text}</li>`;
            });
            content += `</ul>`;
        }

        if (completedOnDate.length > 0) {
            content += `<p><strong>Habits Completed:</strong></p><ul>`;
            completedOnDate.forEach(h => {
                const streakOnDate = h.completedDates.filter(d => d <= dateKey).length;
                content += `<li>${h.text} (Streak: ${streakOnDate})</li>`;
            });
            content += `</ul>`;
        }

        content += `<button class="close_popup">Close</button>`;
        popup.innerHTML = content;

        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            font-family: 'Montserrat', sans-serif;
        `;

        const overlay = document.createElement("div");
        overlay.className = "popup_overlay";
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        popup.querySelector(".close_popup").addEventListener("click", () => {
            popup.remove();
            overlay.remove();
        });

        overlay.addEventListener("click", () => {
            popup.remove();
            overlay.remove();
        });
    }

    // ✏️ Render habits
    function renderHabits() {
        habitsContainer.querySelectorAll(".habit_item").forEach(el => el.remove());
        updateTotalStreak();

        if (habits.length === 0) {
            noHabitsMsg.style.display = "block";
            showMoreBtn.style.display = "none";
            renderCalendar();
            return;
        }

        noHabitsMsg.style.display = "none";

        const sortedHabits = [...habits].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return habits.indexOf(a) - habits.indexOf(b);
        });

        const visible = showAll ? sortedHabits : sortedHabits.slice(0, 4);

        visible.forEach((habit) => {
            const habitIndex = habits.indexOf(habit);
            const div = document.createElement("div");
            div.className = habit.pinned ? "habit_item pinned" : "habit_item";

            const consecutiveStreak = calculateConsecutiveStreak(habit);

            const checkedSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#b85e5e"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18.333 2c1.96 0 3.56 1.537 3.662 3.472l.005 .195v12.666c0 1.96 -1.537 3.56 -3.472 3.662l-.195 .005h-12.666a3.667 3.667 0 0 1-3.662 -3.472l-.005 -.195v-12.666c0 -1.96 1.537 -3.56 3.472 -3.662l.195-.005h12.666zm-2.626 7.293a1 1 0 0 0 -1.414 0l-3.293 3.292l-1.293-1.292l-.094 -.083a1 1 0 0 0 -1.32 1.497l2 2l.094 .083a1 1 0 0 0 1.32 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z"/></svg>`;

            const uncheckedSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b85e5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /></svg>`;

            const pinSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4" /><path d="M9 15l-4.5 4.5" /><path d="M14.5 4l5.5 5.5" /></svg>`;

            const unpinSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3l18 18" /><path d="M15 4.5l-3.249 3.249m-2.57 1.433l-2.181 .818l-1.5 1.5l7 7l1.5 -1.5l.82 -2.186m1.43 -2.563l3.25 -3.251" /><path d="M9 15l-4.5 4.5" /><path d="M14.5 4l5.5 5.5" /></svg>`;

            div.innerHTML = `
                <div class="habit_left">
                    <button class="habit_check">${habit.completed ? checkedSVG : uncheckedSVG}</button>
                    <span class="habit_name" title="${habit.text}">${habit.text}</span>
                </div>
                <div class="habit_actions">
                    <span class="habit_date">${habit.date}</span>
                    <button class="edit_btn" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 15H3.75C2.78 15 2 15.78 2 16.75C2 17.72 2.78 18.5 3.75 18.5H13.25C14.22 18.5 15 19.28 15 20.25C15 21.22 14.22 22 13.25 22H11"/>
                            <path d="M9 15V13.15C9 12.09 9.42 11.07 10.17 10.32L17.79 2.71C18.18 2.32 18.82 2.32 19.21 2.71L21.29 4.79C21.68 5.18 21.68 5.82 21.29 6.21L13.67 13.83C12.92 14.58 11.9 15 10.84 15H9Z"/>
                        </svg>
                    </button>
                    <button class="delete_btn" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 11.5H15"/><path d="M10.5 15.5H13.5"/><path d="M19.5 5.5L18.61 20.12C18.55 21.17 17.67 22 16.61 22H7.38C6.32 22 5.45 21.17 5.38 20.12L4.5 5.5"/>
                            <path d="M3 5.5H8M21 5.5H16M16 5.5L14.76 2.61C14.6 2.24 14.24 2 13.84 2H10.16C9.76 2 9.4 2.24 9.24 2.61L8 5.5M16 5.5H8"/>
                        </svg>
                    </button>
                    <button class="pin_btn" title="${habit.pinned ? 'Unpin' : 'Pin'}">
                        ${habit.pinned ? unpinSVG : pinSVG}
                    </button>
                    <span class="streak_count">🔥 ${consecutiveStreak}</span>
                </div>
            `;

            const habitName = div.querySelector(".habit_name");
            habitName.addEventListener("click", () => {
                showHabitTextPopup(habit.text);
            });

            const checkBtn = div.querySelector(".habit_check");
            checkBtn.addEventListener("click", () => {
                const now = new Date();
                const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

                if (!habit.completedDates) habit.completedDates = [];

                if (!habit.completed) {
                    habit.completed = true;
                    habit.lastCompletedDate = dateKey;

                    if (!habit.completedDates.includes(dateKey)) {
                        habit.completedDates.push(dateKey);
                    }
                } else {
                    habit.completed = false;
                    habit.completedDates = habit.completedDates.filter(d => d !== dateKey);
                }

                saveToLocal();
                renderHabits();
            });

            div.querySelector(".edit_btn").addEventListener("click", () => {
                inputBox.value = habit.text;
                inputBox.focus();
                editIndex = habitIndex;
            });

            div.querySelector(".delete_btn").addEventListener("click", () => {
                if (confirm("Delete this habit?")) {
                    habits.splice(habitIndex, 1);
                    saveToLocal();
                    renderHabits();
                }
            });

            div.querySelector(".pin_btn").addEventListener("click", () => {
                habit.pinned = !habit.pinned;
                saveToLocal();
                renderHabits();
            });

            habitsContainer.insertBefore(div, showMoreBtn);
        });

        showMoreBtn.style.display = habits.length > 4 ? "block" : "none";
        showMoreBtn.textContent = showAll ? "Show less" : "View all habits";
        habitsContainer.classList.toggle("fade_habits", !showAll && habits.length > 4);
        renderCalendar();
    }

    function showHabitTextPopup(text) {
        const existingPopup = document.querySelector(".habit_text_popup");
        const existingOverlay = document.querySelector(".habit_popup_overlay");
        if (existingPopup) existingPopup.remove();
        if (existingOverlay) existingOverlay.remove();

        const popup = document.createElement("div");
        popup.className = "habit_text_popup";

        const content = `
            <h3>Habit Details</h3>
            <div class="habit_text_content">${text}</div>
            <button class="close_habit_popup">Close</button>
        `;

        popup.innerHTML = content;

        const overlay = document.createElement("div");
        overlay.className = "habit_popup_overlay";
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        popup.querySelector(".close_habit_popup").addEventListener("click", () => {
            popup.remove();
            overlay.remove();
        });

        overlay.addEventListener("click", () => {
            popup.remove();
            overlay.remove();
        });

        const escapeHandler = (e) => {
            if (e.key === "Escape") {
                popup.remove();
                overlay.remove();
                document.removeEventListener("keydown", escapeHandler);
            }
        };
        document.addEventListener("keydown", escapeHandler);
    }

    function calculateConsecutiveStreak(habit) {
        if (!habit.completedDates || habit.completedDates.length === 0) return 0;

        const sortedDates = habit.completedDates.sort().reverse();

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedDates.length; i++) {
            const dateKey = sortedDates[i];
            const [year, month, day] = dateKey.split('-').map(Number);
            const checkDate = new Date(year, month, day);
            checkDate.setHours(0, 0, 0, 0);

            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);
            expectedDate.setHours(0, 0, 0, 0);

            if (checkDate.getTime() === expectedDate.getTime()) {
                streak++;
            } else if (i === 0 && checkDate < today) {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                if (checkDate.getTime() === yesterday.getTime()) {
                    streak = 1;
                    continue;
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        return streak;
    }

    function addHabit() {
        const text = inputBox.value.trim();
        if (text === "") return alert("Please write something before saving!");
        const now = new Date();
        const date = now.toLocaleDateString();
        const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

        if (editIndex !== null) {
            habits[editIndex].text = text;
            habits[editIndex].date = date;
            editIndex = null;
        } else {
            habits.unshift({
                text,
                date,
                createdDateKey: dateKey,
                lastCompletedDate: null,
                completed: false,
                completedDates: []
            });
        }

        inputBox.value = "";
        saveToLocal();
        renderHabits();
    }

    function updateTotalStreak() {
        const totalStreak = habits.reduce((sum, h) => {
            const streak = calculateConsecutiveStreak(h);
            return sum + streak;
        }, 0);
        const streakDisplay = document.querySelector(".streak");
        streakDisplay.innerHTML = `Streak Count - 🔥 ${totalStreak}`;
    }

    addBtn.addEventListener("click", addHabit);
    showMoreBtn.addEventListener("click", () => {
        showAll = !showAll;
        renderHabits();
    });

    document.addEventListener("keydown", (e) => {
        if (["Shift", "Control", "Alt", "Tab", "Escape"].includes(e.key)) return;
        const active = document.activeElement;
        if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) return;
        inputBox.focus();
    });

    // ⚙️ SETTINGS POPUP
    const settingsPopup = document.createElement("div");
    settingsPopup.className = "settings_popup hidden";
    settingsPopup.innerHTML = `
        <div class="settings_box">
            <h2>Settings</h2>
            <button id="export_habits">Export Habits (.txt)</button>
            <button id="clear_habits">Clear All Habits</button>
        </div>
    `;
    document.body.appendChild(settingsPopup);

    const overlay = document.createElement("div");
    overlay.className = "settings_overlay hidden";
    document.body.appendChild(overlay);

    settingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        settingsPopup.classList.remove("hidden");
        overlay.classList.remove("hidden");
    });

    overlay.addEventListener("click", () => {
        settingsPopup.classList.add("hidden");
        overlay.classList.add("hidden");
    });

    // Export Habits - FIXED
    document.querySelector("#export_habits").addEventListener("click", () => {
        if (habits.length === 0) {
            alert("No habits to export!");
        } else {
            const txt = habits.map(h => {
                const streak = calculateConsecutiveStreak(h);
                return `${h.text} | Streak: ${streak} | Created: ${h.date}`;
            }).join("\n");
            const blob = new Blob([txt], { type: "text/plain" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "habits.txt";
            a.click();
        }
        settingsPopup.classList.add("hidden");
        overlay.classList.add("hidden");
    });

    // Clear All - FIXED
    document.querySelector("#clear_habits").addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all habits?")) {
            habits = [];
            saveToLocal();
            renderHabits();
        }
        settingsPopup.classList.add("hidden");
        overlay.classList.add("hidden");
    });

    // 📱 Mobile Menu Implementation - FIXED
    function initializeMobileMenu() {
        const menuLogo = document.querySelector(".menu_logo");
        if (!menuLogo) return;

        const mobileMenu = document.createElement("div");
        mobileMenu.className = "mobile_menu_sidebar";
        // REMOVED Habit Tracker from menu since it's the current page
        mobileMenu.innerHTML = `
            <div class="mobile_menu_header">
                <h2 class="mobile_menu_title">Menu</h2>
                <button class="mobile_menu_close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18 6l-12 12" />
                        <path d="M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <nav class="mobile_menu_nav">
                <ul>
                    <li>
                        <a href="home.html" class="mobile_menu_item">
                            <svg class="menu_icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                            Home
                        </a>
                    </li>
                    <li>
                        <a href="timer.html" target="_blank" rel="noopener noreferrer" class="mobile_menu_item">
                            <svg class="menu_icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            Pomodoro Timer
                        </a>
                    </li>
                    <li>
                        <a href="notes.html" target="_blank" rel="noopener noreferrer" class="mobile_menu_item">
                            <svg class="menu_icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            Journal/Notes
                        </a>
                    </li>
                    <li>
                        <button class="mobile_menu_settings">
                            <svg class="menu_icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12C13.6569 12 15 10.6569 15 9Z"/>
                                <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"/>
                                <path d="M17 17C17 14.2386 14.7614 12 12 12C9.23858 12 7 14.2386 7 17"/>
                            </svg>
                            Settings
                        </button>
                    </li>
                </ul>
            </nav>
        `;

        const menuOverlay = document.createElement("div");
        menuOverlay.className = "mobile_menu_overlay";

        document.body.appendChild(mobileMenu);
        document.body.appendChild(menuOverlay);

        function toggleMobileMenu(show) {
            if (show) {
                mobileMenu.classList.add("active");
                menuOverlay.classList.add("active");
                document.body.style.overflow = "hidden";
            } else {
                mobileMenu.classList.remove("active");
                menuOverlay.classList.remove("active");
                document.body.style.overflow = "";
            }
        }

        menuLogo.parentElement.addEventListener("click", (e) => {
            e.preventDefault();
            toggleMobileMenu(true);
        });

        mobileMenu.querySelector(".mobile_menu_close").addEventListener("click", () => {
            toggleMobileMenu(false);
        });

        menuOverlay.addEventListener("click", () => {
            toggleMobileMenu(false);
        });

        mobileMenu.querySelectorAll(".mobile_menu_item").forEach(item => {
            item.addEventListener("click", () => {
                toggleMobileMenu(false);
            });
        });

        // FIXED: Settings button in mobile menu
        mobileMenu.querySelector(".mobile_menu_settings").addEventListener("click", () => {
            toggleMobileMenu(false);
            // Show settings popup using the already created elements
            settingsPopup.classList.remove("hidden");
            overlay.classList.remove("hidden");
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
                toggleMobileMenu(false);
            }
        });
    }

    initializeMobileMenu();
    renderHabits();
});