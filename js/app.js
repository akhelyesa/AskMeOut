const askScene = document.querySelector("#ask-scene");
const shockScene = document.querySelector("#shock-scene");
const planScene = document.querySelector("#plan-scene");
const activityScene = document.querySelector("#activity-scene");
const yesScene = document.querySelector("#yes-scene");
const yesBtn = document.querySelector("#ask-scene .yes-btn");
const shockNext = document.querySelector("#shock-next");
const dayRow = document.querySelector("#day-row");
const timeList = document.querySelector("#time-list");
const timeJoke = document.querySelector("#time-joke");
const weekPrev = document.querySelector("#week-prev");
const weekNext = document.querySelector("#week-next");
const lockPlan = document.querySelector("#lock-plan");
const activityList = document.querySelector("#activity-list");
const foodCard = document.querySelector("#food-card");
const foodList = document.querySelector("#food-list");
const otherPlans = document.querySelector("#other-plans");
const activityJoke = document.querySelector("#activity-joke");
const setActivity = document.querySelector("#set-activity");
const yesTitle = document.querySelector("#yes-title");
const yesPlan = document.querySelector("#yes-plan");
const yesFoods = document.querySelector("#yes-foods");
const yesHint = document.querySelector("#yes-hint");
const copyPlan = document.querySelector("#copy-plan");
const heartBit = document.querySelector(".heart-bit");
const lateBit = document.querySelector(".late-bit");
const heartLine = document.querySelector(".heart-line");
const bpm = document.querySelector("#bpm");
const yesGrow = document.querySelector(".yes-grow");
const noBtn = document.querySelector(".no-btn");
const noMover = document.querySelector(".no-mover");

const RADIUS = 130;
const CATCH = RADIUS * 0.55;
const HOP = 240;
const INSET = 12;
const LABELS = ["No", "Please?", "Rude", "Yeah right"];
const LABEL_HOLD = 900;

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let inside = false;
let aimed = false;
let inCatch = false;
let hops = 0;
let wasOver = false;
let labelAt = 0;
let pointer = null;
let x = 0;
let y = 0;
let vx = 0;
let vy = 0;
let holdX = 0;
let holdY = 0;
let frame = 0;
let last = 0;

const BEATS = [72, 74, 88, 120, 180, 240, "lol"];
let lateTimer = 0;

function show(scene) {
  scene.hidden = false;
  scene.classList.remove("enter");
  void scene.offsetWidth;
  scene.classList.add("enter");
}

function playHeart() {
  const length = heartLine.getTotalLength();
  heartLine.style.strokeDasharray = String(length);
  if (reduceMotion.matches) {
    heartLine.style.transition = "none";
    heartLine.style.strokeDashoffset = "0";
    bpm.textContent = "lol";
    return;
  }

  heartLine.style.transition = "none";
  heartLine.style.strokeDashoffset = String(length);
  requestAnimationFrame(() => {
    heartLine.style.transition = "stroke-dashoffset 1.6s linear";
    heartLine.style.strokeDashoffset = "0";
  });

  BEATS.forEach((value, i) => {
    setTimeout(() => {
      bpm.textContent = value;
    }, 400 + i * 180);
  });
}

function showLate() {
  window.clearTimeout(lateTimer);
  lateTimer = 0;
  heartBit.hidden = true;
  lateBit.hidden = false;
}

yesBtn.addEventListener("click", () => {
  askScene.hidden = true;
  show(shockScene);
  playHeart();
  if (reduceMotion.matches) {
    showLate();
    return;
  }
  lateTimer = window.setTimeout(showLate, 2300);
});

