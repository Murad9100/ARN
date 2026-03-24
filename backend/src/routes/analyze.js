const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const newsData = req.body.news || {};

    try {
        if (!process.env.GROQ_API_KEY) throw new Error("GROQ API Key yoxdur");

        const prompt = `Sən maliyyə analitikisən. Bu xəbəri analiz et: "${newsData.title}". 
        Niyə BUY, SELL və ya HOLD olduğunu Azərbaycan dilində ən azı 3 cümlə ilə ətraflı İZAH ET. 
        Cavabı YALNIZ bu JSON formatında ver, başqa heç nə yazma: {"signal":"BUY","explanation":"...izah..."}`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error?.message || 'Groq API xətası');

        const text = data.choices[0].message.content
            .replace(/```json|```/g, '')
            .trim();

        const finalResult = JSON.parse(text);

        res.json({
            ...finalResult,
            direction: finalResult.signal === 'BUY' ? 'BULLISH' : finalResult.signal === 'SELL' ? 'BEARISH' : 'NEUTRAL',
            confidence: 90,
            model: 'Llama 3.3 70B (Groq)'
        });

    } catch (err) {
        console.error("[Groq Error]:", err.message);
        res.json({
            signal: 'HOLD',
            explanation: "AI qoşulmayıb. API açarını yoxla.",
            model: 'Manual Mode',
            error: err.message
        });
    }
});

module.exports = router;