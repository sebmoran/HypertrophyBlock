// ---------- Setup ----------
const sb = window.supabase.createClient(
  window.SUPABASE_CONFIG.url,
  window.SUPABASE_CONFIG.anonKey
);

const SQUAT_EXERCISE_BY_DAY = {
  Sunday: "Back Squat",
  Tuesday: "Front Squat",
  Thursday: "Back Squat",
};

const ACCESSORY_EXERCISES_BY_DAY = {
  Sunday: ["RDL", "SL Leg Press"],
  Tuesday: ["Reverse Lunge", "Leg Curl"],
  Thursday: ["Clean DL", "Leg Extension"],
};

const todayStr = () => new Date().toISOString().slice(0, 10);

document.getElementById("todayLabel").textContent = new Date().toLocaleDateString("en-GB", {
  weekday: "short", day: "numeric", month: "short",
});

// ---------- Tab navigation ----------
const views = { log: "view-log", cmj: "view-cmj", body: "view-body", dashboard: "view-dashboard" };
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    Object.values(views).forEach((id) => document.getElementById(id).classList.add("hidden"));
    document.getElementById(views[btn.dataset.view]).classList.remove("hidden");
    if (btn.dataset.view === "dashboard") loadDashboard();
  });
});

// ---------- Toast ----------
let toastTimer;
function toast(msg, isError) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.style.borderColor = isError ? "var(--red)" : "var(--border)";
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 2600);
}

// ---------- Squat load form ----------
const squatDaySelect = document.getElementById("squatDaySelect");
const squatExerciseLabel = document.getElementById("squatExerciseLabel");

function updateSquatExerciseLabel() {
  squatExerciseLabel.textContent = SQUAT_EXERCISE_BY_DAY[squatDaySelect.value];
}
squatDaySelect.addEventListener("change", updateSquatExerciseLabel);
updateSquatExerciseLabel();

document.querySelectorAll('input[name="entry_date"]').forEach((el) => (el.value = todayStr()));

document.getElementById("squatForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const dayType = fd.get("day_type");
  const payload = {
    entry_date: fd.get("entry_date"),
    day_type: dayType,
    exercise: SQUAT_EXERCISE_BY_DAY[dayType],
    set_number: 1,
    load_kg: Number(fd.get("load_kg")),
    reps: null,
    rir: null,
    velocity_ms: null,
    is_test_set: false,
    is_velocity_check: false,
  };
  const { error } = await sb.from("lift_entries").insert(payload);
  if (error) return toast("Couldn't save squat load: " + error.message, true);
  toast("Squat load saved");
  const dateVal = fd.get("entry_date");
  e.target.reset();
  document.querySelector('#squatForm input[name="entry_date"]').value = dateVal;
  updateSquatExerciseLabel();
});

// ---------- Velocity check form ----------
document.getElementById("velocityCheckForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    entry_date: fd.get("entry_date"),
    day_type: fd.get("day_type"),
    exercise: "Back Squat",
    set_number: 0,
    load_kg: Number(fd.get("load_kg")),
    reps: 1,
    rir: null,
    velocity_ms: Number(fd.get("velocity_ms")),
    is_test_set: false,
    is_velocity_check: true,
  };
  const { error } = await sb.from("lift_entries").insert(payload);
  if (error) return toast("Couldn't save velocity check: " + error.message, true);
  toast("Velocity check saved");
  const dateVal = fd.get("entry_date");
  e.target.reset();
  document.querySelector('#velocityCheckForm input[name="entry_date"]').value = dateVal;
  document.querySelector('#velocityCheckForm input[name="load_kg"]').value = "120";
});

// ---------- Deload AMRAP test form ----------
document.getElementById("amrapForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    entry_date: fd.get("entry_date"),
    day_type: fd.get("day_type"),
    exercise: "Back Squat",
    set_number: 0,
    load_kg: Number(fd.get("load_kg")),
    reps: Number(fd.get("reps")),
    rir: 0,
    velocity_ms: null,
    is_test_set: true,
    is_velocity_check: false,
  };
  const { error } = await sb.from("lift_entries").insert(payload);
  if (error) return toast("Couldn't save AMRAP test: " + error.message, true);
  toast("AMRAP test saved");
  const dateVal = fd.get("entry_date");
  e.target.reset();
  document.querySelector('#amrapForm input[name="entry_date"]').value = dateVal;
});

// ---------- Accessory sets form ----------
const accessoryDaySelect = document.getElementById("accessoryDaySelect");
const accessoryExerciseSelect = document.getElementById("accessoryExerciseSelect");

