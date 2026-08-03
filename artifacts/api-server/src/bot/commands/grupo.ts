import { reply, isGroup, getJid, getSender, getMentions, type Sock, type Msg } from "../handler";
import { logger } from "../../lib/logger";

const GRUPO_TEXT = `*👑 COMANDOS DE GRUPO*
_Administra tu grupo como un rey_

*.kick @tag*
_Expulsa a un miembro del grupo_

*.promote @tag*
_Convierte a un miembro en admin_

*.demote @tag*
_Le quita el admin a un miembro_

*.group open*
_Abre el grupo para todos_

*.group close*
_Solo admins pueden escribir_

──────────────────
⬅️ Volver: _.menu_`;

export async function handleGrupo(sock: Sock, msg: Msg): Promise<void> {
  await reply(sock, msg, GRUPO_TEXT);
}

async function getBotJid(sock: Sock): Promise<string> {
  return sock.user?.id ?? "";
}

async function isAdmin(sock: Sock, jid: string, participantJid: string): Promise<boolean> {
  try {
    const meta = await sock.groupMetadata(jid);
    return meta.participants.some(
      (p) => p.id === participantJid && (p.admin === "admin" || p.admin === "superadmin")
    );
  } catch {
    return false;
  }
}

export async function handleKick(sock: Sock, msg: Msg, _args: string[]): Promise<void> {
  if (!isGroup(msg)) {
    await reply(sock, msg, "❌ Este comando solo funciona en grupos.");
    return;
  }

  const jid = getJid(msg);
  const botJid = await getBotJid(sock);
  const botIsAdmin = await isAdmin(sock, jid, botJid);

  if (!botIsAdmin) {
    await reply(sock, msg, "❌ El bot necesita ser administrador del grupo para expulsar.");
    return;
  }

  const mentions = getMentions(msg);
  if (mentions.length === 0) {
    await reply(sock, msg, "❌ Menciona a alguien con @.\n\nEjemplo: *.kick @usuario*");
    return;
  }

  try {
    await sock.groupParticipantsUpdate(jid, mentions, "remove");
    await reply(sock, msg, `✅ Expulsado(s) correctamente.`);
  } catch (err) {
    logger.error({ err }, "Error al expulsar");
    await reply(sock, msg, "❌ No se pudo expulsar. ¿Esa persona es admin?");
  }
}

export async function handlePromote(sock: Sock, msg: Msg, _args: string[]): Promise<void> {
  if (!isGroup(msg)) {
    await reply(sock, msg, "❌ Este comando solo funciona en grupos.");
    return;
  }

  const jid = getJid(msg);
  const botJid = await getBotJid(sock);
  const botIsAdmin = await isAdmin(sock, jid, botJid);

  if (!botIsAdmin) {
    await reply(sock, msg, "❌ El bot necesita ser administrador del grupo para promover.");
    return;
  }

  const mentions = getMentions(msg);
  if (mentions.length === 0) {
    await reply(sock, msg, "❌ Menciona a alguien con @.\n\nEjemplo: *.promote @usuario*");
    return;
  }

  try {
    await sock.groupParticipantsUpdate(jid, mentions, "promote");
    await reply(sock, msg, `👑 ¡Promovido(s) a administrador!`);
  } catch (err) {
    logger.error({ err }, "Error al promover");
    await reply(sock, msg, "❌ No se pudo promover al usuario.");
  }
}

export async function handleDemote(sock: Sock, msg: Msg, _args: string[]): Promise<void> {
  if (!isGroup(msg)) {
    await reply(sock, msg, "❌ Este comando solo funciona en grupos.");
    return;
  }

  const jid = getJid(msg);
  const botJid = await getBotJid(sock);
  const botIsAdmin = await isAdmin(sock, jid, botJid);

  if (!botIsAdmin) {
    await reply(sock, msg, "❌ El bot necesita ser administrador del grupo para remover admins.");
    return;
  }

  const mentions = getMentions(msg);
  if (mentions.length === 0) {
    await reply(sock, msg, "❌ Menciona a alguien con @.\n\nEjemplo: *.demote @usuario*");
    return;
  }

  try {
    await sock.groupParticipantsUpdate(jid, mentions, "demote");
    await reply(sock, msg, `✅ Admin removido correctamente.`);
  } catch (err) {
    logger.error({ err }, "Error al demote");
    await reply(sock, msg, "❌ No se pudo remover el admin.");
  }
}

export async function handleGroup(sock: Sock, msg: Msg, args: string[]): Promise<void> {
  if (!isGroup(msg)) {
    await reply(sock, msg, "❌ Este comando solo funciona en grupos.");
    return;
  }

  const jid = getJid(msg);
  const botJid = await getBotJid(sock);
  const botIsAdmin = await isAdmin(sock, jid, botJid);

  if (!botIsAdmin) {
    await reply(sock, msg, "❌ El bot necesita ser administrador del grupo.");
    return;
  }

  const subCmd = (args[0] ?? "").toLowerCase();

  if (subCmd === "open") {
    try {
      await sock.groupSettingUpdate(jid, "not_announcement");
      await reply(sock, msg, "🔓 *Grupo abierto* — Todos pueden escribir.");
    } catch (err) {
      logger.error({ err }, "Error al abrir grupo");
      await reply(sock, msg, "❌ No se pudo abrir el grupo.");
    }
  } else if (subCmd === "close") {
    try {
      await sock.groupSettingUpdate(jid, "announcement");
      await reply(sock, msg, "🔒 *Grupo cerrado* — Solo admins pueden escribir.");
    } catch (err) {
      logger.error({ err }, "Error al cerrar grupo");
      await reply(sock, msg, "❌ No se pudo cerrar el grupo.");
    }
  } else {
    await reply(
      sock,
      msg,
      "❓ Uso:\n*.group open* — Abre el grupo\n*.group close* — Cierra el grupo"
    );
  }
}
