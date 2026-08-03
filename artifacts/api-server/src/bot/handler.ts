/* eslint-disable @typescript-eslint/no-explicit-any */
import type makeWASocket from "@whiskeysockets/baileys";
import type { proto } from "@whiskeysockets/baileys";
import { logger } from "../lib/logger";
import { handleMenu } from "./commands/menu";
import { handleGrupo, handleKick, handlePromote, handleDemote, handleGroup } from "./commands/grupo";
import { handleDescargas, handlePlay, handleYtmp4, handleTiktok } from "./commands/descargas";
import { handleJuegos, handlePpt, handleTopgays, handleShip } from "./commands/juegos";
import { handleIa } from "./commands/ia";
import { handleOwner, handleDonar, handleStatus } from "./commands/owner";
import { handleOtros, handleSticker } from "./commands/otros";

const PREFIX = ".";

export type Sock = ReturnType<typeof makeWASocket>;
export type Msg = proto.IWebMessageInfo;

export function getBody(msg: Msg): string {
  return (
    msg.message?.conversation ??
    msg.message?.extendedTextMessage?.text ??
    msg.message?.imageMessage?.caption ??
    msg.message?.videoMessage?.caption ??
    ""
  );
}

export function getJid(msg: Msg): string {
  return msg.key?.remoteJid ?? "";
}

export function isGroup(msg: Msg): boolean {
  return (msg.key?.remoteJid ?? "").endsWith("@g.us");
}

export function getSender(msg: Msg): string {
  if (isGroup(msg)) {
    return msg.key?.participant ?? (msg as any).participant ?? "";
  }
  return msg.key?.remoteJid ?? "";
}

export function getMentions(msg: Msg): string[] {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ?? [];
}

export async function reply(sock: Sock, msg: Msg, text: string): Promise<void> {
  await sock.sendMessage(getJid(msg), { text }, { quoted: msg as any });
}

export async function handleMessage(sock: Sock, msg: Msg): Promise<void> {
  const body = getBody(msg).trim();
  if (!body.startsWith(PREFIX)) return;

  const args = body.slice(PREFIX.length).trim().split(/\s+/);
  const command = (args[0] ?? "").toLowerCase();
  const rest = args.slice(1);

  logger.info({ command, from: getSender(msg), chat: getJid(msg) }, "Comando recibido");

  try {
    switch (command) {
      case "menu":
      case "help":
      case "ayuda":
        await handleMenu(sock, msg);
        break;

      case "grupo":
        await handleGrupo(sock, msg);
        break;
      case "kick":
        await handleKick(sock, msg, rest);
        break;
      case "promote":
        await handlePromote(sock, msg, rest);
        break;
      case "demote":
        await handleDemote(sock, msg, rest);
        break;
      case "group":
        await handleGroup(sock, msg, rest);
        break;

      case "descargas":
        await handleDescargas(sock, msg);
        break;
      case "play":
        await handlePlay(sock, msg, rest.join(" "));
        break;
      case "ytmp4":
        await handleYtmp4(sock, msg, rest[0] ?? "");
        break;
      case "tiktok":
        await handleTiktok(sock, msg, rest[0] ?? "");
        break;

      case "juegos":
        await handleJuegos(sock, msg);
        break;
      case "ppt":
        await handlePpt(sock, msg);
        break;
      case "topgays":
        await handleTopgays(sock, msg);
        break;
      case "ship":
        await handleShip(sock, msg, rest);
        break;

      case "ia":
        await handleIa(sock, msg, rest.join(" "));
        break;

      case "owner":
        await handleOwner(sock, msg);
        break;
      case "donar":
        await handleDonar(sock, msg);
        break;
      case "status":
        await handleStatus(sock, msg);
        break;

      case "otros":
        await handleOtros(sock, msg);
        break;
      case "sticker":
      case "s":
        await handleSticker(sock, msg);
        break;

      default:
        break;
    }
  } catch (err) {
    logger.error({ err, command }, "Error ejecutando comando");
    await sock.sendMessage(getJid(msg), { text: "❌ Error al ejecutar el comando. Intenta de nuevo." }, { quoted: msg as any });
  }
}
