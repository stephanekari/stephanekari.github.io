const viewport = document.querySelector("#deck");
const track = document.querySelector("#track");
const sections = [...track.querySelectorAll(":scope > section")];
const tabs = [...document.querySelectorAll("[data-go]")];
const nowLabel = document.querySelector("#now-label");

let index = 0;
let drag = null;

document.documentElement.classList.add("is-deck");

function clamp(n) {
  return Math.max(0, Math.min(sections.length - 1, n));
}

function go(next) {
  index = clamp(next);
  track.style.transition = "";
  track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
  sections.forEach((section, i) => {
    const on = i === index;
    section.classList.toggle("is-active", on);
    section.toggleAttribute("inert", !on);
  });
  tabs.forEach((tab, i) => {
    const on = i === index;
    tab.classList.toggle("is-on", on);
    if (on) tab.setAttribute("aria-current", "true");
    else tab.removeAttribute("aria-current");
  });
  const name = sections[index].dataset.name || "";
  if (nowLabel) nowLabel.textContent = name;
  const id = sections[index].id;
  if (location.hash !== `#${id}`) {
    history.replaceState(null, "", `#${id}`);
  }
}

function startFromHash() {
  const id = location.hash.replace("#", "");
  const found = sections.findIndex((section) => section.id === id);
  go(found >= 0 ? found : 0);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => go(Number(tab.dataset.go)));
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href^='#']");
  if (!link) return;
  const id = link.getAttribute("href").slice(1);
  const found = sections.findIndex((section) => section.id === id);
  if (found < 0) return;
  event.preventDefault();
  go(found);
});

window.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.target.closest("input, textarea, select")) return;
  if (event.key === "ArrowRight") {
    event.preventDefault();
    go(index + 1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    go(index - 1);
  }
});

viewport.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  if (event.target.closest(".record, a, button, input, textarea, iframe")) return;
  drag = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    horiz: null,
  };
});

viewport.addEventListener("pointermove", (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  if (drag.horiz === null) {
    if (Math.hypot(dx, dy) < 10) return;
    drag.horiz = Math.abs(dx) > Math.abs(dy) * 1.2;
    if (!drag.horiz) {
      drag = null;
      return;
    }
    viewport.setPointerCapture(event.pointerId);
  }
  event.preventDefault();
  track.style.transition = "none";
  const px = -index * viewport.clientWidth + dx;
  track.style.transform = `translate3d(${px}px, 0, 0)`;
  drag.dx = dx;
});

function endDrag(event) {
  if (!drag || event.pointerId !== drag.id) return;
  const dx = drag.dx || 0;
  const horiz = drag.horiz;
  drag = null;
  if (horiz && Math.abs(dx) > 56) go(index + (dx < 0 ? 1 : -1));
  else go(index);
}

viewport.addEventListener("pointerup", endDrag);
viewport.addEventListener("pointercancel", endDrag);

let wheelLock = false;
viewport.addEventListener(
  "wheel",
  (event) => {
    const section = sections[index];
    const mostlyY = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
    if (mostlyY && section) {
      const down = event.deltaY > 0;
      const canDown =
        section.scrollTop + section.clientHeight < section.scrollHeight - 4;
      const canUp = section.scrollTop > 4;
      if ((down && canDown) || (!down && canUp)) return;
    }
    event.preventDefault();
    if (wheelLock) return;
    const delta = mostlyY ? event.deltaY : event.deltaX;
    if (Math.abs(delta) < 8) return;
    wheelLock = true;
    go(index + (delta > 0 ? 1 : -1));
    window.setTimeout(() => {
      wheelLock = false;
    }, 520);
  },
  { passive: false },
);

const record = document.querySelector(".record");
if (record) {
  let angle = 0;
  let lastX = 0;
  let velocity = 0;
  let holding = false;
  let frame = 0;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const paint = () => {
    record.style.transform = `rotate(${angle}deg)`;
  };

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
  const badge = node.querySelector(":scope > .badge, :scope > .ticket-body > .badge");
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

startFromHash();
window.addEventListener("hashchange", startFromHash);
