import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  isJidBroadcast,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import path from "node:path";
import { fileURLToPath } from "node:url";
import qrcode from "qrcode-terminal";
import { logger } from "../lib/logger";
import { handleMessage } from "./handler";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FOLDER = path.resolve(__dirname, "../../baileys_auth");

export let sock: ReturnType<typeof makeWASocket> | null = null;

const banner = `
/===-_---~~~~~~~~~------____
                  |===-~___                _,-'
               \`//~\\\\   ~~~~\`---.___.-~~
               |  \\\\           _-~
              /' /    \\\\      _-~
             /  /      \\\\   _-~
            /  /        > /
           /__/        / /
          (____)      (_/

⢀⣠⣤⣶⡞⡀⣤⣬⣴  ⢳⣶⣤⣄⡀
    ⣠⣾⣿⣿⣿⣿⡇ ⢸⣿⠿⣿⡇  ⠸⣿⣷⣦⡀
  ⢠⡾⣫⣿⣻⣿⣽⣿⡇ ⠈⢿⣧⡝⠟  ⢸⣿⣟⢷⣄
 ┗━━┛┗━┛┗┻━┛┗━┛┗┻┛┗┻━┛

────────── LZ ULTRA BOT v03 ──────────
🐉 Bot: Lz Ultra Bot v03
👑 Creador: LzSunshiNe
📱 WhatsApp: +31 6 29049445
──────────────────────────────────────
`;

async function connectToWhatsApp(retryCount = 0): Promise<void> {
  console.clear();
  console.log(banner);

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  logger.info({ version, isLatest }, "Usando versión de WhatsApp Web");

  const pinoChild = logger.child({});

  sock = makeWASocket({
    version,
    logger: pinoChild as Parameters<typeof makeWASocket>[0]["logger"],
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pinoChild as Parameters<typeof makeWASocket>[0]["logger"]),
    },
    browser: ["Lz Ultra Bot v03", "Chrome", "3.0"],
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    markOnlineOnConnect: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.clear();
      console.log(banner);
      console.log("📱 Escanea este código QR con WhatsApp:\n");
      qrcode.generate(qr, { small: true });
      console.log("\n[INFO] Usa .menu en WhatsApp para ver los comandos\n");
    }

    if (connection === "close") {
      const boom = lastDisconnect?.error as Boom | undefined;
      const statusCode = boom?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      logger.warn({ statusCode }, "Conexión cerrada");

      if (shouldReconnect) {
        const delay = Math.min(5000 * Math.pow(2, retryCount), 60000);
        logger.info({ delay, retryCount }, "Reconectando...");
        setTimeout(() => connectToWhatsApp(retryCount + 1), delay);
      } else {
        logger.error("Sesión cerrada. Borra la carpeta baileys_auth y reinicia.");
      }
    }

    if (connection === "open") {
      console.clear();
      console.log(banner);
      logger.info({ jid: sock?.user?.id }, "✅ Bot conectado a WhatsApp");
      console.log(`✅ Bot conectado: ${sock?.user?.name ?? "Lz Ultra Bot v03"}`);
      console.log("📋 Usa .menu en WhatsApp para ver los comandos\n");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      try {
        if (msg.key.fromMe) continue;
        if (isJidBroadcast(msg.key.remoteJid ?? "")) continue;
        if (!msg.message) continue;

        await handleMessage(sock!, msg);
      } catch (err) {
        logger.error({ err }, "Error procesando mensaje");
      }
    }
  });
}

export function startBot(): void {
  connectToWhatsApp().catch((err) => {
    logger.error({ err }, "Error fatal al iniciar el bot");
  });
}
