/* eslint-disable @typescript-eslint/no-explicit-any */
import { reply, getJid, type Sock, type Msg } from "../handler";
import { logger } from "../../lib/logger";
import { downloadContentFromMessage, type MediaType } from "@whiskeysockets/baileys";

const OTROS_TEXT = `*⚡ OTROS COMANDOS*
_Utilidades y más_

*.sticker* (o *.s*)
_Envía una imagen y responde con este comando para convertirla en sticker_

──────────────────
⬅️ Volver: _.menu_`;

export async function handleOtros(sock: Sock, msg: Msg): Promise<void> {
  await reply(sock, msg, OTROS_TEXT);
}

export async function handleSticker(sock: Sock, msg: Msg): Promise<void> {
  const jid = getJid(msg);

  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imageMsg = quotedMsg?.imageMessage ?? msg.message?.imageMessage ?? null;
  const videoMsg = quotedMsg?.videoMessage ?? msg.message?.videoMessage ?? null;

  if (!imageMsg && !videoMsg) {
    await reply(
      sock,
      msg,
      "❌ Envía una imagen y responde con *.sticker*\n\nO envía la imagen con el caption *.sticker*"
    );
    return;
  }

  await reply(sock, msg, "🎨 Convirtiendo a sticker...");

  try {
    let sharpFn: ((input: Buffer) => { resize: (...a: any[]) => { webp: () => { toBuffer: () => Promise<Buffer> } } }) | null = null;
    try {
      const sharpMod = await import("sharp");
      sharpFn = (sharpMod as any).default ?? sharpMod;
    } catch {
      sharpFn = null;
    }

    if (!sharpFn) {
      await reply(sock, msg, "❌ Módulo sharp no disponible. No se puede convertir el sticker.");
      return;
    }

    let mediaBuffer: Buffer;
    const mediaType: MediaType = imageMsg ? "image" : "video";
    const mediaSrc = imageMsg ?? videoMsg!;

    const stream = await downloadContentFromMessage(mediaSrc as any, mediaType);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    mediaBuffer = Buffer.concat(chunks);

    if (mediaType === "video") {
      // Send video as-is for animated sticker
      await sock.sendMessage(jid, { sticker: mediaBuffer }, { quoted: msg as any });
      return;
    }

    // Convert image to WebP 512x512
    const webpBuffer = await sharpFn(mediaBuffer)
      .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp()
      .toBuffer();

    await sock.sendMessage(jid, { sticker: webpBuffer }, { quoted: msg as any });
    logger.info({ jid }, "Sticker enviado");
  } catch (err) {
    logger.error({ err }, "Error creando sticker");
    await reply(sock, msg, "❌ Error al crear el sticker. Intenta con otra imagen.");
  }
}