function populateAccessoryExercises() {
  const day = accessoryDaySelect.value;
  accessoryExerciseSelect.innerHTML = "";
  ACCESSORY_EXERCISES_BY_DAY[day].forEach((ex) => {
    const opt = document.createElement("option");
    opt.value = ex;
    opt.textContent = ex;
    accessoryExerciseSelect.appendChild(opt);
  });
}
accessoryDaySelect.addEventListener("change", populateAccessoryExercises);
populateAccessoryExercises();

document.getElementById("accessoryForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    entry_date: fd.get("entry_date"),
    day_type: fd.get("day_type"),
    exercise: fd.get("exercise"),
    sets_completed: Number(fd.get("sets_completed")),
  };
  const { error } = await sb.from("accessory_sets").insert(payload);
  if (error) return toast("Couldn't save accessory sets: " + error.message, true);
  toast("Accessory sets saved");
  const dateVal = fd.get("entry_date");
  e.target.reset();
  document.querySelector('#accessoryForm input[name="entry_date"]').value = dateVal;
  populateAccessoryExercises();
});

document.getElementById("technicalForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    entry_date: fd.get("entry_date"),
    lift: fd.get("lift"),
    score: Number(fd.get("score")),
  };
  const { error } = await sb.from("technical_ratings").insert(payload);
  if (error) return toast("Couldn't save score: " + error.message, true);
  toast("Technical score saved");
  e.target.reset();
  document.querySelector('#technicalForm input[name="entry_date"]').value = todayStr();
});

document.getElementById("ratingForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    entry_date: fd.get("entry_date"),
    day_type: fd.get("day_type"),
    soreness: Number(fd.get("soreness")),
    difficulty: Number(fd.get("difficulty")),
  };
  const { error } = await sb.from("session_ratings").insert(payload);
  if (error) return toast("Couldn't save rating: " + error.message, true);
  toast("Session rating saved");
  e.target.reset();
  document.querySelector('#ratingForm input[name="entry_date"]').value = todayStr();
});

// ---------- CMJ form ----------
document.getElementById("cmjForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const num = (k) => (fd.get(k) ? Number(fd.get(k)) : null);
  const payload = {
    entry_date: fd.get("entry_date"),
    bodyweight_kg: num("bodyweight_kg"),
    jump_height_cm: num("jump_height_cm"),
    impulse_ns: num("impulse_ns"),
    mrsi: num("mrsi"),
    concentric_mean_power_w: num("concentric_mean_power_w"),
    peak_force_n: num("peak_force_n"),
    braking_duration_ms: num("braking_duration_ms"),
    cm_depth_cm: num("cm_depth_cm"),
  };
  const { error } = await sb.from("cmj_entries").insert(payload);
  if (error) return toast("Couldn't save CMJ test: " + error.message, true);
  toast("CMJ test saved");
  e.target.reset();
  document.querySelector('#cmjForm input[name="entry_date"]').value = todayStr();
});

// ---------- Body form ----------
document.getElementById("bodyForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const num = (k) => (fd.get(k) ? Number(fd.get(k)) : null);
  const payload = {
    entry_date: fd.get("entry_date"),
    weight_kg: num("weight_kg"),
    waist_cm: num("waist_cm"),
    thigh_cm: num("thigh_cm"),
  };
  const { error } = await sb.from("body_entries").insert(payload);
  if (error) return toast("Couldn't save body metrics: " + error.message, true);
  toast("Body metrics saved");
  e.target.reset();
  document.querySelector('#bodyForm input[name="entry_date"]').value = todayStr();
});

// ---------- Dashboard ----------
let charts = {};
function upsertChart(id, config) {
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(document.getElementById(id), config);
}

const CHART_COLORS = {
  accent: "#4fd1c5",
  amber: "#e3a008",
  red: "#e5484d",
  muted: "#8b93a1",
  grid: "#2c323d",
};

function baseOptions(extra = {}) {
  return {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: { legend: { labels: { color: "#e7eaee", font: { size: 11 } } } },
    scales: {
      x: { ticks: { color: CHART_COLORS.muted, font: { size: 10 } }, grid: { color: CHART_COLORS.grid } },
      y: { ticks: { color: CHART_COLORS.muted, font: { size: 10 } }, grid: { color: CHART_COLORS.grid } },
    },
    ...extra,
  };
}

