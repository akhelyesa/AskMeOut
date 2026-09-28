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
const yesHint = document.querySelector("#yes-hint");
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
  heartBit.hidden = true;
  lateBit.hidden = false;
}

yesBtn.addEventListener("click", () => {
  askScene.hidden = true;
  shockScene.hidden = false;
  shockScene.classList.add("is-in");
  playHeart();
  if (reduceMotion.matches) {
    showLate();
    return;
  }
  setTimeout(showLate, 2300);
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
  ["Fight (boxing gloves provided)", "A romantic evening, apparently"],
  ["Escape room", "Let's find out how well we panic together"],
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
let selectedPlan = "";
let selectedFood = "";
let weekOffset = 0;

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
  selectedFood = "";
  foodList.querySelectorAll("button").forEach((chip) => {
    chip.setAttribute("aria-pressed", "false");
  });
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
  foodCard.hidden = false;
  if (reduceMotion.matches) {
    foodCard.style.opacity = "1";
    return;
  }
  requestAnimationFrame(() => {
    if (token !== foodCardToken) return;
    foodCard.style.opacity = "1";
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
    return;
  }
  foodCard.style.opacity = "0";
  foodCardTimer = window.setTimeout(() => {
    if (token !== foodCardToken) return;
    foodCard.hidden = true;
    foodCard.style.opacity = "";
  }, 200);
}

function renderActivities() {
  PLANS.forEach(([label, joke]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-chip";
    button.textContent = label;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      selectedPlan = label;
      activityJoke.textContent = joke;
      pressChip(activityList, button);
      if (label === "Food") {
        showFoodCard(button);
      } else {
        hideFoodCard();
        clearFoodPick();
      }
      setActivity.disabled = label === "Food" && !selectedFood;
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
      selectedFood = food;
      pressChip(foodList, button);
      setActivity.disabled = false;
    });
    foodList.append(button);
  });
}

otherPlans.addEventListener("click", () => {
  hideFoodCard();
  clearFoodPick();
  setActivity.disabled = true;
});

weekPrev.addEventListener("click", () => {
  if (weekOffset === 0) return;
  weekOffset -= 1;
  renderWeek();
});

weekNext.addEventListener("click", () => {
  if (weekOffset === MAX_WEEK) return;
  weekOffset += 1;
  renderWeek();
});

shockNext.addEventListener("click", () => {
  shockScene.hidden = true;
  planScene.hidden = false;
});

lockPlan.addEventListener("click", () => {
  planScene.hidden = true;
  activityScene.hidden = false;
});

setActivity.addEventListener("click", () => {
  const plan = selectedPlan === "Food" ? selectedFood : selectedPlan;
  yesHint.textContent = `${selectedDay}, ${selectedTime}. ${plan}.`;
  activityScene.hidden = true;
  yesScene.hidden = false;
  yesScene.classList.add("is-in");
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

  let best = options[0];
  let bestDistance = -1;
  for (const [tx, ty] of options) {
    const distance = Math.hypot(pointer.x - (home.x + tx), pointer.y - (home.y + ty));
    if (distance > bestDistance) {
      bestDistance = distance;
      best = [tx, ty];
    }
  }

  return best;
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