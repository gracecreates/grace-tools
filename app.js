const STORAGE_KEY = "grace-dashboard-v2";
const WORKER_URL = "https://grace-chat-worker.getrightandconquer.workers.dev";

const GRACE_SYSTEM = `You are G.R.A.C.E. Get Right And Conquer Everything.

You were built by someone who has lived through real things. Depression, anxiety, loss, financial setbacks, relationship struggles. Not as theory. As lived experience. That is why you exist.

How you show up in every conversation:

When someone is overwhelmed, you slow things down first. You do not jump into advice. You let them talk. You listen. Then you respond.
You start simple. "Alright. Talk to me. What is going on right now?"
After they get it out you acknowledge it. "Okay. I hear you." Then you offer something real, not a speech.
You ground people. "Right now we are just talking. You are not alone in this moment."
You help them break things into smaller pieces. "We do not have to solve everything tonight. Let us focus on what is happening right now."
You remind them that what they are feeling is not permanent.
You ask targeted questions to understand what is really going on.
You never leave a conversation on a heavy or unresolved note.
You never give motivational speeches. You give presence, honesty, and help people get through the moment.

Your tone always:
Direct. Warm but honest. No sugarcoating. No fluff. No fake positivity.
Short sentences. Real words. Nothing performative.
You remind people who they are when they forget.
You keep things grounded and actionable.
You meet people where they are.
You always end with one clear next step or something that gives them a little strength to keep going.`;

const DIMENSIONS = [
  {
    id: "physical",
    name: "Physical",
    sub: "Body and energy",
    color: "#c2185b",
    intro: "Sleep, food, water, movement, and the basics that keep your body supported.",
    tools: ["Habit tracker", "Routine builder", "Wellness reset"]
  },
  {
    id: "emotional",
    name: "Emotional",
    sub: "Mind and inner state",
    color: "#9c72c8",
    intro: "How you process stress, hold emotions, and keep things from piling up.",
    tools: ["Mood tracking", "Reflection prompts", "Support chat"]
  },
  {
    id: "financial",
    name: "Financial",
    sub: "Money and stability",
    color: "#d4ac5a",
    intro: "Money stress, real numbers, planning, and what stability looks like right now.",
    tools: ["Budget tool", "Debt snapshot", "Weekly money focus"]
  },
  {
    id: "social",
    name: "Social",
    sub: "Relationships and support",
    color: "#e57373",
    intro: "Who is around you, who supports you, and where you need stronger boundaries.",
    tools: ["Boundary prompts", "Support mapping", "Connection reset"]
  },
  {
    id: "occupational",
    name: "Occupational",
    sub: "Work and purpose",
    color: "#4db6ac",
    intro: "What you do, what pays you, what matters to you, and what comes next.",
    tools: ["Career clarity", "Skill builder", "Work focus"]
  },
  {
    id: "spiritual",
    name: "Spiritual",
    sub: "Meaning and inner grounding",
    color: "#b39ddb",
    intro: "What gives your life meaning, what feels aligned, and what helps you feel centered.",
    tools: ["Purpose prompts", "Reflection space", "Grounding check-in"]
  },
  {
    id: "intellectual",
    name: "Intellectual",
    sub: "Learning and growth",
    color: "#81c784",
    intro: "Curiosity, learning, perspective, and the ways you keep expanding.",
    tools: ["Learning tracker", "Curiosity prompts", "Growth notes"]
  },
  {
    id: "environmental",
    name: "Environmental",
    sub: "Home and surroundings",
    color: "#ffb74d",
    intro: "Your space, safety, environment, and whether your surroundings support you.",
    tools: ["Space reset", "Environment notes", "Calm space checklist"]
  }
];

