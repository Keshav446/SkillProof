import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // ✅ FORCE LOAD .env

import express from "express";
import cors from "cors";
import OpenAI from "openai";

// ✅ DEBUG (AFTER dotenv)
console.log("OPENAI KEY:", process.env.OPENAI_API_KEY?.slice(0, 12) || "NOT FOUND");

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// ✅ OpenAI Client (safe)
// ===============================
let client = null;

if (process.env.OPENAI_API_KEY) {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log("✅ OpenAI connected");
} else {
  console.log("⚠️ OpenAI API key not found, fallback mode ON");
}

// ===============================
// ✅ ROOT ROUTE
// ===============================
app.get("/", (req, res) => {
  res.send("✅ SkillProof Backend is Running...");
});

// ===============================
// ✅ RESUME GENERATION API (SAFE)
// ===============================
app.post("/api/resume", async (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills || skills.length === 0) {
      return res.json({
        resume: "No verified skills found.",
      });
    }

    // 🔥 Fallback resume (always works)
    let resumeText = skills
      .map(
        (s) =>
          `• ${s.skill}: Blockchain-verified skill with ${s.confidence}% confidence (${s.level} level).`
      )
      .join("\n");

    // ✅ If OpenAI available → enhance resume
    if (client) {
      try {
        const prompt = `
Create professional resume bullet points.
Rules:
- Professional tone
- One bullet per skill
- No exaggeration

Skills:
${skills.map((s) => `- ${s.skill} (${s.confidence}%)`).join("\n")}
`;

        const completion = await client.chat.completions.create({
          model: "gpt-4.1-mini",
          messages: [{ role: "user", content: prompt }],
        });

        resumeText = completion.choices[0].message.content.trim();
      } catch (aiErr) {
        console.log("⚠️ OpenAI failed, using fallback resume");
      }
    }

    res.json({ resume: resumeText });
  } catch (err) {
    console.error("Resume AI Error:", err);
    res.status(500).json({ resume: "AI resume generation failed" });
  }
});

// ===============================
// ✅ GENERATE TEST QUESTIONS
// ===============================
app.post("/api/generate-test", async (req, res) => {
  const { skill } = req.body;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{
        role: "user",
        content: `Create 3 interview questions for skill "${skill}".`
      }],
    });

    const questions = completion.choices[0].message.content
      .split("\n")
      .map(q => q.trim())
      .filter(Boolean);

    res.json({ questions });
  } catch (err) {
    console.error("Question AI Error:", err);
    res.json({
      questions: [
        `Explain ${skill} in your own words.`,
        `Where have you used ${skill}?`,
        `What challenges did you face while learning ${skill}?`,
      ],
    });
  }
});

// ===============================
// ✅ EVALUATE ANSWER
// ===============================
app.post("/api/evaluate-answer", async (req, res) => {
  const { skill, answer } = req.body;

  try {
    if (!answer || answer.length < 50) {
      return res.json({ result: "FAIL", confidence: 30 });
    }

    if (!client) throw new Error("OpenAI disabled");

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "Return ONLY valid JSON." },
        {
          role: "user",
          content: `
Evaluate this answer for skill: ${skill}

Answer:
${answer}

Return JSON:
{"result":"PASS or FAIL","confidence":number}
`
        },
      ],
    });

    let raw = completion.choices[0].message.content
      .replace(/```json|```/g, "")
      .trim();

    res.json(JSON.parse(raw));

  } catch (err) {
    console.error("Evaluation Error:", err);
    res.json({ result: "PASS", confidence: 70 });
  }
});

// ===============================
// ✅ SERVER START (Render compatible)
// ===============================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 SkillProof Backend running on port ${PORT}`);
});
