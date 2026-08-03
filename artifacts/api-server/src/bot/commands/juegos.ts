import { reply, isGroup, getMentions, type Sock, type Msg } from "../handler";

const JUEGOS_TEXT = `*🎮 COMANDOS DE JUEGOS*
_Diviértete con el grupo_

*.ppt*
_Piedra, papel o tijera vs el bot_

*.topgays*
_Top de los más activos del grupo_

*.ship @tag @tag*
_Compatibilidad entre 2 personas_

──────────────────
⬅️ Volver: _.menu_`;

const PPT_OPTIONS = ["🪨 Piedra", "📄 Papel", "✂️ Tijera"] as const;
type PptOption = (typeof PPT_OPTIONS)[number];

const PPT_RESULTS: Record<PptOption, Record<PptOption, string>> = {
  "🪨 Piedra": {
    "🪨 Piedra": "Empate 🤝",
    "📄 Papel": "Ganaste 🎉",
    "✂️ Tijera": "Perdiste 😢",
  },
  "📄 Papel": {
    "🪨 Piedra": "Perdiste 😢",
    "📄 Papel": "Empate 🤝",
    "✂️ Tijera": "Ganaste 🎉",
  },
  "✂️ Tijera": {
    "🪨 Piedra": "Ganaste 🎉",
    "📄 Papel": "Perdiste 😢",
    "✂️ Tijera": "Empate 🤝",
  },
};

export async function handleJuegos(sock: Sock, msg: Msg): Promise<void> {
  await reply(sock, msg, JUEGOS_TEXT);
}

export async function handlePpt(sock: Sock, msg: Msg): Promise<void> {
  const playerChoice = PPT_OPTIONS[Math.floor(Math.random() * PPT_OPTIONS.length)]!;
  const botChoice = PPT_OPTIONS[Math.floor(Math.random() * PPT_OPTIONS.length)]!;
  const result = PPT_RESULTS[playerChoice][botChoice];

  const text = `*🎮 PIEDRA, PAPEL O TIJERA*

Tú elegiste: *${playerChoice}*
Bot eligió: *${botChoice}*

Resultado: *${result}*`;

  await reply(sock, msg, text);
}

export async function handleTopgays(sock: Sock, msg: Msg): Promise<void> {
  if (!isGroup(msg)) {
    await reply(sock, msg, "❌ Este comando solo funciona en grupos.");
    return;
  }

  const NAMES = [
    "🥇 El Campeón",
    "🥈 El Activo",
    "🥉 El Participante",
    "4️⃣ El Pasivo",
    "5️⃣ El Lurker",
  ];

  const scores = NAMES.map((name, i) => {
    const score = Math.floor(Math.random() * (200 - i * 30)) + 10;
    return `${name} — *${score} mensajes*`;
  });

  const text = `*🏆 TOP MÁS ACTIVOS DEL GRUPO*
_Actualizado ahora mismo_

${scores.join("\n")}

_¿Eres de los top? Sigue activo! 🔥_`;

  await reply(sock, msg, text);
}

export async function handleShip(sock: Sock, msg: Msg, args: string[]): Promise<void> {
  const mentions = getMentions(msg);

  if (mentions.length < 2) {
    await reply(
      sock,
      msg,
      "❌ Menciona a 2 personas.\n\nEjemplo: *.ship @persona1 @persona2*"
    );
    return;
  }

  const [jid1, jid2] = mentions;
  const number1 = jid1!.replace("@s.whatsapp.net", "").replace("@g.us", "");
  const number2 = jid2!.replace("@s.whatsapp.net", "").replace("@g.us", "");

  // Pseudo-deterministic percentage based on numbers
  const seed = (parseInt(number1.slice(-4) ?? "0") + parseInt(number2.slice(-4) ?? "0")) % 100;
  const percentage = Math.abs((seed * 37 + 42) % 101);

  let emoji = "";
  let verdict = "";

  if (percentage >= 80) {
    emoji = "💘💘💘";
    verdict = "¡Son el uno para el otro! 😍";
  } else if (percentage >= 60) {
    emoji = "❤️❤️";
    verdict = "Muy buena compatibilidad 🥰";
  } else if (percentage >= 40) {
    emoji = "💛";
    verdict = "Compatible pero hay trabajo por hacer 😅";
  } else if (percentage >= 20) {
    emoji = "🧡";
    verdict = "Poco compatible... pero nunca se sabe 🙄";
  } else {
    emoji = "💔";
    verdict = "¡Incompatibles! 😂";
  }

  const bar = "█".repeat(Math.floor(percentage / 10)) + "░".repeat(10 - Math.floor(percentage / 10));

  const text = `*💕 SHIP METER*

@${number1} + @${number2}

${emoji} *${percentage}%* ${emoji}
[${bar}]

_${verdict}_`;

  await reply(sock, msg, text);
}
