console.log("Descriptive test loaded ✅");

// ================= CONFIG =================
const CONTRACT_ADDRESS = "0xe006909848f966Aab8CB44381DDC5AFAFC03Aa14";

// ✅ Monad Testnet Chain ID (decimal = 10143, hex = 0x279f)
const MONAD_CHAIN_ID = "0x279f";

// ✅ Backend URL (NO slash at end ❌)
const BACKEND_URL = "https://skillproof-bl37.onrender.com";

const ABI = [
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "level", type: "string" }
    ],
    name: "addSkill",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

// ================= DOM =================
const skill = localStorage.getItem("pendingSkill");
const questionsBox = document.getElementById("questionsBox");
const resultBox = document.getElementById("testResult");

if (!skill) {
  questionsBox.innerHTML = "<p>❌ No skill found</p>";
  throw new Error("No skill found");
}

// ================= LOAD QUESTIONS =================
async function loadQuestions() {
  try {
    questionsBox.innerHTML = "<p>⏳ Loading questions...</p>";

    const res = await fetch(`${BACKEND_URL}/api/generate-test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill }),
    });

    const data = await res.json();

    if (!data.questions || data.questions.length === 0) {
      questionsBox.innerHTML = "<p>❌ No questions generated</p>";
      return;
    }

    questionsBox.innerHTML = "";

    data.questions.forEach((q, i) => {
      const cleanQuestion = q.replace(/^\s*\d+[\.\)\-\:]?\s*/, "");

      const block = document.createElement("div");
      block.className = "question-block";
      block.innerHTML = `
        <h4>Q${i + 1}. ${cleanQuestion}</h4>
        <textarea class="answer-input" placeholder="Write your answer..." rows="4"></textarea>
      `;
      questionsBox.appendChild(block);
    });

    console.log("✅ Questions loaded");

  } catch (err) {
    console.error("❌ Load question error:", err);
    questionsBox.innerHTML = "<p>⚠️ Failed to load questions</p>";
  }
}

loadQuestions();

// ================= SUBMIT TEST =================
async function submitTest() {
  try {
    const answerInputs = document.querySelectorAll(".answer-input");

    let combinedAnswer = "";
    answerInputs.forEach((el, i) => {
      combinedAnswer += `Answer ${i + 1}:\n${el.value.trim()}\n\n`;
    });

    if (combinedAnswer.length < 100) {
      alert("❌ Answers too short");
      return;
    }

    resultBox.innerText = "⏳ AI evaluating...";

    // ===== AI EVALUATION =====
    const res = await fetch(`${BACKEND_URL}/api/evaluate-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill, answer: combinedAnswer }),
    });

    const data = await res.json();
    console.log("AI RESULT:", data);

    if (!data.result || data.result !== "PASS") {
      resultBox.innerText = "❌ AI evaluation failed";
      return;
    }

    resultBox.innerText = "✅ AI Passed. Connecting MetaMask...";

    // ===== METAMASK =====
    if (!window.ethereum) throw new Error("MetaMask not found");

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    console.log("Current Chain ID:", chainId);

    if (chainId !== MONAD_CHAIN_ID) {
      alert("❌ Please switch MetaMask to Monad Testnet");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    // ===== CONFIDENCE FIX =====
    let confidence = Number(data.confidence);

    if (confidence <= 1) {
      confidence = Math.round(confidence * 100);
    }

    let level = "Low";
    if (confidence >= 80) level = "High";
    else if (confidence >= 50) level = "Medium";

    resultBox.innerText = "🦊 Confirm transaction in MetaMask...";

    const tx = await contract.addSkill(skill, level);
    await tx.wait();

    console.log("✅ Stored on blockchain:", tx.hash);

    // ===== SAVE LOCALLY =====
    const skills = JSON.parse(localStorage.getItem("skills")) || [];
    skills.push({
      skill,
      level,
      confidence,
      txHash: tx.hash,
    });
    localStorage.setItem("skills", JSON.stringify(skills));

    resultBox.innerText = "🎉 Skill verified & stored on Monad!";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);

  } catch (err) {
    console.error("🔥 ERROR:", err);
    resultBox.innerText = "⚠️ Blockchain or backend error";
    alert(err.message);
  }
}