shockScene.addEventListener("click", () => {
  if (!lateBit.hidden) return;
  showLate();
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TIMES = [
  ["5:00 PM", "I haven't emotionally arrived yet"],
  ["6:00 PM", "Sure. Why not"],
  ["7:00 PM", "Now we're talking"],
  ["8:00 PM", "I will be hungry"],
  ["9:00 PM", "Risky. My pajamas are already negotiating"],
  ["10:00 PM", "I have become one with my bed"],
];

const PLANS = [
  ["Food", "You pick. I'll pretend I'm easy to please"],
  ["Bowling", "Competitive until one of us gets humbled"],
  ["Pottery or painting", "We make something questionable and call it art"],
  ["Mini golf", "It's not competitive. Until it is"],
  ["Walk in the park", "Fresh air and suspiciously good conversation"],
  ["Escape room", "Let's find out how well we panic together"],
  ["Fight (boxing gloves provided)", "A romantic evening, apparently"],
  ["Try something neither of us has done", "Low expectations. High potential for a story"],
];

const FOODS = [
  "Classic dinner",
  "Italian",
  "Japanese",
  "Korean",
  "Turkish",
  "Mexican",
  "Thai",
  "Dessert date",
];

const MAX_WEEK = 4;

let selectedDay = "";
let selectedTime = "";
let selectedTimeJoke = "";
let selectedPlan = "";
let selectedPlanJoke = "";
const selectedFoods = new Set();
let weekOffset = 0;
let weekToken = 0;

function atNoon(date) {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

function tomorrow() {
  const date = atNoon(new Date());
  date.setDate(date.getDate() + 1);
  return date;
}

function startOfWeek(date) {
  const copy = atNoon(date);
  const day = copy.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + mondayOffset);
  return copy;
}

const firstMonday = startOfWeek(tomorrow());

function formatDay(date) {
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

function pressChip(group, button) {
  group.querySelectorAll("button").forEach((chip) => {
    chip.setAttribute("aria-pressed", String(chip === button));
  });
}

function renderWeek() {
  dayRow.replaceChildren();
  const monday = new Date(firstMonday);
  monday.setDate(firstMonday.getDate() + weekOffset * 7);

  for (let i = 0; i < 7; i += 1) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const label = formatDay(date);
    const button = document.createElement("button");
    const dayNum = document.createElement("span");
    const month = document.createElement("span");
    button.type = "button";
    button.className = "day-chip";
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", String(label === selectedDay));
    if (date < tomorrow()) button.disabled = true;
    dayNum.className = "day-num";
    dayNum.textContent = String(date.getDate());
    month.className = "day-month";
    month.textContent = MONTHS[date.getMonth()];
    button.append(dayNum, month);
    button.addEventListener("click", () => {
      selectedDay = label;
      pressChip(dayRow, button);
    });
    dayRow.append(button);
  }

  weekPrev.disabled = weekOffset === 0;
  weekNext.disabled = weekOffset === MAX_WEEK;
}

function renderPlan() {
  selectedDay = formatDay(tomorrow());
  renderWeek();

  TIMES.forEach(([hour, joke]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "time-chip";
    button.textContent = hour;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      selectedTime = hour;
      selectedTimeJoke = joke;
      timeJoke.textContent = joke;
      pressChip(timeList, button);
      lockPlan.disabled = false;
    });
    timeList.append(button);
  });
}

let foodCardTimer = 0;
let foodCardToken = 0;

function clearFoodPick() {
  selectedFoods.clear();
  foodList.querySelectorAll("button").forEach((chip) => {
    chip.setAttribute("aria-pressed", "false");
  });
}

function selectedFoodLabel() {
  return FOODS.filter((food) => selectedFoods.has(food)).join(", ");
}

function showFoodCard(foodButton) {
  const token = ++foodCardToken;
  window.clearTimeout(foodCardTimer);
  activityList.querySelectorAll(".choice-chip").forEach((chip) => {
    chip.hidden = chip !== foodButton;
  });
  activityJoke.hidden = true;
  if (!foodCard.hidden && foodCard.style.opacity !== "0") return;
  foodCard.style.opacity = "0";
  foodCard.style.transform = "translateY(4px)";
  foodCard.hidden = false;
  if (reduceMotion.matches) {
    foodCard.style.opacity = "1";
    foodCard.style.transform = "";
    return;
  }
  requestAnimationFrame(() => {
    if (token !== foodCardToken) return;
    foodCard.style.opacity = "1";
    foodCard.style.transform = "translateY(0)";
  });
}

function hideFoodCard() {
  const token = ++foodCardToken;
  window.clearTimeout(foodCardTimer);
  activityList.querySelectorAll(".choice-chip").forEach((chip) => {
    chip.hidden = false;
  });
  activityJoke.hidden = false;
  if (foodCard.hidden) return;
  if (reduceMotion.matches) {
    foodCard.hidden = true;
    foodCard.style.opacity = "";
    foodCard.style.transform = "";
    return;
  }
  foodCard.style.opacity = "0";
  foodCard.style.transform = "translateY(4px)";
  foodCardTimer = window.setTimeout(() => {
    if (token !== foodCardToken) return;
    foodCard.hidden = true;
    foodCard.style.opacity = "";
    foodCard.style.transform = "";
  }, 200);
}

