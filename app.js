// 文案、插图和音频统一维护在这里，不需要改播放器逻辑。
const tracks = [
  {
    id: "intro",
    kind: "正在聆听",
    title: "给你的礼物",
    description: "愿这些书陪你穿过时间去远方。",
    subtitle: "A Letter Before the Books",
    image: "assets/images/wax-seal.webp",
    audio: "assets/audio/intro.mp3",
  },
  {
    id: "boy-mole-fox-horse",
    kind: "正在聆听",
    title: "《男孩、鼹鼠、狐狸和马》",
    cardTitle: "《男孩、鼹鼠、\n狐狸和马》",
    description: "你是很重要的存在，\n并且，你一直被爱着。",
    subtitle: "Charlie Mackesy",
    image: "assets/images/boy-mole-fox-horse.webp",
    audio: "assets/audio/book-01.mp3",
  },
  {
    id: "book-of-sand",
    kind: "正在聆听",
    title: "《沙之书》",
    cardTitle: "《沙之书》",
    description: "在有限的书页中\n通向无限的世界。",
    subtitle: "El libro de arena",
    image: "assets/images/book-of-sand.webp",
    audio: "assets/audio/book-02.mp3",
  },
  {
    id: "symposium",
    kind: "正在聆听",
    title: "《会饮篇》",
    cardTitle: "《会饮篇》",
    description: "我爱真善美\n也爱真实具体而不可替代的你",
    subtitle: "Symposium",
    image: "assets/images/symposium.webp",
    audio: "assets/audio/book-03.mp3",
  },
  {
    id: "order-of-time",
    kind: "正在聆听",
    title: "《时间的秩序》",
    cardTitle: "《时间的秩序》",
    description: "世界不在时间里\n时间在世界中",
    subtitle: "The Order of Time",
    image: "assets/images/order-of-time.webp",
    audio: "assets/audio/book-04.mp3",
  },
  {
    id: "invisible-cities",
    kind: "正在聆听",
    title: "《看不见的城市》",
    cardTitle: "《看不见的城市》",
    description: "把记忆、关系和情感放进城市，\n街道与建筑才有了不可替代的意义。",
    subtitle: "Le città invisibili",
    image: "assets/images/invisible-cities.webp",
    audio: "assets/audio/book-05.mp3",
  },
  {
    id: "all-quiet-things",
    kind: "正在聆听",
    title: "《万物静默如谜》",
    cardTitle: "《万物静默如谜》",
    description: "玫瑰是红的，紫罗兰是紫的\n糖是甜的，你也是",
    subtitle: "All Quiet Things",
    image: "assets/images/all-quiet-things.webp",
    audio: "assets/audio/book-06.mp3",
  },
];

const books = tracks.filter((track) => track.id !== "intro");
const trackById = new Map(tracks.map((track) => [track.id, track]));

const elements = {
  audio: document.querySelector("#audioPlayer"),
  bookGrid: document.querySelector("#bookGrid"),
  introButton: document.querySelector("#introButton"),
  panel: document.querySelector("#playerPanel"),
  trackArt: document.querySelector("#trackArt"),
  trackKind: document.querySelector("#trackKind"),
  trackTitle: document.querySelector("#trackTitle"),
  trackDescription: document.querySelector("#trackDescription"),
  currentTime: document.querySelector("#currentTime"),
  duration: document.querySelector("#duration"),
  progress: document.querySelector("#progressRange"),
  playButton: document.querySelector("#playButton"),
  playIcon: document.querySelector("#playIcon"),
  speedButtons: [...document.querySelectorAll("[data-speed]")],
  status: document.querySelector("#playerStatus"),
};

let activeTrackId = "intro";
let selectedSpeed = 1;
let isSeeking = false;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "--:--";
  }

  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function buildBookCards() {
  const fragment = document.createDocumentFragment();

  books.forEach((book) => {
    const button = document.createElement("button");
    button.className = "book-card";
    button.type = "button";
    button.dataset.trackId = book.id;
    button.setAttribute("aria-pressed", String(book.id === activeTrackId));
    button.setAttribute("aria-label", `选择${book.title}`);

    const title = document.createElement("span");
    title.className = "book-card__title";
    title.textContent = book.cardTitle;
    title.style.whiteSpace = "pre-line";

    const art = document.createElement("img");
    art.className = "book-card__art";
    art.src = book.image;
    art.alt = "";
    art.width = 760;
    art.height = 760;

    const subtitle = document.createElement("span");
    subtitle.className = "book-card__subtitle";
    subtitle.textContent = book.subtitle;

    const seal = document.createElement("img");
    seal.className = "book-card__seal";
    seal.src = "assets/images/wax-seal.webp";
    seal.alt = "";
    seal.width = 360;
    seal.height = 359;

    button.append(title, art, subtitle, seal);
    button.addEventListener("click", () => selectTrack(book.id));
    fragment.append(button);
  });

  elements.bookGrid.append(fragment);
  updateSelectionState();
}

function updateSelectionState() {
  const isIntro = activeTrackId === "intro";
  elements.introButton.classList.toggle("is-active", isIntro);
  elements.introButton.setAttribute("aria-pressed", String(isIntro));

  document.querySelectorAll(".book-card").forEach((card) => {
    const isSelected = card.dataset.trackId === activeTrackId;
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });
}

