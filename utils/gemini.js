require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function safeParse(text) {
    try {
        // extract JSON array using regex
        const match = text.match(/\[.*\]/s);
        if (!match) return [];

        return JSON.parse(match[0]);
    } catch {
        return [];
    }
}

async function retry(fn, retries = 2) {
    try {
        return await fn();
    } catch (err) {
        if (retries === 0) throw err;
        await new Promise(r => setTimeout(r, 1000));
        return retry(fn, retries - 1);
    }
}

function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}

async function generateWithRetry(fn, retries = 3) {
    let delay = 500;

    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {

            if (err.status !== 503 || i === retries - 1) {
                throw err;
            }

            console.log(`⚠️ Retry ${i + 1} after ${delay}ms`);
            await sleep(delay);
            delay *= 2; // exponential backoff
        }
    }
}

// 🔮 Predict next words
async function getPredictions(text) {

    try {

        const prompt = `
            Suggest 3 short next phrases for:
            "${text}"

            Return ONLY JSON array.
            Example: ["5 pm", "tomorrow", "at office"]
            `;

        const result = await generateWithRetry(() =>
            genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            })
        );

        const raw =
            result.candidates?.[0]?.content?.parts?.[0]?.text || "";

        return safeParse(raw).length
            ? safeParse(raw)
            : ["Okay", "Sure", "Let's do it"];

    } catch (err) {

        console.log("❌ Gemini prediction error:", err);
        return [];

    }

}

// 💬 Smart replies
async function getSmartReplies(message) {

    try {

        const prompt = `
            Generate 3 short reply options for:
            "${message}"

            Return ONLY JSON array.
            Example: ["Yes, I’ll join", "Running late", "Let’s reschedule"]
            `;

        const result = await generateWithRetry(() =>
            genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            })
        );

        const raw =
            result.candidates?.[0]?.content?.parts?.[0]?.text || "";

        return safeParse(raw).length
            ? safeParse(raw)
            : ["Okay 👍", "Sounds good", "Got it"];

    } catch (err) {

        console.log("❌ Gemini reply error:", err);
        return [];

    }

}

module.exports = { getPredictions, getSmartReplies };