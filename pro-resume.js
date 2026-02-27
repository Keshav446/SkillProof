const wallet = localStorage.getItem("walletAddress");
const skills = JSON.parse(localStorage.getItem("skills")) || [];

document.getElementById("walletAddr").innerText =
  wallet ? "Wallet: " + wallet : "Wallet: Not connected";

const skillList = document.getElementById("skillList");
const verifiedSkills = document.getElementById("verifiedSkills");

if (skills.length === 0) {
  verifiedSkills.innerHTML = "<p>No verified skills yet.</p>";
} else {
  skills.forEach(s => {
    const li = document.createElement("li");
    li.innerText = s.skill + " (" + s.confidence + ")";
    skillList.appendChild(li);

    const tag = document.createElement("div");
    tag.className = "skill-tag";
    tag.innerText = s.skill + " ✅";
    verifiedSkills.appendChild(tag);
  });
}
