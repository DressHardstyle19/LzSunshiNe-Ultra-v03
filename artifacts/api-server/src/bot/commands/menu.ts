import { reply, type Sock, type Msg } from "../handler";

const MENU_TEXT = `*🐉 LZ ULTRA BOT v03*
*By: LzSunshiNe*

_Elige una categoría:_

*👑 GRUPO* → _.grupo_
  Administra tu grupo como un rey

*📥 DESCARGAS* → _.descargas_
  Baja música y videos al instante

*🎮 JUEGOS* → _.juegos_
  Diviértete con el grupo

*🧠 IA* → _.ia <pregunta>_
  Chatea con inteligencia artificial

*🐉 OWNER* → _.owner_
  Info del creador

*⚡ OTROS* → _.otros_
  Utilidades y stickers

──────────────────
_© Lz Ultra Bot v03 2026_`;

export async function handleMenu(sock: Sock, msg: Msg): Promise<void> {
  await reply(sock, msg, MENU_TEXT);
}
