const sections = [...document.querySelectorAll("main > section")];
const tabs = [...document.querySelectorAll("[data-go]")];
const nowLabel = document.querySelector("#now-label");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let hashReady = !location.hash;

function activate(section) {
  const id = section.id;
  sections.forEach((node) => node.classList.toggle("is-active", node === section));
  section.classList.add("was-seen");
  document.body.dataset.world = section.dataset.world || "night";
  tabs.forEach((tab) => {
    const on = tab.dataset.go === id;
    tab.classList.toggle("is-on", on);
    if (on) tab.setAttribute("aria-current", "true");
    else tab.removeAttribute("aria-current");
  });
  if (nowLabel) nowLabel.textContent = section.dataset.name || "";
  if (hashReady && location.hash !== `#${id}`) history.replaceState(null, "", `#${id}`);
}

const ratios = new Map();
const watcher = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
    });
    let best = null;
    let bestRatio = 0;
    sections.forEach((section) => {
      const ratio = ratios.get(section) || 0;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = section;
      }
    });
    if (best) activate(best);
  },
  { threshold: [0.2, 0.35, 0.5, 0.7] },
);
sections.forEach((section) => watcher.observe(section));

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const section = document.getElementById(tab.dataset.go);
    if (!section) return;
    section.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });
});

const reel = document.querySelector("#reel");
if (reel) {
  document.querySelectorAll("[data-reel]").forEach((button) => {
    button.addEventListener("click", () => {
      const shots = [...reel.children];
      const left = reel.scrollLeft;
      const pad = parseFloat(getComputedStyle(reel).paddingLeft) || 0;
      const step = Number(button.dataset.reel);
      const current = shots.findIndex((shot) => shot.offsetLeft - pad >= left - 4);
      const next = shots[Math.max(0, Math.min(shots.length - 1, (current < 0 ? shots.length - 1 : current) + step))];
      reel.scrollTo({ left: next.offsetLeft - pad, behavior: reduce ? "auto" : "smooth" });
    });
  });
}

function noon(iso) {
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysUntil(iso) {
  const target = noon(iso);
  if (!target) return null;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

function whenLabel(days) {
  if (days > 1) return `Dans ${days} jours`;
  if (days === 1) return "Demain";
  if (days === 0) return "Aujourd’hui";
  return "Joué";
}

document.querySelectorAll("[data-date]").forEach((node) => {
  const days = daysUntil(node.dataset.date);
  if (days === null) return;
  const past = days < 0;
  node.classList.toggle("is-past", past);
  const badge = node.querySelector(":scope .badge");
  if (badge) badge.textContent = past ? "Joué" : days === 0 ? "Ce soir" : "À venir";
  if (past) {
    const button = node.querySelector(".btn");
    if (button && button.textContent.trim().startsWith("Billets")) {
      button.textContent = "Page Shotgun";
      button.classList.add("btn-light");
    }
  }
});

document.querySelectorAll("[data-countdown]").forEach((node) => {
  const days = daysUntil(node.dataset.countdown);
  if (days === null) return;
  node.textContent = whenLabel(days);
});

const cassette = document.querySelector("#cassette");
if (cassette) {
  let rotX = -18;
  let rotY = -34;
  let vx = 0;
  let vy = reduce ? 0 : 0.12;
  let holding = false;
  let lastX = 0;
  let lastY = 0;

  const paint = () => {
    cassette.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  };
  paint();

  const frame = () => {
    if (!holding) {
      rotY += vy;
      rotX += vx;
      vx *= 0.94;
      vy *= 0.96;
      if (rotX < -32) rotX = -32;
      if (rotX > 28) rotX = 28;
      if (!reduce && Math.abs(vy) < 0.08 && Math.abs(vx) < 0.04) vy = 0.12;
      paint();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  cassette.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    holding = true;
    vx = 0;
    vy = 0;
    lastX = event.clientX;
    lastY = event.clientY;
    cassette.setPointerCapture(event.pointerId);
    cassette.classList.add("is-holding");
  });

  cassette.addEventListener("pointermove", (event) => {
    if (!holding) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    vy = dx * 0.45;
    vx = -dy * 0.28;
    rotY += vy;
    rotX = Math.max(-32, Math.min(28, rotX + vx));
    paint();
  });

  const release = () => {
    if (!holding) return;
    holding = false;
    cassette.classList.remove("is-holding");
  };
  cassette.addEventListener("pointerup", release);
  cassette.addEventListener("pointercancel", release);

  cassette.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") rotY += 16;
    else if (event.key === "ArrowLeft") rotY -= 16;
    else if (event.key === "ArrowUp") rotX = Math.max(-32, rotX - 8);
    else if (event.key === "ArrowDown") rotX = Math.min(28, rotX + 8);
    else return;
    event.preventDefault();
    vx = 0;
    vy = 0;
    paint();
  });
}

const record = document.querySelector(".record");
if (record) {
  let angle = -18;
  let lastX = 0;
  let velocity = 0;
  let holding = false;
  let frame = 0;

  const paint = () => {
    record.style.transform = `rotate(${angle}deg)`;
  };
  paint();

  const coast = () => {
    if (holding || Math.abs(velocity) < 0.05) {
      velocity = 0;
      return;
    }
    angle += velocity;
    velocity *= 0.96;
    paint();
    frame = requestAnimationFrame(coast);
  };

  record.addEventListener("pointerdown", (event) => {
    holding = true;
    lastX = event.clientX;
    velocity = 0;
    cancelAnimationFrame(frame);
    record.setPointerCapture(event.pointerId);
    record.classList.add("is-holding");
  });

  record.addEventListener("pointermove", (event) => {
    if (!holding) return;
    const dx = event.clientX - lastX;
    lastX = event.clientX;
    velocity = dx * 0.65;
    angle += velocity;
    paint();
  });

  const release = () => {
    if (!holding) return;
    holding = false;
    record.classList.remove("is-holding");
    if (!reduce) frame = requestAnimationFrame(coast);
  };

  record.addEventListener("pointerup", release);
  record.addEventListener("pointercancel", release);
  record.addEventListener("dragstart", (event) => event.preventDefault());
}

if (location.hash) {
  const target = document.querySelector(location.hash);
  if (target) target.scrollIntoView();
  requestAnimationFrame(() => {
    hashReady = true;
  });
}