function renderTrack(track) {
  elements.trackArt.style.opacity = "0";
  elements.trackArt.style.transform = "scale(0.92)";

  window.setTimeout(() => {
    elements.trackArt.src = track.image;
    elements.trackArt.style.opacity = "1";
    elements.trackArt.style.transform = "scale(1)";
  }, 90);

  elements.trackKind.textContent = track.kind;
  elements.trackTitle.textContent = track.title;
  elements.trackDescription.textContent = track.description;
}

async function selectTrack(trackId, { scrollToPlayer = false } = {}) {
  const track = trackById.get(trackId);
  if (!track || trackId === activeTrackId) {
    if (scrollToPlayer) {
      elements.panel.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  const shouldResume = !elements.audio.paused;
  elements.audio.pause();
  activeTrackId = trackId;
  renderTrack(track);
  updateSelectionState();

  elements.audio.src = track.audio;
  elements.audio.load();
  elements.audio.playbackRate = selectedSpeed;
  resetProgress();
  elements.status.textContent = `已切换到${track.title}`;

  if (scrollToPlayer) {
    elements.panel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (shouldResume) {
    try {
      await elements.audio.play();
    } catch {
      updatePlayState(false);
    }
  }
}

function updatePlayState(isPlaying) {
  elements.playButton.classList.toggle("is-playing", isPlaying);
  elements.playButton.setAttribute("aria-label", isPlaying ? "暂停" : "播放");
  elements.playIcon.textContent = isPlaying ? "Ⅱ" : "▶";
  elements.status.textContent = isPlaying ? "正在播放" : "已暂停";
}

async function togglePlayback() {
  if (elements.audio.paused) {
    try {
      await elements.audio.play();
    } catch {
      elements.status.textContent = "暂时无法播放，请再次轻点播放按钮。";
    }
  } else {
    elements.audio.pause();
  }
}

function resetProgress() {
  elements.currentTime.textContent = "0:00";
  elements.duration.textContent = "--:--";
  elements.progress.value = "0";
  elements.progress.style.setProperty("--progress", "0%");
  elements.progress.setAttribute("aria-valuetext", "0:00");
}

function syncTimeline() {
  if (isSeeking) {
    return;
  }

  const duration = elements.audio.duration;
  const currentTime = elements.audio.currentTime;
  const percentage = Number.isFinite(duration) && duration > 0 ? (currentTime / duration) * 100 : 0;

  elements.currentTime.textContent = formatTime(currentTime);
  elements.duration.textContent = formatTime(duration);
  elements.progress.value = String(percentage);
  elements.progress.style.setProperty("--progress", `${percentage}%`);
  elements.progress.setAttribute(
    "aria-valuetext",
    `${formatTime(currentTime)} / ${formatTime(duration)}`,
  );
}

function seekFromRange() {
  const duration = elements.audio.duration;
  if (!Number.isFinite(duration) || duration <= 0) {
    return;
  }

  const percentage = Number(elements.progress.value);
  elements.audio.currentTime = (percentage / 100) * duration;
  isSeeking = false;
  syncTimeline();
}

function previewRange() {
  isSeeking = true;
  const percentage = Number(elements.progress.value);
  const duration = elements.audio.duration;
  elements.progress.style.setProperty("--progress", `${percentage}%`);

  if (Number.isFinite(duration) && duration > 0) {
    const previewTime = (percentage / 100) * duration;
    elements.currentTime.textContent = formatTime(previewTime);
    elements.progress.setAttribute(
      "aria-valuetext",
      `${formatTime(previewTime)} / ${formatTime(duration)}`,
    );
  }
}

function setSpeed(speed) {
  selectedSpeed = speed;
  elements.audio.playbackRate = speed;
  elements.speedButtons.forEach((button) => {
    const isActive = Number(button.dataset.speed) === speed;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  elements.status.textContent = `播放速度 ${speed} 倍`;
}

elements.introButton.addEventListener("click", () => {
  selectTrack("intro", { scrollToPlayer: true });
});

elements.playButton.addEventListener("click", togglePlayback);
elements.progress.addEventListener("input", previewRange);
elements.progress.addEventListener("change", seekFromRange);

elements.speedButtons.forEach((button) => {
  button.addEventListener("click", () => setSpeed(Number(button.dataset.speed)));
});

elements.audio.addEventListener("loadedmetadata", syncTimeline);
elements.audio.addEventListener("durationchange", syncTimeline);
elements.audio.addEventListener("timeupdate", syncTimeline);
elements.audio.addEventListener("play", () => updatePlayState(true));
elements.audio.addEventListener("pause", () => updatePlayState(false));
elements.audio.addEventListener("ended", () => {
  updatePlayState(false);
  elements.audio.currentTime = 0;
  syncTimeline();
});
elements.audio.addEventListener("error", () => {
  updatePlayState(false);
  elements.status.textContent = "音频加载失败，请确认音频文件仍在 assets/audio 中。";
});

if ("preservesPitch" in elements.audio) {
  elements.audio.preservesPitch = true;
}
if ("webkitPreservesPitch" in elements.audio) {
  elements.audio.webkitPreservesPitch = true;
}

function initializePlayer() {
  const initialTrack = trackById.get(activeTrackId);
  elements.trackArt.src = initialTrack.image;
  elements.trackKind.textContent = initialTrack.kind;
  elements.trackTitle.textContent = initialTrack.title;
  elements.trackDescription.textContent = initialTrack.description;
  elements.audio.src = initialTrack.audio;

  buildBookCards();
  setSpeed(1);
  elements.audio.load();
}

initializePlayer();