async function loadDashboard() {
  const [lifts, cmj, body, ratings, technical, accessory] = await Promise.all([
    sb.from("lift_entries").select("*").order("entry_date"),
    sb.from("cmj_entries").select("*").order("entry_date"),
    sb.from("body_entries").select("*").order("entry_date"),
    sb.from("session_ratings").select("*").order("entry_date"),
    sb.from("technical_ratings").select("*").order("entry_date"),
    sb.from("accessory_sets").select("*").order("entry_date", { ascending: false }),
  ]);

  renderSquatChart(lifts.data || []);
  renderVelocityCheckChart(lifts.data || []);
  renderCmjCharts(cmj.data || []);
  renderBodyChart(body.data || []);
  renderRatingChart(ratings.data || []);
  renderTestSetTable(lifts.data || []);
  renderTechnicalChart(technical.data || []);
  renderAccessoryTable(accessory.data || []);
  renderReadiness(lifts.data || [], cmj.data || [], ratings.data || []);
}

function renderSquatChart(lifts) {
  const working = lifts.filter(
    (l) => (l.exercise === "Back Squat" || l.exercise === "Front Squat") && !l.is_test_set && !l.is_velocity_check
  );
  const byExerciseDate = { "Back Squat": {}, "Front Squat": {} };
  working.forEach((l) => {
    const bucket = byExerciseDate[l.exercise];
    if (!bucket[l.entry_date]) bucket[l.entry_date] = [];
    if (l.load_kg != null) bucket[l.entry_date].push(l.load_kg);
  });
  const allDates = [...new Set(working.map((l) => l.entry_date))].sort();
  const backSquatLoad = allDates.map((d) => (byExerciseDate["Back Squat"][d] ? avg(byExerciseDate["Back Squat"][d]) : null));
  const frontSquatLoad = allDates.map((d) => (byExerciseDate["Front Squat"][d] ? avg(byExerciseDate["Front Squat"][d]) : null));

  upsertChart("squatChart", {
    type: "line",
    data: {
      labels: allDates,
      datasets: [
        { label: "Back squat (kg)", data: backSquatLoad, borderColor: CHART_COLORS.accent, backgroundColor: CHART_COLORS.accent, tension: 0.25, spanGaps: true },
        { label: "Front squat (kg)", data: frontSquatLoad, borderColor: CHART_COLORS.amber, backgroundColor: CHART_COLORS.amber, tension: 0.25, spanGaps: true },
      ],
    },
    options: baseOptions(),
  });
}

function renderVelocityCheckChart(lifts) {
  const checks = lifts
    .filter((l) => l.exercise === "Back Squat" && l.is_velocity_check && l.velocity_ms != null)
    .sort((a, b) => (a.entry_date > b.entry_date ? 1 : -1));
  const dates = checks.map((c) => c.entry_date);

  upsertChart("velocityCheckChart", {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        { label: "Velocity @ reference load (m/s)", data: checks.map((c) => c.velocity_ms), borderColor: CHART_COLORS.amber, backgroundColor: CHART_COLORS.amber, yAxisID: "y", tension: 0.25 },
        { label: "Reference load (kg)", data: checks.map((c) => c.load_kg), borderColor: CHART_COLORS.muted, backgroundColor: CHART_COLORS.muted, yAxisID: "y1", tension: 0.25 },
      ],
    },
    options: baseOptions({
      scales: {
        x: { ticks: { color: CHART_COLORS.muted, font: { size: 10 } }, grid: { color: CHART_COLORS.grid } },
        y: { position: "left", ticks: { color: CHART_COLORS.muted }, grid: { color: CHART_COLORS.grid } },
        y1: { position: "right", ticks: { color: CHART_COLORS.muted }, grid: { display: false } },
      },
    }),
  });
}

