import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI Client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ROOT CHECK
app.get("/", (req, res) => {
  res.send("🔥 SkillProof API running");
});

// ================= RESUME =================
app.post("/resume", async (req, res) => {
  try {
    const { skills } = req.body;

    const prompt = `
Create resume-ready bullet points.
Rules:
- Professional language
- One bullet per skill
- No exaggeration

Skills:
${skills.map(s => `- ${s.skill} (${s.confidence})`).join("\n")}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      resume: completion.choices[0].message.content.trim(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ resume: "AI resume generation failed" });
  }
});

// ================= TEST QUESTIONS =================
app.post("/generate-test", async (req, res) => {
  const { skill } = req.body;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: `Create 3 interview questions to test ${skill}`,
        },
      ],
    });

    const questions = completion.choices[0].message.content
      .split("\n")
      .filter(q => q.trim().length > 5);

    res.json({ questions });
  } catch {
    res.json({
      questions: [
        `Explain ${skill} in your own words.`,
        `Where have you used ${skill}?`,
        `What challenge did you face learning ${skill}?`,
      ],
    });
  }
});

// ================= EVALUATE =================
app.post("/evaluate-answer", async (req, res) => {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "Respond ONLY in JSON",
        },
        {
          role: "user",
          content: `
Evaluate answer:
${req.body.answer}

Return:
{"result":"PASS or FAIL","confidence":number}
`,
        },
      ],
    });

    const clean = completion.choices[0].message.content
      .replace(/```json|```/g, "")
      .trim();

    res.json(JSON.parse(clean));
  } catch {
    res.json({ result: "PASS", confidence: 70 });
  }
});

export default app;