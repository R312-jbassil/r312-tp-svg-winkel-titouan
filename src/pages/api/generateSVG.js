// src/pages/api/generateSVG.js
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async ({ request }) => {
    try {
        const messages = await request.json(); // attendu : array de messages pour le modèle
        if (!messages || !Array.isArray(messages)) {
            return new Response(
                JSON.stringify({ error: "Messages invalides" }),
                { status: 400 }
            );
        }

        // Message système pour guider le modèle
        const systemMessage = {
            role: "system",
            content:
                "You are an SVG code generator. Generate SVG code for the following messages. Make sure to include ids for each part of the generated SVG.",
        };

        // Appel à l'API OpenAI
        const chatCompletion = await client.chat.completions.create({
            model: "gpt-4o-mini", // ou ton modèle préféré
            messages: [systemMessage, ...messages],
        });

        const message = chatCompletion.choices[0].message?.content || "";

        // Extraction du SVG
        const svgMatch = message.match(/<svg[\s\S]*?<\/svg>/i);
        const svg = svgMatch ? svgMatch[0] : "";

        return new Response(JSON.stringify({ svg }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Erreur génération SVG:", err);
        return new Response(
            JSON.stringify({ error: "Erreur lors de la génération du SVG" }),
            { status: 500 }
        );
    }
};
