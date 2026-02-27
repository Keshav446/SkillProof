const skills = JSON.parse(localStorage.getItem("skills")) || [];

const totalSkills = skills.length;
document.getElementById("totalSkills").innerText = totalSkills;

let totalConfidence = 0;
let topSkill = "-";
let maxConfidence = 0;

const labels = [];
const values = [];

skills.forEach(s => {
  const c = parseInt(s.confidence);
  totalConfidence += c;
  labels.push(s.skill);
  values.push(c);

  if (c > maxConfidence) {
    maxConfidence = c;
    topSkill = s.skill;
  }
});

const avg = totalSkills ? (totalConfidence / totalSkills).toFixed(1) : 0;
document.getElementById("avgConfidence").innerText = avg + "%";
document.getElementById("topSkill").innerText = topSkill;
document.getElementById("polScore").innerText = totalSkills * 10;

// Chart.js graph
const ctx = document.getElementById("skillChart");

new Chart(ctx, {
  type: "bar",
  data: {
    labels,
    datasets: [{
      label: "Skill Confidence %",
      data: values,
      backgroundColor: "rgba(56,189,248,0.7)"
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true, max: 100 }
    }
  }
});
