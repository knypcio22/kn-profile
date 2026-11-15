if (window.lucide) lucide.createIcons();
    const profileTabs = [document.getElementById("aboutTab"), document.getElementById("settingsTab")];
    const profilePanels = [document.getElementById("aboutPanel"), document.getElementById("settingsPanel")];

    profileTabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        profileTabs.forEach((item, i) => {
          const isSelected = i === index;
          item.classList.toggle("is-active", isSelected);
          item.setAttribute("aria-selected", String(isSelected));
        });
        profilePanels.forEach((panel, i) => {
          if (panel) panel.hidden = i !== index;
        });
        if (index === 1) {
          const scrollBox = document.querySelector(".settings-scroll");
          if (scrollBox) scrollBox.scrollTop = 0;
        }
      });
    });
    const copySensBtn = document.getElementById("copySensBtn");
    if (copySensBtn) {
      copySensBtn.addEventListener("click", async () => {
        try {
          if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
          await navigator.clipboard.writeText("sensitivity 1.26");
          const orig = copySensBtn.textContent;
          copySensBtn.textContent = "Skopiowano!";
          setTimeout(() => copySensBtn.textContent = orig, 1800);
        } catch {
          copySensBtn.textContent = "Brak dostępu";
          setTimeout(() => copySensBtn.textContent = "Kopiuj sens", 1800);
        }
      });
    }
    if (window.VanillaTilt && window.matchMedia("(pointer: fine)").matches) {
      VanillaTilt.init(document.querySelectorAll(".profile"), {
        max: 7,
        speed: 500,
        glare: true,
        "max-glare": 0.1,
        scale: 1.01
      });
    }
    if (window.particlesJS) {
      particlesJS("particles", {
        particles: {
          number: { value: 45, density: { enable: true, value_area: 900 } },
          color: { value: "#d8dde5" },
          shape: { type: "circle" },
          opacity: { value: 0.25, random: true },
          size: { value: 2, random: true },
          line_linked: { enable: true, distance: 145, color: "#d8dde5", opacity: 0.12, width: 1 },
          move: { enable: true, speed: 0.6, direction: "none", random: true, straight: false, out_mode: "out" }
        },
        interactivity: {
          detect_on: "canvas",
          events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: false }, resize: true },
          modes: { grab: { distance: 150, line_linked: { opacity: 0.25 } } }
        },
        retina_detect: true
      });
    }
    const discordStatus = document.getElementById("discordStatus");
    const discordGame = document.getElementById("discordGame");
    const statusDot = document.getElementById("statusDot");
    const lanyardUrl = "https://api.lanyard.rest/v1/users/516273964499075073";

async function updateDiscordPresence() {
  try {
    const response = await fetch(lanyardUrl, {
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error("Presence unavailable");
    const result = await response.json();
    if (!result.success || !result.data) throw new Error("User not found");

    const data = result.data;
    const labels = {
      online: "ONLINE",
      idle: "NIEOBECNY",
      dnd: "NIE PRZESZKADZAĆ",
      offline: "OFFLINE"
    };

    const status = data.discord_status || "offline";
    discordStatus.textContent = labels[status] || "OFFLINE";
    statusDot.className = "dot " + status;
    const gameActivity = (data.activities || []).find(item => item.type === 0);

    if (gameActivity) {
      const name = gameActivity.name || "Gra";
      const details = gameActivity.details || "";
      const state = gameActivity.state || "";
      const isCS2 = /counter-strike|cs2|cs 2/i.test(name);

      if (isCS2) {
        let text = "CS2";
        
        if (details && state) {
          text = `CS2 · ${details} · ${state}`;
        } else if (details) {
          text = `CS2 · ${details}`;
        } else if (state) {
          text = `CS2 · ${state}`;
        } else {
          text = "Gra w CS2";
        }
        if (text.length > 42) text = text.slice(0, 39) + "…";
        discordGame.textContent = text;
      } else {
        let text = "Gra w " + name;
        if (details) text += ` · ${details}`;
        if (text.length > 42) text = text.slice(0, 39) + "…";
        discordGame.textContent = text;
      }
    } else if (data.listening_to_spotify && data.spotify) {
      const song = data.spotify.song || "";
      const artist = data.spotify.artist || "";
      let text = artist ? `Słucha: ${song} — ${artist}` : `Słucha: ${song}`;
      if (text.length > 42) text = text.slice(0, 39) + "…";
      discordGame.textContent = text;
    } else {
      discordGame.textContent = status === "offline" ? "Niedostępny" : "Nie gra teraz";
    }
  } catch (error) {
    discordStatus.textContent = "OFFLINE";
    statusDot.className = "dot error";
    discordGame.textContent = "Brak połączenia";
  }
}

    updateDiscordPresence();
    setInterval(updateDiscordPresence, 30000);
    const audio = document.getElementById("audio");
    const playBtn = document.getElementById("play");
    const volumeSlider = document.getElementById("volume");
    const gate = document.getElementById("gate");

    audio.volume = Number(volumeSlider.value);

    function syncPlayer() {
      playBtn.innerHTML = `<i data-lucide="${audio.paused ? 'play' : 'pause'}"></i>`;
      playBtn.classList.toggle('is-playing', !audio.paused);
      playBtn.setAttribute("aria-label", audio.paused ? "Odtwórz muzykę" : "Wstrzymaj muzykę");
      if (window.lucide) lucide.createIcons();
    }

    playBtn.addEventListener("click", async () => {
      if (audio.paused) {
        try { await audio.play(); } catch {}
      } else {
        audio.pause();
      }
      syncPlayer();
    });

    ["play", "pause", "ended", "error"].forEach(evt => audio.addEventListener(evt, syncPlayer));
    volumeSlider.addEventListener("input", () => audio.volume = Number(volumeSlider.value));

    function enterSite() {
      if (document.body.classList.contains("entered")) return;
      document.body.classList.add("entered");
      document.removeEventListener("keydown", handleKeyEnter);
      audio.play().catch(() => {});
      syncPlayer();
    }

    function handleKeyEnter(e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        enterSite();
      }
    }

    gate.addEventListener("click", enterSite);
    gate.addEventListener("keydown", handleKeyEnter);
    document.addEventListener("keydown", handleKeyEnter);
