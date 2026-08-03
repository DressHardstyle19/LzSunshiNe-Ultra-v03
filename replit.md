# Lz Ultra Bot v03

Bot de WhatsApp construido con Baileys. Muestra el QR en la terminal al iniciar y responde comandos con el prefijo `.`.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — inicia el bot (muestra QR en terminal)
- Auth guardada en `artifacts/api-server/baileys_auth/` — no borrar para mantener la sesión
- Para cerrar sesión: borra la carpeta `baileys_auth` y reinicia

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `.menu` / `.help` | Menú principal con todos los comandos |
| `.grupo` | Lista de comandos de grupo |
| `.kick @tag` | Expulsa a un miembro (bot debe ser admin) |
| `.promote @tag` | Convierte en admin (bot debe ser admin) |
| `.demote @tag` | Quita el admin (bot debe ser admin) |
| `.group open/close` | Abre o cierra el grupo (bot debe ser admin) |
| `.descargas` | Lista de comandos de descarga |
| `.play <canción>` | Descarga MP3 de YouTube |
| `.ytmp4 <link>` | Descarga video MP4 de YouTube |
| `.tiktok <link>` | Descarga TikTok sin marca de agua |
| `.juegos` | Lista de juegos |
| `.ppt` | Piedra, papel o tijera |
| `.topgays` | Top miembros más activos |
| `.ship @a @b` | Compatibilidad entre dos personas |
| `.ia <texto>` | Chat con IA (requiere OPENAI_API_KEY) |
| `.owner` | Info del creador |
| `.donar` | Link para donar |
| `.status` | Estado del bot |
| `.otros` | Lista de otros comandos |
| `.sticker` / `.s` | Convierte imagen a sticker |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- WhatsApp: @whiskeysockets/baileys
- Descargas: @distube/ytdl-core (YouTube), tikwm API (TikTok)
- Stickers: sharp
- API server: Express 5

## Owner info

- Nombre: LzSunshiNe
- WhatsApp: +31 6 29049445
- Bot: Lz Ultra Bot v03
- Prefijo: `.`

## User preferences

- Sin panel de administración — el bot corre solo en el servidor
- Prefijo de comandos: `.`

## Gotchas

- Para .ia necesitas configurar la variable de entorno `OPENAI_API_KEY`
- Los comandos de grupo (kick, promote, demote, group open/close) requieren que el bot sea administrador del grupo
- YouTube a veces bloquea las descargas; usa https://cobalt.tools como alternativa
- La autenticación se guarda en `baileys_auth/`. Si la sesión se pierde, borra esa carpeta y reinicia para ver el QR de nuevo
