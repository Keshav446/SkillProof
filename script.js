// ================================
// WALLET CONNECT
// ================================
async function connectWallet() {
  if (!window.ethereum) {
    alert("❌ MetaMask not found");
    return;
  }

  try {
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    document.getElementById("walletStatus").innerText =
      "✅ Connected: " + accounts[0];

    localStorage.setItem("walletAddress", accounts[0]);
  } catch (err) {
    console.error(err);
    alert("Wallet connection failed");
  }
}

// ================================
// VERIFY SKILL → REDIRECT TO TEST
// ================================
function verifySkillOnChain() {
  const skill = document.getElementById("skillInput").value.trim();
  const desc = document.getElementById("skillDesc").value.trim();

  if (!skill || !desc) {
    alert("❌ Please fill all fields");
    return;
  }

  // Save pending skill (used by test.js)
  localStorage.setItem("pendingSkill", skill);
  localStorage.setItem("pendingDesc", desc);

  console.log("Pending Skill Saved:", skill);

  // Redirect to AI test page
  window.location.href = "test.html";
}

// ================================
// RESUME PAGE
// ================================
function goToResume() {
  window.location.href = "dashboard.html";
}

// ================================
// AUTO LOAD WALLET STATUS
// ================================
window.addEventListener("load", () => {
  const addr = localStorage.getItem("walletAddress");
  if (addr) {
    const el = document.getElementById("walletStatus");
    if (el) el.innerText = "✅ Connected: " + addr;
  }
});