const CHAT_SYSTEM_RESPONSES = [
  {
    match: ["stuck", "direction", "lost", "confused"],
    reply:
      "Okay. I hear you.\n\nWhen everything feels stuck, the first move is not to solve your whole life tonight. It is to get more honest about what feels most off.\n\nStart with this: what feels heaviest right now — money, emotions, structure, work, or relationships?\n\nNext step: pick one area and answer that in one sentence."
  },
  {
    match: ["overwhelmed", "burnout", "stress", "too much"],
    reply:
      "Okay. I hear you.\n\nWhen you are overwhelmed, the goal is not to push harder. It is to slow things down enough to see what is actually going on.\n\nRight now, name the 3 things taking up the most energy.\n\nNext step: write those 3 things down, then circle the one that cannot wait."
  },
  {
    match: ["decision", "decide", "choice"],
    reply:
      "Alright. Let us slow it down.\n\nMost hard decisions feel impossible when everything is mixed together. Usually there is the practical side, the emotional side, and the fear side.\n\nWhat decision are you trying to make, and what are the top 2 options?\n\nNext step: tell me the options first, not the whole story."
  },
  {
    match: ["money", "rent", "debt", "financial"],
    reply:
      "Okay. Money stress can make everything feel louder.\n\nDo not judge the situation right now. Just get clear on it. What matters most first is what is urgent, what is due, and what can wait.\n\nNext step: list your top 3 money pressures in order."
  },
  {
    match: ["anxiety", "depressed", "sad", "mental", "emotion"],
    reply:
      "Okay. I hear you.\n\nYou do not need to act like you are fine right now. Let us keep it simple.\n\nWhat feels strongest today — anxiety, sadness, numbness, anger, or exhaustion?\n\nNext step: name which one is leading today."
  }
];

function defaultState() {
  return {
    profile: {
      userName: "",
      mainGoal: "",
      biggestBlock: ""
    },
    scores: {
      physical: 5,
      emotional: 5,
      financial: 5,
      social: 5,
      occupational: 5,
      spiritual: 5,
      intellectual: 5,
      environmental: 5
    },
    history: [],
    checkins: [],
    chatHistory: []
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();

    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      profile: { ...defaultState().profile, ...(parsed.profile || {}) },
      scores: { ...defaultState().scores, ...(parsed.scores || {}) },
      history: Array.isArray(parsed.history) ? parsed.history : [],
      checkins: Array.isArray(parsed.checkins) ? parsed.checkins : [],
      chatHistory: Array.isArray(parsed.chatHistory) ? parsed.chatHistory : []
    };
  } catch (error) {
    return defaultState();
  }
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

if (!state.history.length) {
  state.history.push({
    date: new Date().toISOString(),
    source: "initial",
    scores: { ...state.scores }
  });
  saveState();
}

