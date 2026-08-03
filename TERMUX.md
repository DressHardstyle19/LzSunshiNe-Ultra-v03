# 📱 Instalar y correr Lz Ultra Bot v03 en Termux

Guía paso a paso para correr el bot en tu Android con **Termux** sin necesitar PC.

---

## 📦 Requisitos

- Android 7.0 o superior
- Termux instalado desde **F-Droid** (NO desde Play Store, está desactualizado)
  - Descarga F-Droid: https://f-droid.org
  - Luego busca **Termux** dentro de F-Droid e instálalo

---

## 🚀 Instalación paso a paso

### 1 — Abrir Termux y actualizar paquetes

```bash
pkg update && pkg upgrade -y
```

> Presiona `Y` si te pregunta algo durante la actualización.

---

### 2 — Instalar dependencias del sistema

```bash
pkg install -y nodejs git python make clang
```

> ⚠️ `python`, `make` y `clang` son necesarios para compilar dependencias nativas (sharp, canvas, etc.)

---

### 3 — Instalar pnpm (gestor de paquetes)

```bash
npm install -g pnpm
```

---

### 4 — Clonar el repositorio

```bash
git clone https://github.com/LzSunshiNe/lz-ultra-bot-v03.git
cd lz-ultra-bot-v03
```

> ⚠️ Reemplaza la URL por la URL real de tu repositorio en GitHub si es diferente.

---

### 5 — Instalar dependencias del proyecto

```bash
pnpm install
```

> Esto puede tardar varios minutos la primera vez.

---

### 6 — Compilar el bot

```bash
pnpm --filter @workspace/api-server run build
```

---

### 7 — Iniciar el bot

```bash
pnpm --filter @workspace/api-server run start
```

O en modo desarrollo (con logs completos):

```bash
pnpm --filter @workspace/api-server run dev
```

---

### 8 — Escanear el QR

1. Aparecerá un código QR en la terminal
2. Abre **WhatsApp** en tu teléfono
3. Ve a **Ajustes → Dispositivos vinculados → Vincular dispositivo**
4. Escanea el QR que aparece en Termux

✅ ¡El bot ya está activo!

---

## 🔄 Mantener el bot corriendo en segundo plano

Por defecto, Termux se cierra cuando minimizas la app. Para mantenerlo activo:

### Opción A — tmux (recomendado)

```bash
pkg install -y tmux
tmux new -s bot
# Dentro del tmux:
pnpm --filter @workspace/api-server run dev
# Para salir sin cerrar el bot: Ctrl+B, luego D
# Para volver: tmux attach -t bot
```

### Opción B — nohup

```bash
nohup pnpm --filter @workspace/api-server run dev > bot.log 2>&1 &
# Ver logs:
tail -f bot.log
# Detener:
kill %1
```

---

## 🔁 Reconexión automática

El bot ya incluye reconexión automática. Si WhatsApp cierra la sesión:
- La primera vez te pedirá escanear QR de nuevo
- La sesión se guarda en `artifacts/api-server/baileys_auth/`
- No borres esa carpeta para no perder la sesión

---

## ⚡ Comandos disponibles

Una vez conectado, escríbele al bot en WhatsApp con el prefijo `.`

| Comando | Descripción |
|---|---|
| `.menu` | Ver todos los comandos |
| `.play <canción>` | Descargar MP3 de YouTube |
| `.ytmp4 <link>` | Descargar video de YouTube |
| `.tiktok <link>` | Descargar TikTok sin marca de agua |
| `.sticker` | Convertir imagen a sticker |
| `.ppt` | Jugar piedra, papel o tijera |
| `.ia <pregunta>` | Chat con IA |
| `.owner` | Info del creador |

---

## 🛠️ Solución de problemas

### Error: `node: command not found`
```bash
pkg install nodejs
```

### Error al compilar `sharp` o módulos nativos
```bash
pkg install python make clang
pnpm install --force
```

### El QR no aparece
- Borra la carpeta de sesión y reinicia:
```bash
rm -rf artifacts/api-server/baileys_auth
pnpm --filter @workspace/api-server run dev
```

### Error de permisos en Termux
```bash
termux-setup-storage
```

### `pnpm: command not found` después de reiniciar
```bash
npm install -g pnpm
```

---

## 📞 Soporte

- Creador: **LzSunshiNe**
- WhatsApp: +31 6 29049445

---

> 💡 **Tip:** Para actualizaciones futuras corre `git pull && pnpm install && pnpm --filter @workspace/api-server run build`