function renderCmjCharts(cmj) {
  const dates = cmj.map((c) => c.entry_date);
  upsertChart("cmjChart", {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        { label: "Jump height (cm)", data: cmj.map((c) => c.jump_height_cm), borderColor: CHART_COLORS.accent, backgroundColor: CHART_COLORS.accent, tension: 0.25 },
        { label: "mRSI", data: cmj.map((c) => c.mrsi), borderColor: CHART_COLORS.amber, backgroundColor: CHART_COLORS.amber, yAxisID: "y1", tension: 0.25 },
      ],
    },
    options: baseOptions({
      scales: {
        x: { ticks: { color: CHART_COLORS.muted, font: { size: 10 } }, grid: { color: CHART_COLORS.grid } },
        y: { position: "left", ticks: { color: CHART_COLORS.muted }, grid: { color: CHART_COLORS.grid } },
        y1: { position: "right", ticks: { color: CHART_COLORS.muted }, grid: { display: false } },
      },
    }),
  });

  upsertChart("cmjForceChart", {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        { label: "Concentric impulse (N·s)", data: cmj.map((c) => c.impulse_ns), borderColor: CHART_COLORS.accent, tension: 0.25 },
        { label: "Peak force (N)", data: cmj.map((c) => c.peak_force_n), borderColor: CHART_COLORS.muted, tension: 0.25 },
        { label: "Concentric mean power (W)", data: cmj.map((c) => c.concentric_mean_power_w), borderColor: CHART_COLORS.amber, yAxisID: "y1", tension: 0.25 },
      ],
    },
    options: baseOptions({
      scales: {
        x: { ticks: { color: CHART_COLORS.muted, font: { size: 10 } }, grid: { color: CHART_COLORS.grid } },
        y: { position: "left", ticks: { color: CHART_COLORS.muted }, grid: { color: CHART_COLORS.grid } },
        y1: { position: "right", ticks: { color: CHART_COLORS.muted }, grid: { display: false } },
      },
    }),
  });
}

function renderBodyChart(body) {
  upsertChart("bodyChart", {
    type: "line",
    data: {
      labels: body.map((b) => b.entry_date),
      datasets: [
        { label: "Weight (kg)", data: body.map((b) => b.weight_kg), borderColor: CHART_COLORS.accent, tension: 0.25 },
        { label: "Waist (cm)", data: body.map((b) => b.waist_cm), borderColor: CHART_COLORS.amber, yAxisID: "y1", tension: 0.25 },
        { label: "Thigh (cm)", data: body.map((b) => b.thigh_cm), borderColor: CHART_COLORS.muted, yAxisID: "y1", tension: 0.25 },
      ],
    },
    options: baseOptions({
      scales: {
        x: { ticks: { color: CHART_COLORS.muted, font: { size: 10 } }, grid: { color: CHART_COLORS.grid } },
        y: { position: "left", ticks: { color: CHART_COLORS.muted }, grid: { color: CHART_COLORS.grid } },
        y1: { position: "right", ticks: { color: CHART_COLORS.muted }, grid: { display: false } },
      },
    }),
  });
}

function renderRatingChart(ratings) {
  upsertChart("ratingChart", {
    type: "bar",
    data: {
      labels: ratings.map((r) => r.entry_date),
      datasets: [
        { label: "Soreness", data: ratings.map((r) => r.soreness), backgroundColor: CHART_COLORS.amber },
        { label: "Difficulty", data: ratings.map((r) => r.difficulty), backgroundColor: CHART_COLORS.accent },
      ],
    },
    options: baseOptions({ scales: { y: { min: 0, max: 10, ticks: { color: CHART_COLORS.muted }, grid: { color: CHART_COLORS.grid } }, x: { ticks: { color: CHART_COLORS.muted, font: { size: 10 } }, grid: { color: CHART_COLORS.grid } } } }),
  });
}

function renderTechnicalChart(technical) {
  const snatch = technical.filter((t) => t.lift === "Snatch");
  const cj = technical.filter((t) => t.lift === "Clean & Jerk");
  upsertChart("technicalChart", {
    type: "line",
    data: {
      labels: [...new Set(technical.map((t) => t.entry_date))].sort(),
      datasets: [
        { label: "Snatch", data: snatch.map((t) => ({ x: t.entry_date, y: t.score })), borderColor: CHART_COLORS.accent, parsing: false },
        { label: "Clean & Jerk", data: cj.map((t) => ({ x: t.entry_date, y: t.score })), borderColor: CHART_COLORS.amber, parsing: false },
      ],
    },
    options: baseOptions({ scales: { y: { min: 1, max: 5, ticks: { color: CHART_COLORS.muted }, grid: { color: CHART_COLORS.grid } }, x: { type: "category", ticks: { color: CHART_COLORS.muted, font: { size: 10 } }, grid: { color: CHART_COLORS.grid } } } }),
  });
}

function renderTestSetTable(lifts) {
  const tests = lifts.filter((l) => l.is_test_set && l.exercise === "Back Squat");
  const tbody = document.querySelector("#testSetTable tbody");
  tbody.innerHTML = "";
  tests.forEach((t) => {
    const e1rm = t.load_kg && t.reps ? Math.round(t.load_kg * (1 + t.reps / 30)) : "—";
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${t.entry_date}</td><td>${t.load_kg ?? "—"}</td><td>${t.reps ?? "—"}</td><td>${e1rm}</td>`;
    tbody.appendChild(tr);
  });
}

function renderAccessoryTable(accessory) {
  const tbody = document.querySelector("#accessoryTable tbody");
  tbody.innerHTML = "";
  accessory.slice(0, 20).forEach((a) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${a.entry_date}</td><td>${a.exercise}</td><td>${a.sets_completed}</td>`;
    tbody.appendChild(tr);
  });
}

