/* eslint-disable @typescript-eslint/no-explicit-any */
import { reply, type Sock, type Msg, getJid } from "../handler";
import { logger } from "../../lib/logger";
import https from "node:https";
import http from "node:http";

const DESCARGAS_TEXT = `*📥 COMANDOS DE DESCARGAS*
_Baja música y videos al instante_

*.play <canción>*
_Busca y descarga MP3 de YouTube_

*.ytmp4 <link>*
_Descarga video de YouTube en MP4_

*.tiktok <link>*
_Descarga TikTok sin marca de agua_

──────────────────
⬅️ Volver: _.menu_`;

export async function handleDescargas(sock: Sock, msg: Msg): Promise<void> {
  await reply(sock, msg, DESCARGAS_TEXT);
}

export async function handlePlay(sock: Sock, msg: Msg, query: string): Promise<void> {
  if (!query.trim()) {
    await reply(sock, msg, "❌ Especifica una canción.\n\nEjemplo: *.play Despacito*");
    return;
  }

  await reply(sock, msg, `🔍 Buscando: *${query}*...\n_Esto puede tardar unos segundos._`);

  try {
    const ytdl = await import("@distube/ytdl-core").catch(() => null);
    if (!ytdl) {
      await reply(sock, msg, "⚠️ Módulo de descarga no disponible.\n\nBusca en: https://cobalt.tools");
      return;
    }

    // Search YouTube for video ID
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const html = await fetchText(searchUrl);
    const videoIdMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);

    if (!videoIdMatch) {
      await reply(sock, msg, "❌ No se encontraron resultados para esa búsqueda.");
      return;
    }

    const videoId = videoIdMatch[1];
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.default.getInfo(videoUrl);
    const title = info.videoDetails.title;
    const duration = Number(info.videoDetails.lengthSeconds);

    if (duration > 600) {
      await reply(sock, msg, "❌ Video muy largo (máx 10 minutos).");
      return;
    }

    const format = ytdl.default.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: "audioonly",
    });

    if (!format) {
      await reply(sock, msg, "❌ No se pudo obtener el audio.");
      return;
    }

    const stream = ytdl.default(videoUrl, { format });
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    const buffer = Buffer.concat(chunks);
    await sock.sendMessage(
      getJid(msg),
      { audio: buffer, mimetype: "audio/mp4", ptt: false },
      { quoted: msg as any }
    );
    await reply(sock, msg, `✅ *${title}*\n_Descargado exitosamente_ 🎵`);
  } catch (err) {
    logger.error({ err }, "Error descargando audio de YouTube");
    await reply(sock, msg, "❌ Error al descargar. Prueba en: https://cobalt.tools");
  }
}

export async function handleYtmp4(sock: Sock, msg: Msg, url: string): Promise<void> {
  if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
    await reply(sock, msg, "❌ Envía un link válido de YouTube.\n\nEjemplo: *.ytmp4 https://youtu.be/XXXXX*");
    return;
  }

  await reply(sock, msg, "⬇️ Descargando video...\n_Puede tardar dependiendo del tamaño._");

  try {
    const ytdl = await import("@distube/ytdl-core").catch(() => null);
    if (!ytdl) {
      await reply(sock, msg, "⚠️ Módulo no disponible.\n\nUsa: https://cobalt.tools");
      return;
    }

    const info = await ytdl.default.getInfo(url);
    const title = info.videoDetails.title;
    const duration = Number(info.videoDetails.lengthSeconds);

    if (duration > 300) {
      await reply(sock, msg, "❌ Video muy largo (máx 5 minutos para MP4).");
      return;
    }

    const format = ytdl.default.chooseFormat(info.formats, {
      quality: "18",
      filter: "videoandaudio",
    });

    if (!format) {
      await reply(sock, msg, "❌ No se encontró formato disponible.");
      return;
    }

    const stream = ytdl.default(url, { format });
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    const buffer = Buffer.concat(chunks);
    await sock.sendMessage(
      getJid(msg),
      { video: buffer, mimetype: "video/mp4", caption: `✅ *${title}*` },
      { quoted: msg as any }
    );
  } catch (err) {
    logger.error({ err }, "Error descargando video de YouTube");
    await reply(sock, msg, "❌ Error al descargar. Prueba en: https://cobalt.tools");
  }
}

export async function handleTiktok(sock: Sock, msg: Msg, url: string): Promise<void> {
  if (!url.includes("tiktok.com")) {
    await reply(sock, msg, "❌ Envía un link válido de TikTok.\n\nEjemplo: *.tiktok https://vm.tiktok.com/XXXXX/*");
    return;
  }

  await reply(sock, msg, "⬇️ Descargando TikTok sin marca de agua...");

  try {
    const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(url)}`;
    const response = await fetchJson(apiUrl);
    const data = (response as any).data as Record<string, string> | undefined;

    if (!response || (response as any).code !== 0 || !data) {
      throw new Error("API error: " + ((response as any).msg ?? "unknown"));
    }

    const videoUrl = data["play"] ?? data["wmplay"];
    if (!videoUrl) throw new Error("No video URL in response");

    const videoBuffer = await fetchBuffer(videoUrl);
    await sock.sendMessage(
      getJid(msg),
      {
        video: videoBuffer,
        mimetype: "video/mp4",
        caption: "✅ TikTok descargado sin marca de agua 🎵",
      },
      { quoted: msg as any }
    );
  } catch (err) {
    logger.error({ err }, "Error descargando TikTok");
    await reply(sock, msg, "❌ Error al descargar TikTok. Prueba en: https://snaptik.app");
  }
}

// ─── HTTP helpers ─────────────────────────────────────────────
function fetchText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function fetchJson(url: string): Promise<unknown> {
  const text = await fetchText(url);
  return JSON.parse(text);
}

function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}
