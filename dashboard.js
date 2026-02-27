console.log("Dashboard loaded ✅");

const skillsList = document.getElementById("skillsList");
const resumeBox = document.getElementById("aiResume");

// ✅ SAME backend as test.js (IMPORTANT)
const BACKEND_URL = "https://skillproof-bl37.onrender.com";

// =======================
// LOAD SKILLS (LOCAL STORAGE)
// =======================
function loadSkills() {
  const skills = JSON.parse(localStorage.getItem("skills")) || [];

  console.log("Loaded skills:", skills);

  skillsList.innerHTML = "";

  if (skills.length === 0) {
    skillsList.innerHTML =
      "<li style='opacity:0.6;'>No verified skills yet</li>";
    return;
  }

  skills.forEach((s) => {
    const li = document.createElement("li");

    // ✅ confidence fix (avoid double %)
    let confidence = Number(s.confidence);
    if (confidence <= 1) confidence = Math.round(confidence * 100);

    li.innerHTML = `
      <span style="color:#00ffd5;font-weight:600;">
        ${s.skill}
      </span>
      <span style="margin-left:6px;opacity:0.85;">
        (${s.level})
      </span>
      <span style="opacity:0.7;">
        — ${confidence}%
      </span>
      <br />
      <small style="opacity:0.5;">
        Tx: ${s.txHash ? s.txHash.slice(0, 12) + "..." : "N/A"}
      </small>
    `;

    skillsList.appendChild(li);
  });
}

// =======================
// GENERATE AI RESUME
// =======================
async function generateResume() {
  const skills = JSON.parse(localStorage.getItem("skills")) || [];

  if (skills.length === 0) {
    resumeBox.innerText = "No skills found. Add skills first.";
    return;
  }

  resumeBox.innerText = "⏳ Generating AI summary...";

  try {
    const res = await fetch(`${BACKEND_URL}/api/resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills }),
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Backend returned:", text);
      throw new Error("Invalid JSON from backend");
    }

    if (!data.resume) throw new Error("No resume in response");

    resumeBox.innerText = data.resume;

  } catch (err) {
    console.error("Resume error:", err);
    resumeBox.innerText =
      "❌ Failed to generate resume. Backend or OpenAI error.";
  }
}

// =======================
// NAVIGATION
// =======================
function openTemplate() {
  window.location.href = "resume-template.html";
}

function openAnalytics() {
  window.location.href = "analytics.html";
}

// =======================
// INIT
// =======================
window.onload = () => {
  loadSkills();
  generateResume();
};
