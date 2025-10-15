export async function POST({ request }) {
    try {
        const { prompt } = await request.json();

        if (!prompt || !prompt.trim()) {
            return new Response(JSON.stringify({ error: "Empty prompt" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const res = await fetch(`${process.env.OPENROUTER_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b:free",
                messages: [
                    {
                        role: "system",
                        content: "You are an assistant that generates valid SVG code from user descriptions.",
                    },
                    { role: "user", content: prompt },
                ],
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`OpenRouter API error ${res.status}: ${text}`);
        }

        const data = await res.json();
        const svg = data?.choices?.[0]?.message?.content || "";

        return new Response(JSON.stringify({ svg }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