const PLAN_ICONS = {
  Food: "<path d=\"M6 4v7a2 2 0 0 0 4 0V4\"/><path d=\"M8 4v16\"/><path d=\"M16 4c2 3 2 5 0 7v9\"/>",
  Bowling: "<circle cx=\"12\" cy=\"12\" r=\"7\"/><circle cx=\"9.4\" cy=\"9.8\" r=\"1.7\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"13.2\" cy=\"11.2\" r=\"1.7\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"10.4\" cy=\"13.8\" r=\"1.7\" fill=\"currentColor\" stroke=\"none\"/>",
  "Pottery or painting": "<path d=\"M4 20h16\"/><path d=\"M8 20c.4-4 1.2-7 4-9 2.8 2 3.6 5 4 9\"/><path d=\"M14 5l5 2-5 2\"/><path d=\"M14 5c-2 1-3 3-2 5\"/>",
  "Mini golf": "<path d=\"M8 20V5\"/><path d=\"M8 5h8l-2.2 3.2L16 11H8\"/><circle cx=\"16\" cy=\"17\" r=\"2\"/>",
  "Walk in the park": "<path d=\"M12 21v-7\"/><path d=\"M12 14c-4 0-6-2.4-5-5.5C8.2 8.5 9.4 9.4 12 11c2.6-1.6 3.8-2.5 5-2.5 1 3.1-1 5.5-5 5.5z\"/>",
  "Fight (boxing gloves provided)": "<path d=\"M8 11V8a1.8 1.8 0 0 1 3.6 0V11\"/><path d=\"M11.6 10.2V7.2a1.8 1.8 0 0 1 3.6 0v4.2\"/><path d=\"M15.2 9.4V8a1.8 1.8 0 0 1 3.5.4c.2 2.2.2 4.2-.2 6.2-1 3.2-3.4 5.4-7 5.4h-.8c-2.6 0-4.4-1.6-4.7-4.2L6 12.2A2 2 0 0 1 8 10.2\"/>",
  "Escape room": "<path d=\"M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16\"/><path d=\"M4 21h16\"/><circle cx=\"15\" cy=\"12\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/>",
  "Try something neither of us has done": "<path d=\"M12 3v3\"/><path d=\"M12 18v3\"/><path d=\"M3 12h3\"/><path d=\"M18 12h3\"/><path d=\"M5.6 5.6l2.1 2.1\"/><path d=\"M16.3 16.3l2.1 2.1\"/><path d=\"M18.4 5.6l-2.1 2.1\"/><path d=\"M7.7 16.3l-2.1 2.1\"/>",
};

