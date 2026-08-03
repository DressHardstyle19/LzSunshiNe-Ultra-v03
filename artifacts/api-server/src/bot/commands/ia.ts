import { reply, type Sock, type Msg } from "../handler";
import { logger } from "../../lib/logger";

const IA_TEXT = `*🧠 COMANDOS DE IA*
_Inteligencia Artificial_

*.ia <pregunta>*
_Chatea con el bot de IA_

Ejemplo: *.ia ¿Cuál es la capital de Francia?*

──────────────────
⬅️ Volver: _.menu_`;

// Simple rotating responses when no AI API is configured
const FALLBACK_RESPONSES = [
  "¡Buena pregunta! Lamentablemente necesito una API key de IA para responderte. Pregúntale al owner del bot. 🤖",
  "Para activar el modo IA, el owner necesita configurar la API key. Por ahora solo puedo decir: ¡bip bop! 🤖",
  "Error 404: Cerebro no encontrado 😅. El owner necesita configurar la IA.",
];

export async function handleIa(sock: Sock, msg: Msg, query: string): Promise<void> {
  if (!query.trim()) {
    await reply(sock, msg, IA_TEXT);
    return;
  }

  // Try to use OpenAI if OPENAI_API_KEY is set
  const apiKey = process.env["OPENAI_API_KEY"];

  if (!apiKey) {
    const response = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]!;
    await reply(sock, msg, `🤖 *IA:* ${response}`);
    return;
  }

  await reply(sock, msg, "🤖 _Pensando..._");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente simpático integrado en un bot de WhatsApp llamado 'Lz Ultra Bot v03'. Responde de forma concisa y amigable. Usa emojis con moderación.",
          },
          { role: "user", content: query },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };
    const answer = data.choices[0]?.message?.content ?? "Sin respuesta";

    await reply(sock, msg, `🧠 *IA dice:*\n\n${answer}`);
  } catch (err) {
    logger.error({ err }, "Error con la IA");
    await reply(
      sock,
      msg,
      "❌ Error al contactar la IA. Intenta de nuevo más tarde."
    );
  }
}