function showStatus(message) {
  const el = document.getElementById("statusMessage");
  el.textContent = message;
  el.classList.remove("hidden");
  clearTimeout(showStatus._timer);
  showStatus._timer = setTimeout(() => {
    el.classList.add("hidden");
  }, 2500);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function averageScore() {
  const values = Object.values(state.scores).map(Number);
  return (values.reduce((sum, n) => sum + n, 0) / values.length).toFixed(1);
}

function bestDimension() {
  return [...DIMENSIONS].sort((a, b) => state.scores[b.id] - state.scores[a.id])[0];
}

function lowestDimension() {
  return [...DIMENSIONS].sort((a, b) => state.scores[a.id] - state.scores[b.id])[0];
}

function getLowestDimensions(count = 2) {
  return [...DIMENSIONS].sort((a, b) => state.scores[a.id] - state.scores[b.id]).slice(0, count);
}

function getAverageFromScores(scoresObj) {
  const values = Object.values(scoresObj).map(Number);
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

function saveScoreSnapshot(source = "manual") {
  state.history.push({
    date: new Date().toISOString(),
    source,
    scores: { ...state.scores }
  });
  state.history = state.history.slice(-40);
  saveState();
}

function getProgressTrend() {
  if (state.history.length < 2) return null;

  const latest = state.history[state.history.length - 1];
  const previous = state.history[state.history.length - 2];
  const latestAvg = getAverageFromScores(latest.scores);
  const previousAvg = getAverageFromScores(previous.scores);

  return Number((latestAvg - previousAvg).toFixed(1));
}

function getFocusSuggestionsForDimension(id) {
  const map = {
    physical: [
      "Drink more water and eat one real meal a day.",
      "Build a simple morning or night routine.",
      "Move your body for 10 minutes this week."
    ],
    emotional: [
      "Do one honest check-in instead of bottling it up.",
      "Track your mood for a few days and notice patterns.",
      "Write down what feels heaviest instead of carrying it all in your head."
    ],
    financial: [
      "Look at the real numbers without avoiding them.",
      "Track income, bills, debt, and savings in one place.",
      "Pick one money move this week and do not overcomplicate it."
    ],
    social: [
      "Notice who drains you and where you need a boundary.",
      "Reach out to one person who feels safe or grounding.",
      "Focus on quality support, not just being around people."
    ],
    occupational: [
      "Stabilize what pays you while still moving toward what matters.",
      "Pick one skill to improve this week.",
      "Update your resume, offer, or next career step."
    ],
    spiritual: [
      "Make space to reflect on what actually matters to you.",
      "Notice what feels aligned and what does not.",
      "Spend a few minutes in gratitude, prayer, or quiet reflection."
    ],
    intellectual: [
      "Choose one topic or skill to learn more about.",
      "Track what is actually helping you grow.",
      "Use curiosity instead of pressure this week."
    ],
    environmental: [
      "Reset one space that has been stressing you out.",
      "Pay attention to what makes your environment feel heavy.",
      "Make one part of your space calmer, cleaner, or more supportive."
    ]
  };

  return map[id] || ["Take one small step in this area this week."];
}

function getPersonalizedRecommendations() {
  return getLowestDimensions(2).map((dimension) => {
    const score = Number(state.scores[dimension.id]);
    let intro = "";

    if (score <= 3) {
      intro = "This area looks like it may need more immediate support right now.";
    } else if (score <= 5) {
      intro = "This area may be slowing you down more than you realize.";
    } else {
      intro = "This area is not the strongest right now, but there is room to build.";
    }

    return {
      ...dimension,
      score,
      intro,
      suggestions: getFocusSuggestionsForDimension(dimension.id)
    };
  });
}

function profileRecommendationFromBlock(block) {
  const lowerBlock = block.toLowerCase();

  if (
    lowerBlock.includes("money") ||
    lowerBlock.includes("rent") ||
    lowerBlock.includes("debt") ||
    lowerBlock.includes("financial")
  ) {
    return "Start with financial and occupational wellness. Focus on what needs immediate stability first, then build from there.";
  }

  if (
    lowerBlock.includes("anxiety") ||
    lowerBlock.includes("burnout") ||
    lowerBlock.includes("stress") ||
    lowerBlock.includes("depressed") ||
    lowerBlock.includes("overwhelm")
  ) {
    return "Start with emotional and physical wellness. Slow things down, look at your routines, and pay attention to what is draining you.";
  }

  if (
    lowerBlock.includes("relationship") ||
    lowerBlock.includes("lonely") ||
    lowerBlock.includes("family") ||
    lowerBlock.includes("people")
  ) {
    return "Start with social and emotional wellness. Look at support, boundaries, and what connections feel safe and real.";
  }

  if (
    lowerBlock.includes("lost") ||
    lowerBlock.includes("direction") ||
    lowerBlock.includes("purpose") ||
    lowerBlock.includes("stuck")
  ) {
    return "Start with occupational, spiritual, and intellectual wellness. Focus on clarity, meaning, and the next small move instead of trying to solve everything at once.";
  }

  return "Start with a full 8 dimensions check-in so you can see what is strongest, what feels neglected, and where your energy needs to go first.";
}

function renderPriorityCard() {
  const low = lowestDimension();
  const score = Number(state.scores[low.id]);
  const introEl = document.getElementById("priorityIntro");
  const titleEl = document.getElementById("priorityTitle");
  const textEl = document.getElementById("priorityText");
  const focusEl = document.getElementById("focusWeekBox");

  introEl.innerHTML = `<strong>Biggest opportunity right now:</strong> ${escapeHtml(low.name)} is currently at ${score}/10.`;
  titleEl.textContent = `Start with ${low.name}`;
  textEl.textContent = `${low.intro} Start here so you are not trying to fix everything at once.`;

  const suggestions = getFocusSuggestionsForDimension(low.id).slice(0, 3);
  focusEl.innerHTML = `
    <strong style="display:block; margin-bottom:8px;">Focus this week</strong>
    ${suggestions.map((item) => `• ${escapeHtml(item)}`).join("<br>")}
  `;

  document.getElementById("priorityBtn").onclick = () => {
    const target = document.getElementById(low.id + "-card");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
  };
}

function renderTrendCard() {
  const trend = getProgressTrend();
  const trendScore = document.getElementById("trendScore");
  const trendText = document.getElementById("trendText");

  if (trend === null) {
    trendScore.textContent = "—";
    trendText.textContent = "Keep checking in to see how things shift over time.";
    return;
  }

  trendScore.textContent = `${trend > 0 ? "+" : ""}${trend}`;

  if (trend > 0) {
    trendText.textContent = "You are moving in a better direction. Keep going.";
  } else if (trend < 0) {
    trendText.textContent = "Things may feel heavier right now. Focus on one area and slow it down.";
  } else {
    trendText.textContent = "No major change yet. Keep showing up honestly.";
  }
}

function renderRecommendations() {
  const wrap = document.getElementById("personalizedRecoSection");
  const recommendations = getPersonalizedRecommendations();

  wrap.innerHTML = recommendations.map((item) => `
    <div class="tool-card reveal visible">
      <h3>${escapeHtml(item.name)} recommendation</h3>
      <div class="notice ${item.score <= 3 ? "danger" : ""}">
        <strong>${escapeHtml(item.name)} (${item.score}/10)</strong><br>
        ${escapeHtml(item.intro)}
      </div>
      <ul>
        ${item.suggestions.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}
      </ul>
      <div class="action-row" style="margin-top:14px;">
        <button class="btn btn-secondary" onclick="scrollToDimension('${item.id}')">Go to ${escapeHtml(item.name)}</button>
      </div>
    </div>
  `).join("");
}

function renderDimensionGrid() {
  const grid = document.getElementById("dimensionGrid");

  grid.innerHTML = DIMENSIONS.map((dimension) => {
    const score = Number(state.scores[dimension.id]);
    return `
      <div class="dimension-card reveal visible" id="${dimension.id}-card">
        <div class="dimension-top">
          <div>
            <div class="dimension-tag">${escapeHtml(dimension.name)}</div>
            <h3 class="dimension-name">${escapeHtml(dimension.name)}</h3>
            <div class="dimension-sub">${escapeHtml(dimension.sub)}</div>
          </div>
          <div class="dimension-score">${score}/10</div>
        </div>

        <div class="progress-track">
          <div class="progress-fill" style="width:${score * 10}%; background:${dimension.color};"></div>
        </div>

        <p style="margin:0;">${escapeHtml(dimension.intro)}</p>

        <label class="field" style="margin-bottom:0;">
          <span>Rate this area</span>
          <input
            class="range"
            type="range"
            min="1"
            max="10"
            value="${score}"
            data-score-id="${dimension.id}"
          />
        </label>

        <div class="tag-row">
          ${dimension.tools.map((tool) => `<span class="tag">${escapeHtml(tool)}</span>`).join("")}
        </div>

        <div class="dimension-actions">
          <button class="ghost-btn" data-raise="${dimension.id}">+1</button>
          <button class="ghost-btn" data-lower="${dimension.id}">-1</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderSummaryCards() {
  document.getElementById("avgScore").textContent = `${averageScore()}/10`;
  document.getElementById("bestDimension").textContent = bestDimension().name;
  document.getElementById("lowestDimension").textContent = lowestDimension().name;
  document.getElementById("goalText").textContent = state.profile.mainGoal || "—";
}

function renderInputs() {
  document.getElementById("userName").value = state.profile.userName || "";
  document.getElementById("mainGoal").value = state.profile.mainGoal || "";
  document.getElementById("biggestBlock").value = state.profile.biggestBlock || "";
}

function render() {
  renderInputs();
  renderSummaryCards();
  renderDimensionGrid();
  renderPriorityCard();
  renderTrendCard();
  renderRecommendations();
  bindDimensionControls();
}

function bindDimensionControls() {
  document.querySelectorAll("[data-score-id]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const id = event.target.dataset.scoreId;
      state.scores[id] = Number(event.target.value);
      saveScoreSnapshot("slider-change");
      render();
    });
  });

  document.querySelectorAll("[data-raise]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.raise;
      state.scores[id] = Math.min(10, Number(state.scores[id]) + 1);
      saveScoreSnapshot("quick-raise");
      render();
      showStatus(`${DIMENSIONS.find((d) => d.id === id).name} increased.`);
    });
  });

  document.querySelectorAll("[data-lower]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.lower;
      state.scores[id] = Math.max(1, Number(state.scores[id]) - 1);
      saveScoreSnapshot("quick-lower");
      render();
      showStatus(`${DIMENSIONS.find((d) => d.id === id).name} lowered.`);
    });
  });
}

function saveProfile() {
  const userName = document.getElementById("userName").value.trim();
  const mainGoal = document.getElementById("mainGoal").value.trim();
  const biggestBlock = document.getElementById("biggestBlock").value.trim();
  const profileResult = document.getElementById("profileResult");

  if (!userName || !mainGoal || !biggestBlock) {
    profileResult.style.display = "block";
    profileResult.className = "result-box";
    profileResult.style.background = "rgba(255, 139, 158, 0.08)";
    profileResult.style.border = "1px solid rgba(255, 139, 158, 0.24)";
    profileResult.innerHTML =
      "<strong>You’re close.</strong><br>Please fill in your name, your main goal, and your biggest block so G.R.A.C.E. can give you a more grounded starting point.";
    return;
  }

  state.profile.userName = userName;
  state.profile.mainGoal = mainGoal;
  state.profile.biggestBlock = biggestBlock;
  saveState();
  render();

  const recommendation = profileRecommendationFromBlock(biggestBlock);

  profileResult.style.display = "block";
  profileResult.style.background = "rgba(125, 211, 167, 0.08)";
  profileResult.style.border = "1px solid rgba(125, 211, 167, 0.22)";
  profileResult.innerHTML = `
    <strong>Welcome, ${escapeHtml(userName)}.</strong><br>
    Your main goal right now is <strong>${escapeHtml(mainGoal)}</strong>.<br><br>
    Based on what you shared about <strong>${escapeHtml(biggestBlock)}</strong>, a strong first move would be:
    <br><br>
    <strong>${escapeHtml(recommendation)}</strong>
    <br><br>
    Next step: adjust your dashboard below and start with the area that scores lowest.
  `;

  profileResult.scrollIntoView({ behavior: "smooth", block: "center" });
  showStatus("Profile saved.");
}

function saveDailyCheckin() {
  state.checkins.unshift({
    date: new Date().toISOString(),
    scores: { ...state.scores }
  });
  state.checkins = state.checkins.slice(0, 10);
  saveScoreSnapshot("daily-checkin");
  render();
  showStatus("Daily check-in saved.");
}

function scrollToSetup() {
  const target = document.getElementById("setup");
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => document.getElementById("userName").focus(), 350);
}

function scrollToTools() {
  document.getElementById("tools").scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToDimension(id) {
  const target = document.getElementById(id + "-card");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

window.scrollToDimension = scrollToDimension;

function openChatDrawer() {
  const drawer = document.getElementById("chatDrawer");
  drawer.classList.remove("hidden");

  const wrap = document.getElementById("chatMessages");
  if (!wrap.children.length) {
    addChatMessage("assistant", "Alright. Talk to me. What is going on right now?");
  }
}

function closeChatDrawer() {
  document.getElementById("chatDrawer").classList.add("hidden");
}

function addChatMessage(role, text, saveToState = true) {
  const wrap = document.getElementById("chatMessages");
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble " + role;
  bubble.textContent = text;
  wrap.appendChild(bubble);
  wrap.scrollTop = wrap.scrollHeight;

  if (saveToState) {
    state.chatHistory.push({ role, text });
    state.chatHistory = state.chatHistory.slice(-20);
    saveState();
  }
}

function restoreChatHistory() {
  const wrap = document.getElementById("chatMessages");
  wrap.innerHTML = "";

  if (!state.chatHistory.length) return;

  state.chatHistory.forEach((msg) => {
    addChatMessage(msg.role, msg.text, false);
  });
}

function generateGraceReply(text) {
  const lower = text.toLowerCase();

  for (const item of CHAT_SYSTEM_RESPONSES) {
    if (item.match.some((keyword) => lower.includes(keyword))) {
      return item.reply;
    }
  }

  return "Okay. I hear you.\n\nYou do not need to solve everything right now. Let us slow it down and get clearer.\n\nWhat feels most pressing at this moment — your emotions, your money, your routines, your work, or your relationships?\n\nNext step: answer with just one of those.";
}

function buildWorkerMessages() {
  return state.chatHistory.map((msg) => ({
    role: msg.role,
    content: msg.text
  }));
}

async function askGraceViaWorker() {
  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      system: GRACE_SYSTEM,
      messages: buildWorkerMessages()
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Worker error ${response.status}: ${text}`);
  }

  const data = await response.json();

  if (!data || !data.reply) {
    throw new Error("Worker returned no reply");
  }

  return data.reply;
}

async function sendGraceMessage(prefillText = null) {
  const input = document.getElementById("chatInput");
  const btn = document.getElementById("sendChatBtn");
  const text = (prefillText ?? input.value).trim();
  if (!text) return;

  addChatMessage("user", text);
  input.value = "";
  btn.disabled = true;
  btn.textContent = "Sending...";

  try {
    const reply = await askGraceViaWorker();
    addChatMessage("assistant", reply);
  } catch (error) {
    console.error("Worker failed, using fallback reply:", error);
    const fallbackReply = generateGraceReply(text);
    addChatMessage("assistant", fallbackReply);
    showStatus("Cloud chat is not connected yet. Using local backup reply.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Send";
  }
}

document.getElementById("startSetupBtn").addEventListener("click", scrollToSetup);
document.getElementById("startSetupBtn2").addEventListener("click", scrollToSetup);
document.getElementById("openGraceChatBtn").addEventListener("click", openChatDrawer);
document.getElementById("openGraceChatBtn2").addEventListener("click", openChatDrawer);
document.getElementById("jumpToToolsBtn").addEventListener("click", scrollToTools);
document.getElementById("saveProfileBtn").addEventListener("click", saveProfile);
document.getElementById("priorityCheckinBtn").addEventListener("click", saveDailyCheckin);
document.getElementById("closeChatBtn").addEventListener("click", closeChatDrawer);
document.getElementById("sendChatBtn").addEventListener("click", () => sendGraceMessage());

document.getElementById("chatInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendGraceMessage();
  }
});

document.getElementById("chatDrawer").addEventListener("click", (event) => {
  if (event.target.id === "chatDrawer") closeChatDrawer();
});

document.querySelectorAll(".chat-prompt").forEach((button) => {
  button.addEventListener("click", () => {
    const prompt = button.dataset.prompt || button.textContent || "";
    sendGraceMessage(prompt);
  });
});

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealElements.forEach((el) => revealObserver.observe(el));

restoreChatHistory();
render();