function choiceIcon(markup) {
  const holder = document.createElement("span");
  holder.className = "choice-icon";
  holder.setAttribute("aria-hidden", "true");
  holder.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${markup}</svg>`;
  return holder;
}

function labeledChip(button, label, markup) {
  const text = document.createElement("span");
  text.className = "choice-label";
  text.textContent = label;
  button.append(choiceIcon(markup), text);
}

function renderActivities() {
  PLANS.forEach(([label, joke]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-chip";
    if (label === "Fight (boxing gloves provided)" || label === "Try something neither of us has done") {
      button.classList.add("choice-wide");
    }
    labeledChip(button, label, PLAN_ICONS[label]);
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      selectedPlan = label;
      selectedPlanJoke = joke;
      activityJoke.textContent = joke;
      pressChip(activityList, button);
      if (label === "Food") {
        showFoodCard(button);
      } else {
        hideFoodCard();
        clearFoodPick();
      }
      setActivity.disabled = label === "Food" && selectedFoods.size === 0;
    });
    activityList.append(button);
    if (label === "Food") button.after(foodCard);
  });

  FOODS.forEach((food) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "time-chip";
    button.textContent = food;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      const on = button.getAttribute("aria-pressed") === "true";
      if (on) selectedFoods.delete(food);
      else selectedFoods.add(food);
      button.setAttribute("aria-pressed", String(!on));
      setActivity.disabled = selectedFoods.size === 0;
    });
    foodList.append(button);
  });
}

otherPlans.addEventListener("click", () => {
  hideFoodCard();
  clearFoodPick();
  activityList.querySelectorAll(".choice-chip").forEach((chip) => {
    chip.setAttribute("aria-pressed", "false");
  });
  setActivity.disabled = true;
});

function turnWeek(direction) {
  const next = weekOffset + direction;
  if (next < 0 || next > MAX_WEEK) return;
  weekOffset = next;
  if (reduceMotion.matches) {
    renderWeek();
    return;
  }

  const token = ++weekToken;
  const outX = direction > 0 ? -12 : 12;
  dayRow.style.transition = "transform 180ms ease-out, opacity 180ms ease-out";
  dayRow.style.transform = `translateX(${outX}px)`;
  dayRow.style.opacity = "0";

  window.setTimeout(() => {
    if (token !== weekToken) return;
    renderWeek();
    dayRow.style.transition = "none";
    dayRow.style.transform = `translateX(${-outX}px)`;
    dayRow.style.opacity = "0";
    void dayRow.offsetWidth;
    if (token !== weekToken) return;
    dayRow.style.transition = "transform 180ms ease-out, opacity 180ms ease-out";
    dayRow.style.transform = "translateX(0)";
    dayRow.style.opacity = "1";
  }, 180);
}

weekPrev.addEventListener("click", () => {
  turnWeek(-1);
});

weekNext.addEventListener("click", () => {
  turnWeek(1);
});

shockNext.addEventListener("click", () => {
  shockScene.hidden = true;
  show(planScene);
});

lockPlan.addEventListener("click", () => {
  planScene.hidden = true;
  show(activityScene);
});

function planMessage() {
  const lines = [selectedDay, selectedTime, selectedPlan];
  if (selectedPlan === "Food") lines.push(selectedFoodLabel());
  return lines.join("\n");
}

setActivity.addEventListener("click", () => {
  const line = document.createElement("br");
  yesTitle.replaceChildren(selectedDay, line, selectedTime);
  yesPlan.textContent = selectedPlan;
  yesFoods.replaceChildren();
  if (selectedPlan === "Food") {
    FOODS.filter((food) => selectedFoods.has(food)).forEach((food) => {
      const item = document.createElement("li");
      item.textContent = food;
      yesFoods.append(item);
    });
    yesFoods.hidden = false;
  } else {
    yesFoods.hidden = true;
  }
  if (selectedPlan === "Food") {
    yesHint.hidden = true;
  } else {
    yesHint.hidden = false;
    yesHint.textContent = selectedPlanJoke || selectedTimeJoke;
  }
  copyPlan.textContent = "Copy plan";
  activityScene.hidden = true;
  show(yesScene);
});

function copyWithTextarea(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "0";
  area.style.top = "0";
  area.style.opacity = "0";
  document.body.append(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

copyPlan.addEventListener("click", () => {
  const text = planMessage();
  const copied = copyWithTextarea(text);
  const mark = (ok) => {
    if (ok) copyPlan.textContent = "Copied";
  };
  if (!navigator.clipboard || !window.isSecureContext) {
    mark(copied);
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    mark(true);
  }).catch(() => {
    mark(copied);
  });
});

renderPlan();
renderActivities();

function homeCenter() {
  const rect = noBtn.getBoundingClientRect();
  const matrix = new DOMMatrix(getComputedStyle(noMover).transform);
  return {
    x: rect.left + rect.width / 2 - matrix.m41,
    y: rect.top + rect.height / 2 - matrix.m42,
    left: rect.left - matrix.m41,
    top: rect.top - matrix.m42,
    width: rect.width,
    height: rect.height,
  };
}

function clamp(tx, ty, home) {
  const minX = INSET - home.left;
  const maxX = window.innerWidth - INSET - home.width - home.left;
  const minY = INSET - home.top;
  const maxY = window.innerHeight - INSET - home.height - home.top;
  return [
    Math.min(Math.max(tx, minX), maxX),
    Math.min(Math.max(ty, minY), maxY),
  ];
}

function park() {
  inside = false;
  aimed = false;
  inCatch = false;
  wasOver = false;
  holdX = x;
  holdY = y;
  vx = 0;
  vy = 0;
  return { tx: holdX, ty: holdY, fleeing: false };
}

function onHop() {
  const now = performance.now();
  if (now - labelAt < LABEL_HOLD) return;
  labelAt = now;
  hops += 1;
  noBtn.textContent = LABELS[Math.min(hops, LABELS.length - 1)];
  const base = yesGrow.offsetWidth;
  const room = base > 0 ? (window.innerWidth - 32) / base : 1;
  const grow = Math.min(1 + hops * 0.06, room, 1.45);
  yesGrow.style.setProperty("--grow", grow.toFixed(3));
}

function hopAway(home) {
  const rect = noBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let dx = cx - pointer.x;
  let dy = cy - pointer.y;
  const length = Math.hypot(dx, dy) || 1;
  dx /= length;
  dy /= length;

  const minX = INSET - home.left;
  const maxX = window.innerWidth - INSET - home.width - home.left;
  const minY = INSET - home.top;
  const maxY = window.innerHeight - INSET - home.height - home.top;
  const options = [
    clamp(x + dx * HOP, y + dy * HOP, home),
    [Math.max(minX, x - HOP), y],
    [Math.min(maxX, x + HOP), y],
    [x, Math.max(minY, y - HOP)],
    [x, Math.min(maxY, y + HOP)],
  ];

  const yes = yesGrow.getBoundingClientRect();
  let best = null;
  let bestDistance = -1;
  let leastOverlap = Infinity;
  let leastSpot = options[0];

  for (const [tx, ty] of options) {
    const left = home.left + tx;
    const top = home.top + ty;
    const right = left + home.width;
    const bottom = top + home.height;
    const overlapX = Math.min(right, yes.right) - Math.max(left, yes.left);
    const overlapY = Math.min(bottom, yes.bottom) - Math.max(top, yes.top);
    const overlap = overlapX > 0 && overlapY > 0 ? overlapX * overlapY : 0;

    if (overlap > 0) {
      if (overlap < leastOverlap) {
        leastOverlap = overlap;
        leastSpot = [tx, ty];
      }
      continue;
    }

    const distance = Math.hypot(pointer.x - (home.x + tx), pointer.y - (home.y + ty));
    if (distance > bestDistance) {
      bestDistance = distance;
      best = [tx, ty];
    }
  }

  return best || leastSpot;
}

function computeTarget() {
  if (reduceMotion.matches || askScene.hidden) {
    return { tx: 0, ty: 0, fleeing: false };
  }

  if (!pointer) return park();

  const rect = noBtn.getBoundingClientRect();
  const distance = Math.hypot(
    pointer.x - (rect.left + rect.width / 2),
    pointer.y - (rect.top + rect.height / 2),
  );

  if (distance > RADIUS) {
    wasOver = false;
    if (inside) return park();
    return { tx: holdX, ty: holdY, fleeing: false };
  }

  const covering =
    pointer.x >= rect.left &&
    pointer.x <= rect.right &&
    pointer.y >= rect.top &&
    pointer.y <= rect.bottom;
  if (covering && !wasOver) onHop();
  wasOver = covering;

  const caught = distance < CATCH;
  if (!aimed || (caught && !inCatch)) {
    [holdX, holdY] = hopAway(homeCenter());
    aimed = true;
    inside = true;
  }
  inCatch = caught;

  return { tx: holdX, ty: holdY, fleeing: true };
}

function step(dt, tx, ty) {
  const omega = 16;
  const zeta = 0.8;
  const ax = -2 * zeta * omega * vx - omega * omega * (x - tx);
  const ay = -2 * zeta * omega * vy - omega * omega * (y - ty);
  vx += ax * dt;
  vy += ay * dt;
  x += vx * dt;
  y += vy * dt;
}

function loop(now) {
  const dt = Math.min(0.032, last ? (now - last) / 1000 : 0.016);
  last = now;
  const { tx, ty } = computeTarget();

  if (reduceMotion.matches) {
    x = 0;
    y = 0;
    vx = 0;
    vy = 0;
    noMover.style.transform = "";
    frame = 0;
    return;
  }

  step(dt, tx, ty);
  noMover.style.transform = `translate(${x}px, ${y}px)`;

  const settled = Math.hypot(x - tx, y - ty) < 0.5 && Math.hypot(vx, vy) < 0.5;
  if (settled) {
    x = tx;
    y = ty;
    vx = 0;
    vy = 0;
    noMover.style.transform = x === 0 && y === 0 ? "" : `translate(${x}px, ${y}px)`;
    frame = 0;
    return;
  }

  frame = requestAnimationFrame(loop);
}

function wake() {
  if (frame) return;
  last = 0;
  frame = requestAnimationFrame(loop);
}

window.addEventListener("pointermove", (event) => {
  if (!finePointer.matches || event.pointerType === "touch") return;
  pointer = { x: event.clientX, y: event.clientY };
  wake();
}, { passive: true });

noMover.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse") return;
  const rect = noBtn.getBoundingClientRect();
  const distance = Math.hypot(
    event.clientX - (rect.left + rect.width / 2),
    event.clientY - (rect.top + rect.height / 2),
  );
  if (distance > RADIUS) return;
  pointer = { x: event.clientX, y: event.clientY };
  aimed = false;
  wake();
});

document.addEventListener("pointerleave", () => {
  pointer = null;
  wake();
});