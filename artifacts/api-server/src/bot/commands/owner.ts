import { reply, type Sock, type Msg } from "../handler";

const OWNER_NAME = "LzSunshiNe";
const OWNER_PHONE = "+31 6 29049445";
const BOT_NAME = "Lz Ultra Bot v03";

const OWNER_TEXT = `*🐉 INFO DEL CREADOR*
_Contacto y soporte_

👑 *Nombre:* ${OWNER_NAME}
📱 *WhatsApp:* ${OWNER_PHONE}
🤖 *Bot:* ${BOT_NAME}

*Comandos del owner:*

*.owner*
_Ver info del creador_

*.donar*
_Apoya al bot_

*.status*
_Ver estado del bot_

──────────────────
⬅️ Volver: _.menu_`;

const DONAR_TEXT = `*💸 APOYA AL BOT*
_¿Te gusta ${BOT_NAME}? ¡Apóyame!_

Cualquier donación ayuda a mantener el bot activo 24/7 🙏

📱 *WhatsApp:* ${OWNER_PHONE}

¡Gracias por tu apoyo! 🐉`;

const startTime = Date.now();

export async function handleOwner(sock: Sock, msg: Msg): Promise<void> {
  await reply(sock, msg, OWNER_TEXT);
}

export async function handleDonar(sock: Sock, msg: Msg): Promise<void> {
  await reply(sock, msg, DONAR_TEXT);
}

export async function handleStatus(sock: Sock, msg: Msg): Promise<void> {
  const uptimeMs = Date.now() - startTime;
  const seconds = Math.floor(uptimeMs / 1000) % 60;
  const minutes = Math.floor(uptimeMs / 60000) % 60;
  const hours = Math.floor(uptimeMs / 3600000) % 24;
  const days = Math.floor(uptimeMs / 86400000);

  const uptime =
    days > 0
      ? `${days}d ${hours}h ${minutes}m`
      : hours > 0
        ? `${hours}h ${minutes}m ${seconds}s`
        : `${minutes}m ${seconds}s`;

  const memUsage = process.memoryUsage();
  const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);

  const statusText = `*⚡ ESTADO DEL BOT*

🤖 *Bot:* ${BOT_NAME}
👑 *Owner:* ${OWNER_NAME}
✅ *Estado:* Activo
⏱️ *Uptime:* ${uptime}
💾 *Memoria:* ${memMB} MB
🌐 *Plataforma:* Node.js ${process.version}

_Todo funcionando a la perfección 🐉_`;

  await reply(sock, msg, statusText);
}