// ---------- Readiness composite ----------
function avg(arr) {
  const vals = arr.filter((v) => v != null && !Number.isNaN(v));
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function renderReadiness(lifts, cmj, ratings) {
  const banner = document.getElementById("readinessBanner");
  const velocityChecks = lifts.filter((l) => l.exercise === "Back Squat" && l.is_velocity_check);

  const velByDate = {};
  velocityChecks.forEach((l) => {
    if (l.velocity_ms == null) return;
    (velByDate[l.entry_date] ||= []).push(l.velocity_ms);
  });

  const cmjByDate = {};
  cmj.forEach((c) => (cmjByDate[c.entry_date] = c));

  const ratingByDate = {};
  ratings.forEach((r) => (ratingByDate[r.entry_date] = Math.max(r.soreness ?? 0, r.difficulty ?? 0)));

  const dates = [...new Set([...Object.keys(velByDate), ...Object.keys(cmjByDate)])].sort();

  const velHistory = [];
  const cmjHistory = [];
  let amberStreak = 0;
  let lastResult = null;

  dates.forEach((date) => {
    const velVal = velByDate[date] ? avg(velByDate[date]) : null;
    const cmjVal = cmjByDate[date] ? cmjByDate[date].jump_height_cm : null;
    const subjVal = ratingByDate[date] ?? null;

    const velBaseline = velHistory.length >= 4 ? avg(velHistory.slice(-6)) : null;
    const cmjBaseline = cmjHistory.length >= 4 ? avg(cmjHistory.slice(-6)) : null;

    const signals = [];
    if (velVal != null && velBaseline != null) signals.push(velVal < velBaseline * 0.9);
    if (cmjVal != null && cmjBaseline != null) signals.push(cmjVal < cmjBaseline * 0.9);
    if (subjVal != null) signals.push(subjVal >= 7);

    const available = signals.length;
    const triggered = signals.filter(Boolean).length;

    let status = "grey";
    let isAmberCandidate = false;
    if (available > 0) {
      if (triggered === available && available >= 2) {
        status = "red";
      } else if (triggered >= 2) {
        isAmberCandidate = true;
        amberStreak += 1;
        status = amberStreak >= 3 ? "red" : "amber";
      } else {
        status = "green";
      }
    }
    if (!isAmberCandidate) amberStreak = 0;

    lastResult = { date, status, velVal, cmjVal, subjVal, velBaseline, cmjBaseline, triggered, available };

    if (velVal != null) velHistory.push(velVal);
    if (cmjVal != null) cmjHistory.push(cmjVal);
  });

  banner.classList.remove("green", "amber", "red");
  if (!lastResult || lastResult.status === "grey") {
    banner.querySelector(".readiness-title").textContent = "Gathering baseline";
    banner.querySelector(".readiness-detail").textContent =
      "Need a few more Sun/Thu sessions (velocity + CMJ) before the flag is meaningful.";
    return;
  }

  banner.classList.add(lastResult.status);
  const reasons = [];
  if (lastResult.velVal != null && lastResult.velBaseline != null && lastResult.velVal < lastResult.velBaseline * 0.9) {
    reasons.push("squat velocity down");
  }
  if (lastResult.cmjVal != null && lastResult.cmjBaseline != null && lastResult.cmjVal < lastResult.cmjBaseline * 0.9) {
    reasons.push("CMJ jump height down");
  }
  if (lastResult.subjVal != null && lastResult.subjVal >= 7) {
    reasons.push("soreness/difficulty high");
  }

  const titles = { green: "On track", amber: "Watch fatigue", red: "High fatigue signal" };
  banner.querySelector(".readiness-title").textContent = `${titles[lastResult.status]} — ${lastResult.date}`;
  banner.querySelector(".readiness-detail").textContent = reasons.length
    ? `Flagged: ${reasons.join(", ")}.`
    : "No fatigue signals triggered against your rolling baseline.";
}

// Load dashboard once on first paint too, in case it's the default tab in future
if (!document.getElementById(views.dashboard).classList.contains("hidden")) loadDashboard();
