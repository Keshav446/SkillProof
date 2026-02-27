console.log("Resume template loaded ✅");

// =======================
// LOAD & CLEAN SKILLS
// =======================
const rawSkills = JSON.parse(localStorage.getItem("skills")) || [];

// 🔥 REMOVE DUPLICATES (keep best confidence)
const skillMap = {};

rawSkills.forEach((s) => {
  if (!skillMap[s.skill] || s.confidence > skillMap[s.skill].confidence) {
    skillMap[s.skill] = s;
  }
});

const skills = Object.values(skillMap);

// =======================
// DOM ELEMENTS
// =======================
const skillsBox = document.getElementById("resumeSkills");
const expBox = document.getElementById("experienceList");
const summaryBox = document.getElementById("resumeSummary");

// =======================
// RENDER SKILLS (LEFT)
// =======================
skillsBox.innerHTML = "";
expBox.innerHTML = "";

if (skills.length === 0) {
  skillsBox.innerHTML = "<li>No verified skills</li>";
  expBox.innerHTML = "<li>No experience data</li>";
} else {
  skills.forEach((s) => {
    // LEFT COLUMN
    const li = document.createElement("li");
    li.innerText = s.skill;
    skillsBox.appendChild(li);

    // VERIFIED EXPERIENCE
    const exp = document.createElement("li");
    exp.innerText = `${s.skill} — ${s.confidence}% (${s.level || "AI Verified"})`;
    expBox.appendChild(exp);
  });
}

// =======================
// LOAD AI SUMMARY (LIVE)
// =======================
async function loadSummary() {
  if (skills.length === 0) {
    summaryBox.innerText = "No skills available for summary.";
    return;
  }

  summaryBox.innerText = "⏳ Generating AI summary...";

  try {
    const res = await fetch(
      "https://skillproof-1.onrender.com/api/resume",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills }),
      }
    );

    if (!res.ok) throw new Error("API failed");

    const data = await res.json();
    summaryBox.innerText = data.resume;
  } catch (err) {
    console.error("AI summary error:", err);
    summaryBox.innerText = "AI summary unavailable.";
  }
}

loadSummary();
