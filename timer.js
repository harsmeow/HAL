document.addEventListener("DOMContentLoaded", () => {
  const pomodoroBtn = document.querySelector(".pomodoro");
  const shortBreakBtn = document.querySelector(".short_break");
  const longBreakBtn = document.querySelector(".long_break");
  const startBtn = document.querySelector(".start");
  const resetSvg = document.querySelector(".reset");
  const minuteEl = document.querySelector(".hour");
  const secondEl = document.querySelector(".minutes");
  const settingsBtns = document.querySelectorAll(".settings");
  const popup = document.querySelector(".settings_popup");
  const pomodoroInput = document.getElementById("pomodoro_input");
  const shortInput = document.getElementById("short_input");
  const longInput = document.getElementById("long_input");
  const soundDurationInput = document.getElementById("sound_duration");
  const customSoundInput = document.getElementById("custom_sound");
  const saveBtn = document.getElementById("save_settings");
  const closeBtn = document.getElementById("close_settings");

  const tabButtons = document.querySelectorAll(".tab_btn");
  const tabContents = document.querySelectorAll(".tab_content");

  if (!minuteEl || !secondEl) return;

  // Load saved data
  const durations = {
    pomodoro: parseInt(localStorage.getItem("pomodoroTime")) || 25,
    short: parseInt(localStorage.getItem("shortTime")) || 5,
    long: parseInt(localStorage.getItem("longTime")) || 15,
  };

  let soundDuration = parseInt(localStorage.getItem("soundDuration")) || 5;
  let customSound = localStorage.getItem("customSound") || null;

  let timerSeconds = durations.pomodoro * 60;
  let intervalId = null;
  let running = false;
  let currentSound;
  let celebrationActive = false;

  function updateDisplay() {
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    minuteEl.textContent = String(m).padStart(2, "0");
    secondEl.textContent = String(s).padStart(2, "0");
  }

  function stopTimer() {
    clearInterval(intervalId);
    intervalId = null;
    running = false;
    startBtn.textContent = "Start";
  }

  function startTimer() {
    if (running) return;
    running = true;
    startBtn.textContent = "Pause";
    intervalId = setInterval(() => {
      if (timerSeconds > 0) {
        timerSeconds--;
        updateDisplay();
      } else {
        stopTimer();
        triggerCelebration();
        playSound();
        setTimeout(() => {
          stopSound();
          stopCelebration();
          resetToActive();
        }, soundDuration * 1000);
      }
    }, 1000);
  }

  function toggleStartPause() {
    running ? stopTimer() : startTimer();
  }

  function resetToActive() {
    stopTimer();
    stopCelebration();
    stopSound();
    if (pomodoroBtn.classList.contains("active"))
      timerSeconds = durations.pomodoro * 60;
    else if (shortBreakBtn.classList.contains("active"))
      timerSeconds = durations.short * 60;
    else if (longBreakBtn.classList.contains("active"))
      timerSeconds = durations.long * 60;
    updateDisplay();
  }

  function setActive(btn) {
    [pomodoroBtn, shortBreakBtn, longBreakBtn].forEach(b =>
      b.classList.remove("active")
    );
    btn.classList.add("active");
  }

  // Celebration (confetti)
  function triggerCelebration() {
    celebrationActive = true;
    const popper = document.createElement("div");
    popper.className = "celebration";
    for (let i = 0; i < 40; i++) {
      const confetti = document.createElement("span");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.background = `hsl(${Math.floor(Math.random() * 360)},80%,60%)`;
      confetti.style.animationDelay = Math.random() * 1.5 + "s";
      popper.appendChild(confetti);
    }
    document.body.appendChild(popper);
    setTimeout(() => stopCelebration(), soundDuration * 1000);
  }

  function stopCelebration() {
    celebrationActive = false;
    document.querySelectorAll(".celebration").forEach(el => el.remove());
  }

  // Sound
  function playSound() {
    stopSound();
    currentSound = new Audio(customSound || "assets/clap.mp3");
    currentSound.play();
    setTimeout(stopSound, soundDuration * 1000);
  }

  function stopSound() {
    if (currentSound) {
      currentSound.pause();
      currentSound.currentTime = 0;
    }
  }

  // Tabs
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      tabContents.forEach(tab => tab.classList.add("hidden"));
      document.getElementById(btn.dataset.tab + "_tab").classList.remove("hidden");
    });
  });

  // Custom sound upload
  customSoundInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      customSound = url;
      localStorage.setItem("customSound", customSound);
    }
  });

  // Settings popup
  // Open settings popup from any settings icon (desktop or mobile)
  settingsBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent menu close
      mobileMenu?.classList.remove("active"); // close mobile menu if open
      pomodoroInput.value = durations.pomodoro;
      shortInput.value = durations.short;
      longInput.value = durations.long;
      soundDurationInput.value = soundDuration;
      popup.classList.remove("hidden");
    });
  });

  closeBtn.addEventListener("click", () => popup.classList.add("hidden"));
  popup.addEventListener("click", e => {
    if (e.target === popup) popup.classList.add("hidden");
  });

  // Save settings
  saveBtn.addEventListener("click", () => {
    durations.pomodoro = parseInt(pomodoroInput.value) || durations.pomodoro;
    durations.short = parseInt(shortInput.value) || durations.short;
    durations.long = parseInt(longInput.value) || durations.long;
    soundDuration = parseInt(soundDurationInput.value) || soundDuration;

    localStorage.setItem("pomodoroTime", durations.pomodoro);
    localStorage.setItem("shortTime", durations.short);
    localStorage.setItem("longTime", durations.long);
    localStorage.setItem("soundDuration", soundDuration);
    if (customSound) localStorage.setItem("customSound", customSound);

    resetToActive();
    popup.classList.add("hidden");
  });

  // Button logic
  startBtn.addEventListener("click", toggleStartPause);
  resetSvg.addEventListener("click", resetToActive);

  pomodoroBtn.addEventListener("click", () => {
    setActive(pomodoroBtn);
    timerSeconds = durations.pomodoro * 60;
    resetToActive();
  });

  shortBreakBtn.addEventListener("click", () => {
    setActive(shortBreakBtn);
    timerSeconds = durations.short * 60;
    resetToActive();
  });

  longBreakBtn.addEventListener("click", () => {
    setActive(longBreakBtn);
    timerSeconds = durations.long * 60;
    resetToActive();
  });

  const clickMe = document.querySelector('.click_me');
  const bgInput = document.getElementById('bgInput');

  clickMe.addEventListener('click', () => bgInput.click());

  bgInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      document.body.style.backgroundImage = `url(${event.target.result})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";

      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0;
        const totalPixels = imageData.length / 4;

        for (let i = 0; i < imageData.length; i += 4) {
          r += imageData[i];
          g += imageData[i + 1];
          b += imageData[i + 2];
        }

        r /= totalPixels;
        g /= totalPixels;
        b /= totalPixels;

        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        const textColor = brightness < 128 ? "#ffffff" : "#000000";
        const bgColor = brightness < 128 ? "#00000055" : "#ffffffcc";
        const borderColor = brightness < 128 ? "#ffffff99" : "#00000099";

        // 1️⃣ Apply to entire page
        document.body.style.color = textColor;
        clickMe.style.color = textColor;
        // Apply color change globally, including popup text
        document.querySelectorAll('body')
          .forEach(el => {
            el.style.color = textColor;
          });



        // 2️⃣ Update all buttons
        document.querySelectorAll("button").forEach(btn => {
          btn.style.color = textColor;
          btn.style.borderColor = borderColor;
          btn.style.backgroundColor = bgColor;
        });

        // 3️⃣ Update nav links
        document.querySelectorAll(".nav_items, .logo, .menu_logo").forEach(link => {
          link.style.color = textColor;
        });

        // 4️⃣ Update SVG icons
        document.querySelectorAll("svg").forEach(svg => {
          svg.style.stroke = textColor;
          svg.style.fill = "none";
        });
      };
    };
    reader.readAsDataURL(file);
  });

  const menuLogo = document.querySelector(".menu_logo");
  const mobileMenu = document.querySelector(".mobile_menu");
  const closeMenu = document.querySelector(".close_menu");

  if (menuLogo && mobileMenu && closeMenu) {
    menuLogo.addEventListener("click", (e) => {
      e.preventDefault();
      mobileMenu.classList.add("active");
    });

    closeMenu.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
    });

    // close when clicking outside
    document.addEventListener("click", (e) => {
      if (!mobileMenu.contains(e.target) && !menuLogo.contains(e.target)) {
        mobileMenu.classList.remove("active");
      }
    });
  }

  // Init
  setActive(pomodoroBtn);
  timerSeconds = durations.pomodoro * 60;
  updateDisplay();
});
